# AGENTS.md — Migrations (`drizzle/`)

Full guide: [docs/07-migrations-and-seeding.md](../docs/07-migrations-and-seeding.md).

## Files

- `NNNN_<random_words>.sql` and `meta/*`: **generated** by `npm run db:generate` (drizzle-kit),
  from `src/worker/db/schema.ts`. Do not edit them by hand after they have been applied anywhere.
- `NNNN_z_<name>.sql`: **hand-written** SQL that drizzle-kit cannot express, and seed data. The `z`
  sorts the file after the generated migration with the same number. Examples:
  - `0000_z_indexes.sql`, `0008_z_indexes.sql`: partial unique indexes (`WHERE col IS NOT NULL`).
  - `0000_z_initial_prod_data.sql`: base locations, the first training team, and the
    organizer/admin users.
  - `0000_z_initial_test_data.sql`: richer fake data for local development.

## Applying

**Agents must not apply migrations or change any database (local or remote).** Write or generate
the SQL, then leave applying it to the developer. See golden rule 13 in [../AGENTS.md](../AGENTS.md).

Migrations are **not** applied with `wrangler d1 migrations apply`. Use:

```bash
./migrate.sh local  drizzle/0009_new_thing.sql
./migrate.sh remote drizzle/0009_new_thing.sql   # production
```

The script runs `wrangler d1 execute zona-atletismo-webapp-db --<env> --file=...` and appends the
path to `migrated.<env>.txt`. It refuses to apply a file that is already listed there.
`migrated.remote.txt` is committed and records what production has; `migrated.local.txt` is
gitignored.

## Rules

1. Apply files in filename order. Seeds only belong to `0000`: apply exactly one of
   `0000_z_initial_test_data.sql` (local) or `0000_z_initial_prod_data.sql` (prod).
   The test seed must run **before** `0003_*`, because it inserts into the old
   `sporting_event_schedules.date` column, which `0003` renames to `date_start`.
2. SQLite cannot alter columns, so drizzle-kit rebuilds tables (`__new_<table>`, copy, drop,
   rename, with `PRAGMA foreign_keys=OFF`). Review these carefully, as with `0005`.
3. Unique constraints on nullable columns (phone, email, tax_id) are partial indexes in `_z_`
   files, not `.unique()` in the schema, except where the schema already declares them.
4. When you add a migration, also update the zod schemas in `src/shared/` and
   [docs/06-data-model.md](../docs/06-data-model.md). Apply it to remote only during deployment
   (see [docs/04-deployment.md](../docs/04-deployment.md)).
