# Atelier

Your interior designer, in liquid glass. Build a design language, model your apartment, tour it in any style, then let a budget agent find, price, negotiate and buy the products.

- **Architecture, APIs and connectors:** [ARCHITECTURE.md](./ARCHITECTURE.md) (also rendered in-app at `/architecture`)
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Zustand · Framer Motion · Anthropic SDK (Claude Opus 5, vision + structured output)

## Run

```bash
pnpm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for vision analysis
pnpm dev                     # http://localhost:3000
```

Without any keys the app runs in demo mode: colour extraction is client-side, mood analysis is heuristic, the sketch parser loads a sample flat, the product agent uses the curated catalogue, and connectors simulate consent.

## Flow

1. `/studio/language` – mood board, mood, palette → the whole UI re-skins.
2. `/studio/rooms` – sketch/photos → rooms with dimensions; drag the floor plan.
3. `/studio/tour` – click through rooms, try styles, swap element shapes/colours.
4. `/studio/budget` – budget, sources, connectors → run the product agent.
5. `/studio/products` – tagged tour, swipe alternatives or none, drag tags, live total.
6. `/studio/checkout` – negotiation + order agent with explicit authorisations.

## Scripts

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm exec tsc --noEmit`
