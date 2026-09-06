import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Glass, Eyebrow } from "@/components/glass/Glass";

const LAYERS = [
  { t: "Browser", d: "Next.js 16 App Router · React 19 · liquid-glass design system re-skinned from the palette · Zustand store · SVG scene renderer · swipe & drag interactions", c: 0 },
  { t: "API / BFF", d: "Route handlers: design analysis, sketch parsing, product search, two streaming agents (NDJSON), OAuth connectors, webhooks", c: 1 },
  { t: "Agents & AI", d: "Claude Opus 5 with vision + structured outputs (mood board → identity, sketch → rooms), negotiation copy; deterministic optimiser for budget allocation; durable workflows via Inngest/Temporal", c: 3 },
  { t: "Data", d: "Postgres + pgvector (products with embeddings, projects, plans, orders, encrypted connector tokens) · Redis for rate limits · R2/S3 for uploads and renders", c: 2 },
  { t: "Sources", d: "ProductSource adapters: affiliate feeds (Awin/CJ: IKEA, home24, Westwing, Wayfair), Amazon PA-API, eBay Browse, Etsy v3, SerpAPI, Facebook Marketplace & Kleinanzeigen via browser companion or scraping provider", c: 4 },
];

const CONNECTORS = [
  ["Pinterest API v5", "boards:read, pins:read", "Import boards into the mood board"],
  ["Facebook Login + Messenger Platform", "public_profile, email, pages_messaging", "Identity and negotiation threads; Marketplace search via browser companion"],
  ["Browser companion (extension)", "user session", "Marketplace & Kleinanzeigen search + sending drafted messages under the user's consent"],
  ["Amazon PA-API 5 + Login with Amazon", "Associates", "Search, prices, cart deep-links"],
  ["eBay Browse API", "client credentials", "New & used listings"],
  ["Etsy Open API v3", "API key", "Handmade rugs, art, zellige"],
  ["Awin / CJ / Rakuten feeds", "publisher", "IKEA, home24, Westwing, Wayfair, West Elm product feeds"],
  ["SerpAPI Google Shopping", "API key", "Long-tail design brands"],
  ["Apify / Bright Data", "feature-flagged", "Managed scraping where no API exists (legal review)"],
  ["Anthropic Claude API", "ANTHROPIC_API_KEY", "Vision analysis, structured extraction, negotiation copy, product re-rank"],
  ["Replicate / fal.ai (planned)", "API key", "ControlNet photoreal renders from the SVG scene"],
  ["Stripe (+ Issuing)", "secret key", "Fees; virtual cards with per-order limits for agent checkouts"],
  ["Inngest / Temporal", "event key", "Durable agent runs, retries, webhook re-entry"],
  ["Supabase / Neon Postgres + pgvector", "DATABASE_URL", "Persistence and product embeddings"],
  ["Clerk / Auth.js", "", "Authentication"],
  ["Cloudflare R2", "", "Uploads, renders"],
];

export default function ArchitecturePage() {
  return (
    <div className="max-w-[1100px] w-full mx-auto px-5 lg:px-8 py-6">
      <Link href="/" className="btn btn-ghost btn-sm mb-6"><ArrowLeft size={14} /> Back</Link>
      <Eyebrow className="mb-2">System design</Eyebrow>
      <h1 className="display text-4xl md:text-5xl mb-3">Architecture, APIs <span className="display-italic accent">& connectors.</span></h1>
      <p className="muted max-w-2xl mb-8">The full blueprint lives in <code className="mono">ARCHITECTURE.md</code>. This page is the short version: the layers, the two agents and every external service the product needs.</p>

      <div className="grid gap-3 mb-10">
        {LAYERS.map((l, i) => (
          <Glass key={l.t} className="p-4 flex gap-4 items-start fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="w-3 h-3 mt-2 rounded-full shrink-0" style={{ background: `var(--blob-${l.c + 1})`, boxShadow: "0 0 0 4px color-mix(in oklab, var(--ink) 8%, transparent)" }} />
            <div><div className="display text-xl">{l.t}</div><p className="muted text-sm mt-1">{l.d}</p></div>
          </Glass>
        ))}
      </div>

      <Eyebrow className="mb-3">The two agents</Eyebrow>
      <div className="grid md:grid-cols-2 gap-3 mb-10">
        <Glass className="p-5"><div className="display text-xl mb-2">Budget → product</div>
          <ol className="text-sm space-y-1.5 list-decimal pl-4 muted">
            <li>Derive categories from every room&apos;s slots</li><li>Fan out to each ready ProductSource; log skipped ones with the reason</li><li>Score: style fit 45 % · colour fit 30 % · source preference 25 %</li><li>Allocate by room importance × element weight; repair overspend; spend headroom on upgrades</li><li>Stream the plan with ranked candidates per slot</li>
          </ol></Glass>
        <Glass className="p-5"><div className="display text-xl mb-2">Buy & negotiate</div>
          <ol className="text-sm space-y-1.5 list-decimal pl-4 muted">
            <li>Marketplace items: Claude drafts an opener at the user&apos;s discount; counters re-enter via webhook/companion</li><li>Auto-accept under the user&apos;s ceiling, otherwise ask</li><li>Retail items: order only with explicit per-order authorisation (Stripe Issuing virtual card or user session)</li><li>Every action logged as a consent event</li>
          </ol></Glass>
      </div>

      <Eyebrow className="mb-3">Connectors & external APIs</Eyebrow>
      <Glass className="p-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left muted mono text-[10px] uppercase tracking-widest"><th className="p-3">Service</th><th className="p-3">Auth / scope</th><th className="p-3">Used for</th></tr></thead>
          <tbody>{CONNECTORS.map((r) => <tr key={r[0]} className="border-t hairline"><td className="p-3 font-medium">{r[0]}</td><td className="p-3 mono text-xs muted">{r[1]}</td><td className="p-3 muted">{r[2]}</td></tr>)}</tbody>
        </table>
      </Glass>

      <Glass className="p-5 mt-6">
        <div className="display text-xl mb-1">About Facebook Marketplace</div>
        <p className="muted text-sm">Meta publishes no Marketplace search API. We recommend a user-installed browser companion that searches and messages inside the user&apos;s own session, with Facebook Login for identity and Messenger Platform webhooks for replies. Managed scraping providers are possible behind a feature flag but conflict with Meta&apos;s terms and need legal review. The adapter seam in <code className="mono">src/lib/sources/facebook.ts</code> keeps the agent independent of the choice.</p>
      </Glass>
    </div>
  );
}
