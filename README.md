# Atelier

Your interior designer, in liquid glass. Build a design language, model your apartment, tour it in any style, then let a budget agent find, price, negotiate and buy the products.

- **Architecture, APIs and connectors:** [ARCHITECTURE.md](./ARCHITECTURE.md) (also rendered in-app at `/architecture`)
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Zustand · Framer Motion · Anthropic SDK (Claude Opus 5, vision + structured output)

## Deploy as a website (no local setup needed)

**Vercel (recommended, free tier, made by the Next.js team)**

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub and import `KatharinaHermann/home`.
2. Leave the detected settings (Framework: Next.js). Optionally add `ANTHROPIC_API_KEY` under *Environment Variables*.
3. Click **Deploy**. You get a `*.vercel.app` URL in about two minutes.
4. Custom domain: *Project → Settings → Domains → Add*, then point your domain's DNS at Vercel as shown there (an `A` record to `76.76.21.21` or a `CNAME` to `cname.vercel-dns.com`). HTTPS is automatic.

Vercel deploys the repository's production branch (`main` by default). Either merge this branch into `main`, or set *Settings → Git → Production Branch* to the branch you want live. Every later push redeploys automatically.

**Any other host (Railway, Render, Fly.io, Hetzner, a VPS)**

The repo ships a `Dockerfile`. Build and run:

```bash
docker build -t atelier .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=... atelier
```

Put a reverse proxy (Caddy, nginx, the host's built-in one) in front for your domain and TLS.

## Run locally

Requires [Node.js 22](https://nodejs.org) (the LTS installer) and pnpm (`npm install -g pnpm`, or `corepack enable`).

```bash
pnpm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY for vision analysis
pnpm dev                     # http://localhost:3000
```

`npm install && npm run dev` works too if you prefer npm.

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
