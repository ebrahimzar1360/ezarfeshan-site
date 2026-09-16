/**
 * Brand guard: greps the source for the class patterns that docs/DESIGN-PLAN.md
 * bans, and exits non-zero when it finds one.
 *
 * This is what replaces a shadcn token-alias layer. The value of having only
 * five colours and only logical properties is that a violation shows up in a
 * diff; an alias layer would let foreign code compile and look approximately
 * right, so nobody would ever port it. A grep says no out loud instead.
 *
 * Read-only. No dependencies. Run with `npm run lint:brand`.
 */

import { readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'components', 'lib']
const EXTENSIONS = ['.ts', '.tsx', '.css']

/** Files exempt from a rule, by the reason recorded in DESIGN-PLAN / OPEN-QUESTIONS. */
const EXEMPT = {
  // The round chat launcher is the single documented exception to the pill ban:
  // a circular FAB is the recognised convention for chat and changing it would
  // confuse people more than the inconsistency costs.
  pill: ['components/site/ChatWidget.tsx', 'components/site/chat/ChatLauncher.tsx'],
  // globals.css defines the palette; layout.tsx needs a literal for <meta
  // name="theme-color"> which cannot read a CSS variable; the OG route runs in
  // Satori, which has no cascade at all; mailer.ts writes email HTML, and no
  // mail client resolves a custom property, so literals there are mandatory.
  hex: [
    'lib/mailer.ts',
    'app/globals.css',
    'app/layout.tsx',
    'app/api/og/route.tsx',
    'app/global-error.tsx',
    'components/ui/logo-mark.generated.ts',
  ],
}

const RULES = [
  {
    id: 'physical-direction',
    // Tailwind logical utilities are start-*/end-*/ms-*/me-*/ps-*/pe-*. A
    // physical one silently renders the mirror image of the intended layout.
    pattern: /(?<![\w-])(ml|mr|pl|pr|left|right)-(?!\[)[a-z0-9.[\]/-]+/g,
    message: 'physical direction utility — use the logical equivalent (start/end, ms/me, ps/pe)',
  },
  {
    id: 'physical-text-align',
    pattern: /(?<![\w-])text-(left|right)(?![\w-])/g,
    message: 'use text-start / text-end',
  },
  {
    id: 'physical-origin',
    pattern: /(?<![\w-])origin-(left|right)(?![\w-])/g,
    message: 'no logical equivalent exists — rewrite the transform or drop the animation',
  },
  {
    id: 'css-physical-property',
    // DESIGN-PLAN §11 lists "no left/right in CSS" as an acceptance criterion
    // and nothing ever enforced it. Only applies to .css files.
    pattern: /^\s*(left|right|margin-left|margin-right|padding-left|padding-right|border-left|border-right)\s*:/gm,
    message: 'physical CSS property — use inset-inline-*, margin-inline-*, border-inline-*',
    only: /\.css$/,
  },
  {
    id: 'pill',
    pattern: /(?<![\w-])rounded-full(?![\w-])/g,
    message: 'pill radius is banned (DESIGN-PLAN §4, radius caps at --radius-lg)',
    exempt: EXEMPT.pill,
  },
  {
    id: 'oversized-radius',
    pattern: /(?<![\w-])rounded-(2xl|3xl|4xl)(?![\w-])/g,
    message: 'radius caps at rounded-lg (10px)',
  },
  {
    id: 'raw-hex',
    pattern: /#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g,
    message: 'raw hex — use a brand token',
    exempt: EXEMPT.hex,
  },
  {
    id: 'foreign-palette',
    pattern: /(?<![\w-])(bg|text|border|from|via|to)-(zinc|slate|gray|grey|stone|red|blue|green|amber|indigo|violet|purple)-\d{2,3}(?![\w-])/g,
    message: 'outside the five-colour palette',
  },
  {
    id: 'absolute-monochrome',
    pattern: /(?<![\w-])(bg|text|border)-(white|black)(?![\w-])/g,
    message: 'use --bg-raised / --text / --border, which flip with the theme',
  },
  {
    id: 'shadow-scale',
    pattern: /(?<![\w-])shadow-(sm|md|lg|xl|2xl)(?![\w-])/g,
    message: 'cards separate with a hairline, not a shadow; floating layers use shadow-(--shadow)',
  },
  {
    id: 'shadcn-token',
    pattern: /(?<![\w-])(bg|text|border)-(background|foreground|muted-foreground|card|popover|primary|secondary|destructive|input|ring)(?![\w-])/g,
    message: 'shadcn token vocabulary — port it (docs/IMPORT-CHECKLIST.md §2)',
  },
  {
    id: 'gradient',
    pattern: /(?<![\w-])bg-gradient-to-[a-z]+(?![\w-])/g,
    message: 'gradients are banned (DESIGN-PLAN §10, anti-pattern row 1)',
  },
  {
    id: 'transition-all',
    pattern: /(?<![\w-])transition-all(?![\w-])/g,
    message: 'name the properties, as Button.tsx does',
  },
]

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'vendor') continue
      yield* walk(path)
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      yield path
    }
  }
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

/**
 * Blank out comments before matching, preserving offsets so line numbers stay
 * true. Without this the guard reads English prose: the OG route explains that
 * Satori lays out "left-to-right" with text "right-aligned by hand", and every
 * one of those words trips the physical-direction rule.
 *
 * The `(?<![:\w])` guard on `//` keeps it off the `//` in a URL.
 */
function stripComments(source) {
  const blank = (match) => match.replace(/[^\n]/g, ' ')
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(?<![:\w])\/\/[^\n]*/g, blank)
}

const findings = []

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file).split(sep).join('/')
    const source = stripComments(readFileSync(file, 'utf8'))

    for (const rule of RULES) {
      if (rule.only && !rule.only.test(rel)) continue
      if (rule.exempt?.includes(rel)) continue

      rule.pattern.lastIndex = 0
      for (const match of source.matchAll(rule.pattern)) {
        findings.push({
          file: rel,
          line: lineOf(source, match.index),
          match: match[0].trim(),
          rule: rule.id,
          message: rule.message,
        })
      }
    }
  }
}

if (findings.length === 0) {
  console.log('lint:brand — clean')
  process.exit(0)
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
for (const f of findings) {
  console.log(`${f.file}:${f.line}  ${f.match}\n    [${f.rule}] ${f.message}`)
}
console.log(`\n${findings.length} finding(s). See docs/IMPORT-CHECKLIST.md.`)
process.exit(1)
