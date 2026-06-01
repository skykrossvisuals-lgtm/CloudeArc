import { useEffect, useState } from "react";
import { useOrchestrator } from "@/lib/orchestrator";

interface FileNode {
  path: string;
  name: string;
  status: "created" | "modified" | "error";
  size: number;
  updatedAt: number;
}

const EXT_ICONS: Record<string, string> = {
  jsx: "⚛️",
  tsx: "⚛️",
  css: "🎨",
  json: "📦",
  md: "📝",
  js: "✨",
  ts: "✨",
  html: "🌐",
  svg: "🖼️",
  png: "🖼️",
};

function getFileIcon(name: string): string {
  const ext = name.split(".").pop() ?? "";
  return EXT_ICONS[ext] || "📄";
}

const STATUS_COLORS: Record<string, string> = {
  created: "text-emerald-400",
  modified: "text-amber-400",
  error: "text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  created: "new",
  modified: "edited",
  error: "error",
};

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  return `${(bytes / 1024).toFixed(1)}kb`;
}

export function LiveFileTree() {
  const { events } = useOrchestrator();
  const [files, setFiles] = useState<Map<string, FileNode>>(new Map());

  useEffect(() => {
    const unsubs = [
      events.on("file_written", (ev) => {
        const { path, content, size } = ev.payload as { path: string; content: string; size: number };
        setFiles((prev) => {
          const next = new Map(prev);
          next.set(path, {
            path,
            name: (path.split("/").pop() ?? path),
            status: "created",
            size: size ?? (content?.length ?? 0),
            updatedAt: Date.now(),
          });
          return next;
        });
      }),

      events.on("file_modified", (ev) => {
        const { path, content, size } = ev.payload as { path: string; content: string; size: number };
        setFiles((prev) => {
          const next = new Map(prev);
          const existing = next.get(path);
          next.set(path, {
            path,
            name: (path.split("/").pop() ?? path),
            status: existing ? "modified" : "created",
            size: size ?? (content?.length ?? 0),
            updatedAt: Date.now(),
          });
          return next;
        });
      }),

      events.on("file_deleted", (ev) => {
        const { path } = ev.payload as { path: string };
        setFiles((prev) => {
          const next = new Map(prev);
          next.delete(path);
          return next;
        });
      }),

      events.on("file_edited", (ev) => {
        const { path } = ev.payload as { path: string };
        setFiles((prev) => {
          if (!prev.has(path)) return prev;
          const next = new Map(prev);
          const existing = next.get(path)!;
          next.set(path, { ...existing, status: "modified", updatedAt: Date.now() });
          return next;
        });
      }),

      events.on("task_finished", () => {
        // Clear new/modified badges after build completes
        setTimeout(() => {
          setFiles((prev) => {
            const next = new Map(prev);
            next.forEach((f, k) => next.set(k, { ...f, status: "modified" }));
            return next;
          });
        }, 3000);
      }),
    ];

    return () => unsubs.forEach((u) => u?.());
  }, [events]);

  const sorted = Array.from(files.values()).sort((a, b) => {
    const depthA = a.path.split("/").length;
    const depthB = b.path.split("/").length;
    if (depthA !== depthB) return depthA - depthB;
    return a.path.localeCompare(b.path);
  });

  if (sorted.length === 0) {
    return (
      <div className="w-full bg-slate-900/50 rounded-lg p-4 font-mono text-xs text-slate-500 italic">
        Files will appear here as they're written…
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 rounded-lg overflow-hidden font-mono text-xs">
      <div className="px-3 py-2 border-b border-slate-700/60 flex items-center justify-between">
        <span className="text-slate-400 font-semibold tracking-wide uppercase text-[10px]">
          Project Files
        </span>
        <span className="text-slate-500">{sorted.length} file{sorted.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="py-1 max-h-64 overflow-y-auto">
        {sorted.map((file) => {
          const indent = Math.max(0, file.path.split("/").length - 2);
          return (
            <div
              key={file.path}
              className="flex items-center gap-1.5 px-3 py-1 hover:bg-slate-800/60 transition-colors group"
              style={{ paddingLeft: `${12 + indent * 12}px` }}
            >
              <span className="shrink-0 text-[11px]">{getFileIcon(file.name)}</span>
              <span className="flex-1 text-slate-300 truncate">{file.name}</span>
              <span
                className={`shrink-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${STATUS_COLORS[file.status]}`}
              >
                {STATUS_LABELS[file.status]}
              </span>
              {file.size > 0 && (
                <span className="shrink-0 text-[10px] text-slate-500">
                  {fmtSize(file.size)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
