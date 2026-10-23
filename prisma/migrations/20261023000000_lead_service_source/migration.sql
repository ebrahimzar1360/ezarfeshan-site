-- /services requests share the leads table and the /admin/leads inbox with
-- the consultation and contact forms. Additive only: two nullable columns, an
-- index, a backfill of `source` for rows that predate it, and the services link
-- in a menu that was already saved from the admin. Nothing is dropped or
-- rewritten, and every statement is safe to run twice.

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "service" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE INDEX IF NOT EXISTS "leads_source_created_at_idx" ON "leads"("source", "created_at" DESC);

-- Older rows: /api/contact writes its subject first ("موضوع: …"); everything
-- else came from the consultation form (the page or the chat widget).
UPDATE "leads" SET "source" = 'contact' WHERE "source" IS NULL AND "challenge" LIKE 'موضوع: %';
UPDATE "leads" SET "source" = 'consult' WHERE "source" IS NULL;

-- The header menu lives in the CMS. If it was never saved, the new defaults in
-- lib/cms/registry.ts already carry «خدمات»; if it was saved, add the link
-- right after «درباره من» (or first, if that link is gone), unless it is there
-- already or the list is full (8, the editor's limit).
UPDATE "settings" AS s
SET "value" = jsonb_set(
      s."value",
      '{items}',
      (
        SELECT jsonb_agg(x.item ORDER BY x.ord)
        FROM (
          SELECT t.item, t.i * 2 AS ord
          FROM jsonb_array_elements(s."value" -> 'items') WITH ORDINALITY AS t(item, i)
          UNION ALL
          SELECT '{"label": "خدمات", "href": "/services"}'::jsonb,
                 COALESCE(
                   (SELECT a.i * 2 + 1
                    FROM jsonb_array_elements(s."value" -> 'items') WITH ORDINALITY AS a(item, i)
                    WHERE a.item ->> 'href' = '/about'
                    LIMIT 1),
                   1)
        ) AS x
      )
    ),
    "updated_at" = now()
WHERE s."key" = 'content:nav.main'
  AND jsonb_typeof(s."value" -> 'items') = 'array'
  AND jsonb_array_length(s."value" -> 'items') < 8
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(s."value" -> 'items') AS e(item)
    WHERE e.item ->> 'href' = '/services'
  );
