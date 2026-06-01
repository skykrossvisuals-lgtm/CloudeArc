import { Router, type Request, type Response } from "express";
import { buildConverseSystemPrompt, type RelationshipPhase } from "../lib/personalityEngine";

const router = Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.MODEL_GENERAL ?? "qwen/qwen3-coder-next";

function sseSetup(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
}

function sseSend(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

type Message = { role: "user" | "assistant" | "system"; content: string };

router.post("/", async (req: Request, res: Response) => {
  const { messages, phase, tone, responseMode } = req.body as {
    messages: Message[];
    phase?: RelationshipPhase;
    tone?: "cofounder" | "neutral" | "directive" | "exploratory";
    responseMode?: "short" | "medium" | "deep";
  };
  if (!messages?.length) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  sseSetup(res);

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    sseSend(res, "error", { message: "OPENROUTER_API_KEY not configured" });
    res.end();
    return;
  }

  const converseTokens = responseMode === "short" ? 300
                       : responseMode === "deep"  ? 1200
                       : 900;

  const payload = {
    model: MODEL,
    messages: [{ role: "system", content: buildConverseSystemPrompt(phase) }, ...messages],
    temperature: tone === "directive" ? 0.55 : tone === "exploratory" ? 0.82 : 0.72,
    max_tokens: converseTokens,
    stream: true,
  };

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://cloudearc.replit.app",
        "X-Title": "CloudeArc",
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      sseSend(res, "error", { message: `API error: ${upstream.status} ${text.slice(0, 200)}` });
      res.end();
      return;
    }

    const reader = upstream.body?.getReader();
    if (!reader) {
      sseSend(res, "error", { message: "No response body" });
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") continue;
        try {
          const chunk = JSON.parse(raw);
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            if (!/<think>/i.test(delta) && !fullText.includes("<think>")) {
              sseSend(res, "token", { text: delta });
            }
          }
        } catch {}
      }
    }

    const readyMatch = fullText.match(/<READY>\s*(\{[\s\S]*?\})/);
    if (readyMatch) {
      try {
        const parsed = JSON.parse(readyMatch[1]);
        if (parsed.prompt) {
          sseSend(res, "build_intent", { prompt: parsed.prompt });
        }
      } catch {
        const fallbackMatch = fullText.match(/<READY>\s*\{[^}]*"prompt"\s*:\s*"([^"]+)"/);
        if (fallbackMatch) {
          sseSend(res, "build_intent", { prompt: fallbackMatch[1] });
        }
      }
    }

    sseSend(res, "done", {});
    res.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    sseSend(res, "error", { message: msg });
    res.end();
  }
});

export default router;
