# World Cup Poly Aggregator

A minimal React app that aggregates [Polymarket](https://polymarket.com) prediction-market odds for the 2026 FIFA World Cup, alongside the full match schedule.

Live site: https://robinino.github.io/worldcup-poly-aggregator/

## Stack

- **Vite 6** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first configuration)
- **react-router v7** (`HashRouter` for static hosting)
- No backend — all API calls run in the browser

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Pages

- **`/`** — Predictions: top candidates for tournament winner and top goal scorer, aggregated from Polymarket.
- **`/schedule`** — Full match schedule from openfootball, with per-match Polymarket odds, displayed in Israel local time.

## Data Sources

| Source | URL | Auth |
|--------|-----|------|
| Polymarket Gamma API | `https://gamma-api.polymarket.com/events?...` | None |
| openfootball | `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json` | None |

## Deployment (GitHub Pages)

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages.

One-time setup: in the repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Because this is a project site served from a subpath, `vite.config.ts` sets `base: "/worldcup-poly-aggregator/"` and the app uses `HashRouter` so deep links and refreshes work without server-side routing.

## CORS caveat

GitHub Pages is a static host and cannot proxy requests. In development, Vite's dev proxy (`/polymarket-api` → `gamma-api.polymarket.com`) handles CORS, but in production the browser calls the Polymarket API directly. If Polymarket stops sending permissive CORS headers, the predictions/odds will fail to load, and you'll need a proxy (e.g. a serverless function or a host that supports one) to work around it.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |

## License

MIT
