// three.js viewer for the interactive 3D fly-apart models (see lib/flyapart-models.ts).
//
// This module is ONLY ever loaded through a dynamic import() from
// components/blocks/FlyApartExplorer.tsx after the visitor clicks "Explore in 3D",
// so three.js never ships in a page's initial JavaScript. Do not import it statically.
//
// Each GLB carries one baked clip (assembled → fully apart). The viewer scrubs that
// clip with a 0..1 progress value, keeps the model framed as it grows, reports which
// part is under the pointer, and zooms toward the last part the visitor clicked.
// Double-clicking (or double-tapping) a part isolates it: everything else is hidden and
// the camera frames that part alone so it can be turned around; doing it again puts it
// back. Parts flagged `individual` (e.g. a disc stack) are picked one mesh at a time.
// Rendering is on demand: the loop stops whenever nothing is moving or the canvas is
// off screen. Wheel and pinch zoom are deliberately off so the canvas never hijacks
// page scrolling; zoom is driven by the explorer's buttons.
import {
  ACESFilmicToneMapping,
  AnimationClip,
  AnimationMixer,
  Box3,
  DirectionalLight,
  LoopOnce,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  ShadowMaterial,
  Vector2,
  Vector3,
  VSMShadowMap,
  WebGLRenderer,
  type AnimationAction,
  type MeshStandardMaterial,
  type Object3D,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export interface FlyApartViewerOptions {
  canvas: HTMLCanvasElement
  modelUrl: string
  dracoPath: string
  /**
   * Identifiable parts (node names). A part with `variant` shows only while that variant is
   * selected. A part with `individual` is picked, highlighted and isolated one mesh at a time.
   */
  parts: readonly { key: string; variant?: string; individual?: boolean }[]
  /** Initially selected variant, for models that have them. */
  variant?: string
  /** Highlight colour for the hovered part (any CSS colour). */
  accent: string
  reducedMotion: boolean
  /** Node that turns slowly once the model is mostly apart. */
  spin?: { node: string; axis: 'x' | 'y' | 'z' }
  /** Height of the shadow-catching floor. */
  floorY: number
  /** Starting camera direction, in degrees. */
  view: { azimuth: number; elevation: number }
  onReady: () => void
  onError: (err: unknown) => void
  /** p: 0 assembled … 1 fully apart. playingTo is the play() target, or null when idle/scrubbing. */
  onProgress: (p: number, playingTo: 0 | 1 | null) => void
  /** unitLabel is set for `individual` parts, e.g. "7 of 24". */
  onFocus: (key: string | null, unitLabel: string | null) => void
  /** A part was isolated (double-click) or returned to the machine (key null). */
  onIsolate: (key: string | null, unitLabel: string | null) => void
  /** Zoom target changed (1 = whole model in view). */
  onZoom: (zoom: number) => void
}

export interface FlyApartViewerHandle {
  setProgress: (p: number) => void
  play: (to: 0 | 1) => void
  /** Multiply the zoom by `factor` (clamped to ZOOM_MIN..ZOOM_MAX). */
  zoomBy: (factor: number) => void
  /** Back to the whole model, centred. */
  resetView: () => void
  /** Show the parts of one variant (e.g. a drive type) and hide the others. */
  setVariant: (variant: string) => void
  /** Put an isolated part back into the machine. */
  exitIsolation: () => void
  dispose: () => void
}

export const ZOOM_MIN = 1
export const ZOOM_MAX = 6
const PLAY_SECONDS = 5.2

export function createFlyApartViewer(opts: FlyApartViewerOptions): FlyApartViewerHandle {
  const { canvas } = opts
  const partVariant = new Map(opts.parts.map((p) => [p.key, p.variant]))
  const individual = new Set(opts.parts.filter((p) => p.individual).map((p) => p.key))

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = VSMShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.03)
  scene.environment = envTarget.texture
  scene.environmentIntensity = 0.95

  const camera = new PerspectiveCamera(32, 16 / 9, 0.05, 200)
  const az = MathUtils.degToRad(opts.view.azimuth)
  const el = MathUtils.degToRad(opts.view.elevation)
  camera.position
    .set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
    .multiplyScalar(6)

  const key = new DirectionalLight(0xffffff, 1.6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4, bottom: -4, near: 1, far: 30 })
  key.shadow.radius = 9
  key.shadow.blurSamples = 16
  key.shadow.bias = -0.0005
  const rim = new DirectionalLight(0xcfe2ff, 0.9)
  rim.position.set(3, 3, -6)
  scene.add(key, key.target, rim)

  const ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.32 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = opts.floorY
  ground.receiveShadow = true
  scene.add(ground)

  const controls = new OrbitControls(camera, canvas)
  controls.enableZoom = false // never hijack page scroll; zoom comes from the explorer's buttons
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minPolarAngle = 0.25
  controls.maxPolarAngle = Math.PI / 2 - 0.04
  controls.autoRotateSpeed = 0.5

  // ── state ────────────────────────────────────────────────────────────────
  let model: Object3D | null = null
  let spinNode: Object3D | undefined
  let mixer: AnimationMixer | null = null
  let action: AnimationAction | null = null
  let clipStart = 0
  let clipEnd = 0
  // A unit is what one click selects: every mesh of a part, or a single mesh of an `individual` part.
  interface Unit {
    key: string
    meshes: Mesh[]
    label: string | null
  }
  const units = new Map<string, Unit>()
  const meshes: Mesh[] = []
  let variant = opts.variant
  let isolated: string | null = null // unit id shown on its own

  let progress = 0
  let applied = -1
  let target: 0 | 1 | null = null
  let focused: string | null = null // unit id under the pointer
  let anchorKey: string | null = null // unit id last clicked: where zoom heads
  let zoomGoal = 1
  let zoom = 1
  let dragging = false
  let idleAt = 0
  let visible = true
  let disposed = false
  let raf = 0
  let last = 0
  let snap = true
  let dist = 6

  const box = new Box3()
  const anchorBox = new Box3()
  const tmpBox = new Box3()
  const center = new Vector3()
  const raycaster = new Raycaster()
  const pointer = new Vector2()
  const tmpA = new Vector3()
  const tmpB = new Vector3()
  const tmpC = new Vector3()
  const tmpP = new Vector3()
  const tmpDir = new Vector3()
  const tmpBefore = new Vector3()
  const tmpWant = new Vector3()

  function wake() {
    if (raf || disposed || !model) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  function setP(p: number) {
    if (p === progress) return
    progress = p
    opts.onProgress(p, target)
    wake()
  }

  function keyOf(o: Object3D | null): string | null {
    for (let n = o; n; n = n.parent) {
      const name = n.name.replace(/_\d+$/, '')
      if (partVariant.has(name)) return name
    }
    return null
  }

  function focus(id: string | null) {
    if (id === focused) return
    for (const [unitId, unit] of units) {
      for (const m of unit.meshes) {
        const mat = m.material as MeshStandardMaterial
        mat.emissive.set(unitId === id ? opts.accent : '#000000')
        mat.emissiveIntensity = unitId === id ? 0.45 : 1
      }
    }
    focused = id
    const unit = id ? units.get(id) : undefined
    opts.onFocus(unit?.key ?? null, unit?.label ?? null)
    wake()
  }

  function pick(e: PointerEvent): string | null {
    if (!model) return null
    const b = canvas.getBoundingClientRect()
    pointer.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObject(model, true).find((h) => h.object.visible) // skip the hidden variant
    const id = hit ? ((hit.object.userData.unitId as string | undefined) ?? null) : null
    focus(id)
    return id
  }

  // Union of the meshes' own bounds (children are separate parts, so they must not be included).
  function expandBy(target: Box3, list: readonly Mesh[]) {
    for (const m of list) {
      if (!m.visible || !m.geometry.boundingBox) continue
      target.union(tmpBox.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld))
    }
  }

  // Bounds of what is currently shown (hidden variants and, when isolating, other parts do not count).
  function computeBox() {
    box.makeEmpty()
    expandBy(box, meshes)
  }

  function applyVisibility() {
    for (const m of meshes) {
      const v = partVariant.get(m.userData.partKey as string)
      const inVariant = !v || !variant || v === variant
      m.visible = inVariant && (!isolated || m.userData.unitId === isolated)
    }
    if (model) {
      model.updateMatrixWorld(true)
      computeBox()
    }
  }

  function setIsolated(id: string | null) {
    if (id === isolated) return
    isolated = id
    // Frame the part (or the machine again) from scratch: no zoom, no anchor.
    zoomGoal = ZOOM_MIN
    anchorKey = null
    if (opts.reducedMotion) zoom = zoomGoal
    opts.onZoom(zoomGoal)
    applyVisibility()
    const unit = id ? units.get(id) : undefined
    opts.onIsolate(unit?.key ?? null, unit?.label ?? null)
    wake()
  }

  // Distance at which the whole box fits the view from direction `dir`.
  function fitDistance(dir: Vector3): number {
    const tanV = Math.tan(MathUtils.degToRad(camera.fov / 2))
    const tanH = tanV * camera.aspect
    const x = tmpA.crossVectors(camera.up, dir).normalize()
    const y = tmpB.crossVectors(dir, x)
    const c = box.getCenter(tmpC)
    const marginH = 0.9
    const marginV = 0.88 // all controls sit outside the canvas, so only a small margin is needed
    let need = 0
    for (let i = 0; i < 8; i++) {
      tmpP
        .set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z)
        .sub(c)
      const pz = tmpP.dot(dir)
      need = Math.max(need, Math.abs(tmpP.dot(x)) / (marginH * tanH) + pz, Math.abs(tmpP.dot(y)) / (marginV * tanV) + pz)
    }
    return need
  }

  function tick(now: number) {
    raf = 0
    if (disposed || !model) return
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    let busy = dragging

    if (target !== null) {
      // Constant-rate sweep; the per-part easing is baked into the clip.
      const step = dt / PLAY_SECONDS
      const d = target - progress
      if (Math.abs(d) <= step) {
        const done = target
        target = null
        progress = done
        opts.onProgress(done, null)
      } else {
        setP(progress + Math.sign(d) * step)
        busy = true
      }
    }
    if (progress !== applied && action && mixer) {
      action.time = clipStart + progress * (clipEnd - clipStart - 1e-4)
      mixer.update(0)
      applied = progress
      model.updateMatrixWorld(true)
      computeBox()
    }
    if (spinNode && opts.spin && progress > 0.6 && !opts.reducedMotion) {
      // Turn the rotor once it is exposed, so the flights / basket read as rotating parts.
      spinNode.rotation[opts.spin.axis] += dt * 0.7 * Math.min(1, (progress - 0.6) / 0.3)
      busy = true
    }

    const kz = snap ? 1 : 1 - Math.exp(-dt * 6)
    zoom += (zoomGoal - zoom) * kz
    if (Math.abs(zoomGoal - zoom) < 1e-3) zoom = zoomGoal
    else busy = true

    controls.autoRotate = !opts.reducedMotion && !dragging && !focused && zoomGoal === 1 && now > idleAt
    if (controls.autoRotate) busy = true
    tmpBefore.copy(camera.position)
    controls.update()

    // Keep the model framed: follow its centre and fit distance for the current view direction.
    // When zoomed in, head for the last clicked part instead of the centre of everything.
    const dir = tmpDir.copy(camera.position).sub(controls.target).normalize()
    const want = Math.max(fitDistance(dir) / zoom, 0.35)
    box.getCenter(tmpWant)
    const anchorUnit = anchorKey ? units.get(anchorKey) : undefined
    if (anchorUnit && zoom > 1) {
      anchorBox.makeEmpty()
      expandBy(anchorBox, anchorUnit.meshes)
      if (!anchorBox.isEmpty()) tmpWant.lerp(anchorBox.getCenter(tmpC), MathUtils.smoothstep(zoom, 1, 1.6))
    }
    const k = snap ? 1 : 1 - Math.exp(-dt * 7)
    snap = false
    dist += (want - dist) * k
    center.lerp(tmpWant, k)
    controls.target.copy(center)
    camera.position.copy(center).addScaledVector(dir, dist)
    camera.lookAt(center)
    box.getCenter(tmpC)
    const lightY = Math.max(7, box.max.y + 4)
    key.position.set(tmpC.x - 1.5, lightY, tmpC.z + 3)
    key.target.position.set(tmpC.x, tmpC.y, tmpC.z)
    if (
      Math.abs(want - dist) > 1e-3 ||
      center.distanceToSquared(tmpWant) > 1e-7 ||
      tmpBefore.distanceToSquared(camera.position) > 1e-8
    ) {
      busy = true
    }

    renderer.render(scene, camera)
    // `!raf`: a callback fired during this frame may already have scheduled the next one.
    if (busy && visible && !raf) raf = requestAnimationFrame(tick)
  }

  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    snap = true
    wake()
  }

  // ── events ───────────────────────────────────────────────────────────────
  let downAt: [number, number] | null = null
  let lastTap: { t: number; x: number; y: number } | null = null
  const onStart = () => {
    dragging = true
  }
  const onEnd = () => {
    dragging = false
    idleAt = performance.now() + 3500
  }
  const onMove = (e: PointerEvent) => {
    if (!dragging && e.pointerType === 'mouse') pick(e)
  }
  const onLeave = () => focus(null)
  const onDown = (e: PointerEvent) => {
    downAt = [e.clientX, e.clientY]
  }
  const onUp = (e: PointerEvent) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) >= 6) return // it was a drag
    const now = performance.now()
    const double = lastTap !== null && now - lastTap.t < 380 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 24
    if (double) {
      // Second click / tap: isolate the part under the pointer, or put the isolated part back.
      lastTap = null
      if (isolated) {
        setIsolated(null)
      } else {
        const id = pick(e)
        if (id) setIsolated(id)
      }
      return
    }
    // Single click or tap: identify the part and make it the zoom anchor.
    lastTap = { t: now, x: e.clientX, y: e.clientY }
    anchorKey = pick(e)
    wake()
  }
  controls.addEventListener('start', onStart)
  controls.addEventListener('end', onEnd)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)

  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) wake()
  })
  io.observe(canvas)

  // ── load ─────────────────────────────────────────────────────────────────
  const draco = new DRACOLoader()
  draco.setDecoderPath(opts.dracoPath)
  draco.setDecoderConfig({ type: 'js' }) // WASM needs 'wasm-unsafe-eval', which the site CSP does not grant
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  loader.load(
    opts.modelUrl,
    (gltf) => {
      if (disposed) return
      model = gltf.scene
      model.traverse((o) => {
        const mesh = o as Mesh
        if (!mesh.isMesh) return
        mesh.castShadow = true
        mesh.material = (mesh.material as MeshStandardMaterial).clone() // per-part highlight
        mesh.geometry.computeBoundingBox()
        meshes.push(mesh)
        const k = keyOf(mesh)
        if (k) {
          // Multi-material meshes arrive as sibling primitives named "<node>_1", "<node>_2": keep them together.
          const node = mesh.parent?.type === 'Group' ? mesh.parent : mesh
          const id = individual.has(k) ? `${k}:${node.name}` : k
          mesh.userData.partKey = k
          mesh.userData.unitId = id
          const unit = units.get(id)
          if (unit) unit.meshes.push(mesh)
          else units.set(id, { key: k, meshes: [mesh], label: null })
        }
      })
      // Number the units of each `individual` part in name order: "1 of 24", "2 of 24", …
      for (const k of individual) {
        const ids = [...units.keys()].filter((id) => id.startsWith(`${k}:`)).sort()
        ids.forEach((id, i) => {
          const unit = units.get(id)
          if (unit) unit.label = `${i + 1} of ${ids.length}`
        })
      }
      spinNode = opts.spin ? model.getObjectByName(opts.spin.node) : undefined
      scene.add(model)

      // One clip whether the export wrote a single clip or one per part.
      const tracks = gltf.animations.flatMap((a) => a.tracks)
      if (tracks.length) {
        const clip = new AnimationClip('FlyApart', -1, tracks)
        mixer = new AnimationMixer(model)
        action = mixer.clipAction(clip)
        action.setLoop(LoopOnce, 1)
        action.clampWhenFinished = true
        action.play()
        clipStart = Math.min(...tracks.map((t) => t.times[0]))
        clipEnd = clip.duration
      }
      applyVisibility()
      box.getCenter(center)
      idleAt = performance.now() + 1200
      resize()
      opts.onReady()
      wake()
    },
    undefined,
    (err) => {
      if (!disposed) opts.onError(err)
    },
  )

  return {
    setProgress(p) {
      target = null
      setP(Math.min(1, Math.max(0, p)))
    },
    play(to) {
      if (opts.reducedMotion) {
        target = null
        setP(to)
        opts.onProgress(to, null)
        return
      }
      target = to
      opts.onProgress(progress, to)
      wake()
    },
    zoomBy(factor) {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomGoal * factor))
      // Snap to exactly 1 near the bottom so "whole model" is a clean resting state.
      zoomGoal = next < ZOOM_MIN * 1.05 ? ZOOM_MIN : next
      if (opts.reducedMotion) zoom = zoomGoal
      opts.onZoom(zoomGoal)
      wake()
    },
    resetView() {
      zoomGoal = ZOOM_MIN
      anchorKey = null
      if (opts.reducedMotion) zoom = zoomGoal
      opts.onZoom(zoomGoal)
      wake()
    },
    setVariant(v) {
      if (v === variant) return
      variant = v
      // Drop isolation, highlight and zoom anchor if they were on a part that is now hidden.
      const hiddenNow = (id: string | null) => {
        const pv = id ? partVariant.get(units.get(id)?.key ?? '') : undefined
        return Boolean(pv && pv !== v)
      }
      if (hiddenNow(isolated)) setIsolated(null)
      if (hiddenNow(focused)) focus(null)
      if (hiddenNow(anchorKey)) anchorKey = null
      applyVisibility()
      wake()
    },
    exitIsolation() {
      setIsolated(null)
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('end', onEnd)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      controls.dispose()
      draco.dispose()
      model?.traverse((o) => {
        const mesh = o as Mesh
        if (!mesh.isMesh) return
        mesh.geometry.dispose()
        ;(mesh.material as MeshStandardMaterial).dispose()
      })
      ground.geometry.dispose()
      ground.material.dispose()
      envTarget.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
