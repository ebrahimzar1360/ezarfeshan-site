const { execSync } = require('child_process');
const fs = require('fs');
const DIR = __dirname;
const OUT = 'c:/Users/Nadimico.com/Desktop/My websait/public/brand';
fs.mkdirSync(OUT, { recursive: true });

const g = (font, chars) => {
  const o = execSync(`node "${DIR}/glyph2path.js" "${DIR}/${font}" "${chars}" 1000`, { encoding: 'utf8' });
  const m = {};
  o.split('\n## ').slice(1).forEach(b => {
    const ch = b[1];
    const bbox = b.match(/bbox=\[([-\d.,]+)\]/)[1].split(',').map(Number);
    const adv = Number(b.match(/adv=([-\d.]+)/)[1]);
    const lsb = Number(b.match(/lsb=([-\d.]+)/)[1]);
    m[ch] = { d: b.split('\n').filter(l => l.startsWith('M'))[0], bbox, adv, lsb };
  });
  return m;
};

const PF = g('playfair700.ttf', 'EZ');
const IN = g('inter600.ttf', 'EBRAHIMZARFESHN ');

const GOLD = '#C8A84B', INK = '#1A1A1A', PAPER = '#F5F5F0';
const place = (leftEdge, baseline, minX, s) => `translate(${(leftEdge - minX * s).toFixed(2)} ${baseline}) scale(${s})`;
const pt = (deg, rad, cx = 100, cy = 100) => [
  +(cx + rad * Math.cos(deg * Math.PI / 180)).toFixed(2),
  +(cy + rad * Math.sin(deg * Math.PI / 180)).toFixed(2)];

// ---------- 1. primary mark (ink parts inherit currentColor) ----------
const R = 78, SW = 5, S = 0.09322;
const [ax, ay] = pt(-26, R), [bx, by] = pt(-58, R), [dx, dy] = pt(-42, R);
const markInner =
  `<path d="M${ax} ${ay} A ${R} ${R} 0 1 1 ${bx} ${by}" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linecap="round"/>` +
  `<circle cx="${dx}" cy="${dy}" r="9" fill="${GOLD}"/>` +
  `<path d="${PF.E.d}" fill="currentColor" transform="${place(55.5, 121.5, 34, S)}"/>` +
  `<path d="${PF.Z.d}" fill="${GOLD}" transform="${place(96.2, 144.5, 39, S)}"/>`;

fs.writeFileSync(`${OUT}/logo-mark.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" role="img" aria-label="ابراهیم زرفشان">\n  ${markInner}\n</svg>\n`);

// ---------- 2. horizontal lockup: mark + latin wordmark ----------
// Inter 600, letterspaced, sitting on a baseline; gold hairline rule beneath.
const WORD = 'EBRAHIM ZARFESHAN';
// paths + metrics are normalised to a 1000-unit em by glyph2path, so both fonts share one space
const WS = 40 / 727.5;               // 1000-em units -> 40 cap height (Inter cap = 727.5)
const TRACK = 80;                    // letterspacing, 1000-em units
let cursor = 0;
let wordPaths = '';
for (const ch of WORD) {
  const gl = IN[ch];
  if (ch !== ' ') wordPaths += `<path d="${gl.d}" transform="translate(${(cursor * WS).toFixed(2)} 0) scale(${WS})"/>`;
  cursor += gl.adv + TRACK;
}
cursor -= TRACK;                     // no trailing track after the last glyph
const wordW = cursor * WS;
const MARK_H = 104, GAP = 26;
const lockH = 104;
const lockW = MARK_H + GAP + wordW;
// wordmark optically centred against the mark: cap box spans baseline-40 .. baseline
const wordBaseY = lockH / 2 + 20;

// horizontal lockup — mark + latin wordmark. No rule here: in the source lockup the
// gold rule divides the latin name from the persian line, which lives as HTML text.
fs.writeFileSync(`${OUT}/logo-lockup.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lockW.toFixed(1)} ${lockH}" role="img" aria-label="ابراهیم زرفشان">
  <g transform="scale(${(MARK_H / 200).toFixed(5)})">${markInner}</g>
  <g fill="currentColor" transform="translate(${(MARK_H + GAP).toFixed(1)} ${wordBaseY})">${wordPaths}</g>
</svg>\n`);

// stacked lockup — mirrors the source artwork: mark over name over gold rule.
const SMARK = 128, SGAP = 26;
const sWordScale = 34 / 727.5;
const sWordW = cursor * sWordScale;
const sW = Math.max(SMARK, sWordW);
const sBase = SMARK + SGAP + 34;
fs.writeFileSync(`${OUT}/logo-stacked.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sW.toFixed(1)} ${(sBase + 26).toFixed(1)}" role="img" aria-label="ابراهیم زرفشان">
  <g transform="translate(${((sW - SMARK) / 2).toFixed(1)} 0) scale(${(SMARK / 200).toFixed(5)})">${markInner}</g>
  <g fill="currentColor" transform="translate(${((sW - sWordW) / 2).toFixed(1)} ${sBase}) scale(${(sWordScale / WS).toFixed(5)})">${wordPaths}</g>
  <rect x="${((sW - sWordW) / 2).toFixed(1)}" y="${(sBase + 16).toFixed(1)}" width="${sWordW.toFixed(1)}" height="2" fill="${GOLD}"/>
</svg>\n`);

// ---------- 3. favicons ----------
const FS = 0.125;
const favInner =
  `<path d="${PF.E.d}" fill="${PAPER}" transform="${place(38, 131, 34, FS)}"/>` +
  `<path d="${PF.Z.d}" fill="${GOLD}" transform="${place(93, 162, 39, FS)}"/>`;
fs.writeFileSync(`${OUT}/favicon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="${INK}"/>${favInner}</svg>\n`);
// maskable / PWA: safe zone is the inner 80%, so shrink content
fs.writeFileSync(`${OUT}/icon-maskable.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${INK}"/><g transform="translate(100 100) scale(0.8) translate(-100 -100)">${favInner}</g></svg>\n`);
// tab-legible fallback: single E + gold dot
fs.writeFileSync(`${OUT}/favicon-small.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="${INK}"/>` +
  `<path d="${PF.E.d}" fill="${PAPER}" transform="${place(58, 160, 34, 0.17)}"/><circle cx="152" cy="48" r="26" fill="${GOLD}"/></svg>\n`);

// ---------- 4. inline marks for the React header ----------
// Emitted from the same geometry as the SVG files above. Hand-copying path data
// into the component once shipped letters at 1/10 scale — the paths had been
// extracted in a 100-unit em while the transforms assumed 1000. Generate, never copy.
const TS_OUT = 'c:/Users/Nadimico.com/Desktop/My websait/components/ui/logo-mark.generated.ts';

// ring: ink strokes take currentColor, gold stays fixed
const ringInline =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" role="presentation">` +
  `<path d="M${ax} ${ay} A ${R} ${R} 0 1 1 ${bx} ${by}" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linecap="round"/>` +
  `<circle cx="${dx}" cy="${dy}" r="9" fill="${GOLD}"/>` +
  `<path d="${PF.E.d}" fill="currentColor" transform="${place(55.5, 121.5, 34, S)}"/>` +
  `<path d="${PF.Z.d}" fill="${GOLD}" transform="${place(96.2, 144.5, 39, S)}"/>` +
  `</svg>`;

// solid: disc takes currentColor, the E is knocked out with the page background,
// so one string works in both themes without a second file.
const solidInline =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="presentation">` +
  `<circle cx="100" cy="100" r="100" fill="currentColor"/>` +
  `<path d="${PF.E.d}" fill="var(--bg)" transform="${place(38, 131, 34, FS)}"/>` +
  `<path d="${PF.Z.d}" fill="${GOLD}" transform="${place(93, 162, 39, FS)}"/>` +
  `</svg>`;

const q = (s) => JSON.stringify(s);
fs.writeFileSync(
  TS_OUT,
  `// GENERATED by tools/logo/build-logo.js — do not edit by hand.\n` +
    `// Run \`npm run logo\` after changing the mark.\n\n` +
    `/** Outlined ring lockup mark. Legible from about 64px up. */\n` +
    `export const MARK_RING = ${q(ringInline)}\n\n` +
    `/** Solid disc, for small sizes where the ring's serifs disappear. */\n` +
    `export const MARK_SOLID = ${q(solidInline)}\n`
);

console.log('wordmark width:', wordW.toFixed(1), '| lockup viewBox:', lockW.toFixed(1), 'x', lockH);
console.log(fs.readdirSync(OUT).join('\n'));
console.log('inline marks -> components/ui/logo-mark.generated.ts');
