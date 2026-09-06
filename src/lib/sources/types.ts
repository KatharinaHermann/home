import type { Product } from "../catalog";
import type { Mood, Palette } from "../moods";

/**
 * Every product source (retailer API, affiliate feed, marketplace
 * connector, scraper) implements this interface. The product agent fans
 * out a `SearchQuery` to all enabled sources and merges the results
 * before handing them to the optimiser.
 */
export type SearchQuery = {
  category: string;
  mood: Mood;
  palette: Palette;
  maxPrice?: number;
  city?: string;
  radiusKm?: number;
  /** free-text hints from the design language, e.g. "walnut", "bouclé" */
  keywords: string[];
};

export type SourceStatus = "ready" | "needs-auth" | "needs-key" | "disabled";

export interface ProductSource {
  id: string;
  label: string;
  /** What this source needs to work in production. Shown in the UI. */
  requires: string[];
  status(): SourceStatus;
  search(q: SearchQuery): Promise<Product[]>;
}
