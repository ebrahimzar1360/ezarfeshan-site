import type { CSSProperties, ReactNode } from 'react'
import { HeroStage } from './HeroStage'

/**
 * The homepage hero's central graphic, drawn in SVG so it scales cleanly and
 * costs a few kilobytes: an isometric slab carrying the EZ monogram, four glass
 * cards (process, analytics, AI, checklist) and a faint network of nodes and
 * lines around them.
 *
 * Motion is slow and small — rings turning once in two minutes, cards floating
 * a few pixels, dashes drifting along the lines, node halos breathing. All of
 * it is CSS (globals.css §13) and all of it stops under reduced motion, which
 * leaves the finished composition. The whole graphic is decorative, so it is
 * aria-hidden; the headline beside it carries the meaning.
 *
 * Colours come from the theme tokens (fill-forest, stroke-gold…), never hex.
 *
 * This SVG is also the poster for the 3D stage (HeroStage → hero-scene.ts).
 * When WebGL draws its first frame the slab and monogram here (.ha-core) fade
 * out and the real solids take their place; rings, lines and cards stay, and
 * the cards drift with the pointer at their own depth (.ha-par, `--z`), so the
 * flat layer and the 3D layer move as one space.
 */

const delay = (s: number, t?: number) => ({ '--dl': `${s}s`, ...(t ? { '--t': `${t}s` } : {}) }) as CSSProperties

/** A floating glass card at (x, y); position is an attribute, motion is nested CSS. */
function Card({
  x,
  y,
  w,
  h,
  enter,
  floatDelay,
  floatTime,
  depth,
  children,
}: {
  x: number
  y: number
  w: number
  h: number
  enter: number
  floatDelay: number
  floatTime: number
  /** how far the card drifts with the pointer, in viewBox units */
  depth: number
  children: ReactNode
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="ha-par" style={{ '--z': depth } as CSSProperties}>
        <g className="ha-in" style={delay(enter)}>
          <g className="ha-float" style={delay(floatDelay, floatTime)}>
            <rect
              width={w}
              height={h}
              rx="20"
              className="fill-white/80 stroke-gold/40"
              strokeWidth="1"
              filter="url(#ha-shadow)"
            />
            {children}
          </g>
        </g>
      </g>
    </g>
  )
}

function Gear() {
  return (
    <g transform="translate(46 46)">
      <circle r="15" className="fill-none stroke-forest" strokeWidth="5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="-4"
          y="-24"
          width="8"
          height="10"
          rx="2"
          className="fill-forest"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="5" className="fill-gold" />
    </g>
  )
}

function Bars() {
  const bars = [
    { x: 22, h: 24 },
    { x: 46, h: 38 },
    { x: 70, h: 54 },
    { x: 94, h: 70, gold: true },
  ]
  return (
    <g>
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={90 - b.h}
          width="15"
          height={b.h}
          rx="3"
          className={b.gold ? 'fill-gold' : 'fill-emerald'}
        />
      ))}
      <path
        d="M22 48 L48 38 L72 26 L100 12"
        className="fill-none stroke-forest/60"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

function Neural() {
  const pts: [number, number][] = [
    [30, 34],
    [70, 28],
    [50, 54],
    [28, 72],
    [72, 70],
  ]
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 3],
    [2, 4],
    [3, 4],
  ]
  return (
    <g>
      <circle cx="50" cy="50" r="36" className="fill-none stroke-emerald/35" strokeWidth="1.5" />
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={pts[a]![0]}
          y1={pts[a]![1]}
          x2={pts[b]![0]}
          y2={pts[b]![1]}
          className="stroke-forest/55"
          strokeWidth="1.6"
        />
      ))}
      {pts.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 2 ? 6 : 4.5} className={i === 2 ? 'fill-gold' : 'fill-forest'} />
      ))}
    </g>
  )
}

function Checklist() {
  return (
    <g>
      {[22, 40, 58].map((y, i) => (
        <g key={y}>
          <circle
            cx="24"
            cy={y}
            r="7"
            className={i < 2 ? 'fill-gold' : 'fill-none stroke-forest/40'}
            strokeWidth="1.6"
          />
          {i < 2 && (
            <path
              d={`M20.5 ${y} l2.6 2.8 l5-5.4`}
              className="fill-none stroke-forest-deep"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <rect x="40" y={y - 3.5} width={i === 1 ? 36 : 44} height="7" rx="3.5" className="fill-forest/25" />
        </g>
      ))}
    </g>
  )
}

export function HeroArt() {
  return (
    <div className="ha-stage">
      <svg viewBox="0 0 560 520" aria-hidden focusable="false" className="h-auto w-full overflow-visible">
        <defs>
          <filter id="ha-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="var(--color-forest)" floodOpacity="0.16" />
          </filter>
          <filter id="ha-soft" x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <radialGradient id="ha-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'var(--color-gold)', stopOpacity: 0.32 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-gold)', stopOpacity: 0 }} />
          </radialGradient>
          <linearGradient id="ha-cream-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'white' }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-sand)' }} />
          </linearGradient>
        </defs>

        {/* soft light behind the slab */}
        <ellipse className="ha-glow" cx="290" cy="300" rx="250" ry="200" fill="url(#ha-aura)" />

        {/* rings — turning once in minutes, not seconds */}
        <circle
          className="ha-spin fill-none stroke-gold/45"
          style={delay(0, 160)}
          cx="290"
          cy="262"
          r="236"
          strokeWidth="1.2"
          strokeDasharray="2 9"
        />
        <circle
          className="ha-spin fill-none stroke-emerald/25"
          style={{ ...delay(0, 110), animationDirection: 'reverse' }}
          cx="290"
          cy="262"
          r="188"
          strokeWidth="1"
        />

        {/* lines from the cards and outer nodes to the slab */}
        <g className="fill-none stroke-forest/30" strokeWidth="1.2" strokeLinecap="round">
          <path className="ha-draw" style={delay(0.7)} pathLength="1" d="M70 132 Q160 182 262 266" />
          <path className="ha-draw" style={delay(0.85)} pathLength="1" d="M480 150 Q400 192 318 266" />
          <path className="ha-draw" style={delay(1.0)} pathLength="1" d="M84 392 Q170 358 250 304" />
          <path className="ha-draw" style={delay(1.15)} pathLength="1" d="M476 392 Q400 358 330 304" />
          <path className="ha-draw" style={delay(1.3)} pathLength="1" d="M290 30 L290 150" />
          <path className="ha-draw" style={delay(1.4)} pathLength="1" d="M26 262 Q110 262 196 292" />
          <path className="ha-draw" style={delay(1.5)} pathLength="1" d="M534 262 Q450 262 384 292" />
        </g>
        <g className="ha-flow fill-none stroke-gold" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          <path d="M70 132 Q160 182 262 266" />
          <path d="M480 150 Q400 192 318 266" />
          <path d="M84 392 Q170 358 250 304" />
          <path d="M476 392 Q400 358 330 304" />
        </g>

        {/* outer nodes, each with a breathing halo */}
        {[
          { x: 290, y: 30, d: 0, g: true },
          { x: 26, y: 262, d: 1.2, g: false },
          { x: 534, y: 262, d: 2.4, g: false },
        ].map((n) => (
          <g key={`${n.x}-${n.y}`}>
            <circle
              className="ha-pulse fill-none stroke-gold"
              style={delay(n.d)}
              cx={n.x}
              cy={n.y}
              r="12"
              strokeWidth="1.2"
            />
            <circle cx={n.x} cy={n.y} r="5" className={n.g ? 'fill-gold' : 'fill-forest'} />
          </g>
        ))}

        {/* slab and monogram — replaced by the 3D stage once it draws */}
        <g className="ha-core">
          {/* slab: soft contact shadow, cream base, forest top */}
          <ellipse cx="290" cy="468" rx="190" ry="34" className="fill-forest-deep/20" filter="url(#ha-soft)" />
          <g className="ha-in" style={delay(0.1)}>
            {/* base (cream) */}
            <polygon points="120,352 290,437 290,465 120,380" className="fill-sand-d2" />
            <polygon points="290,437 460,352 460,380 290,465" className="fill-sand-d1" />
            <polygon
              points="290,267 460,352 290,437 120,352"
              fill="url(#ha-cream-top)"
              className="stroke-gold/35"
              strokeWidth="1"
            />
            {/* forest slab */}
            <polygon points="172,330 290,389 290,411 172,352" className="fill-forest-deep" />
            <polygon points="290,389 408,330 408,352 290,411" className="fill-forest" />
            <polygon points="290,271 408,330 290,389 172,330" className="fill-emerald stroke-gold/60" strokeWidth="1" />
            {/* gold edge line on the forest slab */}
            <polyline points="172,352 290,411 408,352" className="fill-none stroke-gold" strokeWidth="1.5" />
          </g>

          {/* the monogram, standing on the slab */}
          <g className="ha-in" style={delay(0.4)}>
            <ellipse cx="290" cy="338" rx="74" ry="17" className="fill-forest-deep/45" filter="url(#ha-soft)" />
            <g className="ha-float" style={delay(0.2, 9)}>
              <image
                href="/brand/ez-monogram.webp"
                x="190"
                y="152"
                width="200"
                height="186"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </g>
        </g>

        {/* the four cards */}
        <Card x={24} y={86} w={92} h={92} enter={0.9} floatDelay={0} floatTime={8} depth={-14}>
          <Gear />
        </Card>
        <Card x={420} y={98} w={124} h={104} enter={1.05} floatDelay={1.4} floatTime={9} depth={-10}>
          <Bars />
        </Card>
        <Card x={34} y={342} w={100} h={100} enter={1.2} floatDelay={0.8} floatTime={7.5} depth={16}>
          <Neural />
        </Card>
        <Card x={428} y={352} w={96} h={80} enter={1.35} floatDelay={2.2} floatTime={8.5} depth={12}>
          <Checklist />
        </Card>
      </svg>
      <HeroStage />
    </div>
  )
}
