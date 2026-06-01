import { useEffect, useRef } from "react";
import { AgentLivenessIndicator } from "./AgentLivenessIndicator";
import { ThoughtBlock } from "./ThoughtBlock";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thoughts?: string[];
  timestamp: Date;
  phase?: string;
  streaming?: boolean;
}

interface ConversationPanelProps {
  messages: ConversationMessage[];
  isBuilding: boolean;
  onSend: (text: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  executionStage?: "thinking" | "planning" | "building" | "debugging" | "finalizing" | "idle";
  className?: string;
}

export function ConversationPanel({
  messages,
  isBuilding,
  onSend,
  inputValue,
  onInputChange,
  executionStage = "idle",
  className = "",
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = inputValue.trim();
      if (text && !isBuilding) onSend(text);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (text && !isBuilding) onSend(text);
  };

  return (
    <div className={`flex flex-col bg-slate-950 border-l border-slate-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-800 flex items-center gap-2.5">
        <AgentLivenessIndicator stage={executionStage} size={20} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-none">CloudeArc</p>
          <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
            {isBuilding ? executionStage : "ready"}
          </p>
        </div>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-slate-600 text-sm pt-8">
            <p className="text-2xl mb-2">⚡</p>
            <p>Describe what you want to build.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-slate-800 text-slate-100 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" && msg.thoughts && msg.thoughts.length > 0 && (
                <ThoughtBlock
                  data={{
                    title: msg.phase ?? "Thinking",
                    phase: (msg.phase as any) ?? "planning",
                    reasoning: msg.thoughts.join("\n"),
                    strategy: "",
                    insights: [],
                    estimatedDuration: "—",
                  }}
                />
              )}

              <p className={msg.streaming ? "after:content-['▌'] after:animate-pulse after:ml-0.5" : ""}>
                {msg.content}
              </p>

              <time className="block text-[10px] opacity-40 mt-1.5">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isBuilding ? "Building…" : "Ask to add, modify, or rebuild…"}
          disabled={isBuilding}
          rows={3}
          className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none
            disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={handleSend}
          disabled={isBuilding || !inputValue.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500
            text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
        >
          {isBuilding ? "Building…" : "Send"}
        </button>
      </div>
    </div>
  );
}
