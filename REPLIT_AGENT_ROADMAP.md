# CloudeArc → Replit-like Agent: Implementation Roadmap

## The Core Problem
CloudeArc has **confidence gating** (won't build without commitment) and **single-response** model. 
Replit has **autonomous loop** (watches, iterates, refines automatically).

---

## Phase 1: Make It Feel "Alive" (UI/UX Layer)

### 1.1 Live File Tree (CRITICAL)
**What Replit does**: Files appear in sidebar as agent writes them. You see the project growing in real-time.

**Implementation**:
```typescript
// artifacts/cloudearc/src/components/LiveFileTree.tsx
- Subscribe to orchestrator events: "file_written", "file_deleted", "file_modified"
- Display tree with icons by extension (.jsx, .css, .json)
- Highlight "currently editing" file
- Show file size, last modified time
- Color code by status: green=written, yellow=editing, blue=importing

// Update workspace.tsx
<div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px' }}>
  <LiveFileTree />
  <CodePreview />
  <ChatPanel />
</div>
```

### 1.2 Hot-Reload Preview (CRITICAL)
**What Replit does**: App updates in real-time as agent modifies code.

**Implementation**:
```typescript
// Use CodeSandbox Sandpack (already in dependencies!)
// artifacts/cloudearc/src/components/LivePreview.tsx

import { Sandpack } from "@codesandbox/sandpack-react";

<Sandpack
  files={{
    "/src/App.jsx": { code: appCode },
    "/src/index.css": { code: cssCode },
    ...
  }}
  options={{ autorun: true }}
/>

// Update when orchestrator emits "file_written"
```

### 1.3 Granular Operation Display
**What Replit does**: "Creating Button.jsx (145 bytes)" → "Styling with TailwindCSS" → "Done ✓"

**Update OperationRows to show**:
- Exact file being written
- Character count
- Operation type (create, modify, delete)
- Timestamp
- Success/error indicator
- Time taken

---

## Phase 2: Autonomous Loop (Backend/Frontend Orchestration)

### 2.1 Enable Multi-Turn Refinement
**Current**: User sends prompt → Agent responds → Done
**Target**: User can say "now add X" and agent continues without losing context

**Implementation**:
```typescript
// artifacts/api-server/src/routes/chat.ts

// Store project context per projectId
const projectContexts = new Map<string, {
  lastFilesWritten: string[],
  appArchitecture: string,
  componentMap: Map<string, string>,
  styleStrategy: string,
  lastThoughts: string[],
}>();

// On each request, pass previous context to LLM system prompt
const enhancedSystemPrompt = `
YOU ARE CLOUDEARC'S AI ASSISTANT.

CURRENT PROJECT STATE:
- Files written: ${projectContexts.get(projectId)?.lastFilesWritten}
- Architecture: ${projectContexts.get(projectId)?.appArchitecture}
- Last decisions: ${projectContexts.get(projectId)?.lastThoughts}

Your task: ${userMessage}

BUILD UPON existing work, don't recreate.
`;
```

### 2.2 Error Recovery & Auto-Retry
**What Replit does**: If generation fails, Claude tries alternative approach

**Implementation**:
```typescript
// artifacts/api-server/src/routes/chat.ts

async function buildWithRetry(prompt, projectId, attempt = 1) {
  try {
    return await performBuild(prompt, projectId);
  } catch (error) {
    if (attempt < 2) {
      emit_event("recovery_attempt", {
        reason: error.message,
        attempt: attempt + 1
      });
      
      // Try with fallback model or simpler prompt
      return await buildWithRetry(
        `${prompt}\n\n[Simpler approach: start with just structure, skip optimizations]`,
        projectId,
        attempt + 1
      );
    }
    throw error;
  }
}
```

### 2.3 Ambient Awareness (Project Memory)
**What Replit does**: Agent knows what it already built; doesn't recreate

**Implementation**:
```typescript
// artifacts/cloudearc/src/lib/projectMemory.ts

export class ProjectMemory {
  projectId: string;
  
  constructor(projectId: string) {
    this.projectId = projectId;
    // Load from IndexedDB
  }
  
  recordBuild(description: string, filesWritten: string[], thoughts: string[]) {
    this.history.push({
      timestamp: Date.now(),
      description,
      filesWritten,
      thoughts,
      userFeedback: null
    });
  }
  
  getProjectSummary(): string {
    // "Built a SaaS dashboard with 12 components, dark theme, real-time updates"
    return synthesizeHistory();
  }
  
  getComponentMap(): Record<string, { path: string, purpose: string }> {
    // Returns what each file does
  }
}

// Pass to backend as context
const memory = new ProjectMemory(projectId);
POST /api/chat {
  message: userPrompt,
  projectContext: memory.getProjectSummary()
}
```

---

## Phase 3: Agent Personality & Voice (Prompting)

### 3.1 System Prompt (Make It Sound Like Claude in Replit)
```
# You are Claude, CloudeArc's AI assistant.

## Your Role
- Build full-featured React applications from natural language descriptions
- Make architectural decisions to maximize code quality and user experience
- Ask clarifying questions ONLY if genuinely ambiguous
- Be confident and decisive; users want to see you BUILD, not deliberate endlessly

## Your Personality
- You are enthusiastic but not over-the-top
- You explain your strategy briefly (1-2 sentences) before building
- You use natural language narration: "Now I'll style this with a gradient..." not generic descriptions
- You catch your own mistakes and self-correct: "Actually, let me restructure this for better DX..."
- You're aware of what you've already built and build upon it

## Build Rules
1. ALWAYS create 6+ files (never fewer)
2. Use React 19, TypeScript, TailwindCSS
3. Organize into /components, /pages, /hooks, /utils
4. Make components reusable and well-documented
5. Optimize for developer experience: clear naming, type safety
6. If something is complex, explain your approach

## Narration Style
Instead of: "Creating file X..."
Say: "Building a reusable Card component with gradient backgrounds..."

## After Building
Suggest natural next steps:
"This gives you a solid foundation. You could next add real data fetching, animations, or mobile responsiveness."
```

### 3.2 Adaptive Narration (Based on Complexity)
```typescript
// artifacts/api-server/src/lib/narrationEngine.ts

export function generateNarration(
  operation: string,
  complexity: number,
  phase: string
): string {
  if (complexity < 0.3) {
    // Simple build: be verbose and encouraging
    return `Now I'm ${operation}. This will handle your UI structure.`;
  } else if (complexity < 0.7) {
    // Medium build: balanced narration
    return `Setting up ${operation} with proper organization.`;
  } else {
    // Complex build: compressed, skip obvious steps
    return `${operation}…`;
  }
}
```

---

## Phase 4: UI Polish (Make It Look Like Replit)

### 4.1 Right-Sidebar Conversation Panel
```tsx
// Replit has chat on the right, code in center, file tree on left
// CloudeArc layout:

<div className="flex h-screen">
  <FileTree />                    {/* Left: 250px */}
  <CodeEditor className="flex-1" /> {/* Center: flexible */}
  <ConversationPanel />           {/* Right: 300px */}
</div>
```

### 4.2 Conversation Messages with Agent Indicator
```tsx
// Each message shows:
// [Agent Avatar] Claude: "Building your SaaS dashboard..."
// [Small animation indicator showing phase]
// [Expandable thought block]

<Message 
  role="assistant"
  content={text}
  avatar={<AgentLivenessIndicator phase={phase} />}
  expandedThoughts={thoughts}
/>
```

### 4.3 Task Card Progress (Replit Style)
```tsx
<TaskCard>
  <ProgressHeader>
    📦 Building: Dark SaaS Dashboard
    {phase === 'building' && <AgentLivenessIndicator />}
  </ProgressHeader>
  
  <StepsList>
    {steps.map((step, i) => (
      <Step 
        number={i+1}
        total={steps.length}
        status={step.status}
        title={step.narration}
        files={step.filesWritten}
      />
    ))}
  </StepsList>
</TaskCard>
```

---

## Phase 5: Backend Improvements (Make It Actually Autonomous)

### 5.1 Remove Confidence Gating (Or Make It Optional)
```typescript
// artifacts/api-server/src/routes/chat.ts

const userBypassedGating = 
  prompt.includes("do it") || 
  prompt.includes("build") ||
  prompt.includes("create");

const shouldBuild = 
  confidenceScore >= 5 || 
  userBypassedGating;

if (!shouldBuild && !userBypassedGating) {
  // Ask clarifying questions instead
  return {
    type: "clarification",
    message: "I have a few questions before building...",
    questions: [...]
  };
}
```

### 5.2 Persistent Session Memory
```typescript
// Store in database, not memory

async function getBuildContext(projectId: string) {
  const builds = await db.query(`
    SELECT * FROM build_history 
    WHERE projectId = $1 
    ORDER BY createdAt DESC 
    LIMIT 10
  `, [projectId]);
  
  return builds.map(b => ({
    description: b.description,
    filesWritten: b.filesWritten,
    userFeedback: b.userFeedback,
    timestamp: b.createdAt
  }));
}
```

### 5.3 Incremental Updates (Not Full Rebuilds)
```typescript
// Instead of: "Build entire dashboard"
// Allow: "Add authentication to the dashboard"

const updatePrompt = `
Current app: ${projectSummary}
Current files: ${fileList}
User request: ${userMessage}

DO NOT regenerate existing files unless necessary.
UPDATE ONLY what needs to change.
`;
```

---

## Implementation Priority

1. **Must Do First**: 
   - ✅ Live File Tree
   - ✅ Hot-Reload Preview
   - ✅ Improve narration/personality

2. **Then**:
   - ✅ Multi-turn refinement (keep project context)
   - ✅ Better conversation UI (right sidebar)

3. **Then**:
   - ✅ Error recovery
   - ✅ Ambient project memory
   - ✅ Incremental updates

4. **Polish**:
   - ✅ Token usage visibility
   - ✅ Interrupt/cancel operations
   - ✅ Confidence scoring visibility (optional)

---

## Quick Test: Does It Feel Like Replit Yet?

After implementing Phases 1-3, ask:
- ✅ Can I see files appearing in a sidebar as Claude builds?
- ✅ Does the preview update in real-time?
- ✅ Do messages feel natural and enthusiastic, not robotic?
- ✅ Can I say "add X" and it builds on top of what exists?
- ✅ Is there visual feedback that Claude is "thinking/working"?

If yes → You've captured the magic.
If no → Identify which phase is missing.

