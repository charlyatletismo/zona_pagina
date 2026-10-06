# 02 — Architecture

## System context

A single **Cloudflare Worker** (`zona-atletismo-webapp`) serves two things:

- the built React SPA as static assets (`dist/client`, with SPA fallback for unknown paths);
- a **Hono** JSON API under `/api/*`.

The API talks to **Cloudflare D1** through Drizzle ORM and calls three external HTTP APIs.

```mermaid
flowchart LR
    subgraph Client["Browser"]
        SPA["React SPA<br/>(TanStack Router)"]
        LS[("localStorage<br/>JWT + session flags")]
        SPA <--> LS
    end

    subgraph CF["Cloudflare"]
        subgraph Worker["Worker: zona-atletismo-webapp"]
            Assets["Static assets<br/>dist/client (SPA fallback)"]
            API["Hono API /api/*"]
        end
        D1[("D1 (SQLite)<br/>zona-atletismo-webapp-db")]
        IMG["Cloudflare Images"]
    end

    MP["MercadoPago<br/>Checkout Pro + Payments API"]
    WA["Meta WhatsApp<br/>Cloud API (Graph)"]

    SPA -- "GET /, /sportingEvents/..." --> Assets
    SPA -- "fetch /api/* (Bearer JWT)" --> API
    API -- Drizzle --> D1
    API -- "upload/delete event photo" --> IMG
    SPA -- "img tags from imagedelivery.net" --> IMG
    API -- "send OTP template" --> WA
    API -- "create preference / get payment" --> MP
    SPA -- "redirect to init_point" --> MP
    MP -- "webhook POST /api/webhook/mercadoPago/payment" --> API
```

## Repository layout

```mermaid
flowchart TB
    subgraph shared["src/shared (imported by both sides)"]
        types["types.ts<br/>domain zod schemas"]
        ar["apiRespTypes.ts<br/>AR* response schemas"]
        roles["roles.ts"]
        lang["lang.ts<br/>es/en labels"]
        cuit["cuit.ts"]
        sched["schedules.ts"]
    end
    subgraph worker["src/worker (Hono API)"]
        idx["index.ts<br/>Env, middleware, routers"]
        routers["auth / users / settings / sportingEvents /<br/>sportingEventTransactions / chips /<br/>locations / trainingTeams / webhookMercadoPago"]
        lib["lib/*<br/>business logic"]
        schema["db/schema.ts"]
    end
    subgraph app["src/react-app (SPA)"]
        routes["routes/** (file-based)"]
        comps["components/** + ui/"]
        alib["lib/ apiCalls, authCheck,<br/>genForm, queryCache, utils"]
    end
    idx --> routers --> lib --> schema
    routers --> shared
    lib --> shared
    routes --> comps
    routes --> alib
    routes --> shared
    comps --> shared
    schema -. "drizzle-kit generate" .-> drizzle["drizzle/*.sql"]
```

Three TypeScript projects (`tsconfig.app.json`, `tsconfig.worker.json`, `tsconfig.node.json`)
share `src/shared` through the `@shared/*` alias. The frontend also uses `@/*` → `src/react-app/*`.

## Build & runtime

- **Dev:** `vite` with `@cloudflare/vite-plugin` runs the Worker in workerd, inside the Vite dev
  server, with a local D1 (`.wrangler/state`), plus HMR for React. `@tanstack/router-plugin`
  regenerates `routeTree.gen.ts`, and `@tailwindcss/vite` compiles Tailwind v4.
- **Build:** `tsc -b && vite build` emits `dist/client` (SPA) and the Worker bundle.
- **Deploy:** `wrangler deploy` uploads the Worker and its assets. `nodejs_compat` is enabled,
  as are observability and source-map uploads. See [04-deployment.md](04-deployment.md).

## Request pipeline (API)

Defined in [src/worker/index.ts](../src/worker/index.ts):

```mermaid
flowchart TD
    R["Request /api/*"] --> C["CORS (all origins)"]
    C --> W{"path matches<br/>/api/webhook/*?"}
    W -- yes --> H["route handler<br/>(webhook validates MP signature itself)"]
    W -- no --> A{"Authorization<br/>header present?"}
    A -- yes --> J["JWT verify HS256<br/>(JWT_SECRET)"]
    A -- no --> P{"public route?<br/>POST /api/auth/(sendCode|register|login)<br/>GET /api/sportingEvents[/all|/:id]"}
    P -- yes --> H
    P -- no --> J
    J -- valid --> H
    J -- invalid --> E401["401 {message: M.UNAUTHORIZED}"]
    H --> G{"router / handler<br/>role guard"}
    G -- forbidden --> E403["403 {message}"]
    G -- ok --> D["Drizzle → D1 / external APIs"]
    D --> OK["200 {data?, message?}"]
    H -. "uncaught error" .-> E500["500 {message: M.INTERNAL_SERVER_ERROR}"]
```

- Authorization works per handler. Routers either add a `.use()` guard for the whole router
  (users, chips, transactions, locations writes) or check `authorizedOrg` / `authorizedAthMan`
  in each route.
- Anonymous GETs on event endpoints work because the JWT middleware is skipped when there is no
  header. If a header is present, it must be valid. That is how a logged-in user on the same URL
  also gets `user_registration_status`.

## Authentication flow (WhatsApp OTP + JWT)

```mermaid
sequenceDiagram
    actor U as User
    participant S as SPA (/login)
    participant API as /api/auth
    participant DB as D1 users
    participant WA as WhatsApp Cloud API

    U->>S: enters phone (CC_9_NUMBER)
    S->>API: POST /sendCode {phone}
    API->>DB: find user by phone
    alt unknown phone
        API-->>S: 404
        U->>S: enters DNI
        S->>API: POST /register {user_id, phone}
        API->>DB: insert user (role athlete) + temp_code<br/>(or fix phone of an unnamed account)
    else known phone
        API->>DB: set temp_code (6 digits)
    end
    API->>WA: template "verificar_otp" with code
    API-->>S: 200 code sent
    U->>S: types code
    S->>API: POST /login {phone, code}
    API->>DB: compare + clear temp_code
    API-->>S: {token, id, name, role, requireProfileUpdate, banned, language, ...}
    S->>S: setUserInfo() → localStorage
    Note over S: requireProfileUpdate → every route redirects to /settings/profile
    S->>API: later calls: Authorization: Bearer JWT
```

- The JWT payload is `{id, phone, role, name, surname, manager_id}`. It has **no expiry**, see
  [12-known-issues.md](12-known-issues.md).
- Pages that call `checkUpdates()` (home and event page) also call `GET /api/settings/updates`.
  That call refreshes the ban flag, and it forces a logout if the role stored in the DB differs
  from the role in the JWT.

## Payment flow (MercadoPago Checkout Pro)

```mermaid
sequenceDiagram
    actor A as Athlete / Manager
    participant S as SPA
    participant API as Worker API
    participant DB as D1
    participant MP as MercadoPago

    A->>S: "Pagar con Mercado Pago"
    S->>API: POST /api/sportingEvents/:id/pay<br/>(or /payMultipleRegs {registrationIds})
    API->>DB: registration(s) + pending_to_pay
    API->>MP: POST /checkout/preferences<br/>items[id = event_E_user_U_reg_R, unit_price = pending]
    MP-->>API: {id, init_point}
    API-->>S: {init_point, preference_id}
    S->>MP: redirect to init_point
    A->>MP: pays
    MP-->>S: back_url → /sportingEvents/:id/registration (or /registerAthletes)
    MP->>API: POST /api/webhook/mercadoPago/payment?data.id=PAYMENT
    API->>MP: GET /v1/payments/PAYMENT
    loop each item
        API->>DB: setRegistrationAsPaid → bib, chip, reserved clothing, paid_amount
        API->>DB: insert transactions: inflow registration_payment + outflow mercado_pago_fee
    end
    API-->>MP: 200 (always, to stop retries)
```

Bank transfers skip all of this. The organizer records a `registration_payment` transaction from
the registrations admin page, and that recomputes `paid_amount` and marks the registration paid
once it is fully covered. Details: [09-business-rules.md](09-business-rules.md#payments).

## Registration lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: register (fee > 0 after discount)
    [*] --> paid: register (fee = 0, e.g. 100% discount)
    pending --> paid: MercadoPago webhook / manual payment covers fee /<br/>discount or "dismiss pending" leaves 0
    pending --> expired: (computed on read) past fee_payment_due_date and still owing
    pending --> [*]: athlete/manager unregisters (deleted)
    pending --> cancelled: organizer cancels / user banned
    expired --> paid: organizer dismisses pending
    paid --> cancelled: organizer cancels / transfer to another athlete
    cancelled --> pending: organizer reactivates (still owes)
    cancelled --> paid: organizer reactivates (nothing owed)
```

- `expired` is not stored in the DB. It is derived when a registration is read.
- `not_registered` is a virtual status used by the UI for users without a registration.

## Shared validation layer

The same zod schemas validate on both sides:

- [src/shared/types.ts](../src/shared/types.ts) contains the domain schemas (`UserSchema`,
  `SportingEventSchema`, …) with Spanish error messages. Frontend forms use them as TanStack Form
  validators, and the API validates request bodies with them.
- [src/shared/apiRespTypes.ts](../src/shared/apiRespTypes.ts) contains the `AR*` ("API Response")
  schemas. They coerce the DB representation (ISO strings → `Date`, `0/1` → boolean) and pick the
  fields each endpoint returns. Loaders parse responses with them, so a shape mismatch fails in
  the loader rather than in a component.

## Planned: scheduled jobs and queues

Background work (cleanups, status updates, WhatsApp notifications) is planned on Cloudflare Cron
Triggers + Queues and is not implemented yet. See [05-tech-stack.md](05-tech-stack.md#planned).
