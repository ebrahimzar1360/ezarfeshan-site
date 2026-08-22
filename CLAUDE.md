# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal brand and content-authority site for ابراهیم زرفشان (Ebrahim Zarfeshan),
a business-systems and AI consultant. Persian, RTL, Next.js 15 App Router.

**All user-facing text is Persian.** Code, comments, commit messages in this file's
conventions, slugs and identifiers are Latin. There is no i18n layer and none is wanted.

## Commands

```bash
npm run db start          # local Postgres on port 55432 — required before dev/build
npm run dev               # http://localhost:3000
npm run build             # reads the database during static generation
npm run typecheck         # tsc --noEmit
npm test                  # vitest, lib/**/*.test.ts only
npm run test:e2e          # playwright; needs a BUILT app already running
npm run db stop
```

`npm run db` proxies `tools/db/pg.ps1` (`init|start|stop|status|psql`). The cluster
lives outside the repo at `C:\Users\Nadimico.com\pg`. Port 55432 is deliberate — it
must not collide with a standard install.

Single test file / single test:

```bash
npx vitest run lib/content/bio.test.ts
npx vitest run -t 'rolls over at Nowruz'
npx playwright test e2e/newsletter.spec.ts --project=desktop
```

Playwright uses the **system Chrome** (`channel: 'chrome'`), not a downloaded
Chromium. It does not start the server; bring one up first:

```bash
npm run build && npx next start -p 3210 > server.log 2>&1 &
npm run test:e2e
```

`server.log` matters: the newsletter specs recover the confirmation token from it,
because tokens are hashed before storage and never appear in a response.

Asset regeneration (rarely needed, all deterministic):
`npm run fonts` · `npm run logo` · `npm run photos`

## Architecture

### Public / admin separation is enforced by module, not by discipline

`lib/content/queries.ts` filters `status: PUBLISHED` **and** `publishedAt <= now`
on every read. `lib/admin/queries.ts` does not filter at all — the admin must see
drafts. They are separate modules precisely so a public page cannot accidentally
import a query that leaks unpublished work. Keep them separate.

Scheduled posts go live without a rebuild because the publish filter re-evaluates
`NOW()` per request; `dynamicParams` is on so a slug not present at build time still
renders.

### Auth: three layers, only one is the boundary

1. `middleware.ts` — checks a session **cookie exists**. Edge runtime, no database,
   no signature check. It is a cheap redirect, *not* security.
2. `app/admin/(protected)/layout.tsx` — calls `auth()`. **This is the real boundary.**
   The login page sits outside this route group so it cannot redirect to itself.
3. Every server action in `lib/admin/actions.ts` calls `requireAdmin()` itself.
   Server actions are POST endpoints whether or not a page renders their form.

Single admin account, created only via `npm run admin:create`. No signup, no email
password reset — a second way in for a door one person uses is a second way in.

`DUMMY_HASH` in `lib/auth.ts` must remain a **real** Argon2id hash. A hash-shaped
fake is rejected on parse in a fraction of the time, and the timing gap tells an
attacker which addresses have accounts. Its parameters must match
`tools/db/create-admin.mjs`.

### Design tokens are the only source of colour and size

`app/globals.css` defines semantic roles (`--bg`, `--text-muted`, `--border`,
`--accent`, `--solid-bg`…) and `@theme inline` maps them to Tailwind utilities.
Components use `bg-bg-raised`, `text-text-muted`, never a hex value or a raw brand
colour.

Three rules that are easy to break and were broken at least once each:

- **No `left`/`right` in CSS.** Logical properties only. Tailwind's logical utilities
  are `start-*`, `end-*`, `ms-*`, `me-*`, `ps-*`, `pe-*`, `inset-y-*`. The CSS
  property names (`inset-inline-start`, `border-inline-start`) are **not** class
  names and silently produce nothing.
- **Gold is never text on a light background** — 2.10:1, fails AA. It is a surface,
  a rule, or a mark. It *is* allowed as text on `--forest` (5.24:1).
- **Dark sections need `.tone-inverse`**, which redefines the semantic roles for a
  dark ground. Hand-picking colours there produces unreadable muted text.

Tailwind scans source text, so a constructed class name (`bg-${x}`) produces no CSS.
Write the full name.

### The gold marker

The brand's signature device, recovered from the original brand guide's page
graphics. It appears as a section-head rule (`.gold-marker`), and as the article
reading-progress bar in `components/ui/ReadingProgress.tsx` — pure CSS
`animation-timeline: scroll()`, zero JavaScript, with a static fallback.

The hero entrance is the only orchestrated animation on the site.
`prefers-reduced-motion` removes it entirely rather than shortening it.

### Content pipeline

Articles are MDX stored in the `Article.body` column, compiled per request by
`next-mdx-remote/rsc`. `lib/content/mdx.ts` strips HTML comments first — MDX parses
`<!-- -->` as JSX and fails. The component allowlist lives in `components/ui/mdx.tsx`;
anything not listed does not render.

Seed articles carry a `DRAFT:` marker comment and render a visible
`<DraftNotice>` banner. **They are placeholder text and must be rewritten before the
site is shown to anyone.**

### Numbers on the site are computed, never written down

`lib/content/bio.ts` derives every duration from its start year
(`yearsSince(1380)`), so "۲۵ سال" cannot silently go stale at Nowruz. `lib/format.ts`
`faNum()` disables locale grouping — the `fa-IR` default renders `1380` as `۱٬۳۸۰`,
which is wrong for a year. Both are covered by tests; do not "simplify" them back
into literals.

The site states no claim without a number or a field example behind it. Sections with
no real data (trust block, `/resources`) render an empty state rather than filler.
See `docs/OPEN-QUESTIONS.md` for what is still missing and why.

### Forms

Zod schemas in `lib/validation.ts` run on the client for the message and again on the
server for the protection. Every mutating route: rate limit → honeypot → validate.

The **honeypot is deliberately permissive** in the schema and handled in the route,
which returns a normal success. Rejecting it with a 422 naming the field tells the bot
which input to skip next time.

Rate limiting is in Postgres (`lib/rate-limit.ts`), keyed by a hash — no raw IP or
address is ever stored. Same for analytics: the session hash includes the date, so it
rotates at midnight and cannot be joined across days.

### Email

`lib/mailer.ts` has two drivers. `console` (default) prints to the terminal and is
enough to exercise the whole double opt-in loop. `smtp` needs a real domain — gmail
cannot carry SPF/DKIM for this brand and confirmation mail lands in spam.

Confirm and unsubscribe use **separate** tokens; only SHA-256 hashes are stored.
Unsubscribe is a POST behind a button, because mail scanners pre-fetch links and a GET
would unsubscribe people who never clicked. Confirm is a GET (it is opened from an
email client) and is safe to replay.

### Search

Postgres has no Persian stemmer, so `to_tsvector('persian', …)` does not exist.
`app/api/search/route.ts` uses `pg_trgm` similarity plus `ILIKE`. The extension is
created by `prisma/init/01-extensions.sql`; on a pre-existing volume it must be added
by hand or search 500s.

## Verification tools

`tools/audit/` runs against a live server and prints findings; each exits non-zero on
failure.

```bash
node tools/audit/measure.js http://localhost:3210/ 360 390 768 1440 1920   # overflow + the offending element
node tools/audit/shot.js    http://localhost:3210/ ./shots 390 1440        # THEME=dark also works
node tools/audit/seo.mjs    http://localhost:3210                          # metadata, JSON-LD, sitemap, RSS
node tools/audit/flow.mjs   http://localhost:3210 server.log               # newsletter + leads end to end
node tools/audit/admin.mjs  http://localhost:3210                          # auth boundary probing
```

All browser tooling uses `--headless=new`. The old `--headless` mode renders RTL
pages incorrectly and produces shifted, clipped screenshots of layouts that are
actually fine — it caused a bug hunt for an overflow that did not exist.

## Environment

Copy `.env.example` to `.env`. `AUTH_SECRET` must be a fresh 32-byte random value.
`NEXT_PUBLIC_SITE_URL` feeds canonical URLs, sitemap, OG image URLs and email links —
it is `http://localhost:3000` until a domain exists.

`.mcp.json` is gitignored: it is dev-tool config for an unrelated project.

## Platform notes

Windows. Two traps that cost real time:

- **PowerShell 5.1 reads a BOM-less script as CP1252.** A UTF-8 em-dash in a `.ps1`
  file decodes into a stray double quote and the parser fails far from the real line.
  Keep `tools/**/*.ps1` **ASCII only**.
- **Piping `pg_ctl start` hangs.** The postmaster inherits the pipe and holds it open,
  so the shell waits for the database to shut down. `pg.ps1` uses `Start-Process` with
  `-W` and polls `pg_isready` instead. `pkill` does not kill Node on Windows either —
  use `taskkill //PID <pid> //F`.

## Documentation

- `docs/DESIGN-PLAN.md` — palette with measured contrast ratios, type scale, the
  signature element, and the anti-patterns this design deliberately avoids
- `docs/OPEN-QUESTIONS.md` — every placeholder, every default taken without an answer,
  and the reasoning behind the non-obvious decisions
- `docs/DEPLOY.md` — Docker deployment and a troubleshooting table
