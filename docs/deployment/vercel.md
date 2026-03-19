# Vercel Deployment

QPlanner runs as **two separate Vercel projects** from the same Git repository.

## Client (Frontend)

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| Root Directory   | `client`                           |
| Framework        | Vite                               |
| Build Command    | `npm run build`                    |
| Output Directory | `dist`                             |
| Domain           | `planner.hakimgroup.co.uk`         |

### Client Routing

The client is a single-page app (SPA). Vercel's `client/vercel.json` rewrites all paths to `index.html` so client-side routing works.

## Server (API)

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| Root Directory   | `server`                           |
| Framework        | Other                              |
| Build Command    | (default)                          |
| Domain           | `qplanner-server.vercel.app`       |

### Server Routing

The server's `server/vercel.json` rewrites all requests `/(.*) → /api` which routes everything to the Express serverless function at `server/api/index.ts`.

::: tip
Express routes are defined **without** the `/api/` prefix (e.g., `/send-notification-email`). The Vercel rewrite handles the mapping. External callers (pg_net, cron-job.org) should use URLs **without** `/api/`.
:::

## Docs (This Site)

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| Root Directory   | `docs`                             |
| Framework        | VitePress                          |
| Build Command    | `npm run build`                    |
| Output Directory | `.vitepress/dist`                  |
| Domain           | `docs.planner.hakimgroup.co.uk`    |

## How to Deploy

All three projects auto-deploy from the `main` branch. Push to `main` and Vercel builds automatically.

### Manual Deployment

If you need to trigger a deployment manually:
1. Go to the Vercel dashboard for the project
2. Click **Deployments** → **Redeploy** on the latest deployment

### Build Locally

```bash
# Client
cd client && npm run build

# Server (no build step — TypeScript is compiled by Vercel)

# Docs
cd docs && npm run build
```

## Common Issues

### Client build chunk size warning
The client produces a large JS bundle (2MB+). This is a known warning and doesn't affect functionality. Could be improved with code splitting in the future.

### Sass deprecation warnings
Cosmetic warnings from the Sass legacy JS API. Not breaking — will resolve when Mantine updates their Sass dependency.
