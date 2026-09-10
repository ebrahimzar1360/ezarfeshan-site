-- pg_trgm and unaccent as a migration, not only as a volume-init script.
--
-- prisma/init/01-extensions.sql runs once when a Docker data volume is first
-- created. A managed Postgres (Neon on Vercel) never runs it, so the extensions
-- were simply absent there and /api/search returned 500 on the first query.
-- Putting them in a migration means every environment gets them the same way.
--
-- IF NOT EXISTS keeps this idempotent, so a database that already has them
-- (the local cluster, created by tools/db/pg.ps1 init) is unaffected.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
