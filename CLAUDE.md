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
`npm run fonts` · `npm run logo` · `npm run photos` · `npm run renders`

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
2. `app/admin/(protected)/layout.tsx` — calls `currentUser()`. **This is the real
   boundary.** The login page sits outside this route group so it cannot redirect to
   itself; it also uses `currentUser()`, not `auth()`, or a disabled account's still-
   valid cookie loops between the two.
3. Every server action (`lib/admin/actions.ts`, `lib/admin/cms-actions.ts`) and the
   media API call `requirePermission()` themselves. Server actions are POST endpoints
   whether or not a page renders their form. Admin pages call `guard(permission)`.

`currentUser()` re-reads the account from the database on every request — the JWT
is only an id. A disabled user or a changed role takes effect immediately.

Roles: ADMIN / EDITOR / AUTHOR, matrix in `lib/admin/permissions.ts` (unit-tested).
The first ADMIN is created via `npm run admin:create`; others in `/admin/users`.
No signup, no email password reset. The last active ADMIN cannot demote themselves.

`DUMMY_HASH` in `lib/auth.ts` must remain a **real** Argon2id hash. A hash-shaped
fake is rejected on parse in a fraction of the time, and the timing gap tells an
attacker which addresses have accounts. Its parameters must match
`tools/db/create-admin.mjs`.

### CMS — site copy, media, pages (docs/CMS.md)

Every visible string on the main pages, every button/link, the menus, footer,
contact channels, projects list and per-page SEO is a **section** in
`lib/cms/registry.ts`: fields + the shipped copy as defaults. Stored in `settings`
as `content:<key>`; read with `await getSection('<key>')` (`lib/cms/content.ts`,
one query per request). `normalize.ts` falls back per field on read and validates
strictly on save; the admin form is generated from the same field list. To add
editable copy: add the field + default to the registry, read it in the component.
Never hardcode a visitor-facing string that already has a section.

- Inline syntax in copy (`lib/cms/tokens.ts`): `*accent*`, `**bold**`, `[a](/b)`,
  newline, `{{years:1380}}`, `{{year}}`. No HTML path. Render with `<Inline>`.
- Hrefs are checked by `isSafeHref` (no `javascript:`/`data:`/`//host`).
- Saving calls `revalidatePath('/', 'layout')` — static pages refresh too.
- Media: bytes in Postgres (`media`), served by `app/media/[id]/[name]`, immutable
  cache. Uploads go through `/api/admin/media` (route handler: actions cap at 1 MB),
  type sniffed from bytes (`lib/media/detect.ts`, SVG refused), re-encoded to WebP
  by sharp, EXIF stripped. In-use files cannot be deleted (`mediaUsage`).
- Free pages: `Page` model, route group `app/(cms)/[slug]` — deliberately *not*
  under `(site)`, whose `loading.tsx` streams a 200 before `notFound()` can set 404.
  A page with slug `privacy`/`terms` replaces that built-in page.
- Articles keep up to 50 `ArticleRevision`s (manual saves only), have cover/alt,
  OG image, canonical URL, noindex; `/admin/preview/*` renders unpublished MDX.
- `AuditLog` gets a row from every admin mutation (`lib/admin/audit.ts`).

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
  a rule, or a mark. It *is* allowed as text on `--forest` (4.71:1).
- **Dark sections need `.tone-inverse`**, which redefines the semantic roles for a
  dark ground. Hand-picking colours there produces unreadable muted text.

Tailwind scans source text, so a constructed class name (`bg-${x}`) produces no CSS.
Write the full name.

### v3 redesign — minimal, light, calm

The v3 redesign (1405/07/24, from the owner's five-page reference pack) replaced
the night-ground v2 look: light paper, forest-green bands, soft white cards
(`.card-v3`), one forest button (`Button variant="brand"`, `"gold"` on dark
bands). Five pages and a five-link nav: خانه · درباره من · پروژه‌ها · یادداشت‌ها ·
تماس. `/consult` still exists, out of the nav, because the chatbot's knowledge
(`lib/chat/knowledge.ts`) quotes it.

- **Hero** (since 1405/07/28, owner's choice) is the photograph alone:
  `home-hero` (`lib/content/photos.ts`), mirrored, under `.photo-scrim`, with
  CSS-only motion (`.hp-*` in globals.css: blur-in settle, slow drift, gold
  light sweep, rising dust motes, scroll cue) and a pointer lean from
  `HeroParallax`. All of it stops under reduced motion. **No 3D in the hero** —
  the 3D monogram (HeroArt, below) closes the homepage, in the `home.cta` band.
- **Brand sheet v4** (`brand-source/logo-sheet-v4.webp`) is the source of the
  logo, palette and finishes: Deep Emerald `#0F4D3F`, Warm Gold `#D4AF6B`, Warm
  Ivory `#F8F4EC`, Charcoal `#1F2937`. Solid `bg-gold`/`bg-forest`/
  `bg-forest-deep` carry the sheet's metallic gold / emerald gradients
  (`--metal-*`, § BRAND FINISH in globals.css); tints stay flat. The raster
  logo is cut by `tools/logo/crop-sheet.mjs`; the vector outlines in
  `monogram-shapes.ts` feed the 3D scene and the SVG favicons
  (`npm run logo`).
- **Image pack**: `public/site-images/`, placed only via `lib/content/photos.ts`
  (page mastheads, topic pages, projects without a CMS image — marked
  «تصویر مفهومی»). `photos.test.ts` checks every declared size against its file.
- **Hero art** (`components/site/home/HeroArt.tsx`, now mounted in the home
  CTA band, not the hero) is one inline SVG: isometric
  slab, the EZ monogram, four floating glass cards, nodes and lines. Motion is CSS
  only (`.ha-*` in globals.css §13) and all of it stops under reduced motion.
  Colours come from tokens; shades for solids are `.fill-sand-d1`, `.fill-gold-d1`…
  (`color-mix` of the palette) — never a raw hex.
- **3D hero** sits on top of that SVG: `HeroStage` lazy-loads three.js
  (`hero-scene.ts`) when the hero is near the viewport and the browser is idle,
  and extrudes the monogram from hand-traced outlines (`monogram-shapes.ts`).
  The five pieces fly in and assemble; then the mark sways, follows the
  pointer, spreads apart on hover/scroll, spins on tap. The SVG is the poster
  and the fallback (no WebGL, Save-Data, low memory, lost context); after the
  first frame `data-stage="3d"` hides only its slab+monogram (`.ha-core`).
  Reduced motion draws one still 3D frame. Materials read the tokens at
  runtime (no hex) and re-read them when the theme flips. The four floating
  cards around the mark were removed at the owner's request (1405/07/26); the
  mark is lacquered green with gold edges, lit by a small baked studio
  (`studioScene()`), after the RCA site's logo.
- **3D beyond the hero** (all lazy, all with a static fallback, all pausing
  off-screen; shared helpers in `components/site/three/` — `gate.ts` has no
  three.js and is the only part client islands may import, `kit.ts` is for the
  scene modules):
  - *Pillars* ("از شفافیت تا هوشمندی") are scroll beats like the RCA site's
    R/C/A: `PillarsJourney` + `pillars-scene.ts`, one particle cloud that takes
    each card's shape (`pillar-forms.ts`). The drawn `PillarIllustration` is the
    poster and the no-WebGL picture.
  - *Projects* on the homepage are a roadmap grouped by the CMS status
    (`ProjectsRoadmap` + `projects-scene.ts`), like RCA's "از ایده تا محصول".
  - *Articles* on the homepage get 3D topic renders and a mouse tilt (`Tilt`).
  - Renders live in `public/renders/`, made by `npm run renders`
    (`tools/render/`); `lib/content/renders.ts` picks them. Homepage only —
    article pages keep their generated covers.
- **Sound**: `lib/sound.ts` (Web Audio, no files), off by default, toggled by
  `SoundToggle` in the header and remembered. Turning it on replays the logo's
  assembly with its sound. Keep sounds short, quiet and throttled.
- Keep three.js out of the first-load bundle — import it only from the
  `*-scene.ts` modules and `three/kit.ts`.
- **Inner pages** open with `PageBand` (forest, grid, one line of lead); closing
  invitation is `CtaBand`. Gold *type* is allowed only on forest.
- **Logo**: `public/brand/ez-monogram*.webp` are cut from the owner's logo sheet by
  `tools/logo/crop-sheet.mjs`; `Logo` renders them with live text beside.
- **Projects** are the CMS section `projects.items`, mapped by `getProjects()` in
  `lib/content/projects.ts`. A project without an image shows a drawn mock.
- **Contact** has four channels and a four-field form → `/api/contact`, stored as a
  `Lead`. No phone, no address anywhere (removed on purpose).
- **Services** (`/services`, in the nav): four cards from the CMS
  (`services.*`, `getServices()` in `lib/content/services.ts`), one request
  dialog (`ServicesBoard` → `ServiceRequestForm`), deep-linkable with
  `?service=<slug>` (the homepage `ServicesPreview` buttons use it). The form
  posts to **`/api/leads`** — a body with `service` takes the services branch:
  `serviceRequestSchema` (Iranian mobile in Persian or Latin digits, normalised
  to `09…`), honeypot, its own limit (5/hour/address), the slug checked against
  the CMS list, stored as a `Lead` with `source: 'services'` and the service
  title. Every lead has a `source` (services | consult | contact);
  `/admin/leads` is the one inbox, with a tab per source.
- Biography copy (CMS sections `about.*`) feeds /about, the JSON-LD *and* the
  chatbot — change it once, in the admin.

Scroll reveals: add `data-reveal` (optionally `style={{'--d': i}}` for stagger).
`RevealObserver` marks them with a `data-shown` **attribute**, never a class —
a class on a not-yet-hydrated streamed element is a hydration mismatch and a
re-render would strip it. Any page rendered outside `app/(site)/layout.tsx`
that uses `SectionHead` or `data-reveal` must mount `<RevealObserver />`
itself (the 404 does), or the content stays invisible.

The UI/UX Pro Max skill is installed in `.claude/skills/ui-ux-pro-max` for
visual work: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <ux|style|color|…>`.

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
(`yearsSince(1380)`), so "۲۵ سال" cannot silently go stale at Nowruz. CMS copy
keeps this: metric lists store a start year, prose uses `{{years:1380}}`. `lib/format.ts`
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
- `docs/CMS.md` — the admin: what is editable, roles, media rules, how it works
