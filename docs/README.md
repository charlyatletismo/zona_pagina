# Zona Atletismo webapp — Documentation

| # | Document | What's inside |
|---|---|---|
| 01 | [Overview](01-overview.md) | What the product does, user roles, domain glossary |
| 02 | [Architecture](02-architecture.md) | System diagrams, request pipeline, auth and payment flows |
| 03 | [Development](03-development.md) | Local setup, `.dev.vars`, local database, logging in locally, scripts |
| 04 | [Deployment](04-deployment.md) | Production deploy, secrets, remote migrations, MercadoPago webhook |
| 05 | [Tech stack](05-tech-stack.md) | Libraries and services per layer, planned Cron/Queues |
| 06 | [Data model](06-data-model.md) | ER diagram, every table and column, enumerations, conventions |
| 07 | [Migrations & seeding](07-migrations-and-seeding.md) | drizzle-kit, `migrate.sh`, seeds, fake-data generator |
| 08 | [API reference](08-api-reference.md) | Every `/api` endpoint with roles, bodies and responses |
| 09 | [Business rules](09-business-rules.md) | Registration, fees, bibs, chips, clothing, payments, teams, bans |
| 10 | [Frontend](10-frontend.md) | Routing, guards, data loading, forms, tables, theming, components |
| 11 | [Features & views](11-features-and-views.md) | Every page: who can use it, what it shows, what it does |
| 12 | [Known issues](12-known-issues.md) | Bugs, security gaps and tech debt found in the code |

## Reading order

- **New developer:** 01 → 02 → 03 → 05, then skim 11.
- **Deploying:** 04 and 07.
- **Building a feature or fixing a bug (human or agent):** start with the root
  [AGENTS.md](../AGENTS.md), then 06, 08 and 09 for backend work, or 10 and 11 for frontend work.
  Check 12 before you "fix" something that looks wrong; it may be a known issue with context.

## Keeping docs current

These docs describe the code as of the commit that added them. When a change alters an
endpoint, table, rule or page, update the matching document in the same PR.
