/**
 * Liquid raymarching background — vanilla port.
 *
 * Ported from phobon/raymarching-tsl (Codrops, "How to Create a Liquid
 * Raymarching Scene Using Three.js Shading Language"). The original ships as a
 * React Three Fiber scene; this drops React entirely and drives three.js
 * directly. The SDF / lighting / march below is the same maths as the original
 * `final.jsx`, with colour values retuned for this site's palette and rays that
 * hit nothing made transparent so the page background shows through unmodified.
 *
 * three.js itself is an external — loaded from a CDN via an import map.
 */

import {
  // core
  Scene,
  Mesh,
  PlaneGeometry,
  OrthographicCamera,
  WebGPURenderer,
  MeshBasicNodeMaterial,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  // TSL
  float,
  Loop,
  If,
  Break,
  Fn,
  uv,
  vec2,
  vec3,
  vec4,
  timerLocal,
  sin,
  min,
  max,
  abs,
  mix,
  clamp,
  fract,
  smoothstep,
  normalize,
  dot,
  reflect,
  viewportResolution,
} from 'three/webgpu'

/* ------------------------------------------------------------------ *
 * Tunables
 * ------------------------------------------------------------------ */

export const CONFIG = {
  // Raymarch loop iterations. The original uses 80; the shape here is smooth
  // and low-contrast, so fewer steps are visually indistinguishable and much
  // cheaper. Lower this first if the effect ever needs to get cheaper.
  steps: 56,
  // Upper bound on device pixel ratio. A full-viewport fragment shader is
  // fill-rate bound, so this is the single biggest performance lever:
  // rendering a 2x retina display at 1.5x is ~2.2x less work than at 2x.
  maxPixelRatio: 1.5,
  // Extra resolution divisor on top of pixel ratio. 1 = native.
  resolutionScale: 1,
  // Animation speed. The original marches at 1.0; slowed down here so the
  // motion reads as ambient rather than as something asking to be watched.
  timeScale: 0.4,
  // Magnification. Shrinking the aspect-corrected UV zooms the camera in, so
  // >1 makes the liquid shape occupy more of the viewport.
  zoom: 1.7,
  // Width of the soft alpha falloff at the shape's silhouette, in world units.
  edgeSoftness: 0.025,
  // Amplitude of the anti-banding dither, in linear-light units. Roughly one
  // 8-bit step near black.
  ditherAmount: 0.006,
  // Offset used to estimate surface normals by central difference. The
  // original's 1e-4 sits at float32's precision floor once ray positions are
  // ~3 units from the origin: differencing two SDF samples that close together
  // quantises the normal and prints visible concentric rings across the shape.
  normalEpsilon: 0.0025,
}

// Palette, in linear-ish shader space. Kept deliberately dark: the shape should
// separate from #060606 by only a few values, so it reads as a shadow rather
// than an object.
export const PALETTE = {
  // Base albedo of the liquid. Near-black — darker than the background wash
  // behind it, so the shape reads as a silhouette rather than a lit object.
  albedo: [0.055, 0.055, 0.058],
  // Key light — very slightly warm white.
  lightColor: [1.0, 0.97, 0.94],
  // Hemisphere fill. The original used saturated blue/orange; these are
  // desaturated near-neutrals with a faint cool/warm split so the form is
  // legible without introducing a colour cast.
  skyColor: [0.1, 0.105, 0.12],
  groundColor: [0.075, 0.065, 0.06],
  // Accent (#ff5c38) applied only to the fresnel-weighted specular, so the
  // colour appears on rim highlights and nowhere else.
  specularTint: [1.0, 0.361, 0.22],
  // Background wash. In the original this gradient was a side effect — rays
  // that hit nothing were still run through the lighting model with garbage
  // normals. Here it's authored directly: a soft diagonal falling from a dim
  // grey at the top right to the page background at the left and bottom.
  // `bgFloor` is tuned so the darkest corner lands on #060606 after tone
  // mapping, which keeps the canvas seamless with the site background if the
  // effect is ever hidden or fails to start.
  bgFloor: [0.0085, 0.0085, 0.0088],
  bgPeak: [0.044, 0.044, 0.047],
}

export const INTENSITY = {
  ambient: 0.1,
  diffuse: 0.35,
  hemi: 0.25,
  specular: 0.32,
}

/* ------------------------------------------------------------------ *
 * Shader graph (TSL)
 * ------------------------------------------------------------------ */

const timer = timerLocal(CONFIG.timeScale)

// Distance at which the march calls it a hit.
const HIT_EPSILON = 0.005

const hash = Fn(([p]) => fract(sin(dot(p, vec2(12.9898, 78.233))).mul(43758.5453)))

const sdSphere = Fn(([p, r]) => p.length().sub(r))

const smin = Fn(([a, b, k]) => {
  const h = max(k.sub(abs(a.sub(b))), 0).div(k)
  return min(a, b).sub(h.mul(h).mul(k).mul(0.25))
})

const sdf = Fn(([pos]) => {
  const translatedPos = pos.add(vec3(sin(timer), 0, 0))
  const sphere = sdSphere(translatedPos, 0.5)
  const secondSphere = sdSphere(pos, 0.3)

  return smin(secondSphere, sphere, 0.3)
})

const calcNormal = Fn(([p]) => {
  const eps = float(CONFIG.normalEpsilon)
  const h = vec2(eps, 0)
  return normalize(
    vec3(
      sdf(p.add(h.xyy)).sub(sdf(p.sub(h.xyy))),
      sdf(p.add(h.yxy)).sub(sdf(p.sub(h.yxy))),
      sdf(p.add(h.yyx)).sub(sdf(p.sub(h.yyx))),
    ),
  )
})

const lighting = Fn(([ro, r]) => {
  const normal = calcNormal(r)
  const viewDir = normalize(ro.sub(r))

  // Ambient
  const ambient = vec3(1)

  // Diffuse — the 3D read of the form
  const lightDir = normalize(vec3(1, 1, 1))
  const lightColor = vec3(...PALETTE.lightColor)
  const dp = max(0, dot(lightDir, normal))
  const diffuse = dp.mul(lightColor)

  // Hemisphere fill — sky above, ground below, mixed on the normal
  const hemiMix = normal.y.mul(0.5).add(0.5)
  const hemi = mix(vec3(...PALETTE.groundColor), vec3(...PALETTE.skyColor), hemiMix)

  // Phong specular
  const ph = normalize(reflect(lightDir.negate(), normal))
  const phongValue = max(0, dot(viewDir, ph)).pow(32)
  const specular = vec3(phongValue).toVar()

  // Fresnel — pushes the highlight toward grazing angles, so the accent lands
  // on the rim of the shape instead of a hotspot in the middle of it.
  const fresnel = float(1)
    .sub(max(0, dot(viewDir, normal)))
    .pow(2)

  specular.mulAssign(fresnel)

  const light = ambient.mul(INTENSITY.ambient).toVar()
  light.addAssign(diffuse.mul(INTENSITY.diffuse))
  light.addAssign(hemi.mul(INTENSITY.hemi))

  const finalColor = vec3(...PALETTE.albedo).mul(light).toVar()

  // Accent only here.
  finalColor.addAssign(specular.mul(vec3(...PALETTE.specularTint)).mul(INTENSITY.specular))

  return finalColor
})

// Diagonal background wash, brightest toward the top right and falling to the
// page background at the left and bottom edges.
const background = Fn(([screenUv]) => {
  const t = clamp(screenUv.x.mul(0.95).sub(screenUv.y.mul(0.25)).add(0.15), 0, 1)
  return mix(vec3(...PALETTE.bgFloor), vec3(...PALETTE.bgPeak), smoothstep(0, 1, t))
})

const march = Fn(() => {
  // Aspect-corrected UV from fragment coordinates
  const _uv = uv()
    .mul(viewportResolution.xy)
    .mul(2)
    .sub(viewportResolution.xy)
    .div(viewportResolution.y)
    .div(CONFIG.zoom)

  const rayOrigin = vec3(0, 0, -3)
  const rayDirection = vec3(_uv, 1).normalize()

  const t = float(0).toVar()
  const ray = rayOrigin.add(rayDirection.mul(t)).toVar()

  // Did the march actually reach the surface? This is the authoritative
  // coverage signal; minDist below only feathers the edge. Deriving coverage
  // from minDist alone punches a hole through the middle of each sphere,
  // because a ray heading straight at the centre converges and breaks out of
  // the loop without minDist ever being written on that path.
  const hit = float(0).toVar()

  // Closest the ray ever came to the surface, clamped at 0 so a ray that ends
  // up inside the surface doesn't poison the value with a negative. Used as an
  // antialiasing signal: a distance field already knows how far a pixel is
  // from the edge, so the silhouette can be feathered for free instead of
  // coming out jagged (MSAA does nothing for shapes made in a fragment shader).
  const minDist = float(1e5).toVar()

  Loop({ start: 1, end: CONFIG.steps }, () => {
    const d = sdf(ray)

    minDist.assign(min(minDist, max(d, 0)))

    If(d.lessThan(HIT_EPSILON), () => {
      hit.assign(1)
      Break()
    })

    t.addAssign(d.mul(0.8))
    ray.assign(rayOrigin.add(rayDirection.mul(t)))

    If(t.greaterThan(50), () => {
      Break()
    })
  })

  // Coverage: fully opaque wherever the ray hit, feathered in the band just
  // outside the silhouette where it only came close.
  const edge = float(1).sub(smoothstep(HIT_EPSILON, CONFIG.edgeSoftness, minDist))
  const coverage = clamp(max(hit, edge), 0, 1)

  // The shape is composited over the wash here rather than by the browser, so
  // the canvas is fully opaque and the gradient can reach true black at the
  // edges instead of being limited to whatever is painted behind it.
  const color = mix(background(uv()), lighting(rayOrigin, ray), coverage)

  // Both the wash and the shape live within a handful of 8-bit values of
  // #060606, where a single LSB step prints as a visible band. A sub-LSB
  // dither breaks those up into noise the eye doesn't resolve. Static (no time
  // term) so it doesn't shimmer between frames.
  const noise = hash(uv().mul(viewportResolution.xy)).sub(0.5).mul(CONFIG.ditherAmount)

  return vec4(color.add(noise), 1)
})

/* ------------------------------------------------------------------ *
 * Renderer
 * ------------------------------------------------------------------ */

async function webgpuAvailable() {
  if (typeof navigator === 'undefined' || !navigator.gpu) return false
  try {
    return !!(await navigator.gpu.requestAdapter())
  } catch {
    return false
  }
}

function webgl2Available() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

function buildMaterial() {
  const material = new MeshBasicNodeMaterial()
  // Opaque: the shader paints its own background wash, including the black it
  // fades out to, so there is nothing to blend against.
  material.transparent = false

  material.colorNode = march().rgb

  return material
}

export async function initRaymarchBackground(canvas, options = {}) {
  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')

  const useWebGPU = await webgpuAvailable()
  if (!useWebGPU && !webgl2Available()) {
    throw new Error('neither WebGPU nor WebGL2 is available')
  }

  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
    forceWebGL: !useWebGPU,
  })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)

  await renderer.init()

  const scene = new Scene()
  // An orthographic camera with a 2x2 plane fills the frustum exactly at any
  // aspect ratio. The React version needed R3F's `viewport` width/height to
  // scale a plane to fit, but that was only because R3F defaults to a
  // perspective camera — with an ortho camera the whole calculation disappears,
  // and so does the need to touch the mesh on resize.
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  scene.add(new Mesh(new PlaneGeometry(2, 2), buildMaterial()))

  const resize = () => {
    const scale = options.resolutionScale ?? CONFIG.resolutionScale
    const cap = options.maxPixelRatio ?? CONFIG.maxPixelRatio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap) / scale)
    renderer.setSize(window.innerWidth, window.innerHeight, false)
  }

  let running = false
  const renderFrame = () => renderer.render(scene, camera)

  const stop = () => {
    if (!running) return
    running = false
    renderer.setAnimationLoop(null)
  }

  const start = () => {
    if (running) return
    running = true
    renderer.setAnimationLoop(renderFrame)
  }

  // Under reduced-motion the scene is drawn once and left there: the visual
  // stays, the movement doesn't.
  const applyMotionPreference = () => {
    if (reducedMotionQuery?.matches) {
      stop()
      renderFrame()
    } else if (!document.hidden) {
      start()
    }
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })

  // Don't burn frames on a tab nobody is looking at.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop()
    } else {
      applyMotionPreference()
    }
  })

  if (reducedMotionQuery) {
    const onChange = () => applyMotionPreference()
    reducedMotionQuery.addEventListener?.('change', onChange)
  }

  applyMotionPreference()

  return {
    renderer,
    backend: useWebGPU ? 'webgpu' : 'webgl2',
    start,
    stop,
    dispose: () => {
      stop()
      window.removeEventListener('resize', resize)
      renderer.dispose?.()
    },
  }
}

/**
 * Attach to an existing canvas by selector/element. Any failure removes the
 * canvas and resolves to null — a background effect must never be the reason a
 * page breaks.
 */
export async function mountRaymarchBackground(target = '#raymarch-bg', options = {}) {
  const canvas = typeof target === 'string' ? document.querySelector(target) : target
  if (!canvas) return null

  try {
    const instance = await initRaymarchBackground(canvas, options)
    canvas.dataset.backend = instance.backend
    window.__RAYMARCH_BACKEND__ = instance.backend
    return instance
  } catch (err) {
    canvas.remove()
    window.__RAYMARCH_BACKEND__ = 'unavailable'
    if (options.debug) console.warn('[raymarch-bg] disabled:', err)
    return null
  }
}

export default mountRaymarchBackground
