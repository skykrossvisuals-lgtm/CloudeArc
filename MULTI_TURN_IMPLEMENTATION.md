# Multi-Turn Context Implementation Guide

## Summary

CloudeArc needs to support multi-turn builds where the AI remembers what it built previously and can extend/modify projects intelligently.

## Key Changes Needed

### 1. Backend: Store Build History (Database)

In `artifacts/api-server/src/lib/` create `buildHistory.ts`:

```typescript
// Store successful builds in PostgreSQL for retrieval
export async function recordBuild(projectId: string, build: {
  description: string;
  filesWritten: string[];
  userPrompt: string;
  timestamp: Date;
}) {
  // INSERT INTO build_history (projectId, description, filesWritten, userPrompt, timestamp)
  // VALUES ($1, $2, $3, $4, $5)
}

export async function getBuildHistory(projectId: string, limit: number = 10) {
  // SELECT * FROM build_history WHERE projectId = $1 ORDER BY timestamp DESC LIMIT $2
}
```

### 2. Backend: Enhance System Prompt with Context

In `artifacts/api-server/src/routes/chat.ts` at line ~868:

```typescript
// After historical prompts array:
const historyMessages = (history ?? []).slice(-8);

// ADD THIS: Get project context if projectId provided
let projectContext = '';
if (context?.projectId) {
  const previousBuilds = await getBuildHistory(context.projectId, 5);
  if (previousBuilds.length > 0) {
    const lastBuild = previousBuilds[0];
    projectContext = `
\n━━━ PROJECT CONTEXT ━━━
**Previous Request:** "${lastBuild.userPrompt}"
**Files Created:** ${lastBuild.filesWritten.join(', ')}
**Design Direction:** ${lastBuild.description}

If the current request is a continuation (e.g., "add", "modify", "improve"), 
build UPON the existing files. Do NOT regenerate them unless explicitly asked.
If only updating specific files, preserve everything else unchanged.
`;
  }
}

// Then update the BUILD_SYSTEM_PROMPT injection:
const messages: any[] = [
  { 
    role: "system", 
    content: BUILD_SYSTEM_PROMPT + projectContext  // ← Append context
  },
  ...historyMessages,
  { role: "user", content: prompt },
];
```

### 3. Frontend: Pass Project Context in Requests

In `artifacts/cloudearc/src/pages/chat.tsx`:

```typescript
// When sending a chat message:
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    prompt: userMessage,
    context: {
      projectId: currentProjectId,  // ← Pass this
      files: currentFiles,           // ← And this
    },
    history: previousMessages,
  }),
});
```

### 4. Frontend: Track Project in State

In workspace.tsx or chat.tsx:

```typescript
const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
  const saved = localStorage.getItem('cloudearc:project-id');
  return saved || `proj-${Date.now()}`;
});

// Save on every build completion
useEffect(() => {
  localStorage.setItem('cloudearc:project-id', currentProjectId);
}, [currentProjectId]);
```

### 5. Create Database Schema Addition

In `lib/db/src/schema/buildHistory.ts`:

```typescript
import { pgTable, text, timestamp, serial, jsonb } from "drizzle-orm/pg-core";

export const buildHistory = pgTable("build_history", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userPrompt: text("user_prompt").notNull(),
  description: text("description"),
  filesWritten: jsonb("files_written").default([]),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  feedback: text("feedback"),
});
```

Then run: `pnpm --filter @workspace/db run push`

## Result

After these changes:
- ✅ User says "Build a SaaS dashboard" → Creates 12 files, full app
- ✅ User says "Add a dark mode toggle to the header" → Finds Header.jsx, updates it, keeps everything else
- ✅ User says "Make the buttons bigger" → Identifies Button component, updates sizing
- ✅ Each request includes context about what was built before
- ✅ Agent never "forgets" the app structure

## Testing

```
1. /api/chat with { prompt: "Build a Todo app", projectId: "proj-123" }
2. App builds successfully, files created
3. /api/chat with { prompt: "Add a dark mode toggle", projectId: "proj-123", context: { files: [...] } }
4. AI should see the existing files and only modify what's needed
```

## Important Notes

- Each `projectId` persists on frontend via localStorage
- Project context is appended to the system prompt before each request
- Database stores build history for future retrievals
- No need to regenerate entire project on "add X" requests
