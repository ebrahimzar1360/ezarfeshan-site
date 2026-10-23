-- The owner's dealership management began in 1390, not 1389 (owner,
-- 1405/08/01: "۱۵ سال؛ بر اساس شروع مدیریت از سال ۱۳۹۰"). The code defaults
-- are corrected in lib/cms/registry.ts; this corrects copy already saved from
-- the admin, which the defaults do not reach.
--
-- 1389 is used for this one fact only, so each pattern below is that fact and
-- nothing else: a computed duration ({{years:1389}}), a metric's start year,
-- the career milestone's year and the role's "since" line. Only CMS rows
-- (content:*) are touched; rows without the pattern are left as they are, and
-- running it again changes nothing.

UPDATE "settings"
SET "value" = replace("value"::text, '{{years:1389}}', '{{years:1390}}')::jsonb,
    "updated_at" = now()
WHERE "key" LIKE 'content:%' AND "value"::text LIKE '%{{years:1389}}%';

UPDATE "settings"
SET "value" = replace("value"::text, '"startYear": 1389', '"startYear": 1390')::jsonb,
    "updated_at" = now()
WHERE "key" IN ('content:home.metrics', 'content:about.figures') AND "value"::text LIKE '%"startYear": 1389%';

UPDATE "settings"
SET "value" = replace("value"::text, '"year": 1389', '"year": 1390')::jsonb,
    "updated_at" = now()
WHERE "key" = 'content:about.path' AND "value"::text LIKE '%"year": 1389%';

UPDATE "settings"
SET "value" = replace("value"::text, 'از ۱۳۸۹', 'از ۱۳۹۰')::jsonb,
    "updated_at" = now()
WHERE "key" = 'content:about.roles' AND "value"::text LIKE '%از ۱۳۸۹%';
