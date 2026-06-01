import { useState } from "react";

export interface ThoughtBlockData {
  title: string;
  estimatedDuration: string;
  reasoning: string;
  strategy: string;
  insights: string[];
  phase: "planning" | "architecture" | "building";
}

const PHASE_COLOR: Record<ThoughtBlockData["phase"], string> = {
  planning:     "#a78bfa",
  architecture: "#38bdf8",
  building:     "#34d399",
};

const PHASE_LABEL: Record<ThoughtBlockData["phase"], string> = {
  planning:     "planning",
  architecture: "architecture",
  building:     "building",
};

interface ThoughtBlockProps {
  data: ThoughtBlockData;
  defaultCollapsed?: boolean;
}

export function ThoughtBlock({ data, defaultCollapsed = true }: ThoughtBlockProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const color = PHASE_COLOR[data.phase];

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{ borderRadius: "8px" }}
    >
      {/* Header — minimal, no heavy border */}
      <button
        className="w-full flex items-center gap-2 px-0 py-1.5 text-left group"
        onClick={() => setCollapsed(c => !c)}
      >
        {/* Phase dot — subtle, not a bold icon */}
        <span
          className="shrink-0 w-1.5 h-1.5 rounded-full mt-px"
          style={{ background: color, opacity: 0.55 }}
        />

        {/* Phase label */}
        <span
          className="text-[9px] uppercase tracking-[0.1em] font-medium shrink-0"
          style={{ color, opacity: 0.55 }}
        >
          {PHASE_LABEL[data.phase]}
        </span>

        {/* Title */}
        <span
          className="flex-1 text-[11.5px] leading-snug truncate"
          style={{ color: "rgba(228,228,231,0.75)" }}
        >
          {data.title}
        </span>

        {/* Toggle — very quiet */}
        <span
          className="shrink-0 text-[8px] transition-transform duration-200 opacity-30 group-hover:opacity-50"
          style={{
            color: "rgba(161,161,170,1)",
            transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
          }}
        >
          ▶
        </span>
      </button>

      {/* Body — expanded, no heavy borders */}
      {!collapsed && (
        <div
          className="pl-3.5 pb-3 space-y-3"
          style={{ borderLeft: `1px solid ${color}14`, marginLeft: "3px" }}
        >
          {data.reasoning && (
            <p className="text-[11.5px] leading-[1.75] text-zinc-500 pt-1">
              {data.reasoning}
            </p>
          )}

          {data.strategy && (
            <p className="text-[11px] leading-[1.7] text-zinc-600">
              {data.strategy}
            </p>
          )}

          {data.insights.length > 0 && (
            <ul className="space-y-1.5 pt-0.5">
              {data.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="shrink-0 mt-[5px] w-[3px] h-[3px] rounded-full"
                    style={{ background: color, opacity: 0.4 }}
                  />
                  <span className="text-[11px] leading-[1.65] text-zinc-600">
                    {insight}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
