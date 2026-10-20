/**
 * Offline 3D illustrations for the site: the project placeholders (the three
 * projects without a screenshot) and the article covers, one pair per topic.
 *
 * Rendered once by tools/render/render.mjs in a headless browser and saved as
 * WebP under public/renders/. Deterministic: no randomness without a seed.
 * The palette is the brand's (app/globals.css); hex literals are fine here,
 * this file never ships to the browser.
 */
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const P = {
  paper: '#f8f4ec',
  sand: '#efe7d7',
  forest: '#0f4d3f',
  emerald: '#1c6b58',
  gold: '#d4af6b',
  goldLight: '#e9d3a0',
  deep: '#0a3229',
}

function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const M = {
  gold: () => new THREE.MeshPhysicalMaterial({ color: '#d6b75c', metalness: 1, roughness: 0.26, clearcoat: 0.4 }),
  forest: () => new THREE.MeshPhysicalMaterial({ color: P.forest, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  emerald: () => new THREE.MeshPhysicalMaterial({ color: P.emerald, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  white: () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.42, clearcoat: 0.35 }),
  sand: () => new THREE.MeshPhysicalMaterial({ color: P.sand, roughness: 0.6 }),
  deep: () => new THREE.MeshPhysicalMaterial({ color: P.deep, roughness: 0.35, clearcoat: 0.6 }),
  glass: (tint = '#dfeee6') =>
    new THREE.MeshPhysicalMaterial({ color: tint, metalness: 0, roughness: 0.04, transmission: 0.94, thickness: 1.2, ior: 1.45 }),
}

function backdrop(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
  grd.addColorStop(0, '#fbfaf5')
  grd.addColorStop(0.6, P.paper)
  grd.addColorStop(1, P.sand)
  g.fillStyle = grd
  g.fillRect(0, 0, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function stage(w, h, { cam = [0, 5, 9], look = [0, 1, 0], fov = 30, light = [-5, 9, 6] } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.0
  const scene = new THREE.Scene()
  scene.background = backdrop(w, h)
  const pm = new THREE.PMREMGenerator(renderer)
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.75
  const key = new THREE.DirectionalLight('#fff6e6', 2.4)
  key.position.set(...light)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 6
  key.shadow.bias = -0.0004
  const sc = key.shadow.camera
  sc.left = sc.bottom = -9
  sc.right = sc.top = 9
  sc.near = 1
  sc.far = 40
  scene.add(key, new THREE.HemisphereLight('#ffffff', P.sand, 0.35))
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.16 }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100)
  camera.position.set(...cam)
  camera.lookAt(...look)
  const add = (geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], parent = scene) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(...pos)
    m.rotation.set(...rot)
    m.castShadow = true
    m.receiveShadow = true
    parent.add(m)
    return m
  }
  return { renderer, scene, camera, add }
}

const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2))

/* ---------------------------------------------------------------- projects */

function performance(s) {
  const { add } = s
  const board = new THREE.Group()
  board.rotation.y = -0.12
  s.scene.add(board)
  add(rbox(6.4, 0.22, 3.9, 0.16), M.white(), [0, 0.11, 0], [0, 0, 0], board)
  add(rbox(1.1, 0.06, 3.5, 0.06), M.forest(), [-2.45, 0.25, 0], [0, 0, 0], board)
  ;[-1.2, -0.7, -0.2, 0.3].forEach((z, i) =>
    add(rbox(0.7, 0.03, 0.14, 0.05), i === 0 ? M.gold() : M.sand(), [-2.45, 0.3, z], [0, 0, 0], board),
  )
  // KPI tiles
  ;[0, 1, 2].forEach((i) => {
    add(rbox(1.25, 0.12, 0.8, 0.08), M.white(), [-1.15 + i * 1.45, 0.28, -1.25], [0, 0, 0], board)
    add(rbox(0.8, 0.05, 0.16, 0.05), i === 2 ? M.gold() : M.emerald(), [-1.15 + i * 1.45, 0.37, -1.15], [0, 0, 0], board)
  })
  // the bar chart rising out of the board
  const hs = [0.5, 0.85, 0.7, 1.2, 1.0, 1.75]
  hs.forEach((h, i) => add(rbox(0.32, h, 0.32, 0.06), i === 5 ? M.gold() : M.emerald(), [-1.5 + i * 0.48, 0.22 + h / 2, 0.55], [0, 0, 0], board))
  // the gauge, standing
  const g = new THREE.Group()
  g.position.set(2.15, 0.95, 0.35)
  g.rotation.y = -0.35
  board.add(g)
  add(new THREE.TorusGeometry(0.6, 0.13, 24, 96), M.sand(), [0, 0, 0], [0, 0, 0], g)
  add(new THREE.TorusGeometry(0.6, 0.15, 24, 96, Math.PI * 1.45), M.emerald(), [0, 0, 0.01], [0, 0, Math.PI / 2 - Math.PI * 1.45], g)
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 24), M.white(), [0, -0.85, 0], [0, 0, 0], g)
  // the evaluation star
  const star = new THREE.Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.22 : 0.52
    const a = Math.PI / 2 + (i * Math.PI) / 5
    if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else star.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const sg = new THREE.ExtrudeGeometry(star, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.05, bevelSegments: 3 })
  sg.center()
  add(sg, M.gold(), [2.5, 2.55, -1.0], [0.15, -0.5, 0.12])
}

function tama(s) {
  const { add } = s
  // the calendar
  const cal = new THREE.Group()
  cal.position.set(-1.35, 0, 0)
  cal.rotation.y = 0.38
  s.scene.add(cal)
  add(rbox(3.1, 3.3, 0.45, 0.18), M.white(), [0, 1.65, 0], [0, 0, 0], cal)
  add(rbox(3.1, 0.75, 0.5, 0.18), M.forest(), [0, 3.0, 0.02], [0, 0, 0], cal)
  ;[-0.8, 0.8].forEach((x) => add(new THREE.TorusGeometry(0.17, 0.05, 16, 40), M.gold(), [x, 3.45, 0], [0, Math.PI / 2, 0], cal))
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const k = r * 4 + c
      const mat = k === 6 ? M.gold() : [2, 9, 13].includes(k) ? M.emerald() : M.sand()
      add(rbox(0.55, 0.48, 0.12, 0.08), mat, [-1.0 + c * 0.66, 2.2 - r * 0.6, 0.25], [0, 0, 0], cal)
    }
  // the car
  const car = new THREE.Group()
  car.position.set(1.85, 0, 0.9)
  car.rotation.y = -0.55
  s.scene.add(car)
  add(rbox(2.6, 0.62, 1.2, 0.26), M.forest(), [0, 0.6, 0], [0, 0, 0], car)
  add(rbox(1.4, 0.55, 1.05, 0.24), M.glass('#cfe3d8'), [-0.1, 1.12, 0], [0, 0, 0], car)
  ;[
    [-0.85, 0.62],
    [0.85, 0.62],
    [-0.85, -0.62],
    [0.85, -0.62],
  ].forEach(([x, z]) => {
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 32), M.deep(), [x, 0.3, z], [Math.PI / 2, 0, 0], car)
    add(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 24), M.gold(), [x, 0.3, z], [Math.PI / 2, 0, 0], car)
  })
  add(rbox(0.12, 0.12, 0.3, 0.05), M.gold(), [1.3, 0.68, 0.35], [0, 0, 0], car)
  add(rbox(0.12, 0.12, 0.3, 0.05), M.gold(), [1.3, 0.68, -0.35], [0, 0, 0], car)
  // the clock
  const clock = new THREE.Group()
  clock.position.set(2.5, 2.7, -1.2)
  clock.rotation.set(0.05, -0.4, 0)
  s.scene.add(clock)
  add(new THREE.CylinderGeometry(0.7, 0.7, 0.16, 48), M.white(), [0, 0, 0], [Math.PI / 2, 0, 0], clock)
  add(new THREE.TorusGeometry(0.7, 0.06, 16, 64), M.gold(), [0, 0, 0], [0, 0, 0], clock)
  add(rbox(0.07, 0.42, 0.05, 0.02), M.forest(), [0, 0.18, 0.1], [0, 0, 0], clock)
  add(rbox(0.07, 0.32, 0.05, 0.02), M.emerald(), [0.12, -0.08, 0.1], [0, 0, -2.2], clock)
}

function intelligence(s) {
  const { add } = s
  const r = rng(4)
  // scattered reports drifting in from the left
  for (let i = 0; i < 7; i++) {
    const sheet = new THREE.Group()
    const t = i / 6
    sheet.position.set(-3.4 + t * 2.0 + (r() - 0.5) * 0.4, 0.5 + r() * 2.6, -1.4 + r() * 2.4)
    sheet.rotation.set((r() - 0.5) * 0.9, (r() - 0.5) * 1.2, (r() - 0.5) * 0.9)
    s.scene.add(sheet)
    add(rbox(0.95, 1.25, 0.03, 0.03), M.white(), [0, 0, 0], [0, 0, 0], sheet)
    ;[0.35, 0.18, 0.01, -0.16].forEach((y, k) =>
      add(rbox(k === 0 ? 0.5 : 0.7 - k * 0.08, 0.06, 0.02, 0.01), k === 0 ? M.emerald() : M.sand(), [-0.05, y, 0.025], [0, 0, 0], sheet),
    )
  }
  // the crystal where they become insight
  add(new THREE.IcosahedronGeometry(1.05, 0), M.glass('#e3f0e8'), [0.55, 1.75, 0], [0.3, 0.5, 0])
  const core = add(new THREE.SphereGeometry(0.34, 48, 32), M.gold(), [0.55, 1.75, 0])
  core.material.emissive = new THREE.Color('#5a4512')
  add(new THREE.CylinderGeometry(0.75, 0.95, 0.25, 6), M.forest(), [0.55, 0.125, 0], [0, 0.3, 0])
  // what comes out: a clean rising chart
  ;[0.6, 1.05, 1.6].forEach((h, i) => add(rbox(0.36, h, 0.36, 0.06), i === 2 ? M.gold() : M.emerald(), [2.3 + i * 0.55, h / 2, 0.2], [0, -0.3, 0]))
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.4, 1.9, 0.1),
    new THREE.Vector3(2.2, 2.3, 0.3),
    new THREE.Vector3(3.0, 2.5, 0.25),
    new THREE.Vector3(3.7, 2.95, 0.2),
  ])
  add(new THREE.TubeGeometry(curve, 64, 0.045, 12), M.gold())
  add(new THREE.ConeGeometry(0.13, 0.3, 24), M.gold(), [3.78, 3.05, 0.2], [0, 0, -0.9])
}

/* ------------------------------------------------------------------ covers */

function lathe(points, segments = 64) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments)
}

function king() {
  return lathe([
    [0, 0],
    [0.55, 0],
    [0.55, 0.12],
    [0.42, 0.22],
    [0.3, 0.3],
    [0.22, 0.9],
    [0.18, 1.35],
    [0.34, 1.45],
    [0.3, 1.55],
    [0.2, 1.6],
    [0.28, 1.9],
    [0.18, 2.05],
    [0, 2.08],
  ])
}

function pawn() {
  return lathe([
    [0, 0],
    [0.4, 0],
    [0.4, 0.1],
    [0.28, 0.2],
    [0.16, 0.6],
    [0.26, 0.68],
    [0.12, 0.74],
    [0.22, 0.86],
    [0.24, 1.0],
    [0.16, 1.14],
    [0, 1.18],
  ])
}

function management0(s) {
  const { add } = s
  const board = new THREE.Group()
  board.rotation.y = 0.5
  s.scene.add(board)
  for (let x = 0; x < 5; x++)
    for (let z = 0; z < 5; z++)
      add(rbox(0.98, 0.18, 0.98, 0.05), (x + z) % 2 ? M.forest() : M.sand(), [(x - 2) * 1.0, 0.09, (z - 2) * 1.0], [0, 0, 0], board)
  add(king(), M.gold(), [0, 0.18, 0], [0, 0, 0], board)
  add(rbox(0.1, 0.42, 0.1, 0.03), M.gold(), [0, 2.4, 0], [0, 0, 0], board)
  add(rbox(0.32, 0.1, 0.1, 0.03), M.gold(), [0, 2.45, 0], [0, 0, 0], board)
  ;[
    [-1, 1],
    [1, 1],
    [-1, -1],
    [2, 0],
  ].forEach(([x, z], i) => add(pawn(), i % 2 ? M.emerald() : M.forest(), [x, 0.18, z], [0, 0, 0], board))
}

function arrowShape() {
  const a = new THREE.Shape()
  a.moveTo(-0.18, -0.9)
  a.lineTo(0.18, -0.9)
  a.lineTo(0.18, 0.2)
  a.lineTo(0.45, 0.2)
  a.lineTo(0, 0.85)
  a.lineTo(-0.45, 0.2)
  a.lineTo(-0.18, 0.2)
  a.closePath()
  const g = new THREE.ExtrudeGeometry(a, { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.05, bevelSegments: 3 })
  g.center()
  return g
}

function management1(s) {
  const { add } = s
  const steps = new THREE.Group()
  steps.rotation.y = -0.55
  s.scene.add(steps)
  for (let i = 0; i < 5; i++) {
    const h = 0.4 + i * 0.45
    add(rbox(0.95, h, 1.6, 0.08), i % 2 ? M.emerald() : M.forest(), [(i - 2) * 1.0, h / 2, 0], [0, 0, 0], steps)
  }
  add(arrowShape(), M.gold(), [2.3, 3.4, 0], [0, 0, -0.55], steps)
  add(new THREE.SphereGeometry(0.22, 32, 24), M.gold(), [-2, 0.62, 0], [0, 0, 0], steps)
}

function gearGeo(teeth, rOut, rIn, depth) {
  const sh = new THREE.Shape()
  const n = teeth * 4
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = i % 4 < 2 ? rOut : rIn
    if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const hole = new THREE.Path()
  hole.absarc(0, 0, rIn * 0.35, 0, Math.PI * 2, true)
  sh.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 24 })
  g.center()
  return g
}

function system0(s) {
  const { add } = s
  add(gearGeo(14, 1.55, 1.3, 0.35), M.gold(), [-0.6, 1.62, 0], [0, 0.25, 0.05])
  add(gearGeo(10, 1.1, 0.88, 0.35), M.forest(), [1.62, 1.12, 0.2], [0, 0.25, 0.2])
  add(gearGeo(8, 0.8, 0.62, 0.35), M.emerald(), [1.1, 2.75, -0.3], [0, 0.25, 0.4])
  add(rbox(5.2, 0.12, 1.2, 0.05), M.sand(), [0.3, 0.06, 0], [0, 0.25, 0])
}

function system1(s) {
  const { add } = s
  const grid = new THREE.Group()
  grid.rotation.y = 0.65
  s.scene.add(grid)
  for (let x = 0; x < 3; x++)
    for (let z = 0; z < 3; z++) {
      if (x === 2 && z === 0) continue
      const tall = (x + z) % 2 === 0
      add(rbox(1.05, tall ? 1.0 : 0.7, 1.05, 0.14), tall ? M.forest() : M.emerald(), [(x - 1) * 1.15, tall ? 0.5 : 0.35, (z - 1) * 1.15], [0, 0, 0], grid)
    }
  add(rbox(1.05, 1.0, 1.05, 0.14), M.gold(), [1.15, 2.3, -1.15], [0.12, 0.3, 0.08], grid)
  add(new THREE.TorusGeometry(0.62, 0.025, 12, 64), M.gold(), [1.15, 0.03, -1.15], [Math.PI / 2, 0, 0], grid)
}

function ai0(s) {
  const { add } = s
  const r = rng(9)
  const c = new THREE.Vector3(0, 1.9, 0)
  add(new THREE.SphereGeometry(1.6, 64, 48), M.glass('#e8f3ec'), c.toArray())
  const nodes = [c.clone()]
  while (nodes.length < 12) {
    const p = new THREE.Vector3((r() - 0.5) * 2.2, (r() - 0.5) * 2.2, (r() - 0.5) * 2.2)
    if (p.length() < 0.5 || p.length() > 1.15) continue
    nodes.push(p.add(c))
  }
  nodes.forEach((p, i) => add(new THREE.SphereGeometry(i === 0 ? 0.26 : 0.1, 32, 24), i === 0 || i % 4 === 0 ? M.gold() : M.forest(), p.toArray()))
  nodes.forEach((p, i) => {
    if (i === 0) return
    const q = i % 3 === 0 ? nodes[0] : nodes[(i * 5) % nodes.length]
    if (q === p) return
    const len = p.distanceTo(q)
    const m = add(new THREE.CylinderGeometry(0.02, 0.02, len, 8), M.emerald(), p.clone().add(q).multiplyScalar(0.5).toArray())
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.clone().sub(p).normalize())
  })
  add(new THREE.CylinderGeometry(1.0, 1.25, 0.28, 64), M.forest(), [0, 0.14, 0])
  add(new THREE.TorusGeometry(1.08, 0.04, 16, 96), M.gold(), [0, 0.29, 0], [Math.PI / 2, 0, 0])
}

function ai1(s) {
  const { add } = s
  const chip = new THREE.Group()
  chip.rotation.y = 0.6
  s.scene.add(chip)
  add(rbox(2.4, 0.32, 2.4, 0.16), M.deep(), [0, 0.16, 0], [0, 0, 0], chip)
  add(rbox(1.1, 0.12, 1.1, 0.08), M.gold(), [0, 0.38, 0], [0, 0, 0], chip)
  for (let i = 0; i < 6; i++) {
    const o = -1.0 + i * 0.4
    ;[
      [o, 1.35, 0],
      [o, -1.35, 0],
      [1.35, o, 1],
      [-1.35, o, 1],
    ].forEach(([a, b, rot]) => add(rbox(0.14, 0.08, 0.5, 0.03), M.gold(), [a, 0.12, b], [0, rot ? Math.PI / 2 : 0, 0], chip))
  }
  // traces running out across the ground
  const r = rng(3)
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const len = 1.2 + r() * 1.6
    const d = 1.7 + len / 2
    add(rbox(len, 0.03, 0.07, 0.02), i % 3 ? M.emerald() : M.gold(), [Math.cos(a) * d, 0.02, Math.sin(a) * d], [0, -a, 0], chip)
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20), M.gold(), [Math.cos(a) * (d + len / 2), 0.03, Math.sin(a) * (d + len / 2)], [0, 0, 0], chip)
  }
}

function business0(s) {
  const { add } = s
  const g = new THREE.Group()
  g.rotation.y = -0.4
  s.scene.add(g)
  ;[0.8, 1.3, 1.9, 2.7].forEach((h, i) => add(rbox(0.75, h, 0.75, 0.1), i === 3 ? M.gold() : i % 2 ? M.emerald() : M.forest(), [-1.4 + i * 0.95, h / 2, 0], [0, 0, 0], g))
  for (let i = 0; i < 7; i++) add(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 48), M.gold(), [2.3, 0.06 + i * 0.12, 0.9], [0, 0, (i % 2) * 0.02], g)
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.42, 0.42, 0.11, 48), M.gold(), [3.0, 0.06 + i * 0.12, 0.2], [0, 0, 0], g)
}

function business1(s) {
  const { add } = s
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 0.4, 0.5),
    new THREE.Vector3(-1.6, 0.9, 0.2),
    new THREE.Vector3(-0.4, 0.8, 0),
    new THREE.Vector3(0.8, 1.8, -0.2),
    new THREE.Vector3(2.0, 2.4, -0.3),
    new THREE.Vector3(3.0, 3.4, -0.4),
  ])
  add(new THREE.TubeGeometry(curve, 160, 0.11, 20), M.emerald())
  add(new THREE.ConeGeometry(0.28, 0.6, 32), M.gold(), [3.15, 3.65, -0.42], [0, 0, -0.75])
  ;[-3, -1.6, -0.4, 0.8, 2.0].forEach((x, i) => {
    const p = curve.getPoint(i / 5)
    add(rbox(0.5, p.y, 0.5, 0.06), i % 2 ? M.sand() : M.white(), [p.x, p.y / 2, p.z], [0, 0.3, 0])
  })
  add(new THREE.SphereGeometry(0.3, 40, 30), M.gold(), [0.8, 2.15, -0.2])
}

function figure(add, parent, mat, pos, scale = 1) {
  const g = new THREE.Group()
  g.position.set(...pos)
  g.scale.setScalar(scale)
  parent.add(g)
  add(new THREE.CapsuleGeometry(0.32, 0.6, 8, 24), mat, [0, 0.62, 0], [0, 0, 0], g)
  add(new THREE.SphereGeometry(0.26, 32, 24), mat, [0, 1.42, 0], [0, 0, 0], g)
  return g
}

function team0(s) {
  const { add } = s
  const root = new THREE.Group()
  s.scene.add(root)
  add(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 64), M.white(), [0, 0.25, 0], [0, 0, 0], root)
  add(new THREE.CylinderGeometry(0.5, 0.5, 0.55, 48), M.gold(), [0, 0.3, 0], [0, 0, 0], root)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    figure(add, root, i === 1 ? M.gold() : i % 2 ? M.emerald() : M.forest(), [Math.cos(a) * 2.1, 0, Math.sin(a) * 2.1])
  }
}

function team1(s) {
  const { add } = s
  const root = new THREE.Group()
  s.scene.add(root)
  const lead = [0, 0, 0]
  figure(add, root, M.gold(), lead, 1.3)
  const spots = [
    [-2.4, 0, 0.6],
    [-1.4, 0, -1.6],
    [1.4, 0, -1.6],
    [2.4, 0, 0.6],
    [0, 0, 2.0],
  ]
  spots.forEach((p, i) => {
    figure(add, root, i % 2 ? M.emerald() : M.forest(), p, 0.9)
    const a = new THREE.Vector3(0, 1.3, 0)
    const b = new THREE.Vector3(p[0], 1.0, p[2])
    const m = add(new THREE.CylinderGeometry(0.03, 0.03, a.distanceTo(b), 12), M.gold(), a.clone().add(b).multiplyScalar(0.5).toArray())
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
  })
  add(new THREE.TorusGeometry(2.55, 0.03, 12, 128), M.gold(), [0, 0.02, 0.1], [Math.PI / 2, 0, 0])
}

function growth0(s) {
  const { add } = s
  const root = new THREE.Group()
  root.rotation.y = -0.45
  s.scene.add(root)
  // a straight climb, one step at a time, the gold figure partway up and a flag at the top
  for (let i = 0; i < 7; i++) {
    const h = 0.35 + i * 0.42
    add(rbox(0.85, h, 1.5, 0.08), i % 2 ? M.sand() : M.white(), [(i - 3) * 0.85, h / 2, 0], [0, 0, 0], root)
  }
  figure(add, root, M.gold(), [-0.85, 0.35 + 2 * 0.42, 0.1], 0.55)
  const top = 0.35 + 6 * 0.42
  add(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 16), M.forest(), [2.55, top + 0.65, 0], [0, 0, 0], root)
  const flag = new THREE.Shape()
  flag.moveTo(0, 0)
  flag.lineTo(0.75, -0.2)
  flag.lineTo(0, -0.45)
  flag.closePath()
  add(new THREE.ExtrudeGeometry(flag, { depth: 0.04, bevelEnabled: false }), M.emerald(), [2.57, top + 1.28, -0.02], [0, 0, 0], root)
  add(new THREE.SphereGeometry(0.07, 20, 16), M.gold(), [2.55, top + 1.33, 0], [0, 0, 0], root)
}

function growth1(s) {
  const { add } = s
  add(lathe([[0, 0], [0.7, 0], [0.9, 1.05], [0.98, 1.1], [0.98, 1.2], [0, 1.2]]), M.white(), [0, 0, 0])
  add(new THREE.CylinderGeometry(0.86, 0.86, 0.05, 48), M.deep(), [0, 1.18, 0])
  const stem = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.15, 0),
    new THREE.Vector3(0.1, 1.9, 0),
    new THREE.Vector3(-0.08, 2.7, 0.05),
    new THREE.Vector3(0.05, 3.4, 0),
  ])
  add(new THREE.TubeGeometry(stem, 64, 0.06, 12), M.forest())
  ;[
    [1.9, 1, 0.5],
    [2.45, -1, 0.65],
    [3.0, 1, 0.8],
  ].forEach(([y, side, ang]) => {
    const leaf = add(new THREE.SphereGeometry(0.5, 40, 24), M.emerald(), [side * 0.42, y, 0], [0, 0, side * ang])
    leaf.scale.set(1, 0.32, 0.55)
  })
  add(new THREE.SphereGeometry(0.2, 32, 24), M.gold(), [0.05, 3.55, 0])
}

/* ------------------------------------------------------------------ registry */

const SCENES = {
  'project-performance': { w: 1280, h: 800, build: performance, cam: [0.3, 6.4, 9.6], look: [0.3, 0.9, 0] },
  'project-tama': { w: 1280, h: 800, build: tama, cam: [0.4, 3.4, 9.4], look: [0.3, 1.5, 0] },
  'project-intelligence': { w: 1280, h: 800, build: intelligence, cam: [0.1, 3.4, 10.8], look: [0.15, 1.6, 0] },
  'cover-management-0': { w: 1200, h: 800, build: management0, cam: [0, 5.2, 7.8], look: [0, 0.8, 0] },
  'cover-management-1': { w: 1200, h: 800, build: management1, cam: [0, 4.0, 11.2], look: [0, 1.9, 0] },
  'cover-system-building-0': { w: 1200, h: 800, build: system0, cam: [0, 3.0, 9.8], look: [0.4, 1.5, 0] },
  'cover-system-building-1': { w: 1200, h: 800, build: system1, cam: [0, 4.6, 7.6], look: [0, 0.9, 0] },
  'cover-ai-0': { w: 1200, h: 800, build: ai0, cam: [0, 3.0, 8.4], look: [0, 1.6, 0] },
  'cover-ai-1': { w: 1200, h: 800, build: ai1, cam: [0, 5.4, 6.6], look: [0, 0.2, 0] },
  'cover-business-0': { w: 1200, h: 800, build: business0, cam: [0, 3.4, 9.2], look: [0.4, 1.2, 0] },
  'cover-business-1': { w: 1200, h: 800, build: business1, cam: [0, 3.2, 10.4], look: [0, 1.8, 0] },
  'cover-team-0': { w: 1200, h: 800, build: team0, cam: [0, 4.4, 7.8], look: [0, 0.8, 0] },
  'cover-team-1': { w: 1200, h: 800, build: team1, cam: [0, 4.0, 8.4], look: [0, 1.0, 0] },
  'cover-personal-growth-0': { w: 1200, h: 800, build: growth0, cam: [0.6, 3.6, 10.2], look: [0.3, 1.6, 0] },
  'cover-personal-growth-1': { w: 1200, h: 800, build: growth1, cam: [0, 2.6, 7.2], look: [0, 1.8, 0] },
}

window.SCENE_NAMES = Object.keys(SCENES)
window.renderScene = (name) => {
  const def = SCENES[name]
  const s = stage(def.w * 2, def.h * 2, { cam: def.cam, look: def.look })
  def.build(s)
  s.renderer.render(s.scene, s.camera)
  const url = s.renderer.domElement.toDataURL('image/png')
  s.renderer.dispose()
  return url
}
window.READY = true
