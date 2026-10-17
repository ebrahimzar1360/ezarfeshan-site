/**
 * Particle formations for "از شفافیت تا هوشمندی", one per pillar kind. Pure
 * math, no three.js: each returns typed arrays the scene loads into one
 * points geometry and morphs between.
 *
 *   processes — a flow of four steps along a rising path, read from the right
 *               as Persian is, a magnifier over one step and a gold check at
 *               the end. A light runs along the path: work moving through.
 *   systems   — three square layers stacked in isometric, laid out on a strict
 *               grid, joined by pillars. The light climbs layer by layer.
 *   ai        — a sphere of points holding a network of nodes and links around
 *               a gold core, ringed by an orbit. Pulses travel the links.
 *
 * Tones index the palette the scene reads from the theme tokens:
 * 0 forest, 1 emerald, 2 gold, 3 forest-deep.
 */

export type Form = {
  pos: Float32Array // xyz
  tone: Float32Array // palette index
  pulse: Float32Array // 0..1 position along the figure's light path
}

export type Kind = 'processes' | 'systems' | 'ai'

const FOREST = 0
const EMERALD = 1
const GOLD = 2
const DEEP = 3

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Writes points into a form; `put` hands out slots until the budget runs out. */
function writer(n: number) {
  const f: Form = { pos: new Float32Array(n * 3), tone: new Float32Array(n), pulse: new Float32Array(n) }
  let i = 0
  const put = (x: number, y: number, z: number, tone: number, pulse: number) => {
    if (i >= n) return false
    f.pos[i * 3] = x
    f.pos[i * 3 + 1] = y
    f.pos[i * 3 + 2] = z
    f.tone[i] = tone
    f.pulse[i] = pulse
    i++
    return true
  }
  /** fills whatever is left by repeating the points already placed, jittered, so no particle idles at the origin */
  const finish = (r: () => number) => {
    const placed = Math.max(i, 1)
    while (i < n) {
      const j = Math.floor(r() * placed)
      put(
        f.pos[j * 3]! + (r() - 0.5) * 0.03,
        f.pos[j * 3 + 1]! + (r() - 0.5) * 0.03,
        f.pos[j * 3 + 2]! + (r() - 0.5) * 0.03,
        f.tone[j]!,
        f.pulse[j]!,
      )
    }
    return f
  }
  return { put, finish }
}

/* ---- processes ------------------------------------------------------ */

/** the path the steps sit on: from the right (start) to the left (end), rising, bowing towards the viewer */
function flow(t: number): [number, number, number] {
  const x = 2.5 - 5 * t
  const y = -1.45 + 1.9 * t + Math.sin(t * Math.PI * 2) * 0.18
  const z = Math.sin(t * Math.PI) * 0.45
  return [x, y, z]
}

const STEPS = [0.06, 0.36, 0.65, 0.94]

function processes(n: number): Form {
  const r = rng(11)
  const { put, finish } = writer(n)
  const half = 0.46
  const rad = 0.14

  // a rounded-square outline, two layers deep so it reads as a frame
  const frame = (cx: number, cy: number, cz: number, count: number, tone: number, pulse: number) => {
    const straight = half - rad
    const per = 8 * straight + 2 * Math.PI * rad
    for (let k = 0; k < count; k++) {
      let s = r() * per
      let x = 0
      let y = 0
      const sides: [number, number, number, number][] = [
        [-straight, -half, 1, 0],
        [half, -straight, 0, 1],
        [straight, half, -1, 0],
        [-half, straight, 0, -1],
      ]
      let done = false
      for (let side = 0; side < 4 && !done; side++) {
        const [sx, sy, dx, dy] = sides[side]!
        if (s < 2 * straight) {
          x = sx + dx * s
          y = sy + dy * s
          done = true
          break
        }
        s -= 2 * straight
        if (s < (Math.PI / 2) * rad) {
          const a = -Math.PI / 2 + (side * Math.PI) / 2 + s / rad
          const ccx = side === 0 || side === 1 ? straight : -straight
          const ccy = side === 1 || side === 2 ? straight : -straight
          x = ccx + Math.cos(a) * rad
          y = ccy + Math.sin(a) * rad
          done = true
          break
        }
        s -= (Math.PI / 2) * rad
      }
      const depth = r() < 0.5 ? -0.05 : 0.05
      put(cx + x, cy + y, cz + depth + (r() - 0.5) * 0.02, tone, pulse)
    }
  }

  const frameShare = Math.floor(n * 0.4)
  const lineShare = Math.floor(n * 0.12)
  const pathShare = Math.floor(n * 0.26)
  const lensShare = Math.floor(n * 0.14)

  STEPS.forEach((t, i) => {
    const [x, y, z] = flow(t)
    frame(x, y, z, Math.floor(frameShare / 4), i === 3 ? EMERALD : FOREST, t)
    // document lines inside the first three steps; the last holds the check
    if (i < 3) {
      for (let k = 0; k < lineShare / 3; k++) {
        const row = Math.floor(r() * 3)
        const w = row === 0 ? 0.42 : row === 1 ? 0.56 : 0.34
        put(x + 0.28 - r() * w, y + 0.2 - row * 0.19, z + (r() - 0.5) * 0.03, row === 0 ? EMERALD : DEEP, t)
      }
    }
  })

  // the path between steps, skipping the inside of each frame
  for (let k = 0; k < pathShare; k++) {
    const t = r()
    if (STEPS.some((s) => Math.abs(s - t) < 0.075)) {
      k--
      continue
    }
    const [x, y, z] = flow(t)
    put(x + (r() - 0.5) * 0.025, y + (r() - 0.5) * 0.025, z + (r() - 0.5) * 0.025, t > 0.5 ? EMERALD : FOREST, t)
  }

  // magnifier hovering over the second step
  const [mx, my, mz] = flow(STEPS[1]!)
  const lx = mx - 0.22
  const ly = my + 0.3
  const lz = mz + 0.55
  for (let k = 0; k < lensShare; k++) {
    if (k < lensShare * 0.72) {
      const a = r() * Math.PI * 2
      const tube = r() * Math.PI * 2
      const R = 0.42 + Math.cos(tube) * 0.035
      put(lx + Math.cos(a) * R, ly + Math.sin(a) * R, lz + Math.sin(tube) * 0.035, EMERALD, STEPS[1]!)
    } else {
      const s = r()
      const a = -Math.PI / 4
      put(lx + Math.cos(a) * (0.46 + s * 0.42), ly + Math.sin(a) * (0.46 + s * 0.42), lz + (r() - 0.5) * 0.05, GOLD, STEPS[1]!)
    }
  }

  // the check in the last step
  const [cx, cy, cz] = flow(STEPS[3]!)
  const check: [number, number][] = [
    [-0.2, 0.0],
    [-0.06, -0.15],
    [0.22, 0.17],
  ]
  for (let k = 0; k < n * 0.06; k++) {
    const seg = r() < 0.35 ? 0 : 1
    const s = r()
    const [ax, ay] = check[seg]!
    const [bx, by] = check[seg + 1]!
    put(cx + ax + (bx - ax) * s, cy + ay + (by - ay) * s, cz + (r() - 0.5) * 0.06, GOLD, 1)
  }

  return finish(r)
}

/* ---- systems -------------------------------------------------------- */

function systems(n: number): Form {
  const r = rng(23)
  const { put, finish } = writer(n)
  const layers = [
    { y: -1.15, tone: FOREST, edge: DEEP },
    { y: 0, tone: GOLD, edge: GOLD },
    { y: 1.15, tone: EMERALD, edge: FOREST },
  ]
  const half = 1.25
  const turn = Math.PI / 4
  const rot = (x: number, z: number): [number, number] => [
    x * Math.cos(turn) - z * Math.sin(turn),
    x * Math.sin(turn) + z * Math.cos(turn),
  ]
  const perLayer = Math.floor((n * 0.84) / layers.length)

  layers.forEach((L, li) => {
    // a strict grid on the face: order, legible at a glance
    const gridCount = Math.floor(perLayer * 0.62)
    const side = Math.max(4, Math.floor(Math.sqrt(gridCount)))
    for (let gx = 0; gx < side; gx++) {
      for (let gz = 0; gz < side; gz++) {
        const x = -half + (2 * half * (gx + 0.5)) / side
        const z = -half + (2 * half * (gz + 0.5)) / side
        const [rx, rz] = rot(x, z)
        put(rx, L.y, rz, L.tone, li / 2 + 0.05)
      }
    }
    // dense rim, slightly thick, so each layer reads as a solid plate
    const rim = perLayer - side * side
    for (let k = 0; k < rim; k++) {
      const s = r() * 8 * half
      const sideI = Math.floor(s / (2 * half))
      const u = (s % (2 * half)) - half
      const [x, z] = sideI === 0 ? [u, -half] : sideI === 1 ? [half, u] : sideI === 2 ? [-u, half] : [-half, -u]
      const [rx, rz] = rot(x * 1.03, z * 1.03)
      put(rx, L.y + (r() - 0.5) * 0.12, rz, L.edge, li / 2 + 0.05)
    }
  })

  // pillars joining the layers at the corners and the centre: the system's wiring
  const posts: [number, number][] = [
    [half, half],
    [-half, half],
    [half, -half],
    [-half, -half],
    [0, 0],
  ]
  const left = n - Math.floor(n * 0.84)
  for (let k = 0; k < left; k++) {
    const [px, pz] = posts[Math.floor(r() * posts.length)]!
    const [rx, rz] = rot(px * 1.03, pz * 1.03)
    const y = -1.15 + r() * 2.3
    put(rx + (r() - 0.5) * 0.03, y, rz + (r() - 0.5) * 0.03, px === 0 ? GOLD : FOREST, (y + 1.15) / 2.3)
  }

  return finish(r)
}

/* ---- ai --------------------------------------------------------------- */

function ai(n: number): Form {
  const r = rng(37)
  const { put, finish } = writer(n)

  // a shell of evenly spread points
  const shell = Math.floor(n * 0.3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let k = 0; k < shell; k++) {
    const y = 1 - (2 * (k + 0.5)) / shell
    const rad = Math.sqrt(1 - y * y)
    const a = k * golden
    put(Math.cos(a) * rad * 1.7, y * 1.7, Math.sin(a) * rad * 1.7, k % 9 === 0 ? FOREST : EMERALD, 0.5 + y * 0.5)
  }

  // the network inside it
  const nodes: [number, number, number][] = [[0, 0, 0]]
  while (nodes.length < 15) {
    const p: [number, number, number] = [(r() - 0.5) * 2.4, (r() - 0.5) * 2.4, (r() - 0.5) * 2.4]
    const d = Math.hypot(...p)
    if (d < 0.55 || d > 1.25) continue
    if (nodes.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 0.5)) continue
    nodes.push(p)
  }
  const edges: [number, number][] = []
  nodes.forEach((p, i) => {
    if (i === 0) return
    const near = nodes
      .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
    for (const o of near) if (!edges.some(([a, b]) => (a === i && b === o.j) || (a === o.j && b === i))) edges.push([i, o.j])
    if (i % 3 === 0 && !edges.some(([a, b]) => (a === 0 && b === i) || (a === i && b === 0))) edges.push([0, i])
  })

  const linkShare = Math.floor(n * 0.34)
  for (let k = 0; k < linkShare; k++) {
    const e = Math.floor(r() * edges.length)
    const [a, b] = edges[e]!
    const s = r()
    const pa = nodes[a]!
    const pb = nodes[b]!
    // each link carries its own pulse, offset so they do not fire in step
    put(
      pa[0] + (pb[0] - pa[0]) * s,
      pa[1] + (pb[1] - pa[1]) * s,
      pa[2] + (pb[2] - pa[2]) * s,
      FOREST,
      (s * 0.4 + e * 0.137) % 1,
    )
  }

  const nodeShare = Math.floor(n * 0.24)
  for (let k = 0; k < nodeShare; k++) {
    const i = k < nodeShare * 0.22 ? 0 : 1 + Math.floor(r() * (nodes.length - 1))
    const p = nodes[i]!
    const size = i === 0 ? 0.2 : 0.075
    // a small solid ball per node
    const u = r() * 2 - 1
    const a = r() * Math.PI * 2
    const rr = Math.cbrt(r()) * size
    const q = Math.sqrt(1 - u * u)
    put(p[0] + Math.cos(a) * q * rr, p[1] + u * rr, p[2] + Math.sin(a) * q * rr, i === 0 || i % 5 === 0 ? GOLD : DEEP, (i * 0.137) % 1)
  }

  // the orbit around it
  const ring = n - shell - linkShare - nodeShare
  const tilt = 0.45
  for (let k = 0; k < ring; k++) {
    const a = r() * Math.PI * 2
    const R = 2.08 + (r() - 0.5) * 0.03
    const x = Math.cos(a) * R
    const z = Math.sin(a) * R
    put(x, z * Math.sin(tilt), z * Math.cos(tilt), GOLD, a / (Math.PI * 2))
  }

  return finish(r)
}

export function buildForm(kind: string, n: number): Form {
  if (kind === 'systems') return systems(n)
  if (kind === 'ai') return ai(n)
  return processes(n)
}
