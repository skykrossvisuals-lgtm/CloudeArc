import { Router, type Request, type Response } from "express";
import { buildSystemPrompt, type PersonalityContext, type RelationshipPhase } from "../lib/personalityEngine";

const router = Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FAST_MODEL     = process.env.MODEL_FAST ?? "qwen/qwen3-8b";
const ASK_TIMEOUT_MS = 55_000;

// Strips <think>...</think> blocks from streaming content.
class ThinkStripper {
  private buf = "";
  private inThink = false;

  push(chunk: string): string {
    this.buf += chunk;
    let out = "";
    while (this.buf.length > 0) {
      if (this.inThink) {
        const end = this.buf.indexOf("</think>");
        if (end !== -1) {
          this.inThink = false;
          this.buf = this.buf.slice(end + 8);
        } else {
          this.buf = this.buf.slice(Math.max(0, this.buf.length - 8));
          break;
        }
      } else {
        const start = this.buf.indexOf("<think>");
        if (start !== -1) {
          out += this.buf.slice(0, start);
          this.inThink = true;
          this.buf = this.buf.slice(start + 7);
        } else {
          const safe = this.buf.length - 7;
          if (safe > 0) {
            out += this.buf.slice(0, safe);
            this.buf = this.buf.slice(safe);
          }
          break;
        }
      }
    }
    return out;
  }

  flush(): string {
    const out = this.inThink ? "" : this.buf;
    this.buf = "";
    this.inThink = false;
    return out;
  }
}

router.post("/", async (req: Request, res: Response) => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) { res.status(500).json({ error: "OPENROUTER_API_KEY not configured" }); return; }

  const { prompt, fileList, intent, history, phase, tone, responseMode } = req.body as {
    prompt: string;
    fileList?: string[];
    intent?: "question" | "debug";
    history?: { role: "user" | "assistant"; content: string }[];
    phase?: RelationshipPhase;
    tone?: "cofounder" | "neutral" | "directive" | "exploratory";
    responseMode?: "short" | "medium" | "deep";
  };

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing prompt" }); return;
  }

  const log = req.log;

  const ctx: PersonalityContext = {
    appFiles: fileList ?? [],
  };

  const baseSystem = buildSystemPrompt(
    intent === "debug" ? "debug" : "clarification",
    ctx,
    phase,
  );
  const toneNote = tone === "directive"   ? "Be direct, assertive, and structured. State what you see and what to do next."
                 : tone === "exploratory" ? "Be curious, open-ended, and generative. Help the user think wider."
                 : tone === "cofounder"   ? "Sound like a cofounder — invested, opinionated, and action-oriented."
                 : "";
  const system = toneNote ? `${baseSystem}\n\nTone: ${toneNote}` : baseSystem;

  const responseModeTokens = responseMode === "short" ? 80
                           : responseMode === "deep"  ? 500
                           : 400;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ASK_TIMEOUT_MS);

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: FAST_MODEL,
        stream: true,
        temperature: intent === "debug" ? 0.2 : 0.3,
        max_tokens: responseModeTokens,
        messages: [
          { role: "system", content: system },
          ...(history ?? []).slice(-12),
          { role: "user",   content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const stripper = new ThinkStripper();
    const reader = upstream.body!.getReader();
    const decoder = new TextDecoder();
    let totalChars = 0;

    const flush = (text: string) => {
      if (!text) return;
      totalChars += text.length;
      res.write(`data: ${JSON.stringify(text)}\n\n`);
    };

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") break outer;
        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
          };
          const delta = parsed.choices?.[0]?.delta?.content ?? "";
          if (delta) flush(stripper.push(delta));
        } catch { /* skip malformed chunk */ }
      }
    }

    flush(stripper.flush());
    res.write("data: [DONE]\n\n");
    res.end();

    log.info({ chars: totalChars, intent }, "Ask ok");
  } catch (err: any) {
    const isTimeout = err.name === "AbortError";
    log.error({ err: err.message, isTimeout }, "Ask failed");
    if (!res.headersSent) {
      res.status(500).json({ error: isTimeout ? "Taking too long — try again." : "Something went wrong. Try again." });
    } else {
      res.write(`data: ${JSON.stringify({ error: isTimeout ? "Taking too long — try again." : "Something went wrong." })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } finally {
    clearTimeout(timer);
  }
});

export default router;
