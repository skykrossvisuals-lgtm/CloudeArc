import { Router, type IRouter } from "express";
import * as esbuild from "esbuild";
import { tmpdir } from "os";
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, posix } from "path";

// api-server's own node_modules (contains react, react-dom, scheduler as devDeps)
// plus the pnpm virtual store so all transitive deps are reachable by esbuild.
const WORKSPACE_MODULES = join(process.cwd(), "node_modules");
const PNPM_STORE = join(process.cwd(), "../../node_modules/.pnpm");

// Explicit aliases so esbuild always resolves these from our known-good location
// regardless of symlink resolution or pnpm virtual store layout.
const ESBUILD_ALIASES: Record<string, string> = {
  scheduler: join(WORKSPACE_MODULES, "scheduler"),
  react: join(WORKSPACE_MODULES, "react"),
  "react-dom": join(WORKSPACE_MODULES, "react-dom"),
};

function getPnpmNodePaths(): string[] {
  try {
    // Use ESM-compatible fs imports (NOT require — this file runs as ESM)
    const entries = readdirSync(PNPM_STORE);
    // Add the nested node_modules of each pnpm package so esbuild can resolve
    // transitive deps (e.g. scheduler inside react-dom's node_modules).
    return entries.map((e) => join(PNPM_STORE, e, "node_modules")).filter((p) => {
      try { return statSync(p).isDirectory(); } catch { return false; }
    });
  } catch {
    return [];
  }
}

const router: IRouter = Router();

// These are bundled inline by esbuild — no external network requests needed.
const BUNDLED_INLINE = new Set([
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-is",
  "scheduler",
]);

// Non-React packages are mapped to esm.sh for the import map.
function toEsmShUrl(specifier: string): string {
  return `https://esm.sh/${specifier}`;
}

function autoExternalPlugin(collected: Set<string>): esbuild.Plugin {
  return {
    name: "auto-external",
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        // Bundle React family inline — no external requests needed for preview
        if (BUNDLED_INLINE.has(args.path)) return null;
        collected.add(args.path);
        return { path: args.path, external: true };
      });
    },
  };
}

// ── Stub helpers ──────────────────────────────────────────────────────────────

function stubContent(filePath: string): string {
  // For the app entry point, inject a real React mount instead of a null stub.
  // This ensures the preview renders something even when the model writes a
  // broken main.jsx — the bundler auto-fixes the entry so we still see the app.
  if (/main\.[jt]sx?$/.test(filePath)) {
    // Use a known-good entry point so the preview renders the app
    // even when the model wrote a broken main.jsx.
    return "import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\ncreateRoot(document.getElementById('root')).render(<App />);\n";
  }
  const name =
    (filePath.split("/").pop() ?? "Component")
      .replace(/\.[jt]sx?$/, "")
      .replace(/[^a-zA-Z0-9_$]/g, "_") || "Component";
  if (filePath.endsWith(".css")) return "";
  return `export default function ${name}() { return null; }\n`;
}

function writeStub(tmpDir: string, virtualPath: string): void {
  const relative = virtualPath.startsWith("/") ? virtualPath.slice(1) : virtualPath;
  const fullPath = join(tmpDir, relative);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, stubContent(virtualPath), "utf-8");
}

// ── Scan all JS/JSX/TS/TSX files for relative imports and create stubs in
// tmpDir for any files that are missing (e.g. App.jsx when LLM truncated early)
function stubMissingImports(files: Record<string, string>, tmpDir: string): void {
  const IMPORT_RE = /(?:from|import)\s+['"](\.\.?\/[^'"]+)['"]/g;
  const JS_EXTS = [".jsx", ".tsx", ".js", ".ts"];

  const knownPaths = new Set(
    Object.keys(files).map((p) => (p.startsWith("/") ? p : "/" + p)),
  );

  function resolveVirtual(fromFile: string, importPath: string): string {
    return posix.resolve(posix.dirname(fromFile), importPath);
  }

  function tryStub(virtualPath: string): void {
    if (knownPaths.has(virtualPath)) return;
    const hasExt = JS_EXTS.some((e) => virtualPath.endsWith(e));
    if (!hasExt) {
      for (const ext of JS_EXTS) {
        if (knownPaths.has(virtualPath + ext)) return;
      }
    }
    if (!existsSync(join(tmpDir, virtualPath.startsWith("/") ? virtualPath.slice(1) : virtualPath))) {
      writeStub(tmpDir, virtualPath);
      knownPaths.add(virtualPath);
    }
  }

  for (const [rawPath, content] of Object.entries(files)) {
    const filePath = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
    if (!JS_EXTS.some((e) => filePath.endsWith(e))) continue;
    IMPORT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = IMPORT_RE.exec(content)) !== null) {
      tryStub(resolveVirtual(filePath, m[1]));
    }
  }
}

// ── Parse esbuild error messages to extract the file paths that are broken
// e.g. ".../tmp/cloudearc-xxx/src/components/Navbar.jsx:33:125: ERROR: ..."
function extractBrokenFiles(errors: esbuild.Message[], tmpDir: string): string[] {
  const broken = new Set<string>();
  for (const err of errors) {
    const file = err.location?.file;
    if (!file) continue;
    // esbuild returns absolute paths inside tmpDir
    const abs = posix.isAbsolute(file) ? file : join(tmpDir, file);
    if (abs.startsWith(tmpDir)) {
      broken.add(abs);
    }
  }
  return [...broken];
}

// ── Run esbuild. On failure, stub out any syntactically broken files and retry
// once. This recovers from LLM truncation mid-JSX.
// Returns the build result AND the list of relative paths that were stubbed
// (so the caller can signal the client to trigger auto-fix).
async function buildWithFallback(
  entryFile: string,
  tmpDir: string,
  collected: Set<string>,
  logger: any,
): Promise<{ result: esbuild.BuildResult; stubbedFiles: string[] }> {
  const opts: esbuild.BuildOptions = {
    entryPoints: [entryFile],
    bundle: true,
    write: false,
    outdir: tmpDir,
    jsx: "automatic",
    jsxImportSource: "react",
    loader: { ".jsx": "tsx", ".js": "tsx", ".tsx": "tsx", ".ts": "ts", ".css": "css" },
    format: "esm",
    platform: "browser",
    target: "es2020",
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"production"' },
    alias: ESBUILD_ALIASES,
    nodePaths: [WORKSPACE_MODULES, ...getPnpmNodePaths()],
    plugins: [autoExternalPlugin(collected)],
  };

  try {
    const result = await esbuild.build(opts);
    return { result, stubbedFiles: [] };
  } catch (firstErr: any) {
    // Extract which files have syntax errors
    const brokenFiles = extractBrokenFiles(firstErr.errors ?? [], tmpDir);
    if (brokenFiles.length === 0) throw firstErr;

    const relBroken = brokenFiles.map((f) => f.replace(tmpDir + "/", ""));
    logger.warn(
      { brokenFiles: relBroken },
      "esbuild: syntax errors in generated files — stubbing and retrying",
    );

    // Replace each broken file with a null-returning stub
    for (const abs of brokenFiles) {
      const relative = abs.replace(tmpDir + "/", "");
      writeFileSync(abs, stubContent("/" + relative), "utf-8");
    }

    // Retry once with stubs in place
    const result = await esbuild.build(opts);
    return { result, stubbedFiles: relBroken };
  }
}

router.post("/preview", async (req, res) => {
  const tmpDir = join(tmpdir(), `cloudearc-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  try {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ error: `Invalid body: ${JSON.stringify(req.body)}` });
      return;
    }
    const { files } = req.body as { files: Record<string, string> };
    if (!files || typeof files !== "object") {
      res.status(400).json({ error: "files is required" });
      return;
    }

    const hasMain =
      "/src/main.jsx" in files ||
      "src/main.jsx" in files ||
      "/src/main.tsx" in files ||
      "src/main.tsx" in files;

    if (!hasMain) {
      // Return a loading placeholder — the incremental preview fires early
      // (only index.html exists yet). Show a waiting state instead of blank HTML.
      const loadingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Building…</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f172a; color: #94a3b8; font-family: system-ui, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .wrap { text-align: center; }
    .dot-wrap { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #6366f1;
           animation: pulse 1.2s ease-in-out infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
    p { font-size: 14px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="dot-wrap"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    <p>Generating components…</p>
  </div>
</body>
</html>`;
      res.json({ html: loadingHtml });
      return;
    }

    // Files owned by the bundler — must never be written to the temp dir.
    // If the LLM wrote one of these, its content is invalid for esbuild
    // (e.g. package.json with `export` syntax) and will break the build.
    const PREVIEW_PROTECTED = new Set([
      "package.json", "/package.json",
      "vite.config.js", "/vite.config.js",
      "vite.config.ts", "/vite.config.ts",
      "tailwind.config.js", "/tailwind.config.js",
      "tailwind.config.cjs", "/tailwind.config.cjs",
      "tailwind.config.ts", "/tailwind.config.ts",
    ]);

    // Write all generated files to temp dir
    mkdirSync(tmpDir, { recursive: true });
    for (const [path, content] of Object.entries(files)) {
      // Skip bundler-owned config files — they break esbuild when overwritten
      if (PREVIEW_PROTECTED.has(path)) continue;

      const relative = path.startsWith("/") ? path.slice(1) : path;
      const fullPath = join(tmpDir, relative);
      mkdirSync(dirname(fullPath), { recursive: true });
      // Rewrite old ReactDOM default-import pattern to named createRoot import.
      // LLMs sometimes emit `import ReactDOM from "react-dom/client"` +
      // `ReactDOM.createRoot(...)` but react-dom/client has no default export.
      let fixedContent = content;
      if (/main\.[jt]sx?$/.test(path)) {
        fixedContent = fixedContent
          .replace(
            /import\s+ReactDOM\s+from\s+["']react-dom\/client["']/g,
            'import { createRoot } from "react-dom/client"',
          )
          .replace(/ReactDOM\.createRoot\(/g, "createRoot(");
      }
      writeFileSync(fullPath, fixedContent, "utf-8");
    }

    // Stub any imported files that weren't generated at all
    stubMissingImports(files, tmpDir);

    const entryFile =
      "/src/main.jsx" in files || "src/main.jsx" in files
        ? join(tmpDir, "src/main.jsx")
        : join(tmpDir, "src/main.tsx");

    const collectedPackages = new Set<string>();

    // Build — with automatic stub-and-retry on syntax errors (truncated JSX)
    const { result: buildResult, stubbedFiles } = await buildWithFallback(entryFile, tmpDir, collectedPackages, req.log);

    const importMapEntries: Record<string, string> = {};
    for (const pkg of collectedPackages) {
      importMapEntries[pkg] = toEsmShUrl(pkg);
    }

    const bundledJs = buildResult.outputFiles?.find((f) => f.path.endsWith(".js"))?.text ?? "";
    const bundledCss = buildResult.outputFiles?.find((f) => f.path.endsWith(".css"))?.text ?? "";

    const htmlTemplate = files["/index.html"] ?? files["index.html"] ?? "";

    const importMapJson = JSON.stringify({ imports: importMapEntries }, null, 2);
    const importMapScript = `<script type="importmap">\n${importMapJson}\n</script>`;
    const styleBlock = bundledCss ? `<style>\n${bundledCss}\n</style>` : "";
    const scriptBlock = `<script type="module">\n${bundledJs}\n</script>`;

    // Tailwind Play CDN — compiles JIT utility classes (including arbitrary values
    // like bg-[#080C0A]) at runtime. Essential because esbuild does not run Tailwind.
    // The config block registers the font families used by all templates so that
    // both font-['Syne'] (arbitrary) and font-syne (named) work correctly.
    const tailwindCdn = `<script>
window.tailwind = {
  config: {
    theme: {
      extend: {
        fontFamily: {
          'Syne': ['Syne', 'sans-serif'],
          'Inter': ['Inter', 'system-ui', 'sans-serif'],
          'Playfair_Display': ['Playfair Display', 'Georgia', 'serif'],
          'DM_Sans': ['DM Sans', 'system-ui', 'sans-serif'],
        }
      }
    }
  }
};
</script>
<script src="https://cdn.tailwindcss.com"></script>`;

    // Runtime error overlay — shows a red screen AND notifies the parent workspace
    // so it can trigger the auto-fix agent loop.
    // Also intercepts console.error/warn and posts them as 'console-error' messages
    // so the workspace can surface them in the Debug button.
    const errorOverlay = `<script>
function _caNotifyError(msg) {
  try { window.parent.postMessage({ type: 'preview-error', message: String(msg) }, '*'); } catch(e) {}
}
function _caNotifyConsole(level, msg) {
  try { window.parent.postMessage({ type: 'console-error', level: level, message: String(msg) }, '*'); } catch(e) {}
}
// Intercept console.error and console.warn
(function() {
  var _ce = console.error.bind(console);
  var _cw = console.warn.bind(console);
  console.error = function() {
    var msg = Array.from(arguments).map(function(a) {
      return (a && typeof a === 'object' && a.message) ? a.message : String(a);
    }).join(' ');
    _caNotifyConsole('error', msg);
    _ce.apply(console, arguments);
  };
  console.warn = function() {
    var msg = Array.from(arguments).map(function(a) {
      return (a && typeof a === 'object' && a.message) ? a.message : String(a);
    }).join(' ');
    _caNotifyConsole('warn', msg);
    _cw.apply(console, arguments);
  };
})();
window.addEventListener('error', function(e) {
  var msg = e.message || String(e);
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;color:#ef4444;font:13px/1.6 monospace;padding:32px;z-index:9999;white-space:pre-wrap;overflow:auto;';
  d.textContent = 'Runtime error:\\n' + msg + (e.filename ? '\\n\\n' + e.filename + ':' + e.lineno : '');
  document.body && document.body.appendChild(d);
  _caNotifyError(msg);
});
window.addEventListener('unhandledrejection', function(e) {
  var msg = (e.reason && e.reason.message) ? e.reason.message : String(e.reason || e);
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;color:#ef4444;font:13px/1.6 monospace;padding:32px;z-index:9999;white-space:pre-wrap;overflow:auto;';
  d.textContent = 'Unhandled rejection:\\n' + msg;
  document.body && document.body.appendChild(d);
  _caNotifyError(msg);
});
</script>`;

    let html: string;
    if (htmlTemplate && htmlTemplate.includes("<body")) {
      html = htmlTemplate
        .replace(/<script[^>]*type=["']module["'][^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<script[^>]*src=[^>]*main\.[jt]sx?[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace("</head>", `${tailwindCdn}\n${importMapScript}\n${styleBlock}\n</head>`)
        .replace("</body>", `${errorOverlay}\n${scriptBlock}\n</body>`);
    } else {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  ${tailwindCdn}
  ${importMapScript}
  ${styleBlock}
</head>
<body>
  <div id="root"></div>
  ${errorOverlay}
  ${scriptBlock}
</body>
</html>`;
    }

    // If any files were stubbed (syntax errors from LLM truncation), signal this
    // to the client so it can trigger the auto-fix agent loop instead of
    // silently showing a blank preview.
    res.json({ html, stubbed: stubbedFiles });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    req.log.error({ previewErr: message }, "Preview build failed");
    res.status(500).json({ error: message });
  } finally {
    try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

export default router;
