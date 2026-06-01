import { useMemo } from "react";

function fileTypeColor(path: string): string {
  if (path.endsWith(".jsx") || path.endsWith(".tsx")) return "#a78bfa";
  if (path.endsWith(".css")) return "#38bdf8";
  if (path.endsWith(".html")) return "#fb923c";
  if (path.endsWith(".ts") || path.endsWith(".js")) return "#facc15";
  if (path.endsWith(".json")) return "#4ade80";
  return "#94a3b8";
}

function shortName(path: string): string {
  return path.split("/").pop() ?? path;
}

type NodeData = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  col: number;
  row: number;
};

type Edge = { from: string; to: string };

function inferDeps(files: string[]): Edge[] {
  const edges: Edge[] = [];
  const has = (f: string) => files.includes(f);

  // index.html → main entry
  const mainEntry = files.find((f) => /src\/main\.[jt]sx?$/.test(f));
  if (has("/index.html") && mainEntry) edges.push({ from: "/index.html", to: mainEntry });

  // main.jsx → App.jsx
  const app = files.find((f) => /src\/App\.[jt]sx?$/.test(f));
  if (mainEntry && app) edges.push({ from: mainEntry, to: app });

  // main.jsx → CSS globals
  const globalCss = files.find((f) => /globals?\.css$|index\.css$|design\.css$/.test(f));
  if (mainEntry && globalCss) edges.push({ from: mainEntry, to: globalCss });

  // App.jsx → every component
  const components = files.filter((f) => /\/components?\//.test(f) || /\/(Navbar|Hero|Footer|Features|Pricing|CTA|About|Contact|Sidebar|Dashboard|Testimonial)\.[jt]sx?$/i.test(f));
  if (app) {
    components.forEach((c) => edges.push({ from: app, to: c }));
  }

  // App.jsx → every page (besides itself)
  const pages = files.filter((f) => /\/pages?\//.test(f) && f !== app);
  if (app) {
    pages.forEach((p) => edges.push({ from: app, to: p }));
  }

  return edges;
}

const COL_X: Record<number, number> = { 0: 32, 1: 140, 2: 248, 3: 356 };
const NODE_W = 90;
const NODE_H = 28;
const ROW_GAP = 42;
const SVG_W = 460;

export function DependencyMap({ files, activeFile, building }: {
  files: Record<string, string>;
  activeFile?: string;
  building?: boolean;
}) {
  const fileList = Object.keys(files).filter((f) => f !== "/index.html" || files["/index.html"]?.includes("<"));

  const { nodes, edges, svgH } = useMemo(() => {
    const paths = Object.keys(files);

    // Assign columns:
    // Col 0: index.html
    // Col 1: main.jsx, globals.css, theme.css
    // Col 2: App.jsx
    // Col 3: components, pages
    const colAssign = (f: string): number => {
      if (f === "/index.html") return 0;
      if (/src\/main\.[jt]sx?$/.test(f)) return 1;
      if (/globals?\.css$|index\.css$|design\.css$|theme\.css$/.test(f)) return 1;
      if (/src\/App\.[jt]sx?$/.test(f)) return 2;
      return 3;
    };

    const colRows: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const nodeMap = new Map<string, NodeData>();

    for (const path of paths) {
      const col = colAssign(path);
      const row = colRows[col]++;
      const x = COL_X[col];
      const y = 20 + row * ROW_GAP;
      nodeMap.set(path, {
        id: path,
        label: shortName(path),
        color: fileTypeColor(path),
        x, y, col, row,
      });
    }

    const maxRows = Math.max(...Object.values(colRows), 1);
    const svgH = 40 + maxRows * ROW_GAP;
    const edges = inferDeps(paths);
    const nodes = Array.from(nodeMap.values());

    return { nodes, edges, nodeMap, svgH };
  }, [files]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, NodeData>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  if (fileList.length <= 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/25">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/30">No dependency graph yet</div>
          <div className="text-[10px] text-white/15 mt-1">Build an app to see the file graph</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#0A0A0A]">
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600 font-semibold">Dependency Map</span>
        <span className="text-[10px] text-zinc-700 font-mono">{fileList.length} files · {edges.length} edges</span>
      </div>

      {/* Column headers */}
      <div className="px-4 pt-3 pb-1 flex gap-0" style={{ minWidth: SVG_W + 32 }}>
        {(["Entry", "Bootstrap", "Root", "Modules"] as const).map((label, i) => (
          <div
            key={label}
            className="text-[8px] uppercase tracking-[0.14em] text-zinc-700 font-semibold"
            style={{ width: 108, marginLeft: i === 0 ? 0 : 0 }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="px-4 overflow-x-auto" style={{ minWidth: SVG_W + 32 }}>
        <svg
          width={SVG_W}
          height={svgH}
          style={{ overflow: "visible", display: "block" }}
        >
          {/* Edges */}
          {edges.map((e) => {
            const from = nodeMap.get(e.from);
            const to   = nodeMap.get(e.to);
            if (!from || !to) return null;
            const x1 = from.x + NODE_W;
            const y1 = from.y + NODE_H / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_H / 2;
            const midX = (x1 + x2) / 2;
            const isActive = building && (e.from === activeFile || e.to === activeFile);
            return (
              <path
                key={`${e.from}--${e.to}`}
                d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                fill="none"
                stroke={isActive ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.07)"}
                strokeWidth={isActive ? 1.5 : 1}
                strokeDasharray={isActive ? "none" : "3 3"}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isActive = n.id === activeFile;
            const isBuildingActive = building && isActive;
            const opacity = files[n.id] !== undefined ? 1 : 0.3;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                style={{ opacity, transition: "opacity 0.4s" }}
              >
                {/* Glow for active node */}
                {isBuildingActive && (
                  <rect
                    x={-2} y={-2}
                    width={NODE_W + 4} height={NODE_H + 4}
                    rx={8}
                    fill="none"
                    stroke={n.color}
                    strokeWidth={1}
                    opacity={0.4}
                    style={{ filter: `drop-shadow(0 0 4px ${n.color})` }}
                  />
                )}
                {/* Node rect */}
                <rect
                  x={0} y={0}
                  width={NODE_W} height={NODE_H}
                  rx={6}
                  fill={isActive ? `${n.color}18` : "rgba(255,255,255,0.04)"}
                  stroke={isActive ? `${n.color}60` : "rgba(255,255,255,0.08)"}
                  strokeWidth={1}
                  style={{ transition: "fill 0.3s, stroke 0.3s" }}
                />
                {/* Color dot */}
                <circle
                  cx={10} cy={NODE_H / 2}
                  r={3}
                  fill={n.color}
                  opacity={0.85}
                />
                {/* Label */}
                <text
                  x={20} y={NODE_H / 2 + 4}
                  fontSize={9}
                  fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                  fill={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)"}
                  style={{ transition: "fill 0.3s" }}
                >
                  {n.label.length > 11 ? n.label.slice(0, 10) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 pt-3 flex flex-wrap gap-3 border-t border-white/[0.03] mt-2">
        {[
          { color: "#fb923c", label: ".html" },
          { color: "#facc15", label: ".js" },
          { color: "#a78bfa", label: ".jsx/.tsx" },
          { color: "#38bdf8", label: ".css" },
          { color: "#4ade80", label: ".json" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-zinc-700 font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
