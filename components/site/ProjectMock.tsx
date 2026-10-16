import type { Project } from '@/lib/content/projects'

/**
 * Placeholder product illustrations — drawn interface sketches in the brand
 * colours, standing in until real screenshots exist. They carry no data and
 * make no claim, so they are decorative (aria-hidden).
 */

function Window({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect x="28" y="22" width="344" height="206" rx="14" className="fill-white stroke-forest/15" strokeWidth="1.2" />
      <rect x="28" y="22" width="344" height="26" rx="14" className="fill-sand" />
      <rect x="28" y="36" width="344" height="12" className="fill-sand" />
      {[46, 60, 74].map((x, i) => (
        <circle key={x} cx={x} cy="35" r="3.6" className={i === 0 ? 'fill-gold' : 'fill-forest/25'} />
      ))}
      {children}
    </g>
  )
}

function Performance() {
  const bars = [34, 52, 44, 68, 58, 82]
  return (
    <Window>
      {/* sidebar */}
      <rect x="40" y="58" width="52" height="158" rx="8" className="fill-forest" />
      {[72, 90, 108, 126].map((y, i) => (
        <rect key={y} x="50" y={y} width={i === 0 ? 32 : 26} height="6" rx="3" className={i === 0 ? 'fill-gold' : 'fill-paper/50'} />
      ))}
      {/* kpi tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={104 + i * 88} y="58" width="80" height="40" rx="8" className="fill-bg-sunken stroke-forest/10" />
          <rect x={112 + i * 88} y="68" width="28" height="5" rx="2.5" className="fill-forest/30" />
          <rect x={112 + i * 88} y="80" width="46" height="9" rx="4.5" className={i === 2 ? 'fill-gold' : 'fill-emerald'} />
        </g>
      ))}
      {/* bar chart */}
      <rect x="104" y="108" width="168" height="108" rx="8" className="fill-bg-sunken stroke-forest/10" />
      {bars.map((h, i) => (
        <rect key={i} x={116 + i * 24} y={204 - h} width="14" height={h} rx="3" className={i === 5 ? 'fill-gold' : 'fill-emerald'} />
      ))}
      {/* gauge */}
      <rect x="282" y="108" width="80" height="108" rx="8" className="fill-bg-sunken stroke-forest/10" />
      <circle cx="322" cy="150" r="22" className="fill-none stroke-forest/15" strokeWidth="8" />
      <circle
        cx="322"
        cy="150"
        r="22"
        className="fill-none stroke-emerald"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="104 138"
        transform="rotate(-90 322 150)"
      />
      <rect x="298" y="188" width="48" height="6" rx="3" className="fill-forest/25" />
    </Window>
  )
}

function Tama() {
  return (
    <g>
      {/* dashboard window, behind */}
      <rect x="24" y="36" width="236" height="170" rx="14" className="fill-white stroke-forest/15" strokeWidth="1.2" />
      <rect x="38" y="52" width="70" height="8" rx="4" className="fill-forest/30" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const h = [30, 46, 38, 62, 50, 70, 44][i]!
        return <rect key={i} x={40 + i * 30} y={186 - h} width="18" height={h} rx="4" className={i === 5 ? 'fill-gold' : 'fill-emerald/80'} />
      })}
      <rect x="38" y="76" width="204" height="1.5" className="fill-forest/10" />
      {/* phone, in front */}
      <rect x="248" y="22" width="112" height="206" rx="20" className="fill-forest-deep" />
      <rect x="256" y="34" width="96" height="182" rx="14" className="fill-white" />
      <rect x="290" y="38" width="28" height="5" rx="2.5" className="fill-forest-deep/40" />
      <rect x="264" y="54" width="52" height="7" rx="3.5" className="fill-forest/35" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="264" y={70 + i * 34} width="80" height="28" rx="8" className={i === 1 ? 'fill-emerald' : 'fill-bg-sunken'} />
          <rect x="272" y={79 + i * 34} width="26" height="5" rx="2.5" className={i === 1 ? 'fill-paper' : 'fill-forest/35'} />
          <rect x="272" y={88 + i * 34} width="40" height="4" rx="2" className={i === 1 ? 'fill-paper/60' : 'fill-forest/20'} />
          <circle cx="330" cy={84 + i * 34} r="5" className={i === 1 ? 'fill-gold' : 'fill-forest/20'} />
        </g>
      ))}
    </g>
  )
}

function Intelligence() {
  const nodes: [number, number, boolean][] = [
    [120, 96, false],
    [176, 78, false],
    [226, 108, true],
    [150, 150, false],
    [212, 170, false],
  ]
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [3, 2],
    [3, 4],
    [2, 4],
  ]
  return (
    <Window>
      <rect x="40" y="58" width="196" height="158" rx="8" className="fill-bg-sunken stroke-forest/10" />
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a]![0]} y1={nodes[a]![1]} x2={nodes[b]![0]} y2={nodes[b]![1]} className="stroke-forest/35" strokeWidth="1.6" />
      ))}
      {nodes.map(([x, y, gold], i) => (
        <circle key={i} cx={x} cy={y} r={gold ? 11 : 7.5} className={gold ? 'fill-gold' : 'fill-forest'} />
      ))}
      {/* side tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="248" y={58 + i * 54} width="114" height="46" rx="8" className="fill-bg-sunken stroke-forest/10" />
          <rect x="258" y={68 + i * 54} width="34" height="5" rx="2.5" className="fill-forest/30" />
          <rect x="258" y={80 + i * 54} width={[70, 54, 84][i]} height="9" rx="4.5" className={i === 1 ? 'fill-gold' : 'fill-emerald'} />
        </g>
      ))}
    </Window>
  )
}

export function ProjectMock({ kind }: { kind: Project['mock'] }) {
  return (
    <div className="aspect-[8/5] w-full overflow-hidden bg-bg-band">
      <svg viewBox="0 0 400 250" aria-hidden focusable="false" className="size-full">
        {kind === 'performance' && <Performance />}
        {kind === 'tama' && <Tama />}
        {kind === 'intelligence' && <Intelligence />}
      </svg>
    </div>
  )
}
