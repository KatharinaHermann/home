import type { AgentEvent } from "./types";

/** Server helper: turn an async generator of events into a streaming Response. */
export function ndjson(gen: AsyncGenerator<AgentEvent>): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try { for await (const e of gen) controller.enqueue(enc.encode(JSON.stringify(e) + "\n")); }
      catch (err) { controller.enqueue(enc.encode(JSON.stringify({ type: "log", level: "warn", text: `Agent error: ${(err as Error).message}`, at: Date.now() }) + "\n")); }
      finally { controller.close(); }
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
