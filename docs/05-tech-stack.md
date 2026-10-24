# 05 — Tech stack

Versions are taken from [package.json](../package.json).

## Platform

| Piece | Use |
|---|---|
| **Cloudflare Workers** | Runs the API and serves the SPA's static assets (`assets.directory = dist/client`, `not_found_handling = single-page-application`). `compatibility_date 2025-10-08`, flag `nodejs_compat` |
| **Cloudflare D1** | SQLite database `zona-atletismo-webapp-db`, binding `DB` |
| **Cloudflare Images** | Event cover photos (upload/delete via REST, delivery via `imagedelivery.net`) |
| **Workers Observability** | Logs + source maps |
| **Wrangler 4** | CLI for dev, D1 commands, secrets and deploy |

## Backend (`src/worker`)

| Library | Version | Use |
|---|---|---|
| **Hono** | ^4.12 | Router, middleware (`hono/cors`, `hono/jwt`), typed context (`Bindings: Env`, `Variables: JwtVariables<JWTPayload>`) |
| **hono/jwt** | — | HS256 sign (login) and verify (middleware) |
| **drizzle-orm** | ^0.45 | Type-safe SQL for D1 (`drizzle-orm/d1`, `sqlite-core`) |
| **zod** | ^4.3 | Request validation and response shaping (shared with the frontend) |
| Web Crypto | built-in | HMAC-SHA256 for MercadoPago webhook signatures |
| `fetch` | built-in | MercadoPago REST, Meta Graph API, Cloudflare Images REST |

`mercadopago` (^2.12) is a dependency but unused; the REST API is called directly with `fetch`.

## Frontend (`src/react-app`)

| Library | Version | Use |
|---|---|---|
| **React** | 19.2 | UI |
| **Vite** | ^8 | Dev server and bundler (`@vitejs/plugin-react`, `@cloudflare/vite-plugin`, `@tailwindcss/vite`) |
| **TanStack Router** | ^1.168 | File-based routing with loaders, `beforeLoad` guards, code splitting (`@tanstack/router-plugin`), devtools |
| **TanStack Form** | ^1.29 | Forms via `createFormHook` (`useAppForm`) with zod validators |
| **TanStack Table** | ^8.21 | Data tables: sorting, global fuzzy filter (`@tanstack/match-sorter-utils`), grouping, selection, pagination |
| **shadcn/ui** (new-york) + **Radix UI** | — | Primitives in `components/ui` (dialog, dropdown, popover, select, switch, navigation-menu, …) |
| **Tailwind CSS** | ^4.2 | Styling, CSS-variable theme, dark mode; `tw-animate-css` |
| **lucide-react** | ^1.8 | Icons |
| **cmdk** | ^1.1 | Command palette used for searchable comboboxes |
| **react-day-picker** + **date-fns** | ^9 / ^4 | Calendar / date picker |
| `clsx` + `tailwind-merge` + `class-variance-authority` | — | `cn()` and component variants |

## Data & database tooling

| Tool | Use |
|---|---|
| **drizzle-kit** ^0.31 | `npm run db:generate` creates SQL migrations from `src/worker/db/schema.ts` (`drizzle.config.json`, dialect sqlite, output `./drizzle`) |
| **migrate.sh** | Applies one SQL file with `wrangler d1 execute` and records it (see [07](07-migrations-and-seeding.md)) |
| **Python + Faker** | `gen_test_data/` generates fake user inserts |

## External services

| Service | Use | Code |
|---|---|---|
| **MercadoPago Checkout Pro** | Online registration payments (ARS); webhook confirmation | `src/worker/sportingEvents.ts` (`/pay`, `/payMultipleRegs`), `src/worker/webhookMercadoPago.ts` |
| **Meta WhatsApp Cloud API** | Login OTP via template `verificar_otp` | `src/worker/lib/whatsapp.ts` |
| **Cloudflare Images** | Event photo storage/CDN | `src/worker/lib/sportingEventPhotos.ts` |
| **Google Maps / My Maps** | Links only (event location, circuit maps) | event page |
| **WhatsApp click-to-chat** | Contact links and payment-receipt submission (`wa.me`) | footer, registration page |

## Developer tooling

TypeScript 6 (three projects: app, worker, node), ESLint 9 (`typescript-eslint`, `react-hooks`,
`react-refresh`). There is no test framework.

## Planned

**Cloudflare Cron Triggers + Queues** are planned for background work:

- periodic **clean-ups**, e.g. trimming `user_updates` to the retention policy described in the
  schema comment;
- periodic **status updates**, e.g. registrations whose payment due date has passed;
- **user notifications** by WhatsApp, driven by `sporting_event_schedules.notification_template_id` /
  `notify_at` and the template ids in [src/shared/schedules.ts](../src/shared/schedules.ts)
  (kits delivery, payment deadlines, event day).

Nothing is implemented yet. The stubs are the commented-out `scheduled()` handler in
[src/worker/index.ts](../src/worker/index.ts) and the empty
[src/worker/schedule/kitsDelivery.ts](../src/worker/schedule/kitsDelivery.ts). Adding them will
require `triggers.crons` and `queues` entries in `wrangler.json`, followed by `npm run cf-typegen`.
