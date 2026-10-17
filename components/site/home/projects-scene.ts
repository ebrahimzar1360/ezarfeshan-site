import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Sphere,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three'
import { playLock } from '@/lib/sound'
import { makeResolver, quality } from '../three/kit'

/**
 * The stage beside "پروژه‌های در حال توسعه", after the RCA site's "از ایده تا
 * محصول": a path of light with one station per project. Each station holds
 * the project's picture (its screenshot, or its 3D render) in a frame, ringed
 * by a halo of particles; a pulse travels the path. The station of the
 * project being read comes forward and turns gold, the others wait behind.
 *
 * Unlit pictures keep their true colours; the frames, halo and path take the
 * theme tokens. Loop stops off-screen; reduced motion holds still.
 */

export type ProjectsOptions = {
  canvas: HTMLCanvasElement
  host: HTMLElement
  pictures: (string | null)[]
  still: boolean
  onReady: () => void
  onLost: () => void
  /** the visitor clicked a station */
  onPick: (i: number) => void
}

const FOV = 30

const haloVert = /* glsl */ `
  attribute float aStation;
  attribute vec2 aRand;
  uniform float uActive;
  uniform float uTime;
  uniform float uSize;
  uniform float uScale;
  uniform vec3 uBase;
  uniform vec3 uHot;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float on = 1.0 - smoothstep(0.0, 0.6, abs(aStation - uActive));
    vec3 p = position;
    p += 0.015 * vec3(sin(uTime * 1.2 + aRand.x * 30.0), cos(uTime + aRand.y * 30.0), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aRand.y * 0.8) * (1.0 + on * 0.5) * uScale / -mv.z;
    vColor = mix(uBase, uHot, on);
    vAlpha = mix(0.45, 0.95, on) * (0.6 + 0.4 * aRand.x);
  }
`
const haloFrag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.3, r) * vAlpha);
    #include <colorspace_fragment>
  }
`

function roundedRect(w: number, h: number, r: number) {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** a rounded picture plane with UVs spanning the whole rectangle */
function picturePlane(w: number, h: number, r: number) {
  const g = new ShapeGeometry(roundedRect(w, h, r), 6)
  const pos = g.attributes.position!
  const uv = g.attributes.uv!
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5)
  return g
}

export function mountProjectsScene({ canvas, host, pictures, still, onReady, onLost, onPick }: ProjectsOptions) {
  const q = quality()
  const coarse = matchMedia('(pointer: coarse)').matches
  const n = Math.max(1, pictures.length)

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: q.antialias, powerPreference: 'default' })
  renderer.setPixelRatio(q.dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60)
  camera.position.set(0, 0.6, 11)
  camera.lookAt(0, 0.1, 0)
  const hemi = new HemisphereLight(0xffffff, 0xffffff, 1.1)
  const key = new DirectionalLight(0xffffff, 1.4)
  key.position.set(-3, 5, 6)
  scene.add(hemi, key)

  const world = new Group()
  scene.add(world)

  /* the path: from the lower right, where reading starts, up to the upper left */
  const path = new CatmullRomCurve3([
    new Vector3(2.35, -1.55, -0.7),
    new Vector3(0.9, -0.55, -0.35),
    new Vector3(-0.7, 0.5, -0.35),
    new Vector3(-2.35, 1.55, -0.7),
  ])
  const pathMat = new MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 })
  const pathGeo = new TubeGeometry(path, 160, 0.022, 8)
  world.add(new Mesh(pathGeo, pathMat))
  const pulseMat = new MeshBasicMaterial()
  const pulseGeo = new SphereGeometry(0.075, 20, 14)
  const pulses = [0, 0.5].map(() => {
    const m = new Mesh(pulseGeo, pulseMat)
    world.add(m)
    return m
  })

  /* stations */
  const loader = new TextureLoader()
  const textures: Texture[] = []
  const frameMat = new MeshStandardMaterial({ roughness: 0.45, metalness: 0 })
  const geometries: BufferGeometry[] = [pathGeo, pulseGeo]
  const at = (i: number) => (n === 1 ? 0.5 : 0.12 + (0.76 * i) / (n - 1))
  const maxW = Math.min(1.85, 5.2 / n)

  const stations = pictures.map((src, i) => {
    const g = new Group()
    const base = path.getPoint(at(i))
    g.position.copy(base)
    world.add(g)
    const rimMat = new MeshBasicMaterial({ transparent: true, opacity: 0 })
    const picMat = new MeshBasicMaterial({ transparent: true, opacity: 0 })
    const s = {
      g,
      base,
      w: maxW,
      h: maxW / 1.6,
      pic: null as Mesh | null,
      frame: null as Mesh | null,
      rim: null as Mesh | null,
      picMat,
      rimMat,
      focus: 0,
    }
    const build = (aspect: number) => {
      let w = maxW
      let h = w / aspect
      if (h > maxW * 0.8) {
        h = maxW * 0.8
        w = h * aspect
      }
      s.w = w
      s.h = h
      for (const m of [s.pic, s.frame, s.rim]) if (m) g.remove(m)
      const pg = picturePlane(w, h, 0.09)
      const fg = new ExtrudeGeometry(roundedRect(w + 0.14, h + 0.14, 0.13), { depth: 0.08, bevelEnabled: false, curveSegments: 6 })
      fg.translate(0, 0, -0.1)
      const rg = new ShapeGeometry(roundedRect(w + 0.24, h + 0.24, 0.17), 6)
      rg.translate(0, 0, -0.12)
      geometries.push(pg, fg, rg)
      s.pic = new Mesh(pg, picMat)
      s.pic.userData.station = i
      s.frame = new Mesh(fg, frameMat)
      s.rim = new Mesh(rg, rimMat)
      g.add(s.rim, s.frame, s.pic)
    }
    build(1.6)
    if (src) {
      loader.load(src, (tex) => {
        tex.colorSpace = SRGBColorSpace
        textures.push(tex)
        picMat.map = tex
        picMat.needsUpdate = true
        const img = tex.image as { width?: number; height?: number }
        if (img.width && img.height) build(img.width / img.height)
        picMat.opacity = 1
        if (still) render()
      })
    } else picMat.opacity = 1
    return s
  })

  /* the halo of particles around each station */
  const per = q.tier === 2 ? 160 : 320
  const haloGeo = new BufferGeometry()
  const hp = new Float32Array(n * per * 3)
  const hs = new Float32Array(n * per)
  const hr = new Float32Array(n * per * 2)
  stations.forEach((s, i) => {
    for (let k = 0; k < per; k++) {
      const j = i * per + k
      // an ellipse slightly larger than the frame, in the station's plane
      const a = Math.random() * Math.PI * 2
      const rr = 1 + (Math.random() - 0.5) * 0.08
      hp[j * 3] = s.base.x + Math.cos(a) * (maxW * 0.72) * rr
      hp[j * 3 + 1] = s.base.y + Math.sin(a) * (maxW * 0.5) * rr
      hp[j * 3 + 2] = s.base.z + 0.5 + (Math.random() - 0.5) * 0.1
      hs[j] = i
      hr[j * 2] = Math.random()
      hr[j * 2 + 1] = Math.random()
    }
  })
  haloGeo.setAttribute('position', new BufferAttribute(hp, 3))
  haloGeo.setAttribute('aStation', new BufferAttribute(hs, 1))
  haloGeo.setAttribute('aRand', new BufferAttribute(hr, 2))
  haloGeo.boundingSphere = new Sphere(new Vector3(), 6)
  geometries.push(haloGeo)
  const haloMat = new ShaderMaterial({
    vertexShader: haloVert,
    fragmentShader: haloFrag,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uActive: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: q.tier === 2 ? 0.05 : 0.04 },
      uScale: { value: 1 },
      uBase: { value: new Color() },
      uHot: { value: new Color() },
    },
  })
  const halo = new Points(haloGeo, haloMat)
  halo.frustumCulled = false
  world.add(halo)

  /* theme */
  const resolve = makeResolver(host)
  function applyTheme() {
    const gold = resolve('var(--color-gold)')
    pathMat.color.copy(resolve('var(--color-emerald)'))
    pulseMat.color.copy(gold)
    frameMat.color.copy(resolve('var(--bg-raised)'))
    for (const s of stations) s.rimMat.color.copy(gold)
    ;(haloMat.uniforms.uBase!.value as Color).copy(resolve('var(--color-emerald)'))
    ;(haloMat.uniforms.uHot!.value as Color).copy(gold)
    hemi.groundColor.copy(resolve('var(--bg-band)'))
  }
  applyTheme()

  /* state */
  let active = 0
  let activeSmooth = 0
  const pointer = { x: 0, y: 0, at: 0 }
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const r = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    pointer.at = performance.now()
  }
  const ray = new Raycaster()
  const ndc = new Vector2()
  const onClick = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(stations.flatMap((s) => (s.pic ? [s.pic] : [])))[0]
    if (hit) onPick(hit.object.userData.station as number)
  }

  /* frame */
  let time = 0
  let last = performance.now()
  let raf = 0
  let visible = false
  let ready = false

  function pose(dt: number) {
    time += dt
    activeSmooth += (active - activeSmooth) * (still ? 1 : 1 - Math.exp(-dt * 5))
    haloMat.uniforms.uActive!.value = activeSmooth
    haloMat.uniforms.uTime!.value = still ? 0 : time

    stations.forEach((s, i) => {
      const target = i === active ? 1 : 0
      s.focus += (target - s.focus) * (still ? 1 : 1 - Math.exp(-dt * 5))
      const f = s.focus
      // stations float in front of the path, the chosen one further
      s.g.position.set(s.base.x, s.base.y + (still ? 0 : Math.sin(time * 0.8 + i) * 0.04), s.base.z + 0.75 + f * 0.8)
      s.g.scale.setScalar(0.86 + f * 0.24)
      s.g.rotation.y = (1 - f) * 0.28
      s.rimMat.opacity = f
      if (s.picMat.map) s.picMat.opacity = 0.72 + f * 0.28
    })
    pulses.forEach((p, k) => p.position.copy(path.getPoint((time * 0.09 + k * 0.5) % 1)))

    const live = !still && !coarse && performance.now() - pointer.at < 1500
    const k = 1 - Math.exp(-dt * 3)
    world.rotation.y += ((live ? pointer.x * 0.18 : Math.sin(time * 0.2) * 0.06) - world.rotation.y) * k
    world.rotation.x += ((live ? -pointer.y * 0.08 : 0) - world.rotation.x) * k
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
    camera.updateProjectionMatrix()
    // the path is wider than tall: scale it into narrow boxes
    world.scale.setScalar(Math.min(0.85, (w / h) * 0.9))
    haloMat.uniforms.uScale!.value = (h * q.dpr * 0.5) / Math.tan(MathUtils.degToRad(FOV / 2))
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
  window.addEventListener('pointermove', onPointer, { passive: true })
  canvas.addEventListener('click', onClick)

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
    canvas.removeEventListener('click', onClick)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    geometries.forEach((g) => g.dispose())
    textures.forEach((t) => t.dispose())
    ;[pathMat, pulseMat, frameMat, haloMat, ...stations.flatMap((s) => [s.picMat, s.rimMat])].forEach((m) => m.dispose())
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
    setActive(i: number, byUser = false) {
      if (i === active) return
      active = i
      if (byUser && !still) playLock(i)
      if (still) {
        pose(0)
        render()
      }
    },
    dispose,
  }
}
