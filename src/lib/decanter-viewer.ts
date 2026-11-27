// three.js viewer for the decanter rotating-assembly fly-apart.
//
// This module is ONLY ever loaded through a dynamic import() from
// components/blocks/DecanterExplorer.tsx after the visitor clicks "Explore in 3D",
// so three.js never ships in a page's initial JavaScript. Do not import it statically.
//
// The GLB carries one baked clip (assembled → fully apart). The viewer scrubs that
// clip with a 0..1 progress value, keeps the assembly framed as it grows, and
// reports which part is under the pointer. Rendering is on demand: the loop stops
// whenever nothing is moving or the canvas is off screen.
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

export interface DecanterViewerOptions {
  canvas: HTMLCanvasElement
  modelUrl: string
  dracoPath: string
  /** Node names that count as identifiable parts. */
  partKeys: readonly string[]
  /** Highlight colour for the hovered part (any CSS colour). */
  accent: string
  reducedMotion: boolean
  onReady: () => void
  onError: (err: unknown) => void
  /** p: 0 assembled … 1 fully apart. playingTo is the play() target, or null when idle/scrubbing. */
  onProgress: (p: number, playingTo: 0 | 1 | null) => void
  onFocus: (key: string | null) => void
}

export interface DecanterViewerHandle {
  setProgress: (p: number) => void
  play: (to: 0 | 1) => void
  dispose: () => void
}

const PLAY_SECONDS = 5.2
const FLOOR_Y = -0.42

export function createDecanterViewer(opts: DecanterViewerOptions): DecanterViewerHandle {
  const { canvas } = opts
  const partKeys = new Set(opts.partKeys)

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

  const camera = new PerspectiveCamera(32, 16 / 9, 0.05, 100)
  const az = MathUtils.degToRad(-34)
  const el = MathUtils.degToRad(17)
  camera.position
    .set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
    .multiplyScalar(6)

  const key = new DirectionalLight(0xffffff, 1.6)
  key.position.set(-1.5, 7, 3)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 1024)
  Object.assign(key.shadow.camera, { left: -4.2, right: 4.2, top: 2, bottom: -2, near: 1, far: 14 })
  key.shadow.radius = 9
  key.shadow.blurSamples = 16
  key.shadow.bias = -0.0005
  const rim = new DirectionalLight(0xcfe2ff, 0.9)
  rim.position.set(3, 3, -6)
  scene.add(key, key.target, rim)

  const ground = new Mesh(new PlaneGeometry(40, 40), new ShadowMaterial({ opacity: 0.32 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = FLOOR_Y
  ground.receiveShadow = true
  scene.add(ground)

  const controls = new OrbitControls(camera, canvas)
  controls.enableZoom = false // never hijack page scroll
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minPolarAngle = 0.25
  controls.maxPolarAngle = Math.PI / 2 - 0.04
  controls.autoRotateSpeed = 0.5

  // ── state ────────────────────────────────────────────────────────────────
  let model: Object3D | null = null
  let scroll: Object3D | undefined
  let mixer: AnimationMixer | null = null
  let action: AnimationAction | null = null
  let clipStart = 0
  let clipEnd = 0
  const byKey = new Map<string, Mesh[]>()

  let progress = 0
  let applied = -1
  let target: 0 | 1 | null = null
  let focused: string | null = null
  let dragging = false
  let idleAt = 0
  let visible = true
  let disposed = false
  let raf = 0
  let last = 0
  let snap = true
  let dist = 6

  const box = new Box3()
  const center = new Vector3()
  const raycaster = new Raycaster()
  const pointer = new Vector2()
  const tmpA = new Vector3()
  const tmpB = new Vector3()
  const tmpC = new Vector3()
  const tmpP = new Vector3()
  const tmpDir = new Vector3()
  const tmpBefore = new Vector3()

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
      if (partKeys.has(name)) return name
    }
    return null
  }

  function focus(k: string | null) {
    if (k === focused) return
    for (const [name, meshes] of byKey) {
      for (const m of meshes) {
        const mat = m.material as MeshStandardMaterial
        mat.emissive.set(name === k ? opts.accent : '#000000')
        mat.emissiveIntensity = name === k ? 0.45 : 1
      }
    }
    focused = k
    opts.onFocus(k)
    wake()
  }

  function pick(e: PointerEvent) {
    if (!model) return
    const b = canvas.getBoundingClientRect()
    pointer.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObject(model, true)[0]
    focus(hit ? ((hit.object.userData.partKey as string | undefined) ?? null) : null)
  }

  // Distance at which the whole box fits the view from direction `dir`.
  function fitDistance(dir: Vector3): number {
    const tanV = Math.tan(MathUtils.degToRad(camera.fov / 2))
    const tanH = tanV * camera.aspect
    const x = tmpA.crossVectors(camera.up, dir).normalize()
    const y = tmpB.crossVectors(dir, x)
    const c = box.getCenter(tmpC)
    const marginH = 0.9
    const marginV = 0.68 // leaves room for the overlay controls
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
      box.setFromObject(model)
    }
    if (scroll && progress > 0.6 && !opts.reducedMotion) {
      // Turn the conveyor once the bowl has cleared it, so the flights read as a screw.
      scroll.rotation.x += dt * 0.7 * Math.min(1, (progress - 0.6) / 0.3)
      busy = true
    }

    controls.autoRotate = !opts.reducedMotion && !dragging && !focused && now > idleAt
    if (controls.autoRotate) busy = true
    tmpBefore.copy(camera.position)
    controls.update()

    // Keep the assembly framed: follow its centre and fit distance for the current view direction.
    const dir = tmpDir.copy(camera.position).sub(controls.target).normalize()
    const want = fitDistance(dir)
    const k = snap ? 1 : 1 - Math.exp(-dt * 7)
    snap = false
    dist += (want - dist) * k
    center.lerp(box.getCenter(tmpC), k)
    controls.target.copy(center)
    camera.position.copy(center).addScaledVector(dir, dist)
    camera.lookAt(center)
    key.target.position.set(center.x, 0, 0)
    key.position.set(center.x - 1.5, 7, 3)
    if (Math.abs(want - dist) > 1e-3 || tmpBefore.distanceToSquared(camera.position) > 1e-8) busy = true

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
    // A tap (no drag) identifies the part on touch screens.
    if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) pick(e)
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
        const k = keyOf(mesh)
        if (k) {
          mesh.userData.partKey = k
          const list = byKey.get(k)
          if (list) list.push(mesh)
          else byKey.set(k, [mesh])
        }
      })
      scroll = model.getObjectByName('Scroll_Hub')
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
      model.updateMatrixWorld(true)
      box.setFromObject(model)
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
