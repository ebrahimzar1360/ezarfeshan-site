import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Sphere,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type CanvasTexture,
} from 'three'
import { playMorph } from '@/lib/sound'
import { makeResolver, quality, shadowTexture } from '../three/kit'
import { buildForm, type Form } from './pillar-forms'

/**
 * The stage beside "از شفافیت تا هوشمندی": one cloud of particles that takes
 * the shape of whichever pillar card is in view and flows into the next as
 * the visitor scrolls — the RCA site's R/C/A beats, redrawn for this brand on
 * its own light paper.
 *
 * One draw call of points plus two flat rings and a shadow, so it costs very
 * little; weak devices get fewer particles and a lower pixel ratio. The loop
 * stops off-screen and in background tabs. Reduced motion swaps shapes
 * without the flight and holds them still.
 */

export type PillarsOptions = {
  canvas: HTMLCanvasElement
  host: HTMLElement
  kinds: string[]
  still: boolean
  onReady: () => void
  onLost: () => void
}

const FOV = 27
const MORPH = 1.5 // seconds
const PITCH = [392, 494, 587, 659, 740, 880]

const vert = /* glsl */ `
  attribute vec3 aTo;
  attribute vec2 aTone;
  attribute vec2 aPulse;
  attribute vec4 aRand;
  uniform float uT;
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;
  uniform float uMotion;
  uniform vec3 uPal[4];
  uniform vec3 uMouse;
  uniform float uMouseOn;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 pal(float i) {
    return i < 0.5 ? uPal[0] : i < 1.5 ? uPal[1] : i < 2.5 ? uPal[2] : uPal[3];
  }
  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }

  void main() {
    float d = aRand.x * 0.35;
    float t = smoothstep(d, d + 0.65, uT);
    float mid = sin(t * 3.14159265);
    vec3 p = mix(position, aTo, t);
    // a soft vortex while travelling
    p = rotY(p, mid * (aRand.y - 0.5) * 2.4);
    p *= 1.0 + mid * 0.22 * aRand.w;
    p.y += mid * (aRand.z - 0.5) * 0.5;
    p += uMotion * 0.01 * vec3(sin(uTime * 1.3 + aRand.y * 40.0), cos(uTime * 1.1 + aRand.z * 40.0), sin(uTime * 0.9 + aRand.w * 40.0));

    // particles part around the pointer and drift back
    vec2 dm = p.xy - uMouse.xy;
    float md = length(dm);
    float push = smoothstep(0.7, 0.0, md) * uMouseOn * (0.6 + 0.4 * aRand.y);
    p.xy += dm / max(md, 0.001) * push * 0.35;
    p.z += push * 0.3;

    // a light running along the figure's path
    float along = t < 0.5 ? aPulse.x : aPulse.y;
    float ph = fract(uTime * 0.2);
    float gap = abs(along - ph);
    gap = min(gap, 1.0 - gap);
    float glow = smoothstep(0.07, 0.0, gap) * uMotion * (1.0 - mid);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand.z * 0.8) * (1.0 + glow * 0.9 + push * 0.5) * uScale / -mv.z;

    vec3 col = mix(pal(aTone.x), pal(aTone.y), t);
    vColor = mix(col, uPal[2], glow * 0.85);
    vAlpha = 0.62 + 0.38 * aRand.w;
  }
`

const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.3, r) * vAlpha);
    // the palette is linear; convert for the sRGB canvas like every built-in material
    #include <colorspace_fragment>
  }
`

export function mountPillarsScene({ canvas, host, kinds, still, onReady, onLost }: PillarsOptions) {
  const q = quality()
  const coarse = matchMedia('(pointer: coarse)').matches
  const N = Math.round(12000 * q.density)

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: q.antialias, powerPreference: 'default' })
  renderer.setPixelRatio(q.dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60)
  camera.position.set(0, 3.1, 9.4)
  camera.lookAt(0, -0.25, 0)

  /* forms, built once for the distinct kinds in use */
  const forms = new Map<string, Form>()
  for (const k of new Set(kinds)) forms.set(k, buildForm(k, N))
  const formOf = (i: number) => forms.get(kinds[Math.max(0, Math.min(i, kinds.length - 1))] ?? 'processes')!

  /* particles */
  const geo = new BufferGeometry()
  const attr = (name: string, size: number) => {
    const a = new BufferAttribute(new Float32Array(N * size), size)
    geo.setAttribute(name, a)
    return a
  }
  const aPos = attr('position', 3)
  const aTo = attr('aTo', 3)
  const aTone = attr('aTone', 2)
  const aPulse = attr('aPulse', 2)
  const rnd = new Float32Array(N * 4)
  for (let i = 0; i < rnd.length; i++) rnd[i] = Math.random()
  geo.setAttribute('aRand', new BufferAttribute(rnd, 4))
  geo.boundingSphere = new Sphere(new Vector3(), 4)

  const pal: [Color, Color, Color, Color] = [new Color(), new Color(), new Color(), new Color()]
  const mat = new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uT: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: q.tier === 2 ? 0.036 : 0.027 },
      uScale: { value: 1 },
      uMotion: { value: still ? 0 : 1 },
      uPal: { value: pal },
      uMouse: { value: new Vector3(99, 99, 0) },
      uMouseOn: { value: 0 },
    },
  })
  const figure = new Group()
  const points = new Points(geo, mat)
  points.frustumCulled = false
  figure.add(points)
  // figure and plinth scale together to fit the box's width
  const world = new Group()
  world.add(figure)
  scene.add(world)

  /* the plinth under the figure: two flat rings and a soft shadow */
  const floor = new Group()
  floor.position.y = -2.15
  const ringA = new Mesh(new TorusGeometry(1.95, 0.012, 4, 160), new MeshBasicMaterial({ transparent: true, opacity: 0.85 }))
  const ringB = new Mesh(new TorusGeometry(1.45, 0.008, 4, 6), new MeshBasicMaterial({ transparent: true, opacity: 0.7 }))
  ringA.rotation.x = ringB.rotation.x = Math.PI / 2
  const shadowGeo = new PlaneGeometry(5.2, 5.2)
  shadowGeo.rotateX(-Math.PI / 2)
  const shadowMat = new MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.4 })
  const shadow = new Mesh(shadowGeo, shadowMat)
  shadow.position.y = -0.02
  floor.add(shadow, ringA, ringB)
  world.add(floor)

  /* theme */
  const resolve = makeResolver(host)
  let shadowTex: CanvasTexture | null = null
  function applyTheme() {
    resolve('var(--color-forest)', pal[0])
    resolve('var(--color-emerald)', pal[1])
    resolve('var(--color-gold)', pal[2])
    resolve('var(--color-forest-deep)', pal[3])
    // on a dark theme forest-deep vanishes into the ground; lift it to the text tone
    const bg = resolve('var(--bg)')
    if (bg.r + bg.g + bg.b < 0.3) {
      resolve('var(--text-muted)', pal[3])
      resolve('var(--link)', pal[0])
    }
    ;(ringA.material as MeshBasicMaterial).color.copy(pal[2])
    ;(ringB.material as MeshBasicMaterial).color.copy(pal[1])
    shadowTex?.dispose()
    shadowTex = shadowTexture(resolve('var(--color-forest-deep)'), 0.35)
    shadowMat.map = shadowTex
    shadowMat.needsUpdate = true
  }
  applyTheme()

  /* morph state */
  let cur = 0
  let next = 0
  let wanted = 0
  let morphT = 1 // 1 = settled
  function load(a: Form, b: Form) {
    ;(aPos.array as Float32Array).set(a.pos)
    ;(aTo.array as Float32Array).set(b.pos)
    const tone = aTone.array as Float32Array
    const pulse = aPulse.array as Float32Array
    for (let i = 0; i < N; i++) {
      tone[i * 2] = a.tone[i]!
      tone[i * 2 + 1] = b.tone[i]!
      pulse[i * 2] = a.pulse[i]!
      pulse[i * 2 + 1] = b.pulse[i]!
    }
    aPos.needsUpdate = aTo.needsUpdate = aTone.needsUpdate = aPulse.needsUpdate = true
  }
  load(formOf(0), formOf(0))

  function begin() {
    if (wanted === cur) return
    next = wanted
    load(formOf(cur), formOf(next))
    if (formOf(cur) === formOf(next)) {
      cur = next
      return
    }
    morphT = still ? 1 : 0
    if (still) {
      load(formOf(next), formOf(next))
      cur = next
      render()
    } else playMorph(PITCH[next % PITCH.length])
  }

  /* input */
  const pointer = { x: 0, y: 0, live: 0, at: 0 }
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const r = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    pointer.at = performance.now()
  }

  /* frame */
  let time = 0
  let last = performance.now()
  let raf = 0
  let visible = false
  let ready = false
  const yaw = { now: 0 }
  const hit = new Vector3()

  function pose(dt: number) {
    time += dt
    if (morphT < 1) {
      morphT = Math.min(1, morphT + dt / MORPH)
      if (morphT >= 1) {
        cur = next
        load(formOf(cur), formOf(cur))
        mat.uniforms.uT!.value = 0
        if (wanted !== cur) begin()
      }
    }
    mat.uniforms.uT!.value = morphT < 1 ? morphT : 0
    mat.uniforms.uTime!.value = time

    const live = !still && !coarse && performance.now() - pointer.at < 1500
    const k = 1 - Math.exp(-dt * 3)
    yaw.now += ((live ? pointer.x * 0.45 : 0) + (still ? 0 : Math.sin(time * 0.25) * 0.35) - yaw.now) * k
    figure.rotation.y = yaw.now
    figure.rotation.x = live ? -pointer.y * 0.12 : 0
    floor.rotation.y = still ? 0 : time * 0.12

    // pointer onto the figure's own plane, for the parting effect
    if (live) {
      hit.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize()
      const s = -camera.position.z / hit.z
      hit.multiplyScalar(s).add(camera.position)
      figure.worldToLocal(hit)
      ;(mat.uniforms.uMouse!.value as Vector3).lerp(hit, 1 - Math.exp(-dt * 16))
    }
    mat.uniforms.uMouseOn!.value += ((live ? 1 : 0) - mat.uniforms.uMouseOn!.value) * (1 - Math.exp(-dt * 6))
  }

  function render() {
    renderer.render(scene, camera)
    if (!ready) {
      ready = true
      onReady()
    }
  }

  function frame() {
    const ms = performance.now()
    const dt = MathUtils.clamp((ms - last) / 1000, 0, 0.05)
    last = ms
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
    camera.fov = FOV
    camera.updateProjectionMatrix()
    // the phone stage is a short, wide band: scale to its height so nothing clips
    world.scale.setScalar(w > h ? Math.min(1, Math.max(0.6, (h / w) * 0.85)) : 1)
    mat.uniforms.uScale!.value = (h * q.dpr * 0.5) / Math.tan(MathUtils.degToRad(camera.fov / 2))
    if (still || !raf) {
      pose(0)
      render()
    }
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    if (visible) start()
    else stop()
  })
  io.observe(canvas)
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
  if (!still) window.addEventListener('pointermove', onPointer, { passive: true })

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
    window.removeEventListener('pointermove', onPointer)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    geo.dispose()
    mat.dispose()
    ringA.geometry.dispose()
    ringB.geometry.dispose()
    ;(ringA.material as MeshBasicMaterial).dispose()
    ;(ringB.material as MeshBasicMaterial).dispose()
    shadowGeo.dispose()
    shadowMat.dispose()
    shadowTex?.dispose()
    renderer.dispose()
  }
  function onContextLost(e: Event) {
    e.preventDefault()
    dispose()
    onLost()
  }
  canvas.addEventListener('webglcontextlost', onContextLost)

  resize()
  pose(0)
  render()

  return {
    /** the card now in view; the figure flows to its shape */
    setActive(i: number) {
      wanted = i
      if (morphT >= 1) begin()
    },
    dispose,
  }
}
