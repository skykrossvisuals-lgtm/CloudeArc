# LiveFileTree.tsx - Real-time File Display

```typescript
import React, { useEffect, useState } from 'react';
import { useOrchestrator } from '@/lib/orchestrator';
import { FileIcon, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  status: 'created' | 'modified' | 'error';
  size?: number;
}

export function LiveFileTree() {
  const { events } = useOrchestrator();
  const [files, setFiles] = useState<Map<string, FileNode>>(new Map());
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['/src', '/']));

  useEffect(() => {
    const subscriptions = [
      events.on('file_written', (event) => {
        const { path, content } = event;
        addFileToTree(path, 'created', content.length);
      }),
      events.on('file_modified', (event) => {
        const { path, content } = event;
        updateFileStatus(path, 'modified', content.length);
      }),
      events.on('file_deleted', (event) => {
        deleteFileFromTree(event.path);
      }),
    ];

    return () => subscriptions.forEach(sub => sub?.());
  }, []);

  const addFileToTree = (path: string, status: 'created' | 'modified' | 'error', size: number) => {
    const parts = path.split('/').filter(Boolean);
    const newNode: FileNode = {
      path,
      name: parts[parts.length - 1],
      type: 'file',
      status,
      size,
    };

    setFiles(prev => {
      const updated = new Map(prev);
      updated.set(path, newNode);
      return updated;
    });
  };

  const updateFileStatus = (path: string, status: 'modified', size: number) => {
    setFiles(prev => {
      const updated = new Map(prev);
      const file = updated.get(path);
      if (file) {
        file.status = status;
        file.size = size;
      }
      return updated;
    });
  };

  const deleteFileFromTree = (path: string) => {
    setFiles(prev => {
      const updated = new Map(prev);
      updated.delete(path);
      return updated;
    });
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop();
    const iconMap: Record<string, string> = {
      jsx: '⚛️',
      tsx: '⚛️',
      css: '🎨',
      json: '📦',
      md: '📝',
      js: '✨',
      ts: '✨',
    };
    return iconMap[ext as string] || '📄';
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      created: 'text-green-500',
      modified: 'text-yellow-500',
      error: 'text-red-500',
    };
    return colorMap[status as keyof typeof colorMap] || 'text-gray-500';
  };

  return (
    <div className="w-64 bg-slate-900 text-white p-4 overflow-auto font-mono text-sm">
      <h3 className="font-bold mb-4">Project Files</h3>
      <div className="space-y-1">
        {Array.from(files.values())
          .sort((a, b) => a.path.localeCompare(b.path))
          .map(file => (
            <div key={file.path} className="flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded cursor-pointer group">
              <span>{getFileIcon(file.name)}</span>
              <span className="flex-1">{file.name}</span>
              <span className={`text-xs opacity-75 group-hover:opacity-100 ${getStatusColor(file.status)}`}>
                {file.size ? `${(file.size / 1024).toFixed(1)}kb` : ''}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
```

---

# Enhanced System Prompt - Make Claude Sound Natural

```typescript
// artifacts/api-server/src/lib/systemPrompt.ts

export function getEnhancedSystemPrompt(projectContext?: {
  projectName: string;
  filesWritten: string[];
  appArchitecture: string;
  userStyle: 'exploratory' | 'decisive' | 'uncertain';
  lastFeedback?: string;
}): string {
  return `You are Claude, CloudeArc's AI assistant for building beautiful web apps.

## Your Mission
Convert natural language descriptions into fully functional React applications.
You take pride in writing clean, well-organized, delightful code.

## Your Personality
- You're enthusiastic but grounded. You BUILD FIRST, explain second.
- You use natural, conversational narration: "Creating a sleek hero section with a gradient overlay..."
- You catch mistakes and self-correct: "Actually, better to organize by feature..."
- You're aware of what you've built and build upon it intelligently
- You suggest next steps naturally: "You could next add real data or authentication..."

## Key Rules for Building

1. **ALWAYS create 6+ files minimum** (never fewer, even for simple apps)
   - Structure: /components (reusable), /pages (routes), /hooks (logic), /utils (helpers)

2. **React 19 + TypeScript + TailwindCSS ALWAYS**
   - Use latest React hooks: useState, useEffect, useCallback, useMemo
   - Type everything (no 'any'), use discriminated unions for complex state
   - TailwindCSS for styling (no CSS files unless absolutely necessary)

3. **Component Design**
   - Make components reusable and composable
   - PropTypes or TypeScript interfaces for each component
   - Clear, descriptive names: HeaderNav not Nav, EmailInput not Input

4. **First-time builds:**
   - Infer design system from description (e.g., "SaaS" → modern, professional, dark-friendly)
   - Create a theme file: /utils/theme.ts or /tailwind.config.js
   - Build out a complete demo with mock data (NOT empty placeholders)

5. **Handling Feedback**
   - If user says "add", don't rebuild from scratch → ADD ONLY
   - If user says "fix", IDENTIFY THE PROBLEM then fix (not re-architect)
   - If feedback is ambiguous, ask ONE clarifying question max

${
  projectContext
    ? `
## Current Project Context

**Project:** ${projectContext.projectName}
**Files written:** ${projectContext.filesWritten.join(', ')}
**Architecture:** ${projectContext.appArchitecture}
**User style:** ${projectContext.userStyle} (${projectContext.userStyle === 'exploratory' ? 'wants to see options' : projectContext.userStyle === 'decisive' ? 'wants quick, confident builds' : 'needs reassurance'})
${projectContext.lastFeedback ? `**Last feedback:** "${projectContext.lastFeedback}"` : ''}

BUILD ON TOP OF THIS. Don't recreate files that already exist.
`
    : ''
}

## Narration Tone

Use conversational language, not robotic descriptions:

❌ "Creating component X..."
✅ "Building a reusable Button component with variants..."

❌ "Writing CSS..."
✅ "Styling with Tailwind to match the modern aesthetic..."

❌ "Adding state management..."
✅ "Using React hooks to handle form state elegantly..."

## When You're Done

Recap what you built:
"I've created a full-featured SaaS dashboard with 12 components, 
real-time data updates, and a beautiful dark theme. 
You could next add user authentication or integrations."

---

Remember: You're not just writing code. You're building the user's vision into reality.
Make them feel confident they made the right choice asking you to build it.`;
}
```

---

# Enhanced Orchestrator Events - Track Everything

```typescript
// artifacts/cloudearc/src/lib/orchestrator.ts (additions)

export type ExecutionEvent = 
  // File Operations
  | { type: 'file_created'; path: string; size: number; language: string; }
  | { type: 'file_modified'; path: string; changeCount: number; }
  | { type: 'file_deleted'; path: string; }
  
  // Thinking
  | { type: 'thought_generated'; phase: string; content: string; }
  | { type: 'narration'; text: string; confidence: 0-1; }
  
  // Status
  | { type: 'stage_changed'; from: string; to: string; }
  | { type: 'operation_started'; name: string; }
  | { type: 'operation_completed'; name: string; duration: number; }
  | { type: 'operation_failed'; name: string; error: string; }
  | { type: 'recovery_attempt'; reason: string; }
  
  // Async Task Tracking
  | { type: 'step_started'; stepNumber: number; totalSteps: number; description: string; }
  | { type: 'step_completed'; stepNumber: number; duration: number; }
  | { type: 'step_error'; stepNumber: number; error: string; }
  
  // Performance
  | { type: 'metrics'; tokens: number; latency: number; filesCount: number; }
  | { type: 'complexity_detected'; score: 0-1; reason: string; }
  | { type: 'drift_detected'; previousComplexity: number; newComplexity: number; }
  
  // User Interaction
  | { type: 'user_message'; message: string; intent: string; }
  | { type: 'build_requested'; }
  | { type: 'build_cancelled'; }
  | { type: 'feedback_received'; feedback: string; }
;

export class AIOrchestrator {
  async emitNarration(text: string, confidence: number = 0.9) {
    this.emit({
      type: 'narration',
      text,
      confidence,
    });
    
    // Also append to current task's thoughts
    if (this.currentTask) {
      this.currentTask.thoughts.push(text);
    }
  }
  
  async trackStep(number: number, total: number, description: string) {
    this.emit({ type: 'step_started', stepNumber: number, totalSteps: total, description });
  }
  
  async recordComplexity(score: number, reason: string) {
    if (score > this.lastComplexityScore + 0.2) {
      this.emit({
        type: 'drift_detected',
        previousComplexity: this.lastComplexityScore,
        newComplexity: score,
      });
    }
    this.lastComplexityScore = score;
    this.emit({ type: 'complexity_detected', score, reason });
  }
}
```

---

# Conversation Panel - Replit-style Right Sidebar

```typescript
// artifacts/cloudearc/src/components/ConversationPanel.tsx

import React from 'react';
import { AgentLivenessIndicator } from './AgentLivenessIndicator';
import { ThoughtBlock } from './ThoughtBlock';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thoughts?: string[];
  timestamp: Date;
  phase?: string;
}

export function ConversationPanel({ messages }: { messages: Message[] }) {
  return (
    <div className="w-80 bg-slate-950 border-l border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <AgentLivenessIndicator size="sm" />
        <h2 className="font-semibold text-white">Claude</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'justify-end' : 'justify-start'} style={{ display: 'flex' }}>
            <div
              className={`max-w-xs rounded-lg px-3 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-gray-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' && msg.thoughts && (
                <ThoughtBlock thoughts={msg.thoughts} phase={msg.phase} />
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <textarea
          placeholder="Ask Claude to add, modify, or rebuild..."
          className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-medium text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
```

---

Save this as: `/IMPLEMENTATION_TEMPLATES.md` in the root

This gives you production-ready code to copy-paste into your components.

**Next Steps**:
1. Pick ONE from Phase 1 (Live File Tree or Hot Reload) and implement it this week
2. Test with actual builds to see how it feels
3. Then move to better narration/system prompt
4. Then multi-turn refinement

Which feature do you want to tackle first?
