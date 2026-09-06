"use client";
import type { AgentEvent } from "./types";

/** Consume an NDJSON stream of AgentEvents. */
export async function readEvents(res: Response, onEvent: (e: AgentEvent) => void) {
  const reader = res.body!.getReader(); const dec = new TextDecoder(); let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (line) onEvent(JSON.parse(line));
    }
  }
}
