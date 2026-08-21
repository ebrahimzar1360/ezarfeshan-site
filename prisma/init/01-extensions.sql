-- Runs once, the first time the data volume is created.
--
-- pg_trgm powers Persian search: Postgres has no Persian stemmer, so trigram
-- similarity does the work full-text search cannot. unaccent folds diacritics.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
