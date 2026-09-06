import { byCategory } from "../catalog";
import type { ProductSource, SearchQuery } from "./types";

/**
 * Facebook Marketplace.
 *
 * There is no public Marketplace search API. Production options, in the
 * order we recommend them (see ARCHITECTURE.md → Connectors):
 *  1. Meta "Login with Facebook" (OAuth) for identity + Messenger Platform
 *     for the negotiation thread (requires App Review: `pages_messaging`).
 *  2. A user-installed browser companion (extension) that runs searches in
 *     the user's own logged-in session and posts listings to our API.
 *     Keeps us inside the user's consent and off Meta's scraper radar.
 *  3. Managed scraping providers (Apify "facebook-marketplace-scraper",
 *     Bright Data) behind a feature flag and ToS review.
 *
 * This adapter is the server-side seam: swap `search` for a real backend
 * without touching the agent.
 */
export function makeFacebookSource(opts: { accessToken?: string }): ProductSource {
  return {
    id: "fb-marketplace",
    label: "Facebook Marketplace",
    requires: ["META_APP_ID", "META_APP_SECRET", "user OAuth (marketplace scope) or companion extension"],
    status: () => (opts.accessToken ? "ready" : process.env.META_APP_ID ? "needs-auth" : "needs-key"),
    async search(q: SearchQuery) {
      if (!opts.accessToken) return [];
      // TODO(prod): call the companion-extension relay / scraping provider here.
      const radius = q.radiusKm ?? 25;
      return byCategory(q.category).filter((p) => p.source === "fb-marketplace" && (p.meta?.distanceKm ?? 0) <= radius);
    },
  };
}
