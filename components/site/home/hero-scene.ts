import {
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  BoxGeometry,
  CircleGeometry,
  type Material,
} from 'three'
import { playLock, playMorph, playPing, playResolve, SOUND_EVENT, soundEnabled } from '@/lib/sound'
import { makeResolver, shadowTexture } from '../three/kit'
import { ORIGIN, PIECES, type Cmd, type Piece } from './monogram-shapes'

/**
 * The homepage hero in WebGL: the EZ monogram as real solids — a lacquered
 * green E and a gold Z — floating over a two-tier plinth, inside a tilted gold
 * orbit with three nodes riding it.
 *
 * The idea it acts out is the consultant's: a system put together from parts.
 * On arrival the five pieces fly in from scattered positions and lock into the
 * mark; while the page is read the mark sways slowly, so the light travels
 * across the gold; the pointer turns it, hovering spreads the pieces apart a
 * little like an exploded drawing, and scrolling the hero away spreads them
 * further. A tap or click spins it once.
 *
 * Loaded lazily by HeroStage, only when there is WebGL and the hero is near
 * the viewport; the SVG in HeroArt is the poster until the first frame and the
 * fallback forever if this never runs. Every colour is read from the theme
 * tokens at runtime, and re-read when the theme flips.
 */

export type SceneOptions = {
  canvas: HTMLCanvasElement
  /** the element the CSS tokens and the pointer are measured against */
  host: HTMLElement
  /** reduced motion: draw the finished composition once, never animate */
  still: boolean
  onReady: () => void
  onLost: () => void
}

const UNIT = 100 // raster pixels per world unit
const E_DEPTH = 0.46
const Z_DEPTH = 0.46
const Z_FRONT = 0.6 // the Z sits in front of the E, with a visible gap between layers
const ASSEMBLE = 1.5 // seconds each piece takes to fly home
const STAGGER = 0.14

/** where each piece starts its flight, how it is turned, and where it drifts when exploded */
const FLIGHT: Record<
  Piece['id'],
  { from: [number, number, number]; turn: [number, number, number]; spread: [number, number, number]; delay: number }
> = {
  spine: { from: [-5, 1.2, -6], turn: [0.4, -1.6, 0.3], spread: [-0.55, 0, -0.7], delay: 0 },
  top: { from: [4.5, 4.5, -2], turn: [1.4, 0.4, -0.6], spread: [0.35, 0.5, -0.35], delay: 1 },
  ribbon: { from: [-6, 4, 3], turn: [-0.6, 1.4, 0.8], spread: [-0.45, 0.25, 0.55], delay: 1.8 },
  mid: { from: [-4, -1.5, 6], turn: [-0.8, 1.2, 0.9], spread: [-0.2, 0.05, 0.15], delay: 2.6 },
  bottom: { from: [5, -3.5, -4], turn: [-1.2, -0.7, -1.1], spread: [0.45, -0.4, -0.25], delay: 3.4 },
  z: { from: [0.5, 0.5, 12], turn: [0.3, 0.9, -2.4], spread: [0.1, -0.05, 1.25], delay: 4.4 },
}

const easeOutExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k))
const easeOutBack = (k: number) => {
  const c = 1.4
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2)
}
const smooth = (a: number, b: number, x: number) => MathUtils.smoothstep(x, a, b)

/* ---- geometry ------------------------------------------------------ */

function toShape(path: Cmd[]) {
  const s = new Shape()
  const X = (x: number) => (x - ORIGIN.x) / UNIT
  const Y = (y: number) => -(y - ORIGIN.y) / UNIT
  for (const c of path) {
    if (c[0] === 'M') s.moveTo(X(c[1]), Y(c[2]))
    else if (c[0] === 'L') s.lineTo(X(c[1]), Y(c[2]))
    else if (c[0] === 'Q') s.quadraticCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]))
    else if (c[0] === 'C') s.bezierCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]), X(c[5]), Y(c[6]))
  }
  return s
}

function roundedSquare(size: number, r: number) {
  const h = size / 2
  const s = new Shape()
  s.moveTo(-h + r, -h)
  s.lineTo(h - r, -h)
  s.quadraticCurveTo(h, -h, h, -h + r)
  s.lineTo(h, h - r)
  s.quadraticCurveTo(h, h, h - r, h)
  s.lineTo(-h + r, h)
  s.quadraticCurveTo(-h, h, -h, h - r)
  s.lineTo(-h, -h + r)
  s.quadraticCurveTo(-h, -h, -h + r, -h)
  return s
}

/** a flat rounded tier, lying on the ground and turned 45° so it reads as the isometric slab */
function tier(size: number, height: number, bevel: number) {
  const g = new ExtrudeGeometry(roundedSquare(size, size * 0.09), {
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  })
  g.rotateX(-Math.PI / 2)
  g.rotateY(Math.PI / 4)
  return g
}

/**
 * A small photo studio, baked once into the environment map: a dark room with
 * a softbox overhead, a long cool strip on one side, a warm one on the other
 * and a ring in front. Glossy lacquer and gold pick these up as clean,
 * moving highlights — the look of the RCA mark — where a bright room would
 * wash the green out. Neutral and warm whites only; no brand colour is baked.
 */
function studioScene() {
  const s = new Scene()
  s.background = new Color(0.02, 0.022, 0.02)
  const light = (r: number, g: number, b: number) => new MeshBasicMaterial({ color: new Color(r, g, b) })
  const box = new Mesh(new CircleGeometry(2.4, 32), light(5, 5, 4.8))
  box.position.set(0, 7, -2)
  box.lookAt(0, 0, 0)
  const cool = new Mesh(new BoxGeometry(0.6, 14, 0.1), light(2.2, 2.4, 2.6))
  cool.position.set(-7, 1, 1)
  cool.lookAt(0, 1, 1)
  const warm = new Mesh(new BoxGeometry(0.8, 14, 0.1), light(3, 2.6, 1.9))
  warm.position.set(8, 0, -1)
  warm.lookAt(0, 0, -1)
  // two warm bands behind the camera: what flat gold facing the viewer mirrors.
  // Bright above, dim below, so the sway runs a gradient across the gold.
  const front = new Mesh(new BoxGeometry(14, 2.6, 0.1), light(1.9, 1.62, 1.15))
  front.position.set(0, 0.6, 10)
  front.lookAt(0, 0.6, 0)
  const low = new Mesh(new BoxGeometry(14, 3, 0.1), light(0.55, 0.45, 0.32))
  low.position.set(0, -2.6, 10)
  low.lookAt(0, -2.6, 0)
  const floor = new Mesh(new BoxGeometry(30, 0.1, 30), light(0.06, 0.06, 0.055))
  floor.position.y = -6
  s.add(box, cool, warm, front, low, floor)
  return s
}

/* ---- the scene ----------------------------------------------------- */

export function mountHeroScene({ canvas, host, still, onReady, onLost }: SceneOptions) {
  const coarse = matchMedia('(pointer: coarse)').matches
  const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2)

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: dpr < 2, powerPreference: 'default' })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const studio = studioScene()
  const env = pmrem.fromScene(studio, 0.02).texture
  scene.environment = env
  studio.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose()
      ;(o.material as Material).dispose()
    }
  })

  const camera = new PerspectiveCamera(25, 1, 0.1, 100)
  camera.position.set(0, 2.9, 25)
  camera.lookAt(0, -0.85, 0)

  /* palette — filled by applyTheme() */
  const C = {
    gold: new Color(),
    goldLight: new Color(),
    forest: new Color(),
    emerald: new Color(),
    deep: new Color(),
    band: new Color(),
    e300: new Color(),
  }
  // on a dark band (the home CTA) the lacquer would sink into the ground
  // behind it, so it is lifted toward the light emerald tint there
  const onDark = Boolean(host.closest('.tone-inverse'))

  const mat = {
    // deep lacquer: a dark studio reflects as crisp strips, not a grey film
    eFace: new MeshPhysicalMaterial({
      roughness: 0.26,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      envMapIntensity: 0.6,
      emissiveIntensity: 0.14,
    }),
    // every side and bevel of the E is gold, so the mark is drawn in a gold line
    eSide: new MeshStandardMaterial({ roughness: 0.24, metalness: 1, envMapIntensity: 1.6 }),
    zFace: new MeshPhysicalMaterial({
      roughness: 0.2,
      metalness: 1,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.7,
    }),
    zSide: new MeshStandardMaterial({ roughness: 0.3, metalness: 1, envMapIntensity: 1.3 }),
    base: new MeshStandardMaterial({ roughness: 0.85, metalness: 0, envMapIntensity: 0.5 }),
    rim: new MeshStandardMaterial({ roughness: 0.3, metalness: 0.9, envMapIntensity: 1.8 }),
    top: new MeshPhysicalMaterial({ roughness: 0.65, metalness: 0, envMapIntensity: 0.3 }),
    topSide: new MeshStandardMaterial({ roughness: 0.65, envMapIntensity: 0.3 }),
    ring: new MeshStandardMaterial({ roughness: 0.3, metalness: 0.9, envMapIntensity: 1.8 }),
    ring2: new MeshStandardMaterial({ roughness: 0.5, metalness: 0.2, transparent: true, opacity: 0.55 }),
    node: new MeshStandardMaterial({ roughness: 0.25, metalness: 0.9, envMapIntensity: 1.8 }),
    nodeE: new MeshStandardMaterial({ roughness: 0.35, metalness: 0.2 }),
  }

  const geometries: BufferGeometry[] = []
  const keep = <G extends BufferGeometry>(g: G) => (geometries.push(g), g)

  /* lights: a warm key from the reading side, a cool fill, a gold rim behind */
  const hemi = new HemisphereLight(0xffffff, 0xffffff, 0.4)
  const key = new DirectionalLight(0xffffff, 1.8)
  key.position.set(-6, 9, 10)
  const rim = new DirectionalLight(0xffffff, 1.4)
  rim.position.set(7, 4, -8)
  scene.add(hemi, key, rim)

  const root = new Group() // turns a little with the pointer: the whole stage
  scene.add(root)

  /* plinth: sand base, a gold seam, a lacquered forest tier */
  const plinth = new Group()
  const baseMesh = new Mesh(keep(tier(5.8, 0.4, 0.06)), mat.base)
  baseMesh.position.y = -4.1
  const rimMesh = new Mesh(keep(tier(4.65, 0.05, 0.02)), mat.rim)
  rimMesh.position.y = -3.64
  const topMesh = new Mesh(keep(tier(4.4, 0.3, 0.05)), [mat.top, mat.topSide])
  topMesh.position.y = -3.58
  plinth.add(baseMesh, rimMesh, topMesh)
  root.add(plinth)

  /* contact shadows: under the plinth, and the monogram's on the plinth top */
  const shadowGeo = keep(new PlaneGeometry(1, 1))
  shadowGeo.rotateX(-Math.PI / 2)
  const groundShadowMat = new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.9 })
  const markShadowMat = new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.8 })
  const groundShadow = new Mesh(shadowGeo, groundShadowMat)
  groundShadow.scale.set(10, 1, 5.5)
  groundShadow.position.y = -4.17
  const markShadow = new Mesh(shadowGeo, markShadowMat)
  markShadow.scale.set(4.6, 1, 2)
  markShadow.position.y = -3.17
  root.add(groundShadow, markShadow)

  /* the monogram */
  const mark = new Group()
  root.add(mark)
  const pieces = PIECES.map((p) => {
    const isZ = p.letter === 'z'
    const depth = isZ ? Z_DEPTH : E_DEPTH
    const g = keep(
      new ExtrudeGeometry(toShape(p.path), {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.045,
        bevelSegments: 4,
        curveSegments: 28,
      }),
    )
    g.translate(0, 0, -depth / 2)
    // pivot each piece on its own centre so it tumbles about itself in flight
    g.computeBoundingBox()
    const centre = g.boundingBox!.getCenter(new Vector3())
    g.translate(-centre.x, -centre.y, 0)
    const home = new Vector3(centre.x, centre.y, isZ ? Z_FRONT : 0)
    const mesh = new Mesh(g, isZ ? [mat.zFace, mat.zSide] : [mat.eFace, mat.eSide])
    mark.add(mesh)
    const f = FLIGHT[p.id]
    return {
      mesh,
      home,
      from: new Vector3(...f.from),
      turn: f.turn,
      spread: new Vector3(...f.spread),
      delay: 0.15 + f.delay * STAGGER,
    }
  })
  const assembled = 0.15 + FLIGHT.z.delay * STAGGER + ASSEMBLE

  /* orbit: a tilted gold ring with nodes riding it, and a fainter emerald one */
  const orbit = new Group()
  orbit.position.y = -0.35
  orbit.rotation.set(Math.PI / 2 - 0.3, 0, 0.16)
  const ringGeo = keep(new TorusGeometry(4.35, 0.022, 8, 180))
  orbit.add(new Mesh(ringGeo, mat.ring))
  const nodeGeo = keep(new SphereGeometry(1, 20, 14))
  const nodes = [0, 1, 2].map((i) => {
    const n = new Mesh(nodeGeo, i === 0 ? mat.node : mat.nodeE)
    n.scale.setScalar(i === 0 ? 0.13 : 0.09)
    orbit.add(n)
    return n
  })
  const orbit2 = new Mesh(keep(new TorusGeometry(3.75, 0.014, 6, 160)), mat.ring2)
  orbit2.position.y = -0.2
  orbit2.rotation.set(Math.PI / 2 + 0.55, 0.35, 0)
  root.add(orbit, orbit2)

  /* ---- theme ------------------------------------------------------- */

  const resolve = makeResolver(host)
  let shadowTex: CanvasTexture | null = null
  function applyTheme() {
    resolve('var(--color-gold)', C.gold)
    resolve('var(--color-gold-light)', C.goldLight)
    resolve('var(--color-forest)', C.forest)
    resolve('var(--color-emerald)', C.emerald)
    resolve('var(--color-forest-deep)', C.deep)
    resolve('var(--bg-band)', C.band)
    resolve('var(--color-emerald-300)', C.e300)

    const lacquer = onDark ? C.emerald.clone().lerp(C.e300, 0.3) : C.forest.clone().lerp(C.emerald, 0.55)
    // polished gold reads darker than its swatch; lift it toward gold-light
    const polished = C.gold.clone().lerp(C.goldLight, 0.35)
    mat.eFace.color.copy(lacquer)
    mat.eFace.emissive.copy(C.emerald)
    mat.eFace.emissiveIntensity = onDark ? 0.32 : 0.14
    mat.eSide.color.copy(polished)
    mat.zFace.color.copy(polished)
    mat.zSide.color.copy(C.gold).multiplyScalar(0.72)
    mat.base.color.copy(C.band)
    mat.rim.color.copy(polished)
    mat.top.color.copy(lacquer)
    mat.topSide.color.copy(C.forest).lerp(C.deep, 0.3)
    mat.ring.color.copy(polished)
    mat.ring2.color.copy(C.emerald)
    mat.node.color.copy(polished)
    mat.nodeE.color.copy(C.emerald)
    hemi.color.setRGB(1, 1, 1)
    hemi.groundColor.copy(C.band)
    key.color.setRGB(1, 0.97, 0.9)
    rim.color.copy(C.gold).lerp(new Color(1, 1, 1), 0.35)

    shadowTex?.dispose()
    shadowTex = shadowTexture(C.deep)
    groundShadowMat.map = shadowTex
    markShadowMat.map = shadowTex
    groundShadowMat.needsUpdate = markShadowMat.needsUpdate = true
  }
  applyTheme()

  /* ---- input ------------------------------------------------------- */

  const target = { yaw: 0, pitch: 0, hover: 0 }
  const now = { yaw: 0, pitch: 0, hover: 0, scroll: 0, spin: 0, spinVel: 0, spinTo: 0 }
  let scrollTarget = 0

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const r = host.getBoundingClientRect()
    const nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
    const ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)
    target.yaw = MathUtils.clamp(nx, -1, 1) * 0.5
    target.pitch = MathUtils.clamp(ny, -1, 1) * 0.22
  }
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') target.hover = 1
  }
  const onLeave = () => {
    target.hover = 0
  }
  const onTap = () => {
    if (still) return
    now.spinTo += Math.PI * 2
    playPing(620 + Math.random() * 200)
  }
  // turning the sound on replays the assembly, so its sound is heard once
  const onSound = () => {
    if (!still && soundEnabled() && visible && t > assembled) {
      t = 0
      landed.fill(false)
      resolved = false
      playMorph(392)
    }
  }
  const onScroll = () => {
    const r = host.getBoundingClientRect()
    scrollTarget = MathUtils.clamp(-r.top / (r.height * 0.9), 0, 1)
  }

  /* ---- frame ------------------------------------------------------- */

  let t = still ? assembled + 10 : 0
  let last = performance.now()
  let raf = 0
  let visible = true
  let ready = false
  const landed = pieces.map(() => false)
  let resolved = still

  function pose(dt: number) {
    const k = 1 - Math.exp(-dt * 4)
    now.yaw += (target.yaw - now.yaw) * k
    now.pitch += (target.pitch - now.pitch) * k
    now.hover += (target.hover - now.hover) * (1 - Math.exp(-dt * 3))
    now.scroll += (scrollTarget - now.scroll) * (1 - Math.exp(-dt * 6))
    // critically damped spring for the tap spin
    const w = 4.2
    now.spinVel += (w * w * (now.spinTo - now.spin) - 2 * w * now.spinVel) * dt
    now.spin += now.spinVel * dt

    const settle = still ? 0 : smooth(assembled - 0.3, assembled + 1.6, t)
    const intro = still ? 1 : easeOutExpo(MathUtils.clamp(t / (assembled + 0.4), 0, 1))
    const spread = still ? 0 : Math.max(now.hover * 0.35, now.scroll)

    pieces.forEach((p, i) => {
      const k = MathUtils.clamp((t - p.delay) / ASSEMBLE, 0, 1)
      p.mesh.visible = k > 0
      // the click comes as the piece seats, not when it sets off
      if (!landed[i] && k > 0.32) {
        landed[i] = true
        if (!still) playLock(i)
      }
      const ep = easeOutExpo(k)
      const er = easeOutBack(k)
      p.mesh.position
        .copy(p.home)
        .addScaledVector(p.from, 1 - ep)
        .addScaledVector(p.spread, spread)
      p.mesh.rotation.set(p.turn[0] * (1 - er), p.turn[1] * (1 - er), p.turn[2] * (1 - er))
      p.mesh.scale.setScalar(0.3 + 0.7 * ep)
    })
    if (!resolved && t > assembled - 0.9) {
      resolved = true
      playResolve(523)
    }

    // the mark turns in from the side as it assembles, then sways and follows the pointer
    const sway = Math.sin((t - assembled) * 0.42) * 0.24 * settle
    mark.rotation.y = -0.7 * (1 - intro) + sway + now.yaw + now.spin + spread * 0.35
    mark.rotation.x = now.pitch * 0.8 + Math.sin(t * 0.31) * 0.03 * settle
    const bob = Math.sin(t * 0.9) * 0.09 * settle
    mark.position.y = bob

    root.rotation.y = now.yaw * 0.25
    root.rotation.x = now.pitch * 0.15

    markShadow.scale.set(4.6 - bob * 2, 1, 2 - bob)
    markShadowMat.opacity = (0.7 - bob * 1.2) * smooth(0.3, assembled, t)

    orbit.rotation.z = 0.16 + t * 0.035
    orbit2.rotation.z = -t * 0.05
    nodes.forEach((n, i) => {
      const a = t * (0.32 + i * 0.07) + i * 2.1
      n.position.set(Math.cos(a) * 4.35, Math.sin(a) * 4.35, 0)
    })
    orbit.scale.setScalar(0.85 + 0.15 * intro)

  }

  function render() {
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      onReady()
    }
  }

  function frame() {
    // one clock throughout: rAF's timestamp can trail performance.now()
    const ms = performance.now()
    const dt = MathUtils.clamp((ms - last) / 1000, 0, 0.05)
    last = ms
    t += dt
    pose(dt)
    render()
    raf = requestAnimationFrame(frame)
  }

  function start() {
    if (still || raf || !visible || document.hidden) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // keep the whole composition in frame on narrow, tall boxes
    camera.fov = w / h < 1 ? 25 / Math.max(w / h, 0.75) : 25
    camera.updateProjectionMatrix()
    if (still) {
      pose(0)
      render()
    }
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    if (visible) start()
    else stop()
  })
  io.observe(host)
  const onVisibility = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVisibility)

  const themeWatch = new MutationObserver(() => {
    applyTheme()
    if (still) render()
  })
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => {
    applyTheme()
    if (still) render()
  }
  scheme.addEventListener('change', onScheme)

  if (!still) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    host.addEventListener('pointerenter', onEnter)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('click', onTap)
    window.addEventListener(SOUND_EVENT, onSound)
    onScroll()
  }

  let disposed = false
  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    ro.disconnect()
    io.disconnect()
    themeWatch.disconnect()
    scheme.removeEventListener('change', onScheme)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('scroll', onScroll)
    host.removeEventListener('pointerenter', onEnter)
    host.removeEventListener('pointerleave', onLeave)
    host.removeEventListener('click', onTap)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    window.removeEventListener(SOUND_EVENT, onSound)
    geometries.forEach((g) => g.dispose())
    Object.values(mat).forEach((m) => m.dispose())
    groundShadowMat.dispose()
    markShadowMat.dispose()
    shadowTex?.dispose()
    env.dispose()
    pmrem.dispose()
    renderer.dispose()
  }

  function onContextLost(e: Event) {
    e.preventDefault()
    dispose()
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)

  resize()
  if (still) {
    pose(0)
    render()
  } else {
    pose(0)
    render()
    start()
  }

  return dispose
}
