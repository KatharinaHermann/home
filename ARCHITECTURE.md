# Atelier — architecture, APIs, connectors

Atelier is an interior-design copilot for people who can't afford an interior designer. This document is the engineering blueprint: what is built in this repo today, what the production system looks like, and every external API, plug-in or connector it needs.

## 0. What ships in this repository

| Layer | Status | Where |
|---|---|---|
| Liquid-glass design system that re-skins itself from the user's palette + mood | ✅ built | `src/app/globals.css`, `src/lib/theme.ts`, `src/components/ThemeProvider.tsx` |
| Step 1 · Design language: mood board (screenshots, Pinterest URLs, notes), k-means colour extraction, 10 moods, 14 palettes + custom, Claude vision analysis with heuristic fallback | ✅ built | `src/components/language/*`, `src/lib/moods.ts`, `src/lib/ai/claude.ts`, `POST /api/design/analyze` |
| Step 2 · Room constructor: sketch/photo upload → Claude vision → rooms with dimensions; editable floor plan (drag rooms), per-room photos, demo flat | ✅ built | `src/components/rooms/*`, `POST /api/rooms/parse` |
| Step 3 · Room tour: AD-style click-through, style + palette try-on, per-element shape/colour swap, hide element, confirm | ✅ built | `src/components/tour/*`, `src/components/scenes/*` (SVG scene renderer, 7 room types, 30+ element variants) |
| Step 4 · Budget → product agent: budget, source tiers, city/radius, priority rooms, OAuth connectors, streaming agent console, optimiser | ✅ built | `src/components/budget/*`, `src/lib/optimizer.ts`, `src/lib/sources/*`, `POST /api/agents/products` (NDJSON stream) |
| Step 5 · Tagged product tour: draggable price tags, swipe deck per product (alternatives + "none"), live running total, confirm | ✅ built | `src/components/products/*` |
| Step 6 · Buy & negotiate agent: negotiation threads with limits, retailer orders behind explicit authorisation, streamed | ✅ built (simulated sellers) | `src/components/checkout/*`, `POST /api/agents/checkout` |
| Source adapters (curated catalogue, Facebook Marketplace, Kleinanzeigen, Amazon PA-API, eBay, Etsy, Awin, CJ, SerpAPI) | interface + stubs | `src/lib/sources/*` |
| OAuth connectors (Facebook, Pinterest, Amazon) with demo fallback | ✅ built (token exchange stubbed) | `src/app/api/connectors/[provider]/*` |
| Persistence | localStorage (Zustand persist) | `src/lib/store.ts` |

The seed catalogue (`src/lib/catalog.ts`, ~150 products, illustrative prices) stands in for live sources so the entire flow can be exercised without any keys.

## 1. Product flow

```
mood board ─► design language (mood, palette, keywords, materials)
                        │  re-skins UI + every room render
sketch/photos ─► apartment model (rooms, m², heights, layout)
                        │
                 room tour ─► per-element overrides (shape, colour, hidden)
                        │  confirm
budget + sources ─► PRODUCT AGENT ─► plan (item per slot, ranked candidates)
                        │
            tagged tour: swipe / drag / none / live total ─► confirm
                        │
                CHECKOUT AGENT ─► negotiations (marketplace) + orders (retail)
```

## 2. Domain model

- **DesignLanguage** `{ moodId, paletteId, customPalettes[], moodboard[], keywords[], materials[] }` — a *Mood* drives typography (serif / sans / mono), corner radius, background motion energy and product style tags; a *Palette* is 5 roles: wall, secondary, wood/warm, accent, ink.
- **Room** `{ type, w, l, h, x, y, photos[] }`; each room type exposes **Slots** (`walls`, `floor`, `sofa`, `pendant`, …) with a product category, visual variants, importance weight and default tag position (`src/lib/rooms.ts`).
- **Product** `{ source, tier, category, price, perSqm?, styleTags[], colors[], variant, condition, meta }` — normalised shape every adapter maps into.
- **Plan** `{ items: PlacedProduct[], candidates: Record<key, productId[]> }` where `key = roomId:slotId`.
- **Order** `{ kind: negotiation | order | pickup, status, thread[], targetPrice, finalPrice, authorized }`.

## 3. The two agents

### 3.1 Budget → product agent (`/api/agents/products`)
1. Derive the category list from every room's slots.
2. Fan out a `SearchQuery {category, mood, palette, keywords, city, radius}` to every `ProductSource` whose `status()` is `ready`; log skipped sources with the reason (needs key / needs auth).
3. Score each candidate: **style fit 45 %** (tag overlap with the mood), **colour fit 30 %** (min HSL distance to the palette, `src/lib/color.ts`), **source preference 25 %** (the user's tier sliders; "existing" is a hard on/off).
4. Optimise (`src/lib/optimizer.ts`): target share per slot = weight / Σweights × budget (room importance × slot weight × priority boost) → pick best score near target → **repair** overspend by downgrading the item with the least score-loss per euro, then dropping lowest-weight décor → **use headroom** (< 92 % spent) by upgrading best score-gain per euro. Per-m² products (paint, flooring, tiles, cabinet fronts, worktops) are priced from room geometry.
5. Stream `log`, `source`, `plan`, `done` events as NDJSON.

Production upgrades: replace the deterministic scorer with a Claude re-rank over the top-N per slot (vision on product photos vs. mood board), and run the fan-out in a durable workflow (Inngest / Temporal) because marketplace sources are slow and rate-limited.

### 3.2 Checkout agent (`/api/agents/checkout`)
State machine per item: `queued → messaging → counter → agreed | awaiting-auth` (marketplace) and `queued → ordered | awaiting-auth` (retail). Negotiation copy is drafted by Claude (`draftNegotiation`) inside the user's limits (opening discount, auto-accept ceiling, tone). In production seller replies arrive via webhook (Messenger Platform) or the browser companion and re-enter the machine; the user is notified for anything outside their limits. Nothing is bought without an explicit per-order authorisation.

## 4. Production architecture

```
┌──────────────── Browser (Next.js App Router, React 19) ────────────────┐
│ liquid-glass UI · zustand store · SVG scene renderer · swipe/drag      │
│ optional: three.js/R3F 3D walkthrough · Replicate img2img photoreal    │
└──────────────┬────────────────────────────────────┬────────────────────┘
               │ route handlers (BFF)               │ OAuth redirects
┌──────────────▼────────────────────────────────────▼────────────────────┐
│ API layer (Next.js route handlers / tRPC)                              │
│  /api/design/analyze  /api/rooms/parse  /api/products/search           │
│  /api/agents/products (stream)  /api/agents/checkout (stream)          │
│  /api/connectors/{provider}/{authorize,callback}  /api/webhooks/*      │
└───┬───────────────┬───────────────┬───────────────┬────────────────────┘
    │               │               │               │
┌───▼────┐   ┌──────▼──────┐  ┌─────▼─────┐   ┌─────▼──────────────────┐
│ Claude │   │ Workflow    │  │ Postgres  │   │ Object storage         │
│ API    │   │ engine      │  │ + pgvector│   │ (S3/R2): uploads,      │
│ Opus 5 │   │ Inngest /   │  │ Supabase  │   │ renders, product imgs  │
│ vision,│   │ Temporal    │  │ or Neon   │   └────────────────────────┘
│ struct.│   │ (agent runs,│  └───────────┘
│ output │   │ retries,    │
└────────┘   │ webhooks)   │
             └──────┬──────┘
   ┌────────────────┼──────────────────────────────────────────┐
   │ Product sources (adapters implementing ProductSource)     │
   │ retailer/affiliate APIs · marketplace connectors ·        │
   │ scraping providers · browser companion relay              │
   └───────────────────────────────────────────────────────────┘
```

**Recommended stack**: Next.js 16 on Vercel (or Fly.io for long-running streams), Postgres + pgvector (Supabase/Neon), Redis (Upstash) for rate limits and job locks, Inngest for agent workflows and webhook re-entry, Clerk or Auth.js for auth, Cloudflare R2 for uploads, Sentry + PostHog for observability/analytics.

**Data model additions for production**: `users`, `projects`, `design_languages`, `rooms`, `room_overrides`, `plans`, `plan_items`, `products` (normalised cache with embeddings), `sources`, `connector_tokens` (encrypted with KMS, per-user), `orders`, `order_events`, `webhook_inbox`.

**Persistence today** is localStorage; the store shape maps 1:1 onto those tables.

## 5. AI usage (Anthropic)

| Call | Model | Mode | Where |
|---|---|---|---|
| Mood board → design language | `claude-opus-5`, vision + structured output (`zodOutputFormat`) | adaptive thinking, effort medium | `analyzeMoodboard` |
| Sketch/photos → rooms with dimensions | `claude-opus-5`, vision + structured output | effort high | `parseSketch` |
| Negotiation messages | `claude-opus-5` | effort low | `draftNegotiation` |
| (planned) product re-rank vs. mood board, room-tour copy, "why this product" explanations | `claude-opus-5` / `claude-sonnet-5` for bulk | | |

All calls degrade to deterministic fallbacks when `ANTHROPIC_API_KEY` is unset so the product demo never breaks. Uploads are downscaled client-side (≤ 1200 px) before they are sent.

**Photoreal renders (optional, planned)**: the SVG scene is the "control image"; a ControlNet/img2img model on Replicate or fal.ai (Stable Diffusion XL / FLUX with depth + segmentation control) produces a photographic version in the selected palette. Alternative: Spacely / Decor8 / ReRoom style APIs.

**3D (optional, planned)**: rooms → `three.js` / `@react-three/fiber` box model with placed product GLBs (IKEA and most design brands publish GLTF/USDZ; Sketchfab and Polyhaven for generic). Used for a first-person walkthrough and AR preview via `<model-viewer>`.

## 6. Connectors & external APIs

### 6.1 Inspiration
| Need | Integration | Notes |
|---|---|---|
| Pinterest boards | **Pinterest API v5** (OAuth, `boards:read`, `pins:read`) | Import a board's pins as mood-board items. Requires app review for standard access. Built: authorize/callback; pin fetch TODO. |
| Screenshot upload | direct upload → R2/S3 | Colour extraction runs client-side (k-means, `src/lib/color.ts`). |
| Instagram saved posts | Instagram Basic Display is deprecated; **Instagram Graph API** only for business accounts | Treat as "paste a link" + oEmbed. |
| Image search for references | Bing Image Search / Unsplash API | Fill a mood with reference photos. |

### 6.2 Product discovery (`ProductSource` adapters)
| Source | Integration | Auth / cost | Status |
|---|---|---|---|
| IKEA | No public API. Options: **Awin affiliate product feed** (official for many markets), or the unofficial `ikea-api` client for search/availability | Awin publisher account | stub |
| Amazon | **Product Advertising API 5.0** (search, prices, images) | Associates account, 1 req/s until sales | stub |
| eBay | **Browse API** (`item_summary/search`) | OAuth client credentials | stub |
| Etsy | **Open API v3** (`findAllListingsActive`) | API key + app approval | stub |
| Wayfair, West Elm, home24, Westwing, Zara Home, H&M Home, Bauhaus | **Affiliate networks**: Awin, CJ, Rakuten, Impact product feeds (CSV/JSON, daily) → ingest into `products` with embeddings | network membership | stub |
| Design brands (Vitra, HAY, Muuto, GUBI, &Tradition, Louis Poulsen) | Retailer feeds via Connox / Nordic Nest / Finnish Design Shop affiliate programmes; brand sites via scraping provider | | seed data |
| Paint (Farrow & Ball, Little Greene, Jotun, Alpina) | Colour cards are public; prices via retailer feeds | | seed data |
| Long-tail | **SerpAPI Google Shopping** or **Bright Data SERP** | per-request | stub |
| Kleinanzeigen (DE) | No API. **Apify actor** or the browser companion | | stub |
| **Facebook Marketplace** | see 6.3 | | stub + OAuth |

Normalisation pipeline: adapter → `Product` → dedupe (image hash + title similarity) → colour extraction from product image → style tagging (Claude batch, cached) → embeddings (pgvector) → search.

### 6.3 Facebook Marketplace (the honest version)
Meta offers **no public Marketplace search API**; Marketplace partner APIs exist only for large sellers/dealers. Three viable approaches, ordered by how much we recommend them:

1. **Browser companion (recommended).** A small extension the user installs. It runs searches in the user's own logged-in Facebook session, sends listing cards to our API, and can send messages the agent drafted only after the user taps "send" (or under a per-listing authorisation). Everything happens under the user's identity and consent; no shared scraping infrastructure. Same companion covers Kleinanzeigen.
2. **Meta Login + Messenger Platform.** Use **Facebook Login** (OAuth 2, `public_profile`, `email`) for identity and, where the seller is a Page, the **Messenger Platform** (`pages_messaging`) for the negotiation thread with webhook replies. Does not give search.
3. **Managed scraping providers** (Apify `facebook-marketplace-scraper`, Bright Data) behind a feature flag. Fastest to ship; violates Meta ToS and is fragile. Legal review required; never store other users' personal data beyond what is needed for the listing.

The seam is `src/lib/sources/facebook.ts`; the agent does not care which backend answers.

### 6.4 Purchasing & payments
| Need | Integration |
|---|---|
| Retailer orders | Per-retailer: Amazon (cart via PA-API `AddToCart` URL + user session), IKEA (click & collect deep-link), affiliate deep-links with basket pre-fill. True "agent places the order" requires either a **browser automation session under the user's login** (Playwright in a per-user sandbox, or the companion) or **merchant APIs** where they exist. Always a per-order authorisation. |
| Payments | **Stripe** (Link / Payment Element) for our own fees; never store card data. Use **Stripe Issuing virtual cards** with per-order spend limits if we execute retailer checkouts on the user's behalf. |
| Marketplace payments | Cash on pickup or Facebook Pay / PayPal between users; agent only agrees price and pickup slot. |
| Delivery slots | retailer-specific; Shippo / Sendcloud for marketplace item courier quotes. |

### 6.5 Platform services
| Concern | Choice |
|---|---|
| Auth | Clerk or Auth.js (email, Google, Apple) |
| DB | Postgres + pgvector (Supabase / Neon), Prisma or Drizzle |
| Jobs / agents | Inngest (or Temporal) — durable fan-out, retries, webhook re-entry, rate-limit per source |
| Cache / rate limits | Upstash Redis |
| Files | Cloudflare R2 / S3, `sharp` for thumbnails |
| Observability | Sentry, OpenTelemetry → Grafana/Honeycomb, PostHog product analytics |
| E-mail / notifications | Resend (order confirmations, "seller replied" alerts), Web Push |
| Geocoding | Mapbox / Google Places for pickup radius |
| Currency | ECB reference rates (`exchangerate.host`) for multi-currency catalogues |

## 7. API surface (this repo)

| Route | Body → Response |
|---|---|
| `POST /api/design/analyze` | `{images[], notes[], urls[], extractedColors[]}` → `{moodId, keywords, materials, palette[5], summary, mode}` |
| `POST /api/rooms/parse` | `{images[], hint}` → `{rooms[], confidence, mode}` |
| `GET /api/products/search` | `?category&mood&palette` → ranked products + source statuses |
| `POST /api/agents/products` | `{rooms, design, budget, connectors}` → NDJSON `AgentEvent` stream ending with `plan` |
| `POST /api/agents/checkout` | `{items, rooms, tone, discount, maxAuto, authOrders, authNeg, connectors}` → NDJSON stream of `order` events |
| `GET /api/connectors/:provider/authorize` | redirect to consent (or demo callback) |
| `GET /api/connectors/:provider/callback` | token exchange → redirect `?connected=:provider` |

## 8. Security, privacy, compliance

- Connector tokens are stored server-side, encrypted (KMS), scoped to the minimum; the browser never sees them.
- Every purchase and every outbound message is an explicit, revocable authorisation with logged consent (`order_events`).
- Uploads (floor plans, room photos) are personal data: encrypt at rest, delete on project deletion, strip EXIF.
- Scraping is behind feature flags with per-source legal sign-off; prefer official APIs and user-session companions.
- GDPR: data export + deletion endpoints, DPA with sub-processors (Anthropic, Vercel, Supabase, Stripe).

## 9. Roadmap after this build

1. Real persistence (Postgres) + auth; multi-project.
2. Pinterest pin import; affiliate feed ingestion (Awin/CJ) with nightly refresh.
3. Browser companion for Marketplace + Kleinanzeigen; Messenger webhooks.
4. Claude re-rank of candidates against the mood board; "why this" explanations in the swipe deck.
5. Photoreal renders (ControlNet) and 3D walkthrough; AR preview.
6. Stripe Issuing for agent-executed checkouts; order tracking inbox.
