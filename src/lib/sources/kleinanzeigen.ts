import { byCategory } from "../catalog";
import type { ProductSource, SearchQuery } from "./types";

/** Kleinanzeigen (DE) – no official API; scraped via a provider or companion. */
export function makeKleinanzeigenSource(opts: { enabled: boolean }): ProductSource {
  return {
    id: "kleinanzeigen",
    label: "Kleinanzeigen",
    requires: ["SCRAPER_PROVIDER_KEY (Apify/Bright Data) or companion extension"],
    status: () => (opts.enabled ? "ready" : "needs-auth"),
    async search(q: SearchQuery) {
      if (!opts.enabled) return [];
      return byCategory(q.category).filter((p) => p.source === "kleinanzeigen");
    },
  };
}
