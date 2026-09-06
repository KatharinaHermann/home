import type { ProductSource, SearchQuery } from "./types";

/**
 * Retailer / affiliate sources. Each one lists the real integration it maps
 * to; until keys are configured they report `needs-key` and return nothing
 * (the curated catalogue covers demos).
 */
const stub = (id: string, label: string, requires: string[], envKey: string): ProductSource => ({
  id, label, requires,
  status: () => (process.env[envKey] ? "ready" : "needs-key"),
  async search(_q: SearchQuery) {
    void _q;
    // TODO(prod): implement per-provider fetch + normalisation to `Product`.
    return [];
  },
});

export const retailerSources: ProductSource[] = [
  stub("amazon-paapi", "Amazon Product Advertising API", ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET", "AMAZON_ASSOCIATE_TAG"], "AMAZON_PAAPI_ACCESS_KEY"),
  stub("ebay-browse", "eBay Browse API", ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET"], "EBAY_CLIENT_ID"),
  stub("etsy-v3", "Etsy Open API v3", ["ETSY_API_KEY"], "ETSY_API_KEY"),
  stub("awin", "Awin affiliate feeds (IKEA, home24, Westwing, Wayfair…)", ["AWIN_API_TOKEN", "AWIN_PUBLISHER_ID"], "AWIN_API_TOKEN"),
  stub("cj", "CJ Affiliate product feeds (West Elm, Wayfair)", ["CJ_DEV_KEY"], "CJ_DEV_KEY"),
  stub("serp-shopping", "SerpAPI Google Shopping (long-tail brands)", ["SERPAPI_KEY"], "SERPAPI_KEY"),
];
