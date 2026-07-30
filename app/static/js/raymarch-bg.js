import { timerLocal as F, Fn as d, fract as I, sin as z, dot as A, vec2 as G, max as w, abs as W, min as V, vec3 as a, float as y, normalize as S, mix as M, reflect as H, clamp as B, smoothstep as D, uv as R, viewportResolution as x, Loop as O, If as _, Break as k, vec4 as Y, WebGPURenderer as q, ACESFilmicToneMapping as K, SRGBColorSpace as U, Scene as Q, OrthographicCamera as j, Mesh as J, PlaneGeometry as X, MeshBasicNodeMaterial as Z } from "three/webgpu";
const u = {
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
  ditherAmount: 6e-3,
  // Offset used to estimate surface normals by central difference. The
  // original's 1e-4 sits at float32's precision floor once ray positions are
  // ~3 units from the origin: differencing two SDF samples that close together
  // quantises the normal and prints visible concentric rings across the shape.
  normalEpsilon: 25e-4
}, b = {
  // Base albedo of the liquid. Near-black — darker than the background wash
  // behind it, so the shape reads as a silhouette rather than a lit object.
  albedo: [0.055, 0.055, 0.058],
  // Key light — very slightly warm white.
  lightColor: [1, 0.97, 0.94],
  // Hemisphere fill. The original used saturated blue/orange; these are
  // desaturated near-neutrals with a faint cool/warm split so the form is
  // legible without introducing a colour cast.
  skyColor: [0.1, 0.105, 0.12],
  groundColor: [0.075, 0.065, 0.06],
  // Accent (#ff5c38) applied only to the fresnel-weighted specular, so the
  // colour appears on rim highlights and nowhere else.
  specularTint: [1, 0.361, 0.22],
  // Background wash. In the original this gradient was a side effect — rays
  // that hit nothing were still run through the lighting model with garbage
  // normals. Here it's authored directly: a soft diagonal falling from a dim
  // grey at the top right to the page background at the left and bottom.
  // `bgFloor` is tuned so the darkest corner lands on #060606 after tone
  // mapping, which keeps the canvas seamless with the site background if the
  // effect is ever hidden or fails to start.
  bgFloor: [85e-4, 85e-4, 88e-4],
  bgPeak: [0.044, 0.044, 0.047]
}, C = {
  ambient: 0.1,
  diffuse: 0.35,
  hemi: 0.25,
  specular: 0.32
}, $ = F(u.timeScale), T = 5e-3, ee = d(([e]) => I(z(A(e, G(12.9898, 78.233))).mul(43758.5453))), N = d(([e, t]) => e.length().sub(t)), ne = d(([e, t, n]) => {
  const o = w(n.sub(W(e.sub(t))), 0).div(n);
  return V(e, t).sub(o.mul(o).mul(n).mul(0.25));
}), g = d(([e]) => {
  const t = e.add(a(z($), 0, 0)), n = N(t, 0.5), o = N(e, 0.3);
  return ne(o, n, 0.3);
}), te = d(([e]) => {
  const t = y(u.normalEpsilon), n = G(t, 0);
  return S(
    a(
      g(e.add(n.xyy)).sub(g(e.sub(n.xyy))),
      g(e.add(n.yxy)).sub(g(e.sub(n.yxy))),
      g(e.add(n.yyx)).sub(g(e.sub(n.yyx)))
    )
  );
}), oe = d(([e, t]) => {
  const n = te(t), o = S(e.sub(t)), s = a(1), r = S(a(1, 1, 1)), m = a(...b.lightColor), i = w(0, A(r, n)).mul(m), f = n.y.mul(0.5).add(0.5), c = M(a(...b.groundColor), a(...b.skyColor), f), l = S(H(r.negate(), n)), v = w(0, A(o, l)).pow(32), p = a(v).toVar(), E = y(1).sub(w(0, A(o, n))).pow(2);
  p.mulAssign(E);
  const P = s.mul(C.ambient).toVar();
  P.addAssign(i.mul(C.diffuse)), P.addAssign(c.mul(C.hemi));
  const L = a(...b.albedo).mul(P).toVar();
  return L.addAssign(p.mul(a(...b.specularTint)).mul(C.specular)), L;
}), se = d(([e]) => {
  const t = B(e.x.mul(0.95).sub(e.y.mul(0.25)).add(0.15), 0, 1);
  return M(a(...b.bgFloor), a(...b.bgPeak), D(0, 1, t));
}), ae = d(() => {
  const e = R().mul(x.xy).mul(2).sub(x.xy).div(x.y).div(u.zoom), t = a(0, 0, -3), n = a(e, 1).normalize(), o = y(0).toVar(), s = t.add(n.mul(o)).toVar(), r = y(0).toVar(), m = y(1e5).toVar();
  O({ start: 1, end: u.steps }, () => {
    const l = g(s);
    m.assign(V(m, w(l, 0))), _(l.lessThan(T), () => {
      r.assign(1), k();
    }), o.addAssign(l.mul(0.8)), s.assign(t.add(n.mul(o))), _(o.greaterThan(50), () => {
      k();
    });
  });
  const h = y(1).sub(D(T, u.edgeSoftness, m)), i = B(w(r, h), 0, 1), f = M(se(R()), oe(t, s), i), c = ee(R().mul(x.xy)).sub(0.5).mul(u.ditherAmount);
  return Y(f.add(c), 1);
});
async function re() {
  if (typeof navigator > "u" || !navigator.gpu) return !1;
  try {
    return !!await navigator.gpu.requestAdapter();
  } catch {
    return !1;
  }
}
function ie() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return !1;
  }
}
function ce() {
  const e = new Z();
  return e.transparent = !1, e.colorNode = ae().rgb, e;
}
async function le(e, t = {}) {
  const n = window.matchMedia?.("(prefers-reduced-motion: reduce)"), o = await re();
  if (!o && !ie())
    throw new Error("neither WebGPU nor WebGL2 is available");
  const s = new q({
    canvas: e,
    antialias: !0,
    alpha: !0,
    forceWebGL: !o
  });
  s.toneMapping = K, s.outputColorSpace = U, s.setClearColor(0, 0), await s.init();
  const r = new Q(), m = new j(-1, 1, 1, -1, 0, 1);
  r.add(new J(new X(2, 2), ce()));
  const h = () => {
    const p = t.resolutionScale ?? u.resolutionScale, E = t.maxPixelRatio ?? u.maxPixelRatio;
    s.setPixelRatio(Math.min(window.devicePixelRatio || 1, E) / p), s.setSize(window.innerWidth, window.innerHeight, !1);
  };
  let i = !1;
  const f = () => s.render(r, m), c = () => {
    i && (i = !1, s.setAnimationLoop(null));
  }, l = () => {
    i || (i = !0, s.setAnimationLoop(f));
  }, v = () => {
    n?.matches ? (c(), f()) : document.hidden || l();
  };
  if (h(), window.addEventListener("resize", h, { passive: !0 }), document.addEventListener("visibilitychange", () => {
    document.hidden ? c() : v();
  }), n) {
    const p = () => v();
    n.addEventListener?.("change", p);
  }
  return v(), {
    renderer: s,
    backend: o ? "webgpu" : "webgl2",
    start: l,
    stop: c,
    dispose: () => {
      c(), window.removeEventListener("resize", h), s.dispose?.();
    }
  };
}
async function de(e = "#raymarch-bg", t = {}) {
  const n = typeof e == "string" ? document.querySelector(e) : e;
  if (!n) return null;
  try {
    const o = await le(n, t);
    return n.dataset.backend = o.backend, window.__RAYMARCH_BACKEND__ = o.backend, o;
  } catch (o) {
    return n.remove(), window.__RAYMARCH_BACKEND__ = "unavailable", t.debug && console.warn("[raymarch-bg] disabled:", o), null;
  }
}
export {
  u as CONFIG,
  C as INTENSITY,
  b as PALETTE,
  de as default,
  le as initRaymarchBackground,
  de as mountRaymarchBackground
};
