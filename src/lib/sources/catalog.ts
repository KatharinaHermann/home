import { byCategory } from "../catalog";
import type { ProductSource, SearchQuery } from "./types";

/** Local seed catalogue – always available, used for demos and as a fallback. */
export const catalogSource: ProductSource = {
  id: "catalog",
  label: "Curated catalogue",
  requires: [],
  status: () => "ready",
  async search(q: SearchQuery) {
    return byCategory(q.category).filter((p) => p.source !== "fb-marketplace" && p.source !== "kleinanzeigen");
  },
};
