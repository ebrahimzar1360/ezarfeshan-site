import type { CSSProperties } from 'react'
import { HeroStage } from './HeroStage'

/**
 * The homepage hero's central graphic, drawn in SVG so it scales cleanly and
 * costs a few kilobytes: an isometric slab carrying the EZ monogram inside a
 * faint orbit of rings, nodes and lines.
 *
 * Motion is slow and small — rings turning once in two minutes, lines drawing
 * in, node halos breathing. All of it is CSS (globals.css §13) and all of it
 * stops under reduced motion. The whole graphic is decorative, so it is
 * aria-hidden; the headline beside it carries the meaning.
 *
 * Colours come from the theme tokens (fill-forest, stroke-gold…), never hex.
 *
 * This SVG is also the poster for the 3D stage (HeroStage → hero-scene.ts).
 * When WebGL draws its first frame the slab and monogram here (.ha-core) fade
 * out and the real solids take their place; the rings and nodes stay. The four
 * floating cards that used to sit around the mark were removed at the owner's
 * request (1405/07/26) so the logo stands alone.
 */

const delay = (s: number, t?: number) => ({ '--dl': `${s}s`, ...(t ? { '--t': `${t}s` } : {}) }) as CSSProperties

export function HeroArt() {
  return (
    <div className="ha-stage">
      <svg viewBox="0 0 560 520" aria-hidden focusable="false" className="h-auto w-full overflow-visible">
        <defs>
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

        {/* lines from the outer nodes to the slab */}
        <g className="fill-none stroke-forest/30" strokeWidth="1.2" strokeLinecap="round">
          <path className="ha-draw" style={delay(1.3)} pathLength="1" d="M290 30 L290 150" />
          <path className="ha-draw" style={delay(1.4)} pathLength="1" d="M26 262 Q110 262 196 292" />
          <path className="ha-draw" style={delay(1.5)} pathLength="1" d="M534 262 Q450 262 384 292" />
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

      </svg>
      <HeroStage />
    </div>
  )
}
