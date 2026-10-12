/* DawnSky: the painted dawn (2026-10-10), drawn by one fragment shader. On Home it paints the hero (the night sky with its
   wisps, the gold breaking at a horizon 40px under the pill, a sea painted in the sky's own strokes); on every page with
   the footer it paints .page-end (the same sky, no sea, the dawn just under the page's bottom edge). ChatGPT painted the
   reference; the story is in .claude/notes/hero.md and footer.md.
   window.DawnSky.mount(container, opts) -> { destroy(), frame(t) }
   opts: { time: freeze at this time (one frame, no loop), pointer: [nx, ny] fixed, scroll: a number or a function for
           the scroll progress, horizon: a number or a function (where the horizon sits, a share of the height from the
           top; above 1 is under the bottom edge), footer: true for the footer's mode, scale: backing scale (default 0.5),
           fade: ms for the canvas to fade in on its first painted frame, onDrawn(), onFail(): called when the painting
           cannot run (no WebGL, a shader error, a context lost for good), so the page can put its own light back,
           scene: 'sunrise' (the hero and the footer since 2026-10-11), 'hillsSoft' (the same hills at blue hour, ?look=bluehour),
           'hills' (with the anime clouds, ?look=anime) or 'sea' (the fallback scene) } */
(function () {
  'use strict';

  var VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  var FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uHorizon;                       // where the horizon sits, as a share of the height from the top
uniform float uFoot;                          // 1 in the footer: the page's black fades in at the top, nothing at the foot

const float H0 = 0.545;                       // the reference's horizon, fraction of height from the top
const vec3 BG = vec3(9.0, 10.0, 14.0) / 255.0;
const float SEA_FLOW = 0.05;                   // how fast the strokes on the water drift in
// per user "overall need to be darker. otherwise we can not see the text" (0.72), then raised again once the type sat on
// the night blue (the horizon under the pill): the whole hero at a lower exposure, same hues, the sea lower still
const float EXPOSURE = 0.88, SEA_EXPOSURE = 0.85;

float h11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
vec2 h21(float p){ vec3 q = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973)); q += dot(q, q.yzx + 33.33); return fract((q.xx + q.yz) * q.zy); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), u.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float vnoise1(float x){ float i = floor(x); float f = fract(x); return mix(h11(i), h11(i + 1.0), f * f * (3.0 - 2.0 * f)); }
const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
// each call below is one fbm evaluation
float fbm5(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = ROT * p + vec2(1.7, 9.2); a *= 0.5; } return s; }
float fbm4(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = ROT * p + vec2(1.7, 9.2); a *= 0.5; } return s; }

// sky colour by t: height above the horizon, pushed up away from the sun (fitted to the painting)
vec3 skyRamp(float t){
  vec3 c = vec3(245.0, 150.0, 112.0);
  c = mix(c, vec3(194.0, 102.0, 95.0), clamp(t / 0.025, 0.0, 1.0));
  c = mix(c, vec3(188.0, 112.0, 105.0), clamp((t - 0.025) / 0.035, 0.0, 1.0));
  c = mix(c, vec3(160.0, 106.0, 121.0), clamp((t - 0.06) / 0.04, 0.0, 1.0));
  c = mix(c, vec3(119.0, 101.0, 139.0), clamp((t - 0.10) / 0.05, 0.0, 1.0));
  c = mix(c, vec3(89.0, 93.0, 149.0), clamp((t - 0.15) / 0.05, 0.0, 1.0));
  c = mix(c, vec3(62.0, 80.0, 144.0), clamp((t - 0.20) / 0.06, 0.0, 1.0));
  c = mix(c, vec3(42.0, 64.0, 128.0), clamp((t - 0.26) / 0.07, 0.0, 1.0));
  c = mix(c, vec3(24.0, 46.0, 103.0), clamp((t - 0.33) / 0.09, 0.0, 1.0));
  c = mix(c, vec3(15.0, 32.0, 75.0), clamp((t - 0.42) / 0.13, 0.0, 1.0));
  return c / 255.0;
}

// the sky (without the wisps) at a point h above the horizon, for the sea's reflections; the same formulas as main()
vec3 skyAt(float X, float h, float sunX, float sunH, float sc, float gain){
  float dx = X - sunX;
  float hs0 = h - clamp(h, 0.0075, sunH);
  float tt = (max(h, 0.0) + 0.05 * dx * dx) * (1.0 - 0.15 * sc);
  vec3 sky = skyRamp(tt);
  float gsx = 0.45 * (1.0 + 0.4 * sc); float gsy = 0.18 * (1.0 + 0.4 * sc);
  float glow = exp(-(dx * dx) / (gsx * gsx) - (hs0 * hs0) / (gsy * gsy)) * gain;
  vec3 glowCol = mix(vec3(76.0, 67.0, 35.0), vec3(84.0, 74.0, 26.0), sc) / 255.0;
  sky += glowCol * glow;
  float core = exp(-(dx * dx) / 0.0225 - (hs0 * hs0) / 0.000625) * gain;
  sky += vec3(0.0, 50.0, 8.0) / 255.0 * core;
  return min(sky, vec3(1.0));
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  float asp = uRes.x / uRes.y;
  float u = fc.x / uRes.x;
  float v = 1.0 - fc.y / uRes.y;
  float vPage = v;                            // the frame's own height, for meeting the page
  // per user "put them in the dark part so we can raise the brightness a little": the type stays, the whole scene
  // slides down until the horizon sits under the pill, so the heading, sub and pill are all on the night blue
  v -= uHorizon - H0;
  float X = (u - 0.5) * asp;                  // height units, centred
  float px = 1.0 / uRes.y;
  float t = uTime;
  vec2 P = uPointer;
  float sc = clamp(uScroll, 0.0, 1.0);

  // the sun: leans toward the pointer (about 4% of the width), rises a little with scroll
  float sunX = (0.068 + P.x * 0.08) * asp;
  float sunH = 0.0075 + 0.035 * sc;
  float h = H0 - v;
  float dx = X - sunX;
  float hs0 = h - clamp(h, 0.0075, sunH);      // distance to the path the sun has risen along, so the glow only grows
  float breath = 1.0 + 0.035 * sin(t * 0.21);
  float gain = (1.0 + 0.07 * min(length(P) * 2.0, 1.0)) * breath;

  // ---- sky
  float tt = (max(h, 0.0) + 0.05 * dx * dx) * (1.0 - 0.15 * sc);
  vec3 sky = skyRamp(tt);
  // the footer's long smooth stretch shows each straight-line step of the ramp as a dark line (a Mach band): there the
  // ramp is softened over its neighbours; the hero keeps it exactly
  if (uFoot > 0.5) sky = (skyRamp(tt - 0.06) + skyRamp(tt - 0.03) + sky + skyRamp(tt + 0.03) + skyRamp(tt + 0.06)) * 0.2;
  float gsx = 0.45 * (1.0 + 0.4 * sc); float gsy = 0.18 * (1.0 + 0.4 * sc);
  float glow = exp(-(dx * dx) / (gsx * gsx) - (hs0 * hs0) / (gsy * gsy)) * gain;
  vec3 glowCol = mix(vec3(76.0, 67.0, 35.0), vec3(84.0, 74.0, 26.0), sc) / 255.0;
  sky += glowCol * glow;
  float core = exp(-(dx * dx) / 0.0225 - (hs0 * hs0) / 0.000625) * gain;
  sky += vec3(0.0, 50.0, 8.0) / 255.0 * core;
  sky = min(sky, vec3(1.0));

  // ---- high wisps: two fbm, upper sky only, placed where the painting has them
  if (v < 0.5){
    float c = v + 0.22 * X * X;                // arcs that bow toward the horizon
    float mA = exp(-pow((c - 0.262) / 0.05, 2.0)) * smoothstep(-1.3, -0.9, X) * (1.0 - smoothstep(-0.25, 0.0, X));
    float mB = exp(-pow((c - 0.455) / 0.032, 2.0)) * (1.0 - smoothstep(-0.6, -0.38, X));
    float mC = exp(-pow((c - 0.425) / 0.048, 2.0)) * smoothstep(0.2, 0.4, X)
             + 0.5 * exp(-pow((c - 0.535) / 0.026, 2.0)) * smoothstep(0.42, 0.62, X);
    float mD = exp(-pow((c - 0.185) / 0.035, 2.0)) * smoothstep(0.55, 0.72, X);
    float mE = exp(-pow((c - 0.29) / 0.02, 2.0)) * smoothstep(0.38, 0.46, X) * (1.0 - smoothstep(0.64, 0.72, X));
    float m = clamp(mA + mB + mC + 0.8 * mD + 0.7 * mE, 0.0, 1.0);
    // in the footer the wisps keep to the band round "Say hello": out of the whale's dark band and the bar's strip
    if (uFoot > 0.5) m *= smoothstep(0.42, 0.6, vPage) * (1.0 - smoothstep(0.84, 0.9, vPage));
    if (m > 0.02){
      float cl = vnoise(vec2(X * 3.6 + t * 0.002, c * 13.0));
      float veil = m * smoothstep(0.1, 0.6, cl);
      m *= smoothstep(0.18, 0.5, cl);
      vec2 q = vec2((X - P.x * 0.01) * 8.5 + t * 0.003, c * 38.0);
      q.y += 1.0 * sin(X * 2.2 + c * 7.0) + cl * 1.2;
      float n = fbm5(q);
      float nUp = fbm5(q - vec2(0.0, 0.5));
      float th = 0.62 - 0.22 * m;
      float gate = smoothstep(0.02, 0.3, m);
      float d = smoothstep(th, th + 0.14, n) * gate;
      float dUp = smoothstep(th, th + 0.14, nUp) * gate;
      float litF = clamp(0.3 + (dUp - d) * 2.4, 0.0, 1.0);
      float warm = smoothstep(0.05, 0.45, v);
      vec3 body = mix(vec3(0.19, 0.20, 0.44), vec3(0.29, 0.27, 0.53), warm);
      vec3 litC = mix(vec3(0.80, 0.44, 0.50), vec3(0.96, 0.52, 0.44), warm);
      sky = mix(sky, mix(sky, body, 0.6) + vec3(0.02, 0.0, 0.02), veil * 0.35);
      sky = mix(sky, mix(body, litC, litF), d * 0.85);
    }
  }

  // ---- thin strata in the glow above the horizon: two fbm
  if (v > 0.42 && v < 0.545){
    float cs = v + 0.04 * X * X;
    float band = smoothstep(0.43, 0.49, v) * (1.0 - smoothstep(0.527, 0.536, v));
    band *= 1.0 - 0.75 * exp(-dx * dx / 0.035) * smoothstep(0.47, 0.52, v);
    if (uFoot > 0.5) band *= 1.0 - smoothstep(0.84, 0.9, vPage);   // the footer's bar strip stays clear
    if (band > 0.01){
      vec2 q = vec2((X - P.x * 0.005) * 10.0 + t * 0.0012, cs * 85.0);
      band *= smoothstep(0.1, 0.5, vnoise(vec2(X * 3.0 + t * 0.001, cs * 22.0)));
      float n = fbm4(q);
      float nUp = fbm4(q - vec2(0.0, 0.6));
      float d = smoothstep(0.62 - 0.14 * band, 0.70 - 0.14 * band, n) * smoothstep(0.0, 0.25, band);
      float dUp = smoothstep(0.62 - 0.14 * band, 0.70 - 0.14 * band, nUp) * smoothstep(0.0, 0.25, band);
      float litF = clamp(0.4 + (dUp - d) * 2.0, 0.0, 1.0);
      vec3 body = sky * vec3(0.70, 0.58, 0.82) + vec3(0.03, 0.01, 0.06);
      vec3 litC = min(sky * vec3(1.06, 0.98, 0.96) + vec3(0.06, 0.02, 0.02), vec3(1.0));
      sky = mix(sky, mix(body, litC, litF), d * 0.85);
    }
  }

  // ---- the sea, painted like the sky (per user "we need to make the real sea", then "the sea does not need to be that
  // realistic. It need to match the sky's visual style"): the sky mirrored and darkened, with horizontal brush strokes
  // drawn as the wisps are (a thresholded fbm, two tones and a lit edge), fine and packed at the horizon, longer and
  // sparser toward the eye. No path of sun glitter (per user "no need the light is beaming").
  vec3 col = sky;
  if (v > H0){
    float d = v - H0 + 0.0004;
    float z = 1.0 / d;                                      // distance on the water: strokes shrink and flatten with it
    vec3 water = skyAt(X, d * 1.6 + 0.004, sunX, sunH, sc, gain) * mix(0.5, 0.95, exp(-d / 0.035));
    water = mix(water, vec3(0.035, 0.04, 0.10), smoothstep(0.02, 0.28, d));
    float near = smoothstep(0.004, 0.05, d);               // too far to draw a stroke: the water is a smooth mirror there
    vec2 q = vec2((X * z - P.x * 0.25) * 0.55 - t * 0.012, z * 2.2 + t * SEA_FLOW);
    float m = smoothstep(0.25, 0.7, vnoise(vec2(q.x * 0.35, q.y * 0.5)));   // strokes come in loose groups
    float n = fbm5(q);
    float nUp = fbm5(q + vec2(0.0, 0.35));                  // one step toward the horizon, for the lit edge
    float th = 0.66 - 0.12 * m;
    float dS = smoothstep(th, th + 0.08, n) * near * m;
    float dU = smoothstep(th, th + 0.08, nUp) * near * m;
    float litF = clamp(0.35 + (dU - dS) * 2.4, 0.0, 1.0);
    vec3 hzC = skyAt(X, 0.012, sunX, sunH, sc, gain);       // a stroke catches the colour of the sky at the horizon
    vec3 body = mix(water, hzC, 0.28) * 0.9;
    vec3 litC = mix(hzC, water, smoothstep(0.05, 0.3, d)) * 0.95;
    vec3 c = mix(water, mix(body, litC, litF), dS * 0.8);
    // dimmed gold reads brown: on the water, warm darks pass through rose instead (as the hero's dawn darkens through
    // a richer neighbour), and blue water is left alone
    float lumC = dot(c, vec3(0.30, 0.59, 0.11));
    c = mix(c, vec3(1.0, 0.52, 0.80) * lumC * 1.15, 0.7 * smoothstep(0.0, 0.18, c.r - c.b));
    c *= SEA_EXPOSURE;
    col = mix(sky, c, smoothstep(0.0, 1.2 * px, v - H0));
  }

  col *= EXPOSURE;
  // a darkened pale yellow reads olive: the brightest yellows (the sun's core) turn gold as they darken
  float hiY = smoothstep(0.35, 0.72, max(col.r, col.g)) * smoothstep(0.72, 0.98, col.g / max(col.r, 1e-3));
  col.g *= 1.0 - 0.2 * hiY;
  col.b *= 1.0 - 0.38 * hiY;
  // ---- meet the page: exactly #090a0e at the foot
  // the footer (per user "change the footer to match the hero's style") rises out of the page's black at its top and
  // runs to the page's bottom edge; the hero meets the page at its foot
  // (the fade runs on into the sky's own gradient: ending before it began left a flat band that read as a dark stripe)
  if (uFoot > 0.5) col = mix(BG, col, smoothstep(0.0, 0.7, vPage));
  else col = mix(col, BG, smoothstep(max(0.80, uHorizon + 0.03), 0.985, vPage));
  float dith = (h12(fc + fract(t * 0.61) * 37.0) - 0.5) / 255.0;
  col += dith * max(uFoot, 1.0 - step(0.985, vPage));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

  // ---- HILLS (2026-10-10, the hero since he said "use hills"): ChatGPT's second dawn, rolling hills with valley mist and a
  // swaying grass fringe, authored in design pixels (a 1440 x 800 frame, y down). It slides down so its horizon sits under
  // the pill (uHorizon) and runs at 0.8 exposure, per user "make the text contrast better"; its wind gusts every 5s, every
  // blade flutters and the tips catch the light as they bend, per user "how to make the grass to be more obvious to be
  // shaken by wind?" (taller grass, tried next, was "too much"). The story is in .claude/notes/hero.md.
  var FRAG_HILLS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uPointer;",
    "uniform float uScroll;",
    "uniform float uHorizon;                       // where the horizon goes, a share of the height (0 keeps the painting's)",
    "uniform float uFoot;                          // 1 in the footer: the sky alone, out of the page's black at the top",
    "#define C(r,g,b) (vec3(r,g,b)*(1.0/255.0))",
    "const vec3 PAGE = vec3(9.0, 10.0, 14.0)/255.0;",
    "",
    "// ---- hashes and value noise ----",
    "float hash11(float p){ p = fract(p*0.1031); p *= p + 33.33; p *= p + p; return fract(p); }",
    "float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }",
    "vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz)*p3.zy); }",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "vec2 vnoise2(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash22(i), hash22(i + vec2(1.0, 0.0)), u.x), mix(hash22(i + vec2(0.0, 1.0)), hash22(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float noise1(float x){ float i = floor(x); float f = fract(x); return mix(hash11(i), hash11(i + 1.0), f*f*(3.0 - 2.0*f)); }",
    "const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);",
    "// fbm budget per pixel: clouds = fbm3v (3-octave domain warp) + 2 x fbmCl (5 octaves each: the shape, and the shape",
    "// sampled toward the sun for the lit undersides), only inside a cloud-bank mask and above y 500;",
    "// distant land = 1 x fbm4 (4 octaves, the mist), only for y > 440 above the opaque grass body.",
    "// At most 4 fbm evaluations on a pixel (clouds over the land, y 440-500), 17 value-noise octaves. Open sky: 0.",
    "// cloud fbm, 5 value-noise octaves in all: 4 of rounded puffs (gain 0.5) and 1 long streak along the bank",
    "float fbmCl(vec2 q, float sa){",
    "  float s = 0.0; float a = 0.5; vec2 p = q;",
    "  for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2); a *= 0.5; }",
    "  return s/0.9375 + sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "}",
    "// the cloud deck in soft perspective: puffs flatten toward the horizon (vertical only, so nothing skews), and the deck",
    "// curves up toward both corners around the sun (S(x) = -90 log cosh((973 - x)/300))",
    "vec2 deckQ(vec2 cp, float t){",
    "  float d = 860.0 - cp.y;",
    "  float sa = clamp((973.0 - cp.x)/300.0, -6.0, 6.0);",
    "  float shear = -90.0*log(0.5*(exp(sa) + exp(-sa)));",
    "  return vec2((cp.x - 973.0)/40.0 - t*0.055, 17400.0/d - shear/20.0);",
    "}",
    "// the hero's cloud field, or in the footer the same paint at a larger scale, somewhere else in the noise",
    "vec2 cloudQ(vec2 p, float t){",
    "  vec2 q = deckQ(p, t);",
    "  return uFoot > 0.5 ? q*0.8 + vec2(23.7, 5.3) : q;",
    "}",
    "float fbm4(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.03 + vec2(4.1, 2.7); a *= 0.5; } return s/0.9375; }",
    "vec2 fbm3v(vec2 p){ vec2 s = vec2(0.0); float a = 0.5; for (int i = 0; i < 3; i++){ s += a*vnoise2(p); p = ROT*p*2.07 + vec2(3.1, 1.3); a *= 0.5; } return s/0.875; }",
    "",
    "float bump(float x, float c, float w, float h){ float d = (x - c)/w; return h*exp(-d*d); }",
    "// linear segment: the sky ramp keeps a constant slope between stops (smoothstep flattens at each stop and bands)",
    "float ramp(float a, float b, float x){ return clamp((x - a)/(b - a), 0.0, 1.0); }",
    "float gauss(float x, float c, float w){ float d = (x - c)/w; return exp(-d*d); }",
    "float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0); return length(pa - ba*h); }",
    "float segM(vec2 p, vec2 a, vec2 b, float r){ return 1.0 - smoothstep(r*0.4, r, segD(p, a, b)); }",
    "",
    "// ---- wind: a slow breeze, and a gust every 5s that travels left to right across the hill (per user \"how to make the grass",
    "// to be more obvious to be shaken by wind?\": gusts twice as strong and more often, every blade fluttering, tips lit as they bend) ----",
    "float gust(float x, float t, float j){",
    "  float gx = -700.0 + (t - j*5.0)*380.0;",
    "  float d = x - gx;",
    "  float w = d > 0.0 ? 240.0 : 560.0;",
    "  return exp(-(d*d)/(w*w))*(0.7 + 0.6*hash11(j*3.17 + 1.3));",
    "}",
    "float wind(float x, float t){",
    "  float k = floor(t/5.0);",
    "  float g = gust(x, t, k) + gust(x, t, k - 1.0) + gust(x, t, k - 2.0) + gust(x, t, k - 3.0);",
    "  float n = noise1(x*0.0035 - t*0.30);",
    "  return 0.04 + 0.08*n + 0.36*g;",
    "}",
    "",
    "// ---- landforms (design px, y down) ----",
    "float ridgeFar(float x){",
    "  // fitted to the painting's far line: two peaks left of the sun, a low saddle at the sun, a peak far right",
    "  float y = 495.0 - bump(x, 390.0, 45.0, 12.0) - bump(x, 590.0, 45.0, 4.0) - bump(x, 450.0, 160.0, 2.2) + bump(x, 800.0, 140.0, 12.0)",
    "          + bump(x, 975.0, 60.0, 4.0) + bump(x, 1060.0, 60.0, 7.8) + bump(x, 1200.0, 160.0, 2.2) - bump(x, 1290.0, 40.0, 13.5)",
    "          - bump(x, 1420.0, 80.0, 8.0) - bump(x, 120.0, 140.0, 6.0);",
    "  return y + (noise1(x*0.018) - 0.5)*4.0 + (noise1(x*0.07) - 0.5)*1.4;",
    "}",
    "float softplus(float z){ return z > 12.0 ? z : log(1.0 + exp(z)); }",
    "// the long lit slope that runs from behind the grass down into the valley, its top edge carrying the tree line",
    "float slopeTop(float x){ return 516.0 + 16.0*softplus((x - 620.0)/100.0) + (noise1(x*0.010 + 7.0) - 0.5)*7.0 + (noise1(x*0.04) - 0.5)*2.0; }",
    "// the dark wooded hill on the left, behind the slope",
    "float hillL(float x){ return 463.0 + 0.085*x + 6.0e-5*x*x - bump(x, 680.0, 110.0, 22.0) + (noise1(x*0.012 + 3.0) - 0.5)*8.0 + (noise1(x*0.045) - 0.5)*2.5; }",
    "float crestG(float x){",
    "  float y = 532.0 + 0.092*x + 6.0e-6*x*x;",
    "  return y + (noise1(x*0.010 + 7.0) - 0.5)*9.0 + (noise1(x*0.04) - 0.5)*3.0;",
    "}",
    "",
    "// a tree canopy above a ridge: overlapping domes whose size follows a clump mask (1D, cheap)",
    "float canopy(float x, float cell, float seed, float rMax, float clump){",
    "  float hgt = 0.0;",
    "  float ci = floor(x/cell);",
    "  for (int j = -2; j <= 2; j++){",
    "    float id = ci + float(j);",
    "    vec2 h = hash22(vec2(id, seed));",
    "    float r = rMax*(0.22 + 0.78*h.y*h.y)*clump;",
    "    float dxx = x - (id + h.x)*cell;",
    "    float d2 = r*r - dxx*dxx;",
    "    float lift = (fract(h.y*9.7) - 0.35)*r*0.6;",
    "    if (d2 > 0.0) hgt = max(hgt, sqrt(d2)*0.85 + lift);",
    "  }",
    "  return hgt;",
    "}",
    "float clumps(float x, float seed, float fill){ return smoothstep(0.62 - fill, 0.86 - fill, noise1(x*0.03 + seed))*(0.4 + 0.6*noise1(x*0.11 + seed*3.0)); }",
    "",
    "// one hill layer behind the mist: body, a fringe of small trees, its foot dissolving into mist",
    "vec3 hillLayer(vec3 col, vec2 p, float top, vec3 c, vec3 mist, float mistAmt, float tSeed, float tDens, float tR, float aa, float wv){",
    "  float cn = canopy(p.x, tR*1.15, tSeed, tR*1.25, clumps(p.x, tSeed, tDens));",
    "  float inside = smoothstep(top - cn, top - cn + aa, p.y);",
    "  // the foot dissolves into mist, unevenly: the drifting mist noise lifts and lowers the fog line",
    "  float fogLine = top + 8.0 + 26.0*(1.0 - wv);",
    "  vec3 cc = mix(c, mist, smoothstep(fogLine, fogLine + 34.0, p.y)*mistAmt*(0.55 + 0.6*wv));",
    "  return mix(col, cc, inside);",
    "}",
    "",
    "#ifdef SOFT_CLOUDS",
    "// SOFT HELPERS for ?look=clouds: the hero's bank mask again (the same segments as in main()), to look toward the light",
    "float bankMask(vec2 cp){",
    "  float m = 0.0;",
    "  m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "  m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "  m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "  m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "  m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "  m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "  m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "  m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "  m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "  m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "  return m;",
    "}",
    "// the cloud's threshold for a mask value",
    "float softTh(float m){ return mix(0.80, 0.30, smoothstep(0.0, 0.8, m)); }",
    "// a cheap look at the density: only the shape's first octave (one value noise), the billows at their mean and the long",
    "// streak st taken from the point itself (it barely changes over a few dozen px)",
    "float softLo(vec2 q, float st){ return 0.51*vnoise(ROT*q) + 0.265 + st; }",
    "// the soft clouds' own noise space: the deck's, with the puffs larger and taller (rounder heaps, flatter only near the",
    "// horizon) and about a third of its curl toward the corners (the full curl slants the lumps into ledges there)",
    "vec2 softQ(vec2 p, float t){",
    "  float sx = clamp((973.0 - p.x)/300.0, -6.0, 6.0);",
    "  float uncurl = -0.65*(-90.0*log(0.5*(exp(sx) + exp(-sx))))/20.0;   // deckQ's shear term, about two thirds taken back",
    "  return (cloudQ(p, t) - vec2(0.0, uncurl*(uFoot > 0.5 ? 0.8 : 1.0)))*vec2(0.8, 0.64);",
    "}",
    "// the soft clouds' density, 5 value-noise octaves like fbmCl: one smooth octave for the heaps, then three billow octaves",
    "// (round bumps, softly creased between) for the cauliflower on them, and the long streak (st, returned); lo is the",
    "// heap alone (the billows at their mean), dm the shape without its finest octave (at its mean)",
    "float softD(vec2 q, float sa, out float st, out float lo, out float dm){",
    "  vec2 p = ROT*q;",
    "  float s = 0.5*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  st = sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "  lo = s/0.98 + 0.265 + st;",
    "  float v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  float b = 0.26*sqrt(v*v + 0.12);                           // a softened abs: round bumps, soft creases",
    "  v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  b += 0.15*sqrt(v*v + 0.08);",
    "  dm = (s + b)/0.98 + 0.052 + st;",
    "  v = 2.0*vnoise(p) - 1.0;",
    "  b += 0.07*sqrt(v*v + 0.05);",
    "  return (s + b)/0.98 + 0.02 + st;",
    "}",
    "#endif",
    "#ifdef SOFT_CLOUDS",
    "uniform float uMask;                          // 1: draw the cloud cover instead of the scene, for the page's stars",
    "float gCloud = 0.0;",
    "#endif",
    "void main(){",
    "  vec2 fc = gl_FragCoord.xy;",
    "  float aspect = uRes.x/uRes.y;",
    "  float k = 800.0/uRes.y;                       // design px per backing px",
    "  float cx = 720.0 + 220.0*clamp((1.6 - aspect)/1.0, 0.0, 1.0);",
    "  vec2 P = vec2((fc.x - 0.5*uRes.x)*k + cx, (uRes.y - fc.y)*k);",
    "  float t = uTime;",
    "  vec2 ptr = uPointer;",
    "  float sc = clamp(uScroll, 0.0, 1.0);",
    "  vec2 PAR = vec2(-48.0, -16.0)*ptr;            // nearest layer: +-24px x, +-8px y",
    "  vec2 PARL = vec2(0.0);                        // the land stays still under the cursor (per user \"do not let the hills shaking with the cursor\")",
    "  if (P.y >= 788.0 && uFoot < 0.5) { gl_FragColor = vec4(PAGE, 1.0); return; }",
    "  float Ppage = P.y;                            // the frame's own height, for meeting the page",
    "  // per user \"make the text contrast better\": the scene slides down until the dawn's horizon sits under the pill",
    "  if (uHorizon > 0.0) P.y -= uHorizon*800.0 - 497.0;",
    "  vec2 pg = P + PARL;",
    "  float cg = crestG(pg.x);",
    "",
    "  // ---- sky ----",
    "  vec2 sun = vec2(973.0 + ptr.x*115.0, 526.0 - 44.0*sc);",
    "  vec2 sunU = vec2(973.0/1440.0 - 0.5, 500.0/800.0 - 0.5);",
    "  float lift = 1.0 + 0.08*(1.0 - smoothstep(0.0, 0.7, length(ptr - sunU))) + 0.25*sc;",
    "  vec2 ps = P + PAR*0.05;",
    "  float y = ps.y;",
    "  vec3 sky = C(17.0, 40.0, 78.0);",
    "  sky = mix(sky, C(21.0, 44.0, 85.0),   ramp(0.0, 50.0, y));",
    "  sky = mix(sky, C(28.0, 52.0, 94.0),   ramp(50.0, 100.0, y));",
    "  sky = mix(sky, C(40.0, 63.0, 104.0),  ramp(100.0, 150.0, y));",
    "  sky = mix(sky, C(55.0, 75.0, 116.0),  ramp(150.0, 200.0, y));",
    "  sky = mix(sky, C(69.0, 84.0, 124.0),  ramp(200.0, 240.0, y));",
    "  sky = mix(sky, C(88.0, 95.0, 131.0),  ramp(240.0, 280.0, y));",
    "  sky = mix(sky, C(108.0, 103.0, 138.0), ramp(280.0, 320.0, y));",
    "  sky = mix(sky, C(130.0, 110.0, 140.0), ramp(320.0, 350.0, y));",
    "  sky = mix(sky, C(148.0, 114.0, 136.0), ramp(350.0, 380.0, y));",
    "  sky = mix(sky, C(170.0, 119.0, 128.0), ramp(380.0, 410.0, y));",
    "  sky = mix(sky, C(189.0, 124.0, 119.0), ramp(410.0, 440.0, y));",
    "  sky = mix(sky, C(204.0, 125.0, 112.0), ramp(440.0, 470.0, y));",
    "  sky = mix(sky, C(214.0, 127.0, 108.0), ramp(470.0, 510.0, y));",
    "  sky += C(4.0, 8.0, 12.0)*smoothstep(300.0, 1440.0, ps.x)*(1.0 - smoothstep(0.0, 260.0, y));",
    "  sky = mix(sky, sky + C(14.0, 18.0, 22.0), sc*(1.0 - smoothstep(150.0, 500.0, y)));",
    "  float dx = ps.x - sun.x;",
    "  float dyUp = max(sun.y - 27.0 - y, 0.0);",
    "  float sgx = (dx > 0.0 ? 1050.0 : 600.0)*(1.0 + 0.35*sc);",
    "  float sgy = dx > 0.0 ? mix(165.0, 180.0, smoothstep(0.0, 250.0, dx)) : mix(165.0, 132.0, smoothstep(0.0, 300.0, -dx));",
    "  float halo = 0.68*exp(-(dx*dx)/(sgx*sgx) - (dyUp*dyUp)/(sgy*sgy*(1.0 + 0.6*sc)));",
    "  sky = mix(sky, C(248.0, 168.0, 118.0), clamp(halo*lift, 0.0, 0.92));",
    "  // the gold core rises with the sun; below its centre it falls off slowly, so rising never takes light away",
    "  float dyc = y - (sun.y - 29.0);",
    "  dyc = dyc > 0.0 ? dyc*(1.0 - 0.7*sc) : dyc;",
    "  float core = 0.84*exp(-(dx*dx)/(175.0*175.0*(1.0 + 0.5*sc)) - (dyc*dyc)/(38.0*38.0*(1.0 + 0.9*sc)));",
    "  sky = mix(sky, C(255.0, 208.0, 128.0), clamp(core*lift, 0.0, 0.95));",
    "  sky = mix(sky, C(250.0, 176.0, 122.0), 0.22*gauss(dx, 0.0, 260.0)*gauss(y, 425.0, 45.0)*lift);",
    "  // the hot spot where the sun breaks; as it rises the glow on the far line stays, so nothing gets darker",
    "  float spotR = y - 497.0 + 44.0*sc;",
    "  float spot = exp(-(dx*dx)/(36.0*36.0))*max(exp(-spotR*spotR/100.0), exp(-(y - 497.0)*(y - 497.0)/100.0));",
    "  sky = mix(sky, C(255.0, 232.0, 176.0), clamp(spot*0.6*lift, 0.0, 0.8));",
    "  float disc = 1.0 - smoothstep(11.0, 20.0, length(ps - sun));",
    "  sky = mix(sky, C(255.0, 236.0, 192.0), disc);",
    "  vec3 col = sky;",
    "  float nearSun = exp(-(dx*dx)/(420.0*420.0));",
    "",
    "  // ---- clouds: banks of rounded puffs, each puff lit on its underside toward the sun ----",
    "  if (y < 500.0) {",
    "    vec2 cp = P + PAR*0.06;",
    "    // bank masks traced from the painting: three diagonal bands on the left, a rising band and a heavy mass on the right",
    "    float m = 0.0;",
    "    m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "    m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "    m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "    m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "    m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "    m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "    m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "    m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "    m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "    m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "    // the footer has its own clouds (per user \"do not you feel the footer's design elements are too repetitive with the",
    "    // hero? at last the cloud need to have the different shape\", then \"the cloud shape and distribution is too ugly\" of",
    "    // long streaks): two soft heaps rising from the bottom corners, framing \"Say hello\";",
    "    // the whale's band stays open sky",
    "    if (uFoot > 0.5) {",
    "      vec2 fp = vec2(cp.x, Ppage);",
    "      // (then, per user, at about 60% of the size and without the two companions: the word sits in open sky between them)",
    "      m = 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(40.0, 800.0))/vec2(340.0, 150.0)));",
    "      m = max(m, 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(1420.0, 795.0))/vec2(360.0, 160.0))));",
    "      m *= smoothstep(470.0, 560.0, Ppage);",
    "    }",
    "    if (m > 0.02) {",
    "      vec2 q = cloudQ(cp, t);",
    "      vec2 w = fbm3v(q*0.42 + vec2(0.0, t*0.002));",
    "      vec2 wq = (w - 0.5)*vec2(1.0, 0.4);",
    "      float sa = mix(0.48, 0.22, smoothstep(390.0, 450.0, cp.y));",
    "      float d0 = fbmCl(q + wq, sa);",
    "      vec2 L = normalize(normalize(vec2(sun.x, 526.0) - cp) + vec2(0.0, 1.1));",
    "      float d1 = fbmCl(cloudQ(cp + L*7.0, t) + wq, sa);",
    "      float th = mix(0.80, 0.30, m);",
    "#ifdef SOFT_CLOUDS",
    "      // REAL DAWN CLOUDS (2026-10-11, per user \"the cloud looks like the anime. The rest of the element I think it is ok\"):",
    "      // the same banks in the same places, lit like the reference: each point asks how much cloud lies between it and the",
    "      // light (a full look 5px along it, cheap looks at 12, 26 and 46px; the finest grain left out so the light falls on",
    "      // lumps, not speckle), so the faces turned to the sun glow and the light fades gradually into slate bodies. The light",
    "      // comes up from the low sun onto the high clouds and down onto the crowns of the low banks; only the lower clouds",
    "      // turn warm (dusty rose, then peach), the high ones keep a cool lavender grey. A look up gives the crowns the sky's",
    "      // cool light. Heaps have crisp, lumpy outlines; thin cloud lets the sky through. Cost per cloud pixel: the warp, then",
    "      // 14 value-noise octaves (softD twice, softLo four times) against the anime's 10, and five looks at the bank mask.",
    "      vec2 wq2 = wq*0.6;",
    "      float lowW = smoothstep(220.0, 440.0, y);",
    "      vec2 Ls = normalize(vec2(sun.x, 526.0) - cp);                 // toward the sun, low on the horizon",
    "      float bankW = smoothstep(330.0, 440.0, y);                     // the low banks near the horizon",
    "      vec2 Lm = normalize(Ls + vec2(0.0, -mix(0.15, 1.25, bankW)));  // the sun's light: from below on the high clouds, onto the crowns of the low ones",
    "      float fr = 0.4*(w.x - 0.5)*(1.0 - smoothstep(0.45, 0.95, m));",
    "      float st, st1, lo0, lo1, dm0, dm1;",
    "      float th0 = softTh(m);",
    "      float e0 = softD(softQ(cp, t) + wq2, sa, st, lo0, dm0) + fr - th0;     // depth into the cloud",
    "      vec2 p1 = cp + Lm*5.0;",
    "      float th1 = softTh(uFoot > 0.5 ? m : bankMask(p1));",
    "      float e1 = softD(softQ(p1, t) + wq2, sa, st1, lo1, dm1) + fr - th1;",
    "      vec2 p2 = cp + Lm*12.0; vec2 p3 = cp + Lm*26.0; vec2 p4 = cp + Lm*46.0; vec2 pU = cp + vec2(0.0, -20.0);",
    "      float e2 = softLo(softQ(p2, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p2));",
    "      float e3 = softLo(softQ(p3, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p3));",
    "      float e4 = softLo(softQ(p4, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p4));",
    "      float eU = softLo(softQ(pU, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(pU));",
    "      float e0m = dm0 + fr - th0;                                    // the lumps without their finest grain",
    "      float e1m = dm1 + fr - th1;",
    "      // the light's path: through how much cloud (density), and, on the thin low banks, past how much cloud at all (cover)",
    "      float cover = 1.4*smoothstep(-0.02, 0.08, e1m) + 0.9*smoothstep(-0.02, 0.08, e2) + 0.5*smoothstep(-0.02, 0.08, e3);",
    "      float sunL = exp(-1.5*max(e0m, 0.0) - 2.5*max(e1m, 0.0) - 0.6*max(e2, 0.0) - 0.4*max(e3, 0.0) - 0.25*max(e4, 0.0) - 0.6*bankW*cover*(1.0 - 0.6*nearSun));",
    "      float skyL = exp(-1.5*max(e0, 0.0) - 4.0*max(eU, 0.0));       // the sky's light from above, on the crowns",
    "      float heap = lo0 + fr - th0;                                   // the heap alone: thick (cumulus) or thin (a wisp)",
    "      float eA = e0 + (e0 - heap)*smoothstep(0.3, 0.8, m)*mix(1.0, 0.25, smoothstep(0.04, 0.22, heap));   // the outline lumpy, no holes deep in a heap",
    "      float kap = mix(6.0, 60.0, smoothstep(-0.05, 0.2, heap));       // thin cloud lets the sky through; a thick heap has a crisp edge",
    "      float thick = max(smoothstep(-0.05, 0.2, heap), bankW);       // the low banks keep crisp edges",
    "      float a = smoothstep(-0.015, mix(0.1, 0.02, thick), eA)*(1.0 - exp(-kap*max(eA + 0.02, 0.0)))*smoothstep(0.03, 0.12, m);",
    "      // lighter than the sky behind them, not darker (per user \"the real dawn clouds are too dark\"): a soft blue-grey body",
    "      vec3 body = mix(C(58.0, 68.0, 100.0), C(74.0, 76.0, 104.0), smoothstep(150.0, 320.0, y));",
    "      body = mix(body, C(104.0, 88.0, 108.0), smoothstep(320.0, 450.0, y));",
    "      vec3 skyC = mix(C(84.0, 92.0, 124.0), C(128.0, 108.0, 128.0), smoothstep(200.0, 420.0, y));   // cool crowns high, mauve low",
    "      float warmW = smoothstep(150.0, 340.0, y);                     // the sun reaches the lower clouds; the high ones keep the sky's cool",
    "      vec3 halfC = mix(C(88.0, 92.0, 122.0), C(166.0, 110.0, 120.0), warmW);                     // half light: grey-blue high, rose low",
    "      vec3 sunC = mix(C(104.0, 104.0, 132.0), C(184.0, 114.0, 122.0), smoothstep(170.0, 290.0, y));   // lavender grey high, dusty rose",
    "      sunC = mix(sunC, C(228.0, 134.0, 114.0), smoothstep(280.0, 380.0, y));",
    "      sunC = mix(sunC, C(246.0, 148.0, 108.0), smoothstep(370.0, 450.0, y));",
    "      sunC = mix(sunC, C(252.0, 174.0, 124.0), nearSun*smoothstep(360.0, 460.0, y)*0.6);",
    "      float glow = (0.8 + 0.2*lift)*(1.0 + 0.25*sc);",
    "      float li = clamp(sunL*mix(0.9, 1.3 + 0.3*nearSun, lowW)*glow, 0.0, 1.0);",
    "      li = 0.18 + 0.82*li;                                            // a little less shadow (per user: \"reduce the shadow of the clouds a little. do not change the shape\")",
    "      vec3 cc = mix(body, skyC, 0.2 + skyL*0.45);",
    "      cc = mix(cc, halfC, smoothstep(0.0, 0.4, li));",
    "      cc = mix(cc, sunC, smoothstep(0.25, 0.7, li));",
    "      cc = mix(cc, col, 0.3*(1.0 - smoothstep(0.0, 0.5, li)));        // the shadowed bodies are thin: the sky shows through",
    "      vec2 cv = vec2((cp.x - 720.0)/560.0, (cp.y - 312.0)/120.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);                       // the headline keeps clear sky: wider and quieter there",
    "      float top = smoothstep(250.0, 110.0, cp.y)*(1.0 - smoothstep(700.0, 1000.0, cp.x));",
    "      col = mix(col, cc, 0.88*a*(1.0 - 0.88*top)*(1.0 - 0.65*calm));",
    "      gCloud = a;                                                   // how much cloud is here, for the stars",
    "#else",
    "      float a = smoothstep(th, th + mix(0.04, 0.018, smoothstep(380.0, 440.0, cp.y)), d0)*smoothstep(0.1, 0.4, m);",
    "      // light: full where the sample toward the sun has left the cloud, fading over the puff's body",
    "      float lit = (1.0 - smoothstep(th - 0.02, th + 0.17, d1))*smoothstep(-0.06, 0.02, d0 - d1);   // only faces turned to the sun",
    "      // the sun is level with the low cloudlets: they glow nearly whole, darker only on their tops",
    "      float lowC = smoothstep(380.0, 455.0, y);",
    "      lit = max(lit, lowC*(0.2 + 0.2*nearSun)*(1.0 - smoothstep(0.0, 0.1, d1 - d0)));",
    "      float shadeS = smoothstep(0.0, 0.12, d1 - d0)*(1.0 - lit);   // tops turned away from the sun",
    "      float top = smoothstep(250.0, 110.0, cp.y);",
    "      vec3 body = C(52.0, 60.0, 98.0);",
    "      body = mix(body, C(66.0, 72.0, 110.0), smoothstep(150.0, 260.0, y));",
    "      body = mix(body, C(82.0, 80.0, 114.0), smoothstep(260.0, 350.0, y));",
    "      body = mix(body, C(128.0, 96.0, 118.0), smoothstep(340.0, 405.0, y));",
    "      body = mix(body, C(198.0, 128.0, 118.0), smoothstep(392.0, 455.0, y));",
    "      // the low streaks over the far left hill are in shadow: dark mauve",
    "      body = mix(body, C(96.0, 84.0, 108.0), smoothstep(620.0, 120.0, cp.x)*smoothstep(400.0, 460.0, y)*0.75);",
    "      // low cloudlets beside the sun are lit almost whole",
    "      body = mix(body, C(206.0, 116.0, 106.0), nearSun*smoothstep(380.0, 450.0, y)*0.75);",
    "      body = mix(body, C(230.0, 146.0, 114.0), gauss(dx, 0.0, 230.0)*smoothstep(395.0, 450.0, y)*0.8);",
    "      vec3 shadow = body*vec3(0.84, 0.86, 0.94);",
    "      vec3 rimC = C(150.0, 106.0, 122.0);",
    "      rimC = mix(rimC, C(214.0, 128.0, 112.0), smoothstep(150.0, 260.0, y));",
    "      rimC = mix(rimC, C(238.0, 142.0, 110.0), smoothstep(260.0, 370.0, y));",
    "      rimC = mix(rimC, C(248.0, 164.0, 114.0), smoothstep(370.0, 470.0, y));",
    "      rimC = mix(rimC, C(252.0, 184.0, 120.0), nearSun*smoothstep(360.0, 470.0, y)*0.3);",
    "      float sideL = 1.0 - 0.25*smoothstep(700.0, 150.0, cp.x)*smoothstep(200.0, 330.0, cp.y) - 0.35*smoothstep(500.0, 100.0, cp.x)*smoothstep(420.0, 460.0, cp.y);",
    "      float litA = clamp(lit*sideL*(0.6 + 0.4*lift)*(1.0 + 0.3*sc), 0.0, 1.0);",
    "      // calm behind the headline: same shapes, lower contrast",
    "      vec2 cv = vec2((cp.x - 720.0)/480.0, (cp.y - 312.0)/106.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);",
    "      vec3 cc = mix(body, shadow, shadeS*0.8);",
    "      cc = mix(cc, rimC, litA*(1.0 - 0.9*top)*(1.0 - 0.5*calm));",
    "      col = mix(col, cc, a*mix(0.8, 1.0, litA)*(1.0 - 0.5*top)*(1.0 - 0.45*calm));",
    "#endif",
    "    }",
    "  }",
    "",
    "  // ---- distant land and mist ----",
    "  if (y > 440.0 && pg.y < cg + 34.0) {   // the grass body is fully opaque by cg + 30",
    "    vec2 pf = P + PARL*0.12;",
    "    float rf = ridgeFar(pf.x);",
    "    vec2 pm = P + PARL*0.3;",
    "    float mn = fbm4(vec2((pm.x - t*3.5)*0.0052, pm.y*0.045 + t*0.006));",
    "    float glowX = gauss(pm.x, sun.x + 20.0, 300.0)*gauss(pm.y, 536.0, 40.0);",
    "    vec3 mistC = mix(C(104.0, 100.0, 128.0), C(204.0, 146.0, 130.0), glowX);",
    "    mistC *= 0.94 + 0.14*mn;",
    "    mistC = mix(mistC, mistC*1.12, sc);",
    "    float aa = k;",
    "    // far range: hazy mauve peaks, almost sky where they pass in front of the sun",
    "    if (pf.y > rf - 2.0) {",
    "      vec3 fcol = mix(C(108.0, 96.0, 118.0), C(80.0, 84.0, 112.0), smoothstep(650.0, 1250.0, pf.x));",
    "      fcol = mix(fcol, C(134.0, 104.0, 116.0), gauss(pf.x, 395.0, 55.0)*gauss(pf.y, rf, 14.0)*0.7);",
    "      fcol = mix(fcol, C(64.0, 74.0, 106.0), smoothstep(1150.0, 1350.0, pf.x)*0.8);",
    "      fcol = mix(fcol, C(200.0, 136.0, 120.0), gauss(pf.x, sun.x, 140.0)*0.7*(1.0 - smoothstep(rf + 2.0, rf + 16.0, pf.y)));",
    "      fcol = mix(fcol, mistC, smoothstep(rf + 6.0, rf + 30.0, pf.y)*0.85);",
    "      float ia = smoothstep(rf, rf + aa, pf.y);",
    "      col = mix(col, fcol, ia);",
    "      col += C(250.0, 190.0, 120.0)*(1.0 - smoothstep(0.0, 4.0, pf.y - rf))*gauss(pf.x, sun.x, 170.0)*0.35*ia;",
    "    }",
    "    // layered ridges in the mist, right of the sun, nearer ones darker",
    "    vec2 p1 = P + PARL*0.16;",
    "    float top1 = 526.0 - bump(p1.x, 1170.0, 90.0, 12.0) - bump(p1.x, 1320.0, 120.0, 22.0) - bump(p1.x, 1480.0, 110.0, 26.0) + (noise1(p1.x*0.02 + 11.0) - 0.5)*6.0",
    "                 + 0.22*max(1080.0 - p1.x, 0.0);",
    "    vec3 tmp = hillLayer(col, p1, top1, C(58.0, 69.0, 99.0), mistC, 0.3, 3.0, 0.3, 7.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p1.x));",
    "    // low wooded ridges just under the far line, either side of the sun",
    "    vec2 p0 = P + PARL*0.2;",
    "    float top0 = 515.0 + (noise1(p0.x*0.012 + 5.0) - 0.5)*9.0 + 0.3*max(p0.x - 1060.0, 0.0) + 0.3*max(700.0 - p0.x, 0.0);",
    "    tmp = hillLayer(col, p0, top0, C(92.0, 84.0, 104.0), mistC, 0.7, 27.0, 0.3, 5.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(600.0, 660.0, p0.x)*(1.0 - smoothstep(1080.0, 1130.0, p0.x)));",
    "    // a bright mist sea in front of their feet, between the far range and the nearer hills",
    "    float sea = gauss(pm.y, mix(543.0, 556.0, smoothstep(1000.0, 1180.0, pm.x)), mix(15.0, 21.0, gauss(pm.x, 950.0, 160.0)))*smoothstep(620.0, 740.0, pm.x)*(1.0 - 0.6*smoothstep(1100.0, 1250.0, pm.x));",
    "    float wisp = smoothstep(0.4, 0.68, mn);",
    "    col = mix(col, mistC*(1.04 + 0.18*wisp), clamp(sea*(0.45 + 0.55*wisp), 0.0, 0.95));",
    "    vec2 p2 = P + PARL*0.24;",
    "    float top2 = 550.0 - bump(p2.x, 1190.0, 80.0, 12.0) - bump(p2.x, 1390.0, 110.0, 22.0) + (noise1(p2.x*0.025 + 2.0) - 0.5)*6.0",
    "                 + 0.25*max(1040.0 - p2.x, 0.0);",
    "    tmp = hillLayer(col, p2, top2, C(40.0, 56.0, 84.0), mistC, 0.45, 9.0, 0.42, 9.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(860.0, 920.0, p2.x));",
    "    // and a second sheet of mist in front of that ridge's foot, on the right",
    "    float seaMid = gauss(pm.y, 574.0 - 8.0*smoothstep(1250.0, 1440.0, pm.x) + 6.0*(mn - 0.5), 19.0)*smoothstep(1080.0, 1200.0, pm.x);",
    "    col = mix(col, mistC*(0.98 + 0.16*wisp), clamp(seaMid*(0.3 + 0.6*wisp), 0.0, 0.85));",
    "    vec2 p3 = P + PARL*0.3;",
    "    float top3 = 598.0 - bump(p3.x, 1090.0, 60.0, 10.0) - bump(p3.x, 1300.0, 90.0, 14.0) - bump(p3.x, 1440.0, 90.0, 20.0) + (noise1(p3.x*0.03 + 6.0) - 0.5)*6.0",
    "                 + 0.3*max(1060.0 - p3.x, 0.0);",
    "    tmp = hillLayer(col, p3, top3, C(28.0, 43.0, 69.0), mistC, 0.45, 13.0, 0.45, 11.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p3.x));",
    "    float seaLow = gauss(pm.y, 618.0 + 6.0*(mn - 0.5), 20.0)*smoothstep(1150.0, 1260.0, pm.x);",
    "    col = mix(col, mistC*(0.95 + 0.16*wisp), clamp(seaLow*(0.35 + 0.65*wisp), 0.0, 0.9));",
    "    vec2 p4 = P + PARL*0.38;",
    "    float top4 = 630.0 - 16.0*smoothstep(1250.0, 1440.0, p4.x) + (noise1(p4.x*0.03 + 1.0) - 0.5)*8.0 + 0.3*max(1250.0 - p4.x, 0.0);",
    "    tmp = hillLayer(col, p4, top4, C(22.0, 34.0, 56.0), mistC, 0.3, 17.0, 0.45, 13.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(1120.0, 1170.0, p4.x));",
    "    // the dark wooded hill on the left",
    "    vec2 ph = P + PARL*0.42;",
    "    float hl = hillL(ph.x);",
    "    float cnh = canopy(ph.x, 9.0, 21.0, 12.0, (0.35 + 0.65*clumps(ph.x, 4.0, 0.5))*(1.0 - smoothstep(760.0, 860.0, ph.x)));",
    "    float inh = smoothstep(hl - cnh + 2.0, hl - cnh + 2.0 + aa, ph.y);",
    "    vec3 hc = mix(C(40.0, 56.0, 84.0), C(43.0, 55.0, 77.0), smoothstep(hl, hl + 50.0, ph.y));",
    "    hc = mix(hc, C(31.0, 45.0, 68.0), 1.0 - smoothstep(hl - 1.0, hl + 4.0, ph.y));",
    "    hc *= 0.96 + 0.08*mn;",
    "    col = mix(col, hc, inh);",
    "    // the long lit slope and its tree line",
    "    vec2 pl = P + PARL*0.5;",
    "    float st = slopeTop(pl.x);",
    "    float dl = 0.95*gauss(pl.x, 760.0, 170.0) + 0.6*gauss(pl.x, 1105.0, 22.0) + 0.6*gauss(pl.x, 1290.0, 20.0)",
    "             + 0.35*gauss(pl.x, 1000.0, 40.0) + 0.3*gauss(pl.x, 470.0, 70.0);",
    "    float cnl = canopy(pl.x, 11.0, 33.0, 18.0, clamp(dl, 0.0, 1.0)*(0.45 + 0.55*clumps(pl.x, 8.0, 0.5)));",
    "    float inl = smoothstep(st - cnl + 2.0, st - cnl + 2.0 + aa, pl.y);",
    "    float tl = 1.0 - smoothstep(st + 1.0, st + 6.0, pl.y);",
    "    vec3 cl = mix(C(46.0, 57.0, 78.0), C(52.0, 59.0, 74.0), smoothstep(450.0, 750.0, pl.x));",
    "    cl = mix(cl, C(34.0, 46.0, 63.0), smoothstep(820.0, 1060.0, pl.x));",
    "    cl = mix(cl, C(54.0, 55.0, 64.0), gauss(pl.x, 880.0, 120.0)*gauss(pl.y, st + 30.0, 30.0)*0.6);",
    "    cl = mix(cl, C(40.0, 50.0, 70.0), smoothstep(st + 25.0, st + 110.0, pl.y)*0.7);",
    "    float hz = exp(-max(pl.y - st, 0.0)/14.0)*0.15*gauss(pl.x, sun.x - 80.0, 260.0);",
    "    cl = mix(cl, mistC, hz*(1.0 - tl));",
    "    // the ground rolls: soft bands that follow the slope, and the drifting mist shadow",
    "    cl *= (0.93 + 0.14*noise1(pl.x*0.006 + (pl.y - st)*0.05 + 4.0))*(0.95 + 0.1*mn);",
    "    vec3 treeC = mix(C(30.0, 42.0, 64.0), C(38.0, 46.0, 66.0), smoothstep(500.0, 1000.0, pl.x));",
    "    cl = mix(cl, treeC, tl*smoothstep(0.5, 2.0, cnl));",
    "    col = mix(col, cl, inl);",
    "    // the light breaking over the far land",
    "    col = mix(col, C(252.0, 192.0, 128.0), (0.24 + 0.12*sc)*gauss(P.x, sun.x, 130.0*(1.0 + 0.4*sc))*gauss(P.y, 498.0, 13.0*(1.0 + 0.8*sc)));",
    "  }",
    "",
    "  // ---- foreground hill: dark body, a fringe of thin swaying blades, a few small flowers ----",
    "  if (pg.y > cg - 210.0) {",
    "    float wd = wind(pg.x, t);",
    "    float aa = k;",
    "    float cslope = 0.092 + 1.2e-5*pg.x;           // local slope of the crest (crestG')",
    "    float goldM = 0.14 + 0.7*gauss(pg.x, 560.0, 300.0) + 0.3*gauss(pg.x, 1100.0, 180.0);",
    "    vec3 bladeC = C(13.0, 16.0, 22.0);",
    "    vec3 goldC = C(222.0, 170.0, 96.0);",
    "    for (int L = 0; L < 4; L++) {",
    "      float fl = float(L);",
    "      // back to front: short and dense, then taller and sparser",
    "      float cw   = fl < 0.5 ? 1.7  : (fl < 1.5 ? 2.8  : (fl < 2.5 ? 6.5  : 17.0));",
    "      float hMin = fl < 0.5 ? 18.0 : (fl < 1.5 ? 25.0 : (fl < 2.5 ? 28.0 : 40.0));   // shorter front blades, per user \"this grass is too long\"",
    "      float hRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 30.0 : (fl < 2.5 ? 38.0 : 42.0));",
    "      float dMin = fl < 0.5 ? 8.0  : (fl < 1.5 ? 12.0 : (fl < 2.5 ? 12.0 : 22.0));   // the back rows rooted under the hill's dark edge, per user \"I can see the root, which is looking like the floating\"",
    "      float dRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 28.0 : (fl < 2.5 ? 50.0 : 60.0));",
    "      float prob = fl < 0.5 ? 1.0  : (fl < 1.5 ? 1.0  : (fl < 2.5 ? 0.88 : 0.62));",
    "      float wid  = fl < 0.5 ? 1.25 : (fl < 1.5 ? 1.45 : (fl < 2.5 ? 1.7  : 2.0));",
    "      float hTyp = hMin + 0.5*hRng;",
    "      float above = max(cg + dMin + 0.5*dRng - pg.y, 0.0);",
    "      float shift = min(wd*(0.5 + hTyp/110.0), 0.85)*(0.3*above + 0.7*above*above/hTyp);",
    "      float ci = floor((pg.x - shift)/cw);",
    "      float cov = 0.0; float tip = 0.0; float shade = 0.0; float seed = 0.0;",
    "      if (pg.y < cg + dMin + dRng + 1.0 && pg.y > cg + dMin - hMin - hRng - 12.0) for (int j = -4; j <= 4; j++) {",
    "        float id = ci + float(j);",
    "        vec2 h = hash22(vec2(id, 31.0 + fl*17.0));",
    "        float h3 = hash11(id*1.37 + fl*7.1);",
    "        if (h3 > prob) continue;",
    "        float rx = (id + h.x)*cw;",
    "        float ry = cg + cslope*(rx - pg.x) + dMin + dRng*h.y;",
    "        float H = (hMin + hRng*fract(h.x*7.13 + h.y*3.1))*(1.0 - 0.12*smoothstep(800.0, 1350.0, rx))*(0.8 + 0.3*noise1(rx*0.011 + fl*5.0));",
    "        float s = (ry - pg.y)/H;",
    "        if (s < 0.0 || s > 1.08) continue;",
    "        float lim = 3.6*cw/H;",
    "        float flut = (0.035 + 0.16*clamp(wd - 0.1, 0.0, 1.0))*sin(t*(2.2 + 1.6*fract(h.x*9.7)) + h.x*40.0);",
    "        float lean = clamp((fract(h.y*5.31) - 0.5)*1.3, -lim, lim) + min(wd*(0.5 + H/110.0), 0.85) + flut;   // a gust bends a blade to about 40 degrees, no flatter",
    "        float bx = rx + lean*H*(0.25*s + 0.75*s*s);",
    "        float w = wid*(1.0 - 0.72*min(s, 1.0));",
    "        float d = abs(pg.x - bx);",
    "        float c = clamp((w + 0.5*aa - d)/aa, 0.0, 1.0)*min(1.0, 2.0*w/aa)*(1.0 - smoothstep(0.98, 1.08, s))*smoothstep(0.0, 0.25, s);   // the base fades into the dark, no cut stub",
    "        // a few tall blades carry a small seed head, lit gold from behind",
    "        float sh = fract(h3*29.3);",
    "        if (fl > 1.5 && sh < 0.12) {",
    "          vec2 sd = vec2(pg.x - (rx + lean*H), (pg.y - (ry - H) - 2.0)*0.34);",
    "          float hm = (1.0 - smoothstep(1.0, 1.0 + aa, length(sd)))*0.7;",
    "          if (hm > c) { c = hm; }",
    "          seed = max(seed, hm);",
    "        }",
    "        if (c > cov) { cov = c; tip = smoothstep(0.55, 0.97, s)*min(1.0, (fract(h3*13.7) > 0.5 ? 1.0 : 0.12) + 2.2*max(wd - 0.12, 0.0)); shade = fract(h.x*31.7); }",
    "      }",
    "      float sunk = smoothstep(cg + 8.0, cg + 46.0, pg.y);",
    "      vec3 bc = mix(bladeC, C(24.0, 29.0, 39.0), shade*shade*0.7*(1.0 - sunk));",
    "      bc = mix(bc, goldC, max(tip*0.8, seed)*goldM*(1.0 - 0.75*sunk));",
    "      bc = mix(bc, C(15.0, 19.0, 26.0), sunk*0.7);",
    "      col = mix(col, bc, cov);",
    "      if (L == 1) {",
    "        // the solid body after the two back layers, its top soft and broken into tufts",
    "        float bt = cg + 12.0 + (noise1(pg.x*0.05 + 3.0) - 0.5)*14.0 + (noise1(pg.x*0.19) - 0.5)*6.0;",
    "        float bodyA = smoothstep(bt - 6.0, bt + 8.0, pg.y);",
    "        vec3 body = mix(C(15.0, 18.0, 24.0), C(10.0, 13.0, 18.0), smoothstep(cg, cg + 80.0, pg.y));",
    "        body = mix(body, PAGE, smoothstep(cg + 60.0, cg + 140.0, pg.y));",
    "        body = mix(body, C(44.0, 42.0, 40.0), (1.0 - smoothstep(bt - 2.0, bt + 12.0, pg.y))*goldM*0.45);",
    "        col = mix(col, body, bodyA);",
    "        // (the wildflowers were removed 2026-10-10, per user \"what are these white dots?\", then \"remove\": at their size they read as specks)",
    "      }",
    "    }",
    "  }",
    "",
    "  col *= 0.8;                                    // a lower exposure, same hues, so the sub reads on the lit clouds",
    "  // ---- meet the page: the bottom reaches #090a0e exactly ----",
    "  // the footer (per user \"don't you think the footer need the change to match the hills?\") is this sky with the land",
    "  // under the bottom edge, rising out of the page's black; the hero meets the page at its foot",
    "  float fade = uFoot > 0.5 ? 1.0 - smoothstep(0.0, 560.0, Ppage) : smoothstep(700.0, 788.0, Ppage);",
    "  col = mix(col, PAGE, fade);",
    "  col += (hash12(fc + fract(t*7.13)*61.0) - 0.5)*(1.0/255.0)*max(uFoot, 1.0 - fade);   // the footer's fade from black is dithered too, or it bands",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "#ifdef SOFT_CLOUDS",
    "  if (uMask > 0.5) gl_FragColor = vec4(gCloud, 0.0, 0.0, 1.0);",
    "#endif",
    "}"
  ].join('\n');

  // the hills with real dawn clouds instead of anime ones (a preview, ?look=clouds)
  var FRAG_HILLS_SOFT = '#define SOFT_CLOUDS 1\n' + FRAG_HILLS;
  // ---- SUNRISE (2026-10-11, the hero and every footer since he said "sunrise the best", of three happier moods built to
  // "home page's visual color on hero and footer can be more dynamic and happy. Do not you think it is too depressed?"): the
  // hills with real dawn clouds some minutes later, the sun's rim clearing the far ridge. Same composition and shapes; only
  // light and colour change: a clear cobalt sky, the warm layers blended in OKLab (no violet band), gold only near the sun,
  // light clouds rose on their sun side, glowing mist, blue silhouette land. The sun is up from the first frame (the sunrise
  // that played at open was removed the same day, per user "i do not like the hero's time change"). ?look=bluehour keeps the hills as they were (hillsSoft). The story is in .claude/notes/hero.md.
  var FRAG_SUNRISE = [
    "#define SOFT_CLOUDS 1",
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uPointer;",
    "uniform float uScroll;",
    "uniform float uHorizon;                       // where the horizon goes, a share of the height (0 keeps the painting's)",
    "uniform float uFoot;                          // 1 in the footer: the sky alone, out of the page's black at the top",
    "#define C(r,g,b) (vec3(r,g,b)*(1.0/255.0))",
    "const vec3 PAGE = vec3(9.0, 10.0, 14.0)/255.0;",
    "",
    "// ---- hashes and value noise ----",
    "float hash11(float p){ p = fract(p*0.1031); p *= p + 33.33; p *= p + p; return fract(p); }",
    "float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }",
    "vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz)*p3.zy); }",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "vec2 vnoise2(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash22(i), hash22(i + vec2(1.0, 0.0)), u.x), mix(hash22(i + vec2(0.0, 1.0)), hash22(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float noise1(float x){ float i = floor(x); float f = fract(x); return mix(hash11(i), hash11(i + 1.0), f*f*(3.0 - 2.0*f)); }",
    "const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);",
    "// fbm budget per pixel: clouds = fbm3v (3-octave domain warp) + 2 x fbmCl (5 octaves each: the shape, and the shape",
    "// sampled toward the sun for the lit undersides), only inside a cloud-bank mask and above y 500;",
    "// distant land = 1 x fbm4 (4 octaves, the mist), only for y > 440 above the opaque grass body.",
    "// At most 4 fbm evaluations on a pixel (clouds over the land, y 440-500), 17 value-noise octaves. Open sky: 0.",
    "// cloud fbm, 5 value-noise octaves in all: 4 of rounded puffs (gain 0.5) and 1 long streak along the bank",
    "float fbmCl(vec2 q, float sa){",
    "  float s = 0.0; float a = 0.5; vec2 p = q;",
    "  for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2); a *= 0.5; }",
    "  return s/0.9375 + sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "}",
    "// the cloud deck in soft perspective: puffs flatten toward the horizon (vertical only, so nothing skews), and the deck",
    "// curves up toward both corners around the sun (S(x) = -90 log cosh((973 - x)/300))",
    "vec2 deckQ(vec2 cp, float t){",
    "  float d = 860.0 - cp.y;",
    "  float sa = clamp((973.0 - cp.x)/300.0, -6.0, 6.0);",
    "  float shear = -90.0*log(0.5*(exp(sa) + exp(-sa)));",
    "  return vec2((cp.x - 973.0)/40.0 - t*0.055, 17400.0/d - shear/20.0);",
    "}",
    "// the hero's cloud field, or in the footer the same paint at a larger scale, somewhere else in the noise",
    "vec2 cloudQ(vec2 p, float t){",
    "  vec2 q = deckQ(p, t);",
    "  return uFoot > 0.5 ? q*0.8 + vec2(23.7, 5.3) : q;",
    "}",
    "float fbm4(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.03 + vec2(4.1, 2.7); a *= 0.5; } return s/0.9375; }",
    "vec2 fbm3v(vec2 p){ vec2 s = vec2(0.0); float a = 0.5; for (int i = 0; i < 3; i++){ s += a*vnoise2(p); p = ROT*p*2.07 + vec2(3.1, 1.3); a *= 0.5; } return s/0.875; }",
    "",
    "float bump(float x, float c, float w, float h){ float d = (x - c)/w; return h*exp(-d*d); }",
    "// linear segment: the sky ramp keeps a constant slope between stops (smoothstep flattens at each stop and bands)",
    "float ramp(float a, float b, float x){ return clamp((x - a)/(b - a), 0.0, 1.0); }",
    "float gauss(float x, float c, float w){ float d = (x - c)/w; return exp(-d*d); }",
    "float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0); return length(pa - ba*h); }",
    "float segM(vec2 p, vec2 a, vec2 b, float r){ return 1.0 - smoothstep(r*0.4, r, segD(p, a, b)); }",
    "// SUNRISE: colours given as OKLCH (lightness, chroma, hue in degrees), blended in OKLab (a straight line, never a walk",
    "// round the hue circle: a walk from blue to rose crosses violet and magenta), then to sRGB. Where blue meets warm the",
    "// blend passes through a pale, light haze, never a mid-grey or a violet",
    "vec3 lab(vec3 lch){ float h = radians(lch.z); return vec3(lch.x, lch.y*cos(h), lch.y*sin(h)); }",
    "vec3 labRGB(vec3 c){",
    "  float a = c.y; float b = c.z;",
    "  vec3 lms = vec3(c.x + 0.3963377774*a + 0.2158037573*b, c.x - 0.1055613458*a - 0.0638541728*b, c.x - 0.0894841775*a - 1.2914855480*b);",
    "  lms = lms*lms*lms;",
    "  vec3 lin = vec3(4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,",
    "                  -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,",
    "                  -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z);",
    "  lin = clamp(lin, 0.0, 1.0);",
    "  return mix(lin*12.92, 1.055*pow(max(lin, vec3(1.0e-6)), vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), lin));",
    "}",
    "vec3 okl(vec3 lch){ return labRGB(lab(lch)); }",
    "// SUNRISE: the live dawn's colour a, the sunrise's b, by the sunrise's progress R (in scope wherever it is used)",
    "#define SR(a, b) mix(a, b, R)",
    "// the warm stack's steps in the warmth w: the haze, then the peach rose",
    "#define HZ0 0.06",
    "#define HZ1 0.35",
    "#define RS1 0.50",
    "// the cloud light's steps in li (SUNRISE): the half light (from the shadow's floor up, so shadows stay the body's blue), the warm",
    "#define LC0 0.28",
    "#define LC1 0.55",
    "#define LS0 0.25",
    "#define LS0H 0.42",
    "#define LS1 0.70",
    "",
    "// ---- wind: a slow breeze, and a gust every 5s that travels left to right across the hill (per user \"how to make the grass",
    "// to be more obvious to be shaken by wind?\": gusts twice as strong and more often, every blade fluttering, tips lit as they bend) ----",
    "float gust(float x, float t, float j){",
    "  float gx = -700.0 + (t - j*5.0)*380.0;",
    "  float d = x - gx;",
    "  float w = d > 0.0 ? 240.0 : 560.0;",
    "  return exp(-(d*d)/(w*w))*(0.7 + 0.6*hash11(j*3.17 + 1.3));",
    "}",
    "float wind(float x, float t){",
    "  float k = floor(t/5.0);",
    "  float g = gust(x, t, k) + gust(x, t, k - 1.0) + gust(x, t, k - 2.0) + gust(x, t, k - 3.0);",
    "  float n = noise1(x*0.0035 - t*0.30);",
    "  return 0.04 + 0.08*n + 0.36*g;",
    "}",
    "",
    "// ---- landforms (design px, y down) ----",
    "float ridgeFar(float x){",
    "  // fitted to the painting's far line: two peaks left of the sun, a low saddle at the sun, a peak far right",
    "  float y = 495.0 - bump(x, 390.0, 45.0, 12.0) - bump(x, 590.0, 45.0, 4.0) - bump(x, 450.0, 160.0, 2.2) + bump(x, 800.0, 140.0, 12.0)",
    "          + bump(x, 975.0, 60.0, 4.0) + bump(x, 1060.0, 60.0, 7.8) + bump(x, 1200.0, 160.0, 2.2) - bump(x, 1290.0, 40.0, 13.5)",
    "          - bump(x, 1420.0, 80.0, 8.0) - bump(x, 120.0, 140.0, 6.0);",
    "  return y + (noise1(x*0.018) - 0.5)*4.0 + (noise1(x*0.07) - 0.5)*1.4;",
    "}",
    "float softplus(float z){ return z > 12.0 ? z : log(1.0 + exp(z)); }",
    "// the long lit slope that runs from behind the grass down into the valley, its top edge carrying the tree line",
    "float slopeTop(float x){ return 516.0 + 16.0*softplus((x - 620.0)/100.0) + (noise1(x*0.010 + 7.0) - 0.5)*7.0 + (noise1(x*0.04) - 0.5)*2.0; }",
    "// the dark wooded hill on the left, behind the slope",
    "float hillL(float x){ return 463.0 + 0.085*x + 6.0e-5*x*x - bump(x, 680.0, 110.0, 22.0) + (noise1(x*0.012 + 3.0) - 0.5)*8.0 + (noise1(x*0.045) - 0.5)*2.5; }",
    "float crestG(float x){",
    "  float y = 532.0 + 0.092*x + 6.0e-6*x*x;",
    "  return y + (noise1(x*0.010 + 7.0) - 0.5)*9.0 + (noise1(x*0.04) - 0.5)*3.0;",
    "}",
    "",
    "// a tree canopy above a ridge: overlapping domes whose size follows a clump mask (1D, cheap)",
    "float canopy(float x, float cell, float seed, float rMax, float clump){",
    "  float hgt = 0.0;",
    "  float ci = floor(x/cell);",
    "  for (int j = -2; j <= 2; j++){",
    "    float id = ci + float(j);",
    "    vec2 h = hash22(vec2(id, seed));",
    "    float r = rMax*(0.22 + 0.78*h.y*h.y)*clump;",
    "    float dxx = x - (id + h.x)*cell;",
    "    float d2 = r*r - dxx*dxx;",
    "    float lift = (fract(h.y*9.7) - 0.35)*r*0.6;",
    "    if (d2 > 0.0) hgt = max(hgt, sqrt(d2)*0.85 + lift);",
    "  }",
    "  return hgt;",
    "}",
    "float clumps(float x, float seed, float fill){ return smoothstep(0.62 - fill, 0.86 - fill, noise1(x*0.03 + seed))*(0.4 + 0.6*noise1(x*0.11 + seed*3.0)); }",
    "",
    "// one hill layer behind the mist: body, a fringe of small trees, its foot dissolving into mist",
    "vec3 hillLayer(vec3 col, vec2 p, float top, vec3 c, vec3 mist, float mistAmt, float tSeed, float tDens, float tR, float aa, float wv, float warm){",
    "  float cn = canopy(p.x, tR*1.15, tSeed, tR*1.25, clumps(p.x, tSeed, tDens));",
    "  float inside = smoothstep(top - cn, top - cn + aa, p.y);",
    "  // the foot dissolves into mist, unevenly: the drifting mist noise lifts and lowers the fog line",
    "  float fogLine = top + 8.0 + 26.0*(1.0 - wv);",
    "  vec3 cc = mix(c, mist, smoothstep(fogLine, fogLine + 34.0, p.y)*mistAmt*(0.55 + 0.6*wv)*(1.0 - 0.7*warm));   // (SUNRISE: where the mist is warm the hill stays blue to its foot: warm mist into a blue hill is grey)",
    "  return mix(col, cc, inside);",
    "}",
    "",
    "#ifdef SOFT_CLOUDS",
    "// SOFT HELPERS for ?look=clouds: the hero's bank mask again (the same segments as in main()), to look toward the light",
    "float bankMask(vec2 cp){",
    "  float m = 0.0;",
    "  m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "  m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "  m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "  m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "  m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "  m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "  m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "  m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "  m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "  m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "  return m;",
    "}",
    "// the cloud's threshold for a mask value",
    "float softTh(float m){ return mix(0.80, 0.30, smoothstep(0.0, 0.8, m)); }",
    "// a cheap look at the density: only the shape's first octave (one value noise), the billows at their mean and the long",
    "// streak st taken from the point itself (it barely changes over a few dozen px)",
    "float softLo(vec2 q, float st){ return 0.51*vnoise(ROT*q) + 0.265 + st; }",
    "// the soft clouds' own noise space: the deck's, with the puffs larger and taller (rounder heaps, flatter only near the",
    "// horizon) and about a third of its curl toward the corners (the full curl slants the lumps into ledges there)",
    "vec2 softQ(vec2 p, float t){",
    "  float sx = clamp((973.0 - p.x)/300.0, -6.0, 6.0);",
    "  float uncurl = -0.65*(-90.0*log(0.5*(exp(sx) + exp(-sx))))/20.0;   // deckQ's shear term, about two thirds taken back",
    "  return (cloudQ(p, t) - vec2(0.0, uncurl*(uFoot > 0.5 ? 0.8 : 1.0)))*vec2(0.8, 0.64);",
    "}",
    "// the soft clouds' density, 5 value-noise octaves like fbmCl: one smooth octave for the heaps, then three billow octaves",
    "// (round bumps, softly creased between) for the cauliflower on them, and the long streak (st, returned); lo is the",
    "// heap alone (the billows at their mean), dm the shape without its finest octave (at its mean)",
    "float softD(vec2 q, float sa, out float st, out float lo, out float dm){",
    "  vec2 p = ROT*q;",
    "  float s = 0.5*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  st = sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "  lo = s/0.98 + 0.265 + st;",
    "  float v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  float b = 0.26*sqrt(v*v + 0.12);                           // a softened abs: round bumps, soft creases",
    "  v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  b += 0.15*sqrt(v*v + 0.08);",
    "  dm = (s + b)/0.98 + 0.052 + st;",
    "  v = 2.0*vnoise(p) - 1.0;",
    "  b += 0.07*sqrt(v*v + 0.05);",
    "  return (s + b)/0.98 + 0.02 + st;",
    "}",
    "#endif",
    "#ifdef SOFT_CLOUDS",
    "uniform float uMask;                          // 1: draw the cloud cover instead of the scene, for the page's stars",
    "float gCloud = 0.0;",
    "#endif",
    "void main(){",
    "  vec2 fc = gl_FragCoord.xy;",
    "  float aspect = uRes.x/uRes.y;",
    "  float k = 800.0/uRes.y;                       // design px per backing px",
    "  float cx = 720.0 + 220.0*clamp((1.6 - aspect)/1.0, 0.0, 1.0);",
    "  vec2 P = vec2((fc.x - 0.5*uRes.x)*k + cx, (uRes.y - fc.y)*k);",
    "  float t = uTime;",
    "  // SUNRISE: R is how far the sunrise has come, from the blue hour's light (0) to the sunrise's (1). It played once as the",
    "  // page opened (held 0.8s, then 5.2s on an ease-out) until he said \"i do not like the hero's time change. remove it\": the",
    "  // sun is up from the first frame",
    "  float R = 1.0;",
    "  vec2 ptr = uPointer;",
    "  float sc = clamp(uScroll, 0.0, 1.0);",
    "  vec2 PAR = vec2(-48.0, -16.0)*ptr;            // nearest layer: +-24px x, +-8px y",
    "  vec2 PARL = vec2(0.0);                        // the land stays still under the cursor (per user \"do not let the hills shaking with the cursor\")",
    "  if (P.y >= 788.0 && uFoot < 0.5) { gl_FragColor = vec4(PAGE, 1.0); return; }",
    "  float Ppage = P.y;                            // the frame's own height, for meeting the page",
    "  // per user \"make the text contrast better\": the scene slides down until the dawn's horizon sits under the pill",
    "  if (uHorizon > 0.0) P.y -= uHorizon*800.0 - 497.0;",
    "  vec2 pg = P + PARL;",
    "  float cg = crestG(pg.x);",
    "",
    "  // ---- sky ----",
    "  // the sun stays put under the cursor (per user \"do not let this sun move with the cursor\"; it leaned 115 design px)",
    "  vec2 sun = vec2(973.0, mix(526.0, 504.0, R) - 44.0*sc);   // SUNRISE: the rim rises over the far ridge (about 499)",
    "  vec2 sunU = vec2(973.0/1440.0 - 0.5, 500.0/800.0 - 0.5);",
    "  float lift = 1.0 + 0.08*(1.0 - smoothstep(0.0, 0.7, length(ptr - sunU))) + 0.25*sc;",
    "  vec2 ps = P;                                  // nor does the sky drift (it carried the sun's disc and glow with it)",
    "  float y = ps.y;",
    "  vec3 sky = C(17.0, 40.0, 78.0);",
    "  sky = mix(sky, C(21.0, 44.0, 85.0),   ramp(0.0, 50.0, y));",
    "  sky = mix(sky, C(28.0, 52.0, 94.0),   ramp(50.0, 100.0, y));",
    "  sky = mix(sky, C(40.0, 63.0, 104.0),  ramp(100.0, 150.0, y));",
    "  sky = mix(sky, C(55.0, 75.0, 116.0),  ramp(150.0, 200.0, y));",
    "  sky = mix(sky, C(69.0, 84.0, 124.0),  ramp(200.0, 240.0, y));",
    "  sky = mix(sky, C(88.0, 95.0, 131.0),  ramp(240.0, 280.0, y));",
    "  sky = mix(sky, C(108.0, 103.0, 138.0), ramp(280.0, 320.0, y));",
    "  sky = mix(sky, C(130.0, 110.0, 140.0), ramp(320.0, 350.0, y));",
    "  sky = mix(sky, C(148.0, 114.0, 136.0), ramp(350.0, 380.0, y));",
    "  sky = mix(sky, C(170.0, 119.0, 128.0), ramp(380.0, 410.0, y));",
    "  sky = mix(sky, C(189.0, 124.0, 119.0), ramp(410.0, 440.0, y));",
    "  sky = mix(sky, C(204.0, 125.0, 112.0), ramp(440.0, 470.0, y));",
    "  sky = mix(sky, C(214.0, 127.0, 108.0), ramp(470.0, 510.0, y));",
    "  sky += C(4.0, 8.0, 12.0)*smoothstep(300.0, 1440.0, ps.x)*(1.0 - smoothstep(0.0, 260.0, y));",
    "  sky = mix(sky, sky + C(14.0, 18.0, 22.0), sc*(1.0 - smoothstep(150.0, 500.0, y)));",
    "  float dx = ps.x - sun.x;",
    "  float dyUp = max(sun.y - 27.0 - y, 0.0);",
    "  float sgx = (dx > 0.0 ? 1050.0 : 600.0)*(1.0 + 0.35*sc);",
    "  float sgy = dx > 0.0 ? mix(165.0, 180.0, smoothstep(0.0, 250.0, dx)) : mix(165.0, 132.0, smoothstep(0.0, 300.0, -dx));",
    "  float halo = 0.68*exp(-(dx*dx)/(sgx*sgx) - (dyUp*dyUp)/(sgy*sgy*(1.0 + 0.6*sc)));",
    "  sky = mix(sky, C(248.0, 168.0, 118.0), clamp(halo*lift, 0.0, 0.92));",
    "  // the gold core rises with the sun; below its centre it falls off slowly, so rising never takes light away",
    "  float dyc = y - (sun.y - 29.0);",
    "  dyc = dyc > 0.0 ? dyc*(1.0 - 0.7*sc) : dyc;",
    "  float core = 0.84*exp(-(dx*dx)/(175.0*175.0*(1.0 + 0.5*sc)) - (dyc*dyc)/(38.0*38.0*(1.0 + 0.9*sc)));",
    "  sky = mix(sky, C(255.0, 208.0, 128.0), clamp(core*lift, 0.0, 0.95));",
    "  sky = mix(sky, C(250.0, 176.0, 122.0), 0.22*gauss(dx, 0.0, 260.0)*gauss(y, 425.0, 45.0)*lift);",
    "  // the hot spot where the sun breaks; as it rises the glow on the far line stays, so nothing gets darker",
    "  float spotR = y - 497.0 + 44.0*sc;",
    "  float spot = exp(-(dx*dx)/(36.0*36.0))*max(exp(-spotR*spotR/100.0), exp(-(y - 497.0)*(y - 497.0)/100.0));",
    "  sky = mix(sky, C(255.0, 232.0, 176.0), clamp(spot*0.6*lift, 0.0, 0.8));",
    "  float disc = 1.0 - smoothstep(11.0, 20.0, length(ps - sun));",
    "  sky = mix(sky, C(255.0, 236.0, 192.0), disc);",
    "  // ---- SUNRISE sky: one warmth w round the sun (1 at the sun, falling off upward and, more slowly, sideways), walked in",
    "  // OKLab through clean layers: deep cobalt overhead, a clear azure lower, a pale haze, peach rose, peach, gold, white",
    "  float sxS = dx > 0.0 ? 1150.0 : 720.0;",
    "  float hxS = exp(-(dx*dx)/(sxS*sxS));",
    "  float dyS = max(499.0 - 44.0*sc - y, 0.0);",
    "  // the glow stays low in the type's column (the sub reads on periwinkle) and climbs higher beside it, behind the banks",
    "  float sideS = smoothstep(380.0, 680.0, abs(ps.x - 720.0))*(1.0 - uFoot);   // (not in the footer: its line's text sits at both ends)",
    "  float tau = mix(66.0, 128.0, sideS)*(0.6 + 0.4*hxS)*(1.0 + 0.3*sc);",
    "  float sig = mix(80.0, 176.0, sideS)*(1.0 + 0.3*sc);",
    "  float wS = clamp(mix(0.55, 1.0, hxS)*exp(-dyS/tau - (dyS*dyS)/(sig*sig))*lift, 0.0, 1.0);",
    "  float yb = clamp(y/300.0, 0.0, 1.0);",
    "  vec3 lch = vec3(mix(0.35, 0.455, yb), mix(0.14, 0.145, yb), mix(263.0, 256.0, yb));",
    "  lch.x += 0.02*smoothstep(300.0, 1440.0, ps.x)*(1.0 - yb) + 0.03*sc*(1.0 - yb);",
    "  lch.x += 0.04*smoothstep(320.0, 470.0, y);                               // a lighter, clear azure low down, leading into the haze",
    "  if (uFoot > 0.5) lch = mix(lch, vec3(0.50, 0.11, 250.0), smoothstep(300.0, 650.0, Ppage));   // the footer's fill: clear air, not a flat royal blue",
    "  // a morning, not a sunset: clear blue, then a pale luminous haze, a peach rose, peach, and gold only close to the sun",
    "  vec3 lb = lab(lch);",
    "  lb = mix(lb, lab(vec3(0.78, 0.03, 70.0)), smoothstep(HZ0, HZ1, wS));     // pale luminous haze (eased in: a kink in the blue's slope reads as a seam)",
    "  lb = mix(lb, lab(vec3(0.74, 0.10, 28.0)), ramp(HZ1, RS1, wS));           // peach rose",
    "  lb = mix(lb, lab(vec3(0.79, 0.125, 55.0)), ramp(RS1, 0.62, wS));         // peach",
    "  lb = mix(lb, lab(vec3(0.86, 0.13, 75.0)), ramp(0.66, 0.84, wS));         // gold",
    "  lb = mix(lb, lab(vec3(0.87, 0.13, 78.0)), ramp(0.86, 0.98, wS));         // pale gold at the sun",
    "  // the footer: the warm light under its bottom edge, between the two ends of its line, flat across the middle (a band of",
    "  // light, not a dome) and only ever lighter toward the edge: blue, the pale haze, a pale peach",
    "  if (uFoot > 0.5) {",
    "    float fx = (ps.x - 720.0)/430.0;",
    "    float fw = smoothstep(640.0, 940.0, Ppage)*exp(-fx*fx);       // a soft glow rising from under the edge (a flat-topped dome read as an egg)",
    "    lb = mix(lb, lab(vec3(0.74, 0.045, 70.0)), 0.85*fw);",
    "    lb = mix(lb, lab(vec3(0.82, 0.11, 60.0)), fw*fw);",
    "  }",
    "  vec3 skyS = labRGB(lb);",
    "  float dycS = y - (sun.y - 4.0);",
    "  float coreS = exp(-(dx*dx)/(90.0*90.0) - (dycS*dycS)/(22.0*22.0));",
    "  skyS = mix(skyS, C(255.0, 232.0, 176.0), clamp(coreS*0.7*lift, 0.0, 0.95));",
    "  float rS = length(ps - sun);",
    "  skyS = mix(skyS, C(255.0, 246.0, 222.0), 0.85*exp(-max(rS - 15.0, 0.0)/12.0));   // the bloom hugging the disc",
    "  float discS = 1.0 - smoothstep(14.0, 16.5, rS);",
    "  skyS = mix(skyS, C(255.0, 254.0, 246.0), discS);",
    "  sky = mix(sky, skyS, R);",
    "  vec3 col = sky;",
    "  float nearSun = exp(-(dx*dx)/(420.0*420.0));",
    "",
    "  // ---- clouds: banks of rounded puffs, each puff lit on its underside toward the sun ----",
    "  if (y < 500.0) {",
    "    vec2 cp = P + PAR*0.06;",
    "    // bank masks traced from the painting: three diagonal bands on the left, a rising band and a heavy mass on the right",
    "    float m = 0.0;",
    "    m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "    m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "    m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "    m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "    m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "    m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "    m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "    m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "    m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "    m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "    // the footer has its own clouds (per user \"do not you feel the footer's design elements are too repetitive with the",
    "    // hero? at last the cloud need to have the different shape\", then \"the cloud shape and distribution is too ugly\" of",
    "    // long streaks): two soft heaps rising from the bottom corners, framing \"Say hello\";",
    "    // the whale's band stays open sky",
    "    if (uFoot > 0.5) {",
    "      vec2 fp = vec2(cp.x, Ppage);",
    "      // (then, per user, at about 60% of the size and without the two companions: the word sits in open sky between them)",
    "      m = 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(40.0, 800.0))/vec2(340.0, 150.0)));",
    "      m = max(m, 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(1420.0, 795.0))/vec2(360.0, 160.0))));",
    "      m *= smoothstep(470.0, 560.0, Ppage);",
    "    }",
    "    if (m > 0.02) {",
    "      vec2 q = cloudQ(cp, t);",
    "      vec2 w = fbm3v(q*0.42 + vec2(0.0, t*0.002));",
    "      vec2 wq = (w - 0.5)*vec2(1.0, 0.4);",
    "      float sa = mix(0.48, 0.22, smoothstep(390.0, 450.0, cp.y));",
    "      float d0 = fbmCl(q + wq, sa);",
    "      vec2 L = normalize(normalize(vec2(sun.x, 526.0) - cp) + vec2(0.0, 1.1));",
    "      float d1 = fbmCl(cloudQ(cp + L*7.0, t) + wq, sa);",
    "      float th = mix(0.80, 0.30, m);",
    "#ifdef SOFT_CLOUDS",
    "      // REAL DAWN CLOUDS (2026-10-11, per user \"the cloud looks like the anime. The rest of the element I think it is ok\"):",
    "      // the same banks in the same places, lit like the reference: each point asks how much cloud lies between it and the",
    "      // light (a full look 5px along it, cheap looks at 12, 26 and 46px; the finest grain left out so the light falls on",
    "      // lumps, not speckle), so the faces turned to the sun glow and the light fades gradually into slate bodies. The light",
    "      // comes up from the low sun onto the high clouds and down onto the crowns of the low banks; only the lower clouds",
    "      // turn warm (dusty rose, then peach), the high ones keep a cool lavender grey. A look up gives the crowns the sky's",
    "      // cool light. Heaps have crisp, lumpy outlines; thin cloud lets the sky through. Cost per cloud pixel: the warp, then",
    "      // 14 value-noise octaves (softD twice, softLo four times) against the anime's 10, and five looks at the bank mask.",
    "      vec2 wq2 = wq*0.6;",
    "      float lowW = smoothstep(220.0, 440.0, y);",
    "      vec2 Ls = normalize(vec2(sun.x, 526.0) - cp);                 // toward the sun, low on the horizon",
    "      float bankW = smoothstep(330.0, 440.0, y);                     // the low banks near the horizon",
    "      vec2 Lm = normalize(Ls + vec2(0.0, -mix(0.15, 1.25, bankW)));  // the sun's light: from below on the high clouds, onto the crowns of the low ones",
    "      float fr = 0.4*(w.x - 0.5)*(1.0 - smoothstep(0.45, 0.95, m));",
    "      float st, st1, lo0, lo1, dm0, dm1;",
    "      float th0 = softTh(m);",
    "      float e0 = softD(softQ(cp, t) + wq2, sa, st, lo0, dm0) + fr - th0;     // depth into the cloud",
    "      vec2 p1 = cp + Lm*5.0;",
    "      float th1 = softTh(uFoot > 0.5 ? m : bankMask(p1));",
    "      float e1 = softD(softQ(p1, t) + wq2, sa, st1, lo1, dm1) + fr - th1;",
    "      vec2 p2 = cp + Lm*12.0; vec2 p3 = cp + Lm*26.0; vec2 p4 = cp + Lm*46.0; vec2 pU = cp + vec2(0.0, -20.0);",
    "      float e2 = softLo(softQ(p2, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p2));",
    "      float e3 = softLo(softQ(p3, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p3));",
    "      float e4 = softLo(softQ(p4, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p4));",
    "      float eU = softLo(softQ(pU, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(pU));",
    "      float e0m = dm0 + fr - th0;                                    // the lumps without their finest grain",
    "      float e1m = dm1 + fr - th1;",
    "      // the light's path: through how much cloud (density), and, on the thin low banks, past how much cloud at all (cover)",
    "      float cover = 1.4*smoothstep(-0.02, 0.08, e1m) + 0.9*smoothstep(-0.02, 0.08, e2) + 0.5*smoothstep(-0.02, 0.08, e3);",
    "      float sunL = exp(-1.5*max(e0m, 0.0) - 2.5*max(e1m, 0.0) - 0.6*max(e2, 0.0) - 0.4*max(e3, 0.0) - 0.25*max(e4, 0.0) - 0.6*bankW*cover*(1.0 - 0.6*nearSun));",
    "      float skyL = exp(-1.5*max(e0, 0.0) - 4.0*max(eU, 0.0));       // the sky's light from above, on the crowns",
    "      float heap = lo0 + fr - th0;                                   // the heap alone: thick (cumulus) or thin (a wisp)",
    "      float eA = e0 + (e0 - heap)*smoothstep(0.3, 0.8, m)*mix(1.0, 0.25, smoothstep(0.04, 0.22, heap));   // the outline lumpy, no holes deep in a heap",
    "      float kap = mix(6.0, 60.0, smoothstep(-0.05, 0.2, heap));       // thin cloud lets the sky through; a thick heap has a crisp edge",
    "      float thick = max(smoothstep(-0.05, 0.2, heap), bankW);       // the low banks keep crisp edges",
    "      float a = smoothstep(-0.015, mix(0.1, 0.02, thick), eA)*(1.0 - exp(-kap*max(eA + 0.02, 0.0)))*smoothstep(0.03, 0.12, m);",
    "      // lighter than the sky behind them, not darker (per user \"the real dawn clouds are too dark\"): a soft blue-grey body",
    "      // (SUNRISE: the shadow sides keep the sky's own blue, a little lighter than the sky; the half light is a light pearl",
    "      // peach on the low clouds, so blue meets the warm at high lightness, not at mid lightness, which is mauve; rose only on",
    "      // the high crowns, peach and gold low)",
    "      vec3 body = mix(SR(C(58.0, 68.0, 100.0), C(70.0, 104.0, 170.0)), SR(C(74.0, 76.0, 104.0), C(88.0, 118.0, 182.0)), smoothstep(150.0, 320.0, y));",
    "      body = mix(body, SR(C(104.0, 88.0, 108.0), C(112.0, 130.0, 192.0)), smoothstep(320.0, 450.0, y));",
    "      vec3 skyC = mix(SR(C(84.0, 92.0, 124.0), C(60.0, 110.0, 185.0)), SR(C(128.0, 108.0, 128.0), C(96.0, 126.0, 196.0)), smoothstep(200.0, 420.0, y));   // cool crowns high, mauve low (SUNRISE: the blue sky's light)",
    "      float warmW = smoothstep(150.0, 340.0, y);                     // the sun reaches the lower clouds; the high ones keep the sky's cool",
    "      vec3 halfC = mix(SR(C(88.0, 92.0, 122.0), C(96.0, 124.0, 190.0)), SR(C(166.0, 110.0, 120.0), C(244.0, 196.0, 174.0)), warmW);   // half light: grey-blue high, rose low (SUNRISE: the sky's blue high, a pearl peach low)",
    "      vec3 sunC = mix(SR(C(104.0, 104.0, 132.0), C(236.0, 160.0, 178.0)), SR(C(184.0, 114.0, 122.0), C(244.0, 164.0, 152.0)), smoothstep(170.0, 290.0, y));   // lavender grey high, dusty rose (SUNRISE: a rose pink on the high crowns, then peach and gold)",
    "      sunC = mix(sunC, SR(C(228.0, 134.0, 114.0), C(252.0, 172.0, 124.0)), smoothstep(260.0, 360.0, y));",
    "      sunC = mix(sunC, SR(C(246.0, 148.0, 108.0), C(255.0, 192.0, 116.0)), smoothstep(350.0, 440.0, y));",
    "      sunC = mix(sunC, SR(C(252.0, 174.0, 124.0), C(255.0, 208.0, 122.0)), nearSun*smoothstep(360.0, 460.0, y)*0.6);",
    "      if (uFoot > 0.5) sunC = mix(sunC, C(255.0, 194.0, 126.0), 0.6*R);   // the footer's corner heaps: gold and peach",
    "      float glow = (0.8 + 0.2*lift)*(1.0 + 0.25*sc)*mix(1.0, 1.2, R);",
    "      float li = clamp(sunL*mix(0.9, mix(1.3, 1.55, R) + 0.3*nearSun, lowW)*glow, 0.0, 1.0);   // (SUNRISE: the low banks' undersides catch more of the sun)",
    "      li = mix(0.18, 0.24, R) + mix(0.82, 0.76, R)*li;                // a little less shadow (per user: \"reduce the shadow of the clouds a little. do not change the shape\")",
    "      // SUNRISE footer: the corner heaps keep the light on their crowns; their lower halves, where the line's text sits, are in soft shade",
    "      if (uFoot > 0.5) li *= 1.0 - 0.7*R*smoothstep(mix(690.0, 650.0, step(ps.x, 420.0)), 765.0, Ppage);",
    "      if (uFoot > 0.5) body = mix(body, C(80.0, 94.0, 160.0), 0.75*R*smoothstep(670.0, 760.0, Ppage));   // the footer: the heaps' shaded feet, behind the line's text",
    "      vec3 cc = mix(body, skyC, (0.2 + skyL*0.45)*(1.0 - 0.6*uFoot*smoothstep(670.0, 760.0, Ppage)));",
    "      // SUNRISE: a cloud low over the horizon takes the colour of the sky behind it, a little deeper and toward rose (a light",
    "      // pearl blue just above the haze, a pale peach in it, coral rose, peach, gold by the sun), so it is never a mid blue body",
    "      // under gold light (beige), and its holes show sky of its own hue",
    "      vec3 wb = lab(vec3(0.74, 0.045, 255.0));",
    "      wb = mix(wb, lab(vec3(0.78, 0.065, 50.0)), ramp(HZ0, HZ1, wS));",
    "      wb = mix(wb, lab(vec3(0.68, 0.10, 25.0)), ramp(HZ1, RS1, wS));",
    "      wb = mix(wb, lab(vec3(0.75, 0.11, 45.0)), ramp(RS1, 0.62, wS));",
    "      wb = mix(wb, lab(vec3(0.81, 0.12, 64.0)), ramp(0.66, 0.84, wS));",
    "      cc = mix(cc, labRGB(wb), R*smoothstep(0.0, 0.12, wS)*(1.0 - uFoot));",
    "      cc = mix(cc, halfC, smoothstep(mix(0.0, LC0, R), mix(0.4, LC1, R), li));",
    "      // (SUNRISE: on the high clouds the rose stays on the faces turned to the sun, where the cloud thins toward it, not as a",
    "      // rim all round)",
    "      float faceS = smoothstep(-0.05, 0.03, e0m - e1m);",
    "      cc = mix(cc, sunC, smoothstep(mix(0.25, mix(LS0H, LS0, warmW), R), mix(0.7, LS1, R), li)*mix(1.0, 0.2 + 0.8*faceS, R*(1.0 - warmW)));",
    "      cc = mix(cc, col, mix(0.3, 0.45, R)*(1.0 - smoothstep(0.0, 0.5, li)));   // the shadowed bodies are thin: the sky shows through",
    "      vec2 cv = vec2((cp.x - 720.0)/mix(560.0, 680.0, R), (cp.y - 312.0)/120.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);                       // the headline keeps clear sky: wider and quieter there",
    "      float top = smoothstep(250.0, 110.0, cp.y)*(1.0 - smoothstep(700.0, 1000.0, cp.x));",
    "      // SUNRISE: deep in a heap the holes show thin cloud, not bare cobalt (on the light clouds they read as cut paper);",
    "      // colour only, the shapes and the stars' cloud cover are untouched",
    "      float veil = R*smoothstep(-0.08, 0.1, heap)*smoothstep(0.06, 0.4, m)*(1.0 - 0.9*calm)*(1.0 - top);",
    "      col = mix(col, mix(skyC, body, 0.35), 0.85*veil);",
    "      col = mix(col, cc, 0.88*a*(1.0 - 0.88*top)*(1.0 - mix(0.65, 0.93, R)*calm));",
    "      gCloud = a;                                                   // how much cloud is here, for the stars",
    "#else",
    "      float a = smoothstep(th, th + mix(0.04, 0.018, smoothstep(380.0, 440.0, cp.y)), d0)*smoothstep(0.1, 0.4, m);",
    "      // light: full where the sample toward the sun has left the cloud, fading over the puff's body",
    "      float lit = (1.0 - smoothstep(th - 0.02, th + 0.17, d1))*smoothstep(-0.06, 0.02, d0 - d1);   // only faces turned to the sun",
    "      // the sun is level with the low cloudlets: they glow nearly whole, darker only on their tops",
    "      float lowC = smoothstep(380.0, 455.0, y);",
    "      lit = max(lit, lowC*(0.2 + 0.2*nearSun)*(1.0 - smoothstep(0.0, 0.1, d1 - d0)));",
    "      float shadeS = smoothstep(0.0, 0.12, d1 - d0)*(1.0 - lit);   // tops turned away from the sun",
    "      float top = smoothstep(250.0, 110.0, cp.y);",
    "      vec3 body = C(52.0, 60.0, 98.0);",
    "      body = mix(body, C(66.0, 72.0, 110.0), smoothstep(150.0, 260.0, y));",
    "      body = mix(body, C(82.0, 80.0, 114.0), smoothstep(260.0, 350.0, y));",
    "      body = mix(body, C(128.0, 96.0, 118.0), smoothstep(340.0, 405.0, y));",
    "      body = mix(body, C(198.0, 128.0, 118.0), smoothstep(392.0, 455.0, y));",
    "      // the low streaks over the far left hill are in shadow: dark mauve",
    "      body = mix(body, C(96.0, 84.0, 108.0), smoothstep(620.0, 120.0, cp.x)*smoothstep(400.0, 460.0, y)*0.75);",
    "      // low cloudlets beside the sun are lit almost whole",
    "      body = mix(body, C(206.0, 116.0, 106.0), nearSun*smoothstep(380.0, 450.0, y)*0.75);",
    "      body = mix(body, C(230.0, 146.0, 114.0), gauss(dx, 0.0, 230.0)*smoothstep(395.0, 450.0, y)*0.8);",
    "      vec3 shadow = body*vec3(0.84, 0.86, 0.94);",
    "      vec3 rimC = C(150.0, 106.0, 122.0);",
    "      rimC = mix(rimC, C(214.0, 128.0, 112.0), smoothstep(150.0, 260.0, y));",
    "      rimC = mix(rimC, C(238.0, 142.0, 110.0), smoothstep(260.0, 370.0, y));",
    "      rimC = mix(rimC, C(248.0, 164.0, 114.0), smoothstep(370.0, 470.0, y));",
    "      rimC = mix(rimC, C(252.0, 184.0, 120.0), nearSun*smoothstep(360.0, 470.0, y)*0.3);",
    "      float sideL = 1.0 - 0.25*smoothstep(700.0, 150.0, cp.x)*smoothstep(200.0, 330.0, cp.y) - 0.35*smoothstep(500.0, 100.0, cp.x)*smoothstep(420.0, 460.0, cp.y);",
    "      float litA = clamp(lit*sideL*(0.6 + 0.4*lift)*(1.0 + 0.3*sc), 0.0, 1.0);",
    "      // calm behind the headline: same shapes, lower contrast",
    "      vec2 cv = vec2((cp.x - 720.0)/480.0, (cp.y - 312.0)/106.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);",
    "      vec3 cc = mix(body, shadow, shadeS*0.8);",
    "      cc = mix(cc, rimC, litA*(1.0 - 0.9*top)*(1.0 - 0.5*calm));",
    "      col = mix(col, cc, a*mix(0.8, 1.0, litA)*(1.0 - 0.5*top)*(1.0 - 0.45*calm));",
    "#endif",
    "    }",
    "  }",
    "",
    "  // ---- distant land and mist ----",
    "  if (y > 440.0 && pg.y < cg + 34.0) {   // the grass body is fully opaque by cg + 30",
    "    vec2 pf = P + PARL*0.12;",
    "    float rf = ridgeFar(pf.x);",
    "    vec2 pm = P + PARL*0.3;",
    "    float mn = fbm4(vec2((pm.x - t*3.5)*0.0052, pm.y*0.045 + t*0.006));",
    "    float glowX = gauss(pm.x, sun.x + 20.0, 300.0)*gauss(pm.y, 536.0, 40.0);",
    "    vec3 mistC = mix(C(104.0, 100.0, 128.0), C(204.0, 146.0, 130.0), glowX);",
    "    // SUNRISE: a clean lavender blue where the sun has not reached, pearl, then gold where it has (blue and gold meet only",
    "    // through pearl, at high lightness, never through grey or mauve)",
    "    float glowS = gauss(pm.x, sun.x + 20.0, 200.0)*gauss(pm.y, 540.0, 60.0);",
    "    vec3 mistS = mix(C(136.0, 156.0, 222.0), C(222.0, 228.0, 242.0), smoothstep(0.3, 0.6, glowS));",
    "    mistS = mix(mistS, C(255.0, 206.0, 152.0), smoothstep(0.55, 0.95, glowS));",
    "    float warmL = glowS*R;",
    "    mistC = mix(mistC, mistS, R);",
    "    mistC *= 0.94 + 0.14*mn;",
    "    mistC = mix(mistC, mistC*1.12, sc);",
    "    float aa = k;",
    "    // far range: hazy mauve peaks, almost sky where they pass in front of the sun",
    "    if (pf.y > rf - 2.0) {",
    "      vec3 fcol = mix(SR(C(108.0, 96.0, 118.0), C(100.0, 106.0, 160.0)), SR(C(80.0, 84.0, 112.0), C(82.0, 92.0, 146.0)), smoothstep(650.0, 1250.0, pf.x));",
    "      fcol = mix(fcol, SR(C(134.0, 104.0, 116.0), C(142.0, 154.0, 204.0)), gauss(pf.x, 395.0, 55.0)*gauss(pf.y, rf, 14.0)*0.7);",
    "      fcol = mix(fcol, SR(C(64.0, 74.0, 106.0), C(66.0, 80.0, 136.0)), smoothstep(1150.0, 1350.0, pf.x)*0.8);",
    "      // (SUNRISE: in front of the sun the far range stays a blue silhouette, the light only on its edge: a warm haze over a",
    "      // blue ridge is grey)",
    "      fcol = mix(fcol, C(200.0, 136.0, 120.0), (1.0 - R)*gauss(pf.x, sun.x, 140.0)*0.7*(1.0 - smoothstep(rf + 2.0, rf + 16.0, pf.y)));",
    "      fcol = mix(fcol, mistC, smoothstep(rf + 6.0, rf + 30.0, pf.y)*0.85*(1.0 - 0.7*warmL));   // (SUNRISE: not into the warm or pearl mist: grey)",
    "      float ia = smoothstep(rf, rf + aa, pf.y);",
    "      col = mix(col, fcol, ia);",
    "      col += C(250.0, 190.0, 120.0)*(1.0 - smoothstep(0.0, mix(4.0, 2.5, R), pf.y - rf))*gauss(pf.x, sun.x, mix(170.0, 220.0, R))*mix(0.35, 0.6, R)*ia;",
    "    }",
    "    // layered ridges in the mist, right of the sun, nearer ones darker",
    "    vec2 p1 = P + PARL*0.16;",
    "    float top1 = 526.0 - bump(p1.x, 1170.0, 90.0, 12.0) - bump(p1.x, 1320.0, 120.0, 22.0) - bump(p1.x, 1480.0, 110.0, 26.0) + (noise1(p1.x*0.02 + 11.0) - 0.5)*6.0",
    "                 + 0.22*max(1080.0 - p1.x, 0.0);",
    "    vec3 tmp = hillLayer(col, p1, top1, SR(C(58.0, 69.0, 99.0), C(52.0, 72.0, 128.0)), mistC, 0.3, 3.0, 0.3, 7.0, aa, mn, warmL);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p1.x));",
    "    // low wooded ridges just under the far line, either side of the sun",
    "    vec2 p0 = P + PARL*0.2;",
    "    float top0 = 515.0 + (noise1(p0.x*0.012 + 5.0) - 0.5)*9.0 + 0.3*max(p0.x - 1060.0, 0.0) + 0.3*max(700.0 - p0.x, 0.0);",
    "    tmp = hillLayer(col, p0, top0, SR(C(92.0, 84.0, 104.0), C(80.0, 90.0, 150.0)), mistC, 0.7, 27.0, 0.3, 5.0, aa, mn, warmL);",
    "    col = mix(col, tmp, smoothstep(600.0, 660.0, p0.x)*(1.0 - smoothstep(1080.0, 1130.0, p0.x)));",
    "    // a bright mist sea in front of their feet, between the far range and the nearer hills",
    "    float sea = gauss(pm.y, mix(543.0, 556.0, smoothstep(1000.0, 1180.0, pm.x)), mix(15.0, 21.0, gauss(pm.x, 950.0, 160.0)))*smoothstep(620.0, 740.0, pm.x)*(1.0 - 0.6*smoothstep(1100.0, 1250.0, pm.x));",
    "    float wisp = smoothstep(0.4, 0.68, mn);",
    "    float seaA = clamp(sea*(0.45 + 0.55*wisp), 0.0, 0.95);",
    "    seaA = mix(seaA, 0.95*smoothstep(0.12, 0.5, seaA), warmL);       // (SUNRISE: where the mist glows it is a solid sheet with a short edge, not a veil over the blue hills)",
    "    col = mix(col, mistC*(1.04 + 0.18*wisp), seaA);",
    "    vec2 p2 = P + PARL*0.24;",
    "    float top2 = 550.0 - bump(p2.x, 1190.0, 80.0, 12.0) - bump(p2.x, 1390.0, 110.0, 22.0) + (noise1(p2.x*0.025 + 2.0) - 0.5)*6.0",
    "                 + 0.25*max(1040.0 - p2.x, 0.0);",
    "    tmp = hillLayer(col, p2, top2, SR(C(40.0, 56.0, 84.0), C(40.0, 58.0, 108.0)), mistC, 0.45, 9.0, 0.42, 9.0, aa, mn, warmL);",
    "    col = mix(col, tmp, smoothstep(860.0, 920.0, p2.x));",
    "    // and a second sheet of mist in front of that ridge's foot, on the right",
    "    float seaMid = gauss(pm.y, 574.0 - 8.0*smoothstep(1250.0, 1440.0, pm.x) + 6.0*(mn - 0.5), 19.0)*smoothstep(1080.0, 1200.0, pm.x);",
    "    col = mix(col, mistC*(0.98 + 0.16*wisp), clamp(seaMid*(0.3 + 0.6*wisp), 0.0, 0.85));",
    "    vec2 p3 = P + PARL*0.3;",
    "    float top3 = 598.0 - bump(p3.x, 1090.0, 60.0, 10.0) - bump(p3.x, 1300.0, 90.0, 14.0) - bump(p3.x, 1440.0, 90.0, 20.0) + (noise1(p3.x*0.03 + 6.0) - 0.5)*6.0",
    "                 + 0.3*max(1060.0 - p3.x, 0.0);",
    "    tmp = hillLayer(col, p3, top3, SR(C(28.0, 43.0, 69.0), C(30.0, 46.0, 92.0)), mistC, 0.45, 13.0, 0.45, 11.0, aa, mn, warmL);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p3.x));",
    "    float seaLow = gauss(pm.y, 618.0 + 6.0*(mn - 0.5), 20.0)*smoothstep(1150.0, 1260.0, pm.x);",
    "    col = mix(col, mistC*(0.95 + 0.16*wisp), clamp(seaLow*(0.35 + 0.65*wisp), 0.0, 0.9));",
    "    vec2 p4 = P + PARL*0.38;",
    "    float top4 = 630.0 - 16.0*smoothstep(1250.0, 1440.0, p4.x) + (noise1(p4.x*0.03 + 1.0) - 0.5)*8.0 + 0.3*max(1250.0 - p4.x, 0.0);",
    "    tmp = hillLayer(col, p4, top4, SR(C(22.0, 34.0, 56.0), C(24.0, 38.0, 78.0)), mistC, 0.3, 17.0, 0.45, 13.0, aa, mn, warmL);",
    "    col = mix(col, tmp, smoothstep(1120.0, 1170.0, p4.x));",
    "    // the dark wooded hill on the left",
    "    vec2 ph = P + PARL*0.42;",
    "    float hl = hillL(ph.x);",
    "    float cnh = canopy(ph.x, 9.0, 21.0, 12.0, (0.35 + 0.65*clumps(ph.x, 4.0, 0.5))*(1.0 - smoothstep(760.0, 860.0, ph.x)));",
    "    float inh = smoothstep(hl - cnh + 2.0, hl - cnh + 2.0 + aa, ph.y);",
    "    vec3 hc = mix(SR(C(40.0, 56.0, 84.0), C(36.0, 52.0, 98.0)), SR(C(43.0, 55.0, 77.0), C(38.0, 52.0, 92.0)), smoothstep(hl, hl + 50.0, ph.y));",
    "    hc = mix(hc, SR(C(31.0, 45.0, 68.0), C(28.0, 42.0, 82.0)), 1.0 - smoothstep(hl - 1.0, hl + 4.0, ph.y));",
    "    // SUNRISE: the crowns of its trees catch the low sun",
    "    hc += C(196.0, 124.0, 64.0)*R*1.1*(1.0 - smoothstep(hl - cnh + 2.0, hl - cnh + 4.0, ph.y))*(0.3 + 0.7*smoothstep(200.0, 760.0, ph.x));   // added light: a warm rim, never a grey blend",
    "    hc *= 0.96 + 0.08*mn;",
    "    col = mix(col, hc, inh);",
    "    // the long lit slope and its tree line",
    "    vec2 pl = P + PARL*0.5;",
    "    float st = slopeTop(pl.x);",
    "    float dl = 0.95*gauss(pl.x, 760.0, 170.0) + 0.6*gauss(pl.x, 1105.0, 22.0) + 0.6*gauss(pl.x, 1290.0, 20.0)",
    "             + 0.35*gauss(pl.x, 1000.0, 40.0) + 0.3*gauss(pl.x, 470.0, 70.0);",
    "    float cnl = canopy(pl.x, 11.0, 33.0, 18.0, clamp(dl, 0.0, 1.0)*(0.45 + 0.55*clumps(pl.x, 8.0, 0.5)));",
    "    float inl = smoothstep(st - cnl + 2.0, st - cnl + 2.0 + aa, pl.y);",
    "    float tl = 1.0 - smoothstep(st + 1.0, st + 6.0, pl.y);",
    "    vec3 cl = mix(SR(C(46.0, 57.0, 78.0), C(44.0, 58.0, 106.0)), SR(C(52.0, 59.0, 74.0), C(50.0, 60.0, 104.0)), smoothstep(450.0, 750.0, pl.x));",
    "    cl = mix(cl, SR(C(34.0, 46.0, 63.0), C(34.0, 46.0, 88.0)), smoothstep(820.0, 1060.0, pl.x));",
    "    cl = mix(cl, SR(C(54.0, 55.0, 64.0), C(58.0, 70.0, 128.0)), gauss(pl.x, 880.0, 120.0)*gauss(pl.y, st + 30.0, 30.0)*0.6);",
    "    cl = mix(cl, SR(C(40.0, 50.0, 70.0), C(38.0, 48.0, 86.0)), smoothstep(st + 25.0, st + 110.0, pl.y)*0.7);",
    "    // SUNRISE: the top of the long slope catches the low sun, strongest toward it",
    "    cl += C(206.0, 132.0, 70.0)*R*0.95*exp(-max(pl.y - st, 0.0)/3.0)*(0.25 + 0.75*gauss(pl.x, sun.x - 120.0, 420.0));",
    "    float hz = exp(-max(pl.y - st, 0.0)/14.0)*0.15*gauss(pl.x, sun.x - 80.0, 260.0);",
    "    cl = mix(cl, mistC, hz*(1.0 - tl)*(1.0 - 0.7*R));",
    "    // the ground rolls: soft bands that follow the slope, and the drifting mist shadow",
    "    cl *= (0.93 + 0.14*noise1(pl.x*0.006 + (pl.y - st)*0.05 + 4.0))*(0.95 + 0.1*mn);",
    "    vec3 treeC = mix(SR(C(30.0, 42.0, 64.0), C(30.0, 42.0, 82.0)), SR(C(38.0, 46.0, 66.0), C(36.0, 46.0, 84.0)), smoothstep(500.0, 1000.0, pl.x));",
    "    treeC += C(200.0, 128.0, 66.0)*R*1.0*(1.0 - smoothstep(st - cnl + 2.0, st - cnl + 4.0, pl.y))*(0.3 + 0.7*gauss(pl.x, sun.x, 450.0));",
    "    cl = mix(cl, treeC, tl*smoothstep(0.5, 2.0, cnl));",
    "    col = mix(col, cl, inl);",
    "    // the light breaking over the far land",
    "    col = mix(col, SR(C(252.0, 192.0, 128.0), C(255.0, 222.0, 160.0)), (mix(0.24, 0.5, R) + 0.12*sc)*gauss(P.x, sun.x, mix(130.0, 170.0, R)*(1.0 + 0.4*sc))*gauss(P.y, 498.0, mix(13.0, P.y > 498.0 ? 5.0 : 16.0, R)*(1.0 + 0.8*sc)));",
    "  }",
    "",
    "  // ---- foreground hill: dark body, a fringe of thin swaying blades, a few small flowers ----",
    "  if (pg.y > cg - 210.0) {",
    "    float wd = wind(pg.x, t);",
    "    float aa = k;",
    "    float cslope = 0.092 + 1.2e-5*pg.x;           // local slope of the crest (crestG')",
    "    float goldM = 0.14 + 0.7*gauss(pg.x, 560.0, 300.0) + 0.3*gauss(pg.x, 1100.0, 180.0) + 0.1*R;",
    "    vec3 bladeC = SR(C(13.0, 16.0, 22.0), C(14.0, 18.0, 30.0));",
    "    vec3 goldC = SR(C(222.0, 170.0, 96.0), C(255.0, 200.0, 110.0));",
    "    for (int L = 0; L < 4; L++) {",
    "      float fl = float(L);",
    "      // back to front: short and dense, then taller and sparser",
    "      float cw   = fl < 0.5 ? 1.7  : (fl < 1.5 ? 2.8  : (fl < 2.5 ? 6.5  : 17.0));",
    "      float hMin = fl < 0.5 ? 18.0 : (fl < 1.5 ? 25.0 : (fl < 2.5 ? 28.0 : 40.0));   // shorter front blades, per user \"this grass is too long\"",
    "      float hRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 30.0 : (fl < 2.5 ? 38.0 : 42.0));",
    "      float dMin = fl < 0.5 ? 8.0  : (fl < 1.5 ? 12.0 : (fl < 2.5 ? 12.0 : 22.0));   // the back rows rooted under the hill's dark edge, per user \"I can see the root, which is looking like the floating\"",
    "      float dRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 28.0 : (fl < 2.5 ? 50.0 : 60.0));",
    "      float prob = fl < 0.5 ? 1.0  : (fl < 1.5 ? 1.0  : (fl < 2.5 ? 0.88 : 0.62));",
    "      float wid  = fl < 0.5 ? 1.25 : (fl < 1.5 ? 1.45 : (fl < 2.5 ? 1.7  : 2.0));",
    "      float hTyp = hMin + 0.5*hRng;",
    "      float above = max(cg + dMin + 0.5*dRng - pg.y, 0.0);",
    "      float shift = min(wd*(0.5 + hTyp/110.0), 0.85)*(0.3*above + 0.7*above*above/hTyp);",
    "      float ci = floor((pg.x - shift)/cw);",
    "      float cov = 0.0; float tip = 0.0; float shade = 0.0; float seed = 0.0;",
    "      if (pg.y < cg + dMin + dRng + 1.0 && pg.y > cg + dMin - hMin - hRng - 12.0) for (int j = -4; j <= 4; j++) {",
    "        float id = ci + float(j);",
    "        vec2 h = hash22(vec2(id, 31.0 + fl*17.0));",
    "        float h3 = hash11(id*1.37 + fl*7.1);",
    "        if (h3 > prob) continue;",
    "        float rx = (id + h.x)*cw;",
    "        float ry = cg + cslope*(rx - pg.x) + dMin + dRng*h.y;",
    "        float H = (hMin + hRng*fract(h.x*7.13 + h.y*3.1))*(1.0 - 0.12*smoothstep(800.0, 1350.0, rx))*(0.8 + 0.3*noise1(rx*0.011 + fl*5.0));",
    "        float s = (ry - pg.y)/H;",
    "        if (s < 0.0 || s > 1.08) continue;",
    "        float lim = 3.6*cw/H;",
    "        float flut = (0.035 + 0.16*clamp(wd - 0.1, 0.0, 1.0))*sin(t*(2.2 + 1.6*fract(h.x*9.7)) + h.x*40.0);",
    "        float lean = clamp((fract(h.y*5.31) - 0.5)*1.3, -lim, lim) + min(wd*(0.5 + H/110.0), 0.85) + flut;   // a gust bends a blade to about 40 degrees, no flatter",
    "        float bx = rx + lean*H*(0.25*s + 0.75*s*s);",
    "        float w = wid*(1.0 - 0.72*min(s, 1.0));",
    "        float d = abs(pg.x - bx);",
    "        float c = clamp((w + 0.5*aa - d)/aa, 0.0, 1.0)*min(1.0, 2.0*w/aa)*(1.0 - smoothstep(0.98, 1.08, s))*smoothstep(0.0, 0.25, s);   // the base fades into the dark, no cut stub",
    "        // a few tall blades carry a small seed head, lit gold from behind",
    "        float sh = fract(h3*29.3);",
    "        if (fl > 1.5 && sh < 0.12) {",
    "          vec2 sd = vec2(pg.x - (rx + lean*H), (pg.y - (ry - H) - 2.0)*0.34);",
    "          float hm = (1.0 - smoothstep(1.0, 1.0 + aa, length(sd)))*0.7;",
    "          if (hm > c) { c = hm; }",
    "          seed = max(seed, hm);",
    "        }",
    "        if (c > cov) { cov = c; tip = smoothstep(0.55, 0.97, s)*min(1.0, (fract(h3*13.7) > 0.5 ? 1.0 : 0.12) + 2.2*max(wd - 0.12, 0.0)); shade = fract(h.x*31.7); }",
    "      }",
    "      float sunk = smoothstep(cg + 8.0, cg + 46.0, pg.y);",
    "      vec3 bc = mix(bladeC, SR(C(24.0, 29.0, 39.0), C(30.0, 38.0, 62.0)), shade*shade*0.7*(1.0 - sunk));",
    "      float gw = clamp(max(tip*mix(0.8, 1.0, R), seed)*goldM*(1.0 - 0.75*sunk), 0.0, 1.0);",
    "      bc = mix(mix(bc, goldC, gw), bc + goldC*gw*0.85, R);   // (SUNRISE: the gold added as light, so a part-lit tip is amber, not khaki)",
    "      bc = mix(bc, SR(C(15.0, 19.0, 26.0), C(14.0, 18.0, 28.0)), sunk*0.7);",
    "      col = mix(col, bc, cov);",
    "      if (L == 1) {",
    "        // the solid body after the two back layers, its top soft and broken into tufts",
    "        float bt = cg + 12.0 + (noise1(pg.x*0.05 + 3.0) - 0.5)*14.0 + (noise1(pg.x*0.19) - 0.5)*6.0;",
    "        float bodyA = smoothstep(bt - 6.0, bt + 8.0, pg.y);",
    "        vec3 body = mix(SR(C(15.0, 18.0, 24.0), C(16.0, 20.0, 34.0)), SR(C(10.0, 13.0, 18.0), C(11.0, 14.0, 22.0)), smoothstep(cg, cg + 80.0, pg.y));",
    "        body = mix(body, PAGE, smoothstep(cg + 60.0, cg + 140.0, pg.y));",
    "        body = mix(body, SR(C(44.0, 42.0, 40.0), C(54.0, 50.0, 74.0)), (1.0 - smoothstep(bt - 2.0, bt + 12.0, pg.y))*goldM*0.45);",
    "        col = mix(col, body, bodyA);",
    "        // (the wildflowers were removed 2026-10-10, per user \"what are these white dots?\", then \"remove\": at their size they read as specks)",
    "      }",
    "    }",
    "  }",
    "",
    "  col *= mix(0.8, 1.0, R);                       // a lower exposure, same hues, so the sub reads on the lit clouds (SUNRISE: the sunrise's colours are its own, at 1)",
    "  // ---- meet the page: the bottom reaches #090a0e exactly ----",
    "  // the footer (per user \"don't you think the footer need the change to match the hills?\") is this sky with the land",
    "  // under the bottom edge, rising out of the page's black; the hero meets the page at its foot",
    "  float fade = uFoot > 0.5 ? 1.0 - smoothstep(0.0, mix(560.0, 420.0, R), Ppage) : smoothstep(700.0, 788.0, Ppage);   // SUNRISE: the footer's sky rises out of the black sooner",
    "  col = mix(col, PAGE, fade);",
    "  col += (hash12(fc + fract(t*7.13)*61.0) - 0.5)*(1.0/255.0)*max(uFoot, 1.0 - fade);   // the footer's fade from black is dithered too, or it bands",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "#ifdef SOFT_CLOUDS",
    "  if (uMask > 0.5) gl_FragColor = vec4(gCloud, 0.0, 0.0, 1.0);",
    "#endif",
    "}"
  ].join('\n');

  // ---- DUSK (2026-10-11, every footer, per user "My suggestion: make the page one day. You arrive at sunrise and reach the
  // footer at dusk", after "so hero has no star, and footer has star. what make you make this decision?"): the rose mood
  // built that day (the pink hour: a vivid violet-blue sky, coral and pink cloud light), whose footer reads as evening, so
  // the whale's stars and the rising embers belong to its sky. Only its footer mode (uFoot) is used on the site; the hero
  // half is ?look=rose's (dawn-rose.js). The story is in .claude/notes/footer.md.
  var FRAG_DUSK = [
    "#define SOFT_CLOUDS 1",
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uPointer;",
    "uniform float uScroll;",
    "uniform float uHorizon;                       // where the horizon goes, a share of the height (0 keeps the painting's)",
    "uniform float uFoot;                          // 1 in the footer: the sky alone, out of the page's black at the top",
    "#define C(r,g,b) (vec3(r,g,b)*(1.0/255.0))",
    "const vec3 PAGE = vec3(9.0, 10.0, 14.0)/255.0;",
    "",
    "// ---- hashes and value noise ----",
    "float hash11(float p){ p = fract(p*0.1031); p *= p + 33.33; p *= p + p; return fract(p); }",
    "float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }",
    "vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz)*p3.zy); }",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "vec2 vnoise2(vec2 p){",
    "  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0 - 2.0*f);",
    "  return mix(mix(hash22(i), hash22(i + vec2(1.0, 0.0)), u.x), mix(hash22(i + vec2(0.0, 1.0)), hash22(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float noise1(float x){ float i = floor(x); float f = fract(x); return mix(hash11(i), hash11(i + 1.0), f*f*(3.0 - 2.0*f)); }",
    "const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);",
    "// fbm budget per pixel: clouds = fbm3v (3-octave domain warp) + 2 x fbmCl (5 octaves each: the shape, and the shape",
    "// sampled toward the sun for the lit undersides), only inside a cloud-bank mask and above y 500;",
    "// distant land = 1 x fbm4 (4 octaves, the mist), only for y > 440 above the opaque grass body.",
    "// At most 4 fbm evaluations on a pixel (clouds over the land, y 440-500), 17 value-noise octaves. Open sky: 0.",
    "// cloud fbm, 5 value-noise octaves in all: 4 of rounded puffs (gain 0.5) and 1 long streak along the bank",
    "float fbmCl(vec2 q, float sa){",
    "  float s = 0.0; float a = 0.5; vec2 p = q;",
    "  for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2); a *= 0.5; }",
    "  return s/0.9375 + sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "}",
    "// the cloud deck in soft perspective: puffs flatten toward the horizon (vertical only, so nothing skews), and the deck",
    "// curves up toward both corners around the sun (S(x) = -90 log cosh((973 - x)/300))",
    "vec2 deckQ(vec2 cp, float t){",
    "  float d = 860.0 - cp.y;",
    "  float sa = clamp((973.0 - cp.x)/300.0, -6.0, 6.0);",
    "  float shear = -90.0*log(0.5*(exp(sa) + exp(-sa)));",
    "  return vec2((cp.x - 973.0)/40.0 - t*0.055, 17400.0/d - shear/20.0);",
    "}",
    "// the hero's cloud field, or in the footer the same paint at a larger scale, somewhere else in the noise",
    "vec2 cloudQ(vec2 p, float t){",
    "  vec2 q = deckQ(p, t);",
    "  return uFoot > 0.5 ? q*0.8 + vec2(23.7, 5.3) : q;",
    "}",
    "float fbm4(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = ROT*p*2.03 + vec2(4.1, 2.7); a *= 0.5; } return s/0.9375; }",
    "vec2 fbm3v(vec2 p){ vec2 s = vec2(0.0); float a = 0.5; for (int i = 0; i < 3; i++){ s += a*vnoise2(p); p = ROT*p*2.07 + vec2(3.1, 1.3); a *= 0.5; } return s/0.875; }",
    "",
    "float bump(float x, float c, float w, float h){ float d = (x - c)/w; return h*exp(-d*d); }",
    "// linear segment: the sky ramp keeps a constant slope between stops (smoothstep flattens at each stop and bands)",
    "float ramp(float a, float b, float x){ return clamp((x - a)/(b - a), 0.0, 1.0); }",
    "float gauss(float x, float c, float w){ float d = (x - c)/w; return exp(-d*d); }",
    "float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0); return length(pa - ba*h); }",
    "float segM(vec2 p, vec2 a, vec2 b, float r){ return 1.0 - smoothstep(r*0.4, r, segD(p, a, b)); }",
    "",
    "// ---- wind: a slow breeze, and a gust every 5s that travels left to right across the hill (per user \"how to make the grass",
    "// to be more obvious to be shaken by wind?\": gusts twice as strong and more often, every blade fluttering, tips lit as they bend) ----",
    "float gust(float x, float t, float j){",
    "  float gx = -700.0 + (t - j*5.0)*380.0;",
    "  float d = x - gx;",
    "  float w = d > 0.0 ? 240.0 : 560.0;",
    "  return exp(-(d*d)/(w*w))*(0.7 + 0.6*hash11(j*3.17 + 1.3));",
    "}",
    "float wind(float x, float t){",
    "  float k = floor(t/5.0);",
    "  float g = gust(x, t, k) + gust(x, t, k - 1.0) + gust(x, t, k - 2.0) + gust(x, t, k - 3.0);",
    "  float n = noise1(x*0.0035 - t*0.30);",
    "  return 0.04 + 0.08*n + 0.36*g;",
    "}",
    "",
    "// ---- landforms (design px, y down) ----",
    "float ridgeFar(float x){",
    "  // fitted to the painting's far line: two peaks left of the sun, a low saddle at the sun, a peak far right",
    "  float y = 495.0 - bump(x, 390.0, 45.0, 12.0) - bump(x, 590.0, 45.0, 4.0) - bump(x, 450.0, 160.0, 2.2) + bump(x, 800.0, 140.0, 12.0)",
    "          + bump(x, 975.0, 60.0, 4.0) + bump(x, 1060.0, 60.0, 7.8) + bump(x, 1200.0, 160.0, 2.2) - bump(x, 1290.0, 40.0, 13.5)",
    "          - bump(x, 1420.0, 80.0, 8.0) - bump(x, 120.0, 140.0, 6.0);",
    "  return y + (noise1(x*0.018) - 0.5)*4.0 + (noise1(x*0.07) - 0.5)*1.4;",
    "}",
    "float softplus(float z){ return z > 12.0 ? z : log(1.0 + exp(z)); }",
    "// the long lit slope that runs from behind the grass down into the valley, its top edge carrying the tree line",
    "float slopeTop(float x){ return 516.0 + 16.0*softplus((x - 620.0)/100.0) + (noise1(x*0.010 + 7.0) - 0.5)*7.0 + (noise1(x*0.04) - 0.5)*2.0; }",
    "// the dark wooded hill on the left, behind the slope",
    "float hillL(float x){ return 463.0 + 0.085*x + 6.0e-5*x*x - bump(x, 680.0, 110.0, 22.0) + (noise1(x*0.012 + 3.0) - 0.5)*8.0 + (noise1(x*0.045) - 0.5)*2.5; }",
    "float crestG(float x){",
    "  float y = 532.0 + 0.092*x + 6.0e-6*x*x;",
    "  return y + (noise1(x*0.010 + 7.0) - 0.5)*9.0 + (noise1(x*0.04) - 0.5)*3.0;",
    "}",
    "",
    "// a tree canopy above a ridge: overlapping domes whose size follows a clump mask (1D, cheap)",
    "float canopy(float x, float cell, float seed, float rMax, float clump){",
    "  float hgt = 0.0;",
    "  float ci = floor(x/cell);",
    "  for (int j = -2; j <= 2; j++){",
    "    float id = ci + float(j);",
    "    vec2 h = hash22(vec2(id, seed));",
    "    float r = rMax*(0.22 + 0.78*h.y*h.y)*clump;",
    "    float dxx = x - (id + h.x)*cell;",
    "    float d2 = r*r - dxx*dxx;",
    "    float lift = (fract(h.y*9.7) - 0.35)*r*0.6;",
    "    if (d2 > 0.0) hgt = max(hgt, sqrt(d2)*0.85 + lift);",
    "  }",
    "  return hgt;",
    "}",
    "float clumps(float x, float seed, float fill){ return smoothstep(0.62 - fill, 0.86 - fill, noise1(x*0.03 + seed))*(0.4 + 0.6*noise1(x*0.11 + seed*3.0)); }",
    "",
    "// one hill layer behind the mist: body, a fringe of small trees, its foot dissolving into mist",
    "vec3 hillLayer(vec3 col, vec2 p, float top, vec3 c, vec3 mist, float mistAmt, float tSeed, float tDens, float tR, float aa, float wv){",
    "  float cn = canopy(p.x, tR*1.15, tSeed, tR*1.25, clumps(p.x, tSeed, tDens));",
    "  float inside = smoothstep(top - cn, top - cn + aa, p.y);",
    "  // the foot dissolves into mist, unevenly: the drifting mist noise lifts and lowers the fog line",
    "  float fogLine = top + 8.0 + 26.0*(1.0 - wv);",
    "  vec3 cc = mix(c, mist, smoothstep(fogLine, fogLine + 34.0, p.y)*mistAmt*(0.55 + 0.6*wv));",
    "  return mix(col, cc, inside);",
    "}",
    "",
    "#ifdef SOFT_CLOUDS",
    "// SOFT HELPERS for ?look=clouds: the hero's bank mask again (the same segments as in main()), to look toward the light",
    "float bankMask(vec2 cp){",
    "  float m = 0.0;",
    "  m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "  m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "  m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "  m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "  m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "  m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "  m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "  m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "  m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "  m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "  return m;",
    "}",
    "// the cloud's threshold for a mask value",
    "float softTh(float m){ return mix(0.80, 0.30, smoothstep(0.0, 0.8, m)); }",
    "// a cheap look at the density: only the shape's first octave (one value noise), the billows at their mean and the long",
    "// streak st taken from the point itself (it barely changes over a few dozen px)",
    "float softLo(vec2 q, float st){ return 0.51*vnoise(ROT*q) + 0.265 + st; }",
    "// the soft clouds' own noise space: the deck's, with the puffs larger and taller (rounder heaps, flatter only near the",
    "// horizon) and about a third of its curl toward the corners (the full curl slants the lumps into ledges there)",
    "vec2 softQ(vec2 p, float t){",
    "  float sx = clamp((973.0 - p.x)/300.0, -6.0, 6.0);",
    "  float uncurl = -0.65*(-90.0*log(0.5*(exp(sx) + exp(-sx))))/20.0;   // deckQ's shear term, about two thirds taken back",
    "  return (cloudQ(p, t) - vec2(0.0, uncurl*(uFoot > 0.5 ? 0.8 : 1.0)))*vec2(0.8, 0.64);",
    "}",
    "// the soft clouds' density, 5 value-noise octaves like fbmCl: one smooth octave for the heaps, then three billow octaves",
    "// (round bumps, softly creased between) for the cauliflower on them, and the long streak (st, returned); lo is the",
    "// heap alone (the billows at their mean), dm the shape without its finest octave (at its mean)",
    "float softD(vec2 q, float sa, out float st, out float lo, out float dm){",
    "  vec2 p = ROT*q;",
    "  float s = 0.5*vnoise(p); p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  st = sa*(vnoise(q*vec2(0.2, 0.62) + vec2(3.3, 8.8)) - 0.5);",
    "  lo = s/0.98 + 0.265 + st;",
    "  float v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  float b = 0.26*sqrt(v*v + 0.12);                           // a softened abs: round bumps, soft creases",
    "  v = 2.0*vnoise(p) - 1.0; p = ROT*p*2.02 + vec2(1.7, 9.2);",
    "  b += 0.15*sqrt(v*v + 0.08);",
    "  dm = (s + b)/0.98 + 0.052 + st;",
    "  v = 2.0*vnoise(p) - 1.0;",
    "  b += 0.07*sqrt(v*v + 0.05);",
    "  return (s + b)/0.98 + 0.02 + st;",
    "}",
    "#endif",
    "#ifdef SOFT_CLOUDS",
    "uniform float uMask;                          // 1: draw the cloud cover instead of the scene, for the page's stars",
    "float gCloud = 0.0;",
    "#endif",
    "void main(){",
    "  vec2 fc = gl_FragCoord.xy;",
    "  float aspect = uRes.x/uRes.y;",
    "  float k = 800.0/uRes.y;                       // design px per backing px",
    "  float cx = 720.0 + 220.0*clamp((1.6 - aspect)/1.0, 0.0, 1.0);",
    "  vec2 P = vec2((fc.x - 0.5*uRes.x)*k + cx, (uRes.y - fc.y)*k);",
    "  float t = uTime;",
    "  vec2 ptr = uPointer;",
    "  float sc = clamp(uScroll, 0.0, 1.0);",
    "  vec2 PAR = vec2(-48.0, -16.0)*ptr;            // nearest layer: +-24px x, +-8px y",
    "  vec2 PARL = vec2(0.0);                        // the land stays still under the cursor (per user \"do not let the hills shaking with the cursor\")",
    "  if (P.y >= 788.0 && uFoot < 0.5) { gl_FragColor = vec4(PAGE, 1.0); return; }",
    "  float Ppage = P.y;                            // the frame's own height, for meeting the page",
    "  // per user \"make the text contrast better\": the scene slides down until the dawn's horizon sits under the pill",
    "  if (uHorizon > 0.0) P.y -= uHorizon*800.0 - 497.0;",
    "  vec2 pg = P + PARL;",
    "  float cg = crestG(pg.x);",
    "",
    "  // ---- sky ----",
    "  vec2 sun = vec2(973.0 + ptr.x*115.0, 526.0 - 44.0*sc);",
    "  vec2 sunU = vec2(973.0/1440.0 - 0.5, 500.0/800.0 - 0.5);",
    "  float lift = 1.0 + 0.08*(1.0 - smoothstep(0.0, 0.7, length(ptr - sunU))) + 0.25*sc;",
    "  vec2 ps = P + PAR*0.05;",
    "  float y = ps.y;",
    "  float yr = uFoot > 0.5 ? 337.0 + (y - 337.0)*0.72 : y;   // ROSE: the footer runs through more of the ramp, so violet shows behind the word",
    "  // ROSE MORNING (the pink hour): a vivid periwinkle-to-violet overhead, lilac, then rose and peach toward the horizon.",
    "  // Behind the type the luminance stays where the live sky had it (low green, high red and blue: colour, not light);",
    "  // the light rises under the pill, where the exposure climbs (EXPO below)",
    "  vec3 sky = C(26.0, 50.0, 136.0);",
    "  sky = mix(sky, C(30.0, 56.0, 150.0),   ramp(0.0, 50.0, yr));",
    "  sky = mix(sky, C(36.0, 64.0, 168.0),   ramp(50.0, 100.0, yr));",
    "  sky = mix(sky, C(46.0, 72.0, 186.0),   ramp(100.0, 150.0, yr));",
    "  sky = mix(sky, C(60.0, 76.0, 196.0),   ramp(150.0, 200.0, yr));",
    "  sky = mix(sky, C(76.0, 80.0, 202.0),   ramp(200.0, 240.0, yr));",
    "  sky = mix(sky, C(98.0, 83.0, 200.0),   ramp(240.0, 280.0, yr));",
    "  sky = mix(sky, C(120.0, 90.0, 200.0),  ramp(280.0, 320.0, yr));",
    "  sky = mix(sky, C(140.0, 98.0, 195.0),  ramp(320.0, 350.0, yr));",
    "  sky = mix(sky, C(156.0, 96.0, 188.0), ramp(350.0, 380.0, yr));",
    "  sky = mix(sky, C(196.0, 110.0, 182.0), ramp(380.0, 410.0, yr));",
    "  sky = mix(sky, C(240.0, 138.0, 172.0), ramp(410.0, 440.0, yr));",
    "  sky = mix(sky, C(253.0, 155.0, 153.0), ramp(440.0, 470.0, yr));",
    "  sky = mix(sky, C(253.0, 172.0, 148.0), ramp(470.0, 510.0, yr));",
    "  sky += C(6.0, 6.0, 14.0)*smoothstep(300.0, 1440.0, ps.x)*(1.0 - smoothstep(0.0, 260.0, y));",
    "  sky = mix(sky, sky + C(16.0, 14.0, 26.0), sc*(1.0 - smoothstep(150.0, 500.0, y)));",
    "  float dx = ps.x - sun.x;",
    "  float dyUp = max(sun.y - 27.0 - y, 0.0);",
    "  float sgx = (dx > 0.0 ? 1050.0 : 600.0)*(1.0 + 0.35*sc);",
    "  float sgy = dx > 0.0 ? mix(165.0, 180.0, smoothstep(0.0, 250.0, dx)) : mix(165.0, 132.0, smoothstep(0.0, 300.0, -dx));",
    "  float halo = 0.68*exp(-(dx*dx)/(sgx*sgx) - (dyUp*dyUp)/(sgy*sgy*(1.0 + 0.6*sc)));",
    "  sky = mix(sky, C(252.0, 154.0, 158.0), clamp(halo*lift, 0.0, 0.92));          // a rose-peach halo, not orange",
    "  // the gold core rises with the sun; below its centre it falls off slowly, so rising never takes light away",
    "  float dyc = y - (sun.y - 29.0);",
    "  dyc = dyc > 0.0 ? dyc*(1.0 - 0.7*sc) : dyc;",
    "  float core = 0.84*exp(-(dx*dx)/(140.0*140.0*(1.0 + 0.5*sc)) - (dyc*dyc)/(34.0*34.0*(1.0 + 0.9*sc)));   // gold only right at the sun",
    "  sky = mix(sky, C(255.0, 206.0, 142.0), clamp(core*lift, 0.0, 0.95));",
    "  sky = mix(sky, C(252.0, 168.0, 156.0), 0.22*gauss(dx, 0.0, 260.0)*gauss(y, 425.0, 45.0)*lift);",
    "  // the hot spot where the sun breaks; as it rises the glow on the far line stays, so nothing gets darker",
    "  float spotR = y - 497.0 + 44.0*sc;",
    "  float spot = exp(-(dx*dx)/(36.0*36.0))*max(exp(-spotR*spotR/100.0), exp(-(y - 497.0)*(y - 497.0)/100.0));",
    "  sky = mix(sky, C(255.0, 232.0, 176.0), clamp(spot*0.6*lift, 0.0, 0.8));",
    "  float disc = 1.0 - smoothstep(11.0, 20.0, length(ps - sun));",
    "  sky = mix(sky, C(255.0, 236.0, 192.0), disc);",
    "  vec3 col = sky;",
    "  // ROSE: behind \"Say hello\" the footer's sky (the sky only, the corner clouds keep their light) is a deeper violet-blue: a",
    "  // multiply with less green than red and blue, so it gets deeper and more violet, never greyer, and the word keeps its contrast",
    "  if (uFoot > 0.5) col *= mix(vec3(1.0), vec3(0.86, 0.56, 0.76), smoothstep(200.0, 580.0, Ppage)*(1.0 - smoothstep(684.0, 740.0, Ppage)));",
    "  float nearSun = exp(-(dx*dx)/(420.0*420.0));",
    "",
    "  // ---- clouds: banks of rounded puffs, each puff lit on its underside toward the sun ----",
    "  if (y < 500.0) {",
    "    vec2 cp = P + PAR*0.06;",
    "    // bank masks traced from the painting: three diagonal bands on the left, a rising band and a heavy mass on the right",
    "    float m = 0.0;",
    "    m = max(m, segM(cp, vec2(-60.0, 212.0), vec2(445.0, 352.0), 84.0));",
    "    m = max(m, segM(cp, vec2(-90.0, 322.0), vec2(300.0, 404.0), 70.0));",
    "    m = max(m, 0.95*segM(cp, vec2(190.0, 396.0), vec2(650.0, 434.0), 36.0));",
    "    m = max(m, 0.8*segM(cp, vec2(20.0, 461.0), vec2(660.0, 467.0), 20.0));",
    "    m = max(m, 0.5*segM(cp, vec2(-90.0, 30.0), vec2(290.0, 140.0), 90.0));",
    "    m = max(m, 0.42*segM(cp, vec2(280.0, 88.0), vec2(470.0, 150.0), 34.0));",
    "    m = max(m, segM(cp, vec2(1085.0, 228.0), vec2(1540.0, 70.0), 96.0));",
    "    m = max(m, segM(cp, vec2(1180.0, 372.0), vec2(1540.0, 300.0), 90.0));",
    "    m = max(m, 0.62*segM(cp, vec2(700.0, 456.0), vec2(1540.0, 432.0), 44.0));",
    "    m = max(m, 0.45*segM(cp, vec2(820.0, 414.0), vec2(1250.0, 392.0), 24.0));",
    "    // the footer has its own clouds (per user \"do not you feel the footer's design elements are too repetitive with the",
    "    // hero? at last the cloud need to have the different shape\", then \"the cloud shape and distribution is too ugly\" of",
    "    // long streaks): two soft heaps rising from the bottom corners, framing \"Say hello\";",
    "    // the whale's band stays open sky",
    "    if (uFoot > 0.5) {",
    "      vec2 fp = vec2(cp.x, Ppage);",
    "      // (then, per user, at about 60% of the size and without the two companions: the word sits in open sky between them)",
    "      m = 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(40.0, 800.0))/vec2(340.0, 150.0)));",
    "      m = max(m, 1.0 - smoothstep(0.45, 1.0, length((fp - vec2(1420.0, 795.0))/vec2(360.0, 160.0))));",
    "      m *= smoothstep(470.0, 560.0, Ppage);",
    "    }",
    "    if (m > 0.02) {",
    "      vec2 q = cloudQ(cp, t);",
    "      vec2 w = fbm3v(q*0.42 + vec2(0.0, t*0.002));",
    "      vec2 wq = (w - 0.5)*vec2(1.0, 0.4);",
    "      float sa = mix(0.48, 0.22, smoothstep(390.0, 450.0, cp.y));",
    "      float d0 = fbmCl(q + wq, sa);",
    "      vec2 L = normalize(normalize(vec2(sun.x, 526.0) - cp) + vec2(0.0, 1.1));",
    "      float d1 = fbmCl(cloudQ(cp + L*7.0, t) + wq, sa);",
    "      float th = mix(0.80, 0.30, m);",
    "#ifdef SOFT_CLOUDS",
    "      // REAL DAWN CLOUDS (2026-10-11, per user \"the cloud looks like the anime. The rest of the element I think it is ok\"):",
    "      // the same banks in the same places, lit like the reference: each point asks how much cloud lies between it and the",
    "      // light (a full look 5px along it, cheap looks at 12, 26 and 46px; the finest grain left out so the light falls on",
    "      // lumps, not speckle), so the faces turned to the sun glow and the light fades gradually into slate bodies. The light",
    "      // comes up from the low sun onto the high clouds and down onto the crowns of the low banks; only the lower clouds",
    "      // turn warm (dusty rose, then peach), the high ones keep a cool lavender grey. A look up gives the crowns the sky's",
    "      // cool light. Heaps have crisp, lumpy outlines; thin cloud lets the sky through. Cost per cloud pixel: the warp, then",
    "      // 14 value-noise octaves (softD twice, softLo four times) against the anime's 10, and five looks at the bank mask.",
    "      vec2 wq2 = wq*0.6;",
    "      float lowW = smoothstep(220.0, 440.0, y);",
    "      vec2 Ls = normalize(vec2(sun.x, 526.0) - cp);                 // toward the sun, low on the horizon",
    "      float bankW = smoothstep(330.0, 440.0, y);                     // the low banks near the horizon",
    "      vec2 Lm = normalize(Ls + vec2(0.0, -mix(0.15, 1.25, bankW)));  // the sun's light: from below on the high clouds, onto the crowns of the low ones",
    "      float fr = 0.4*(w.x - 0.5)*(1.0 - smoothstep(0.45, 0.95, m));",
    "      float st, st1, lo0, lo1, dm0, dm1;",
    "      float th0 = softTh(m);",
    "      float e0 = softD(softQ(cp, t) + wq2, sa, st, lo0, dm0) + fr - th0;     // depth into the cloud",
    "      vec2 p1 = cp + Lm*5.0;",
    "      float th1 = softTh(uFoot > 0.5 ? m : bankMask(p1));",
    "      float e1 = softD(softQ(p1, t) + wq2, sa, st1, lo1, dm1) + fr - th1;",
    "      vec2 p2 = cp + Lm*12.0; vec2 p3 = cp + Lm*26.0; vec2 p4 = cp + Lm*46.0; vec2 pU = cp + vec2(0.0, -20.0);",
    "      float e2 = softLo(softQ(p2, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p2));",
    "      float e3 = softLo(softQ(p3, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p3));",
    "      float e4 = softLo(softQ(p4, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(p4));",
    "      float eU = softLo(softQ(pU, t) + wq2, st) + fr - softTh(uFoot > 0.5 ? m : bankMask(pU));",
    "      float e0m = dm0 + fr - th0;                                    // the lumps without their finest grain",
    "      float e1m = dm1 + fr - th1;",
    "      // the light's path: through how much cloud (density), and, on the thin low banks, past how much cloud at all (cover)",
    "      float cover = 1.4*smoothstep(-0.02, 0.08, e1m) + 0.9*smoothstep(-0.02, 0.08, e2) + 0.5*smoothstep(-0.02, 0.08, e3);",
    "      float sunL = exp(-1.5*max(e0m, 0.0) - 2.5*max(e1m, 0.0) - 0.6*max(e2, 0.0) - 0.4*max(e3, 0.0) - 0.25*max(e4, 0.0) - 0.6*bankW*cover*(1.0 - 0.6*nearSun));",
    "      float skyL = exp(-1.5*max(e0, 0.0) - 4.0*max(eU, 0.0));       // the sky's light from above, on the crowns",
    "      float heap = lo0 + fr - th0;                                   // the heap alone: thick (cumulus) or thin (a wisp)",
    "      float eA = e0 + (e0 - heap)*smoothstep(0.3, 0.8, m)*mix(1.0, 0.25, smoothstep(0.04, 0.22, heap));   // the outline lumpy, no holes deep in a heap",
    "      float kap = mix(6.0, 60.0, smoothstep(-0.05, 0.2, heap));       // thin cloud lets the sky through; a thick heap has a crisp edge",
    "      float thick = max(smoothstep(-0.05, 0.2, heap), bankW);       // the low banks keep crisp edges",
    "      float a = smoothstep(-0.015, mix(0.1, 0.02, thick), eA)*(1.0 - exp(-kap*max(eA + 0.02, 0.0)))*smoothstep(0.03, 0.12, m);",
    "      // lighter than the sky behind them, not darker (per user \"the real dawn clouds are too dark\"): a soft blue-grey body",
    "      // ROSE: the whole deck lit from below by the pink hour: violet-lilac bodies (never slate), periwinkle crowns, the",
    "      // lit faces rose-pink high, coral lower, peach by the sun",
    "      vec3 body = mix(C(74.0, 72.0, 168.0), C(104.0, 82.0, 176.0), smoothstep(150.0, 320.0, y));",
    "      body = mix(body, C(134.0, 106.0, 194.0), smoothstep(320.0, 450.0, y));         // lavender low bodies (cool shade under warm light)",
    "      vec3 skyC = mix(C(100.0, 104.0, 206.0), C(176.0, 124.0, 196.0), smoothstep(200.0, 420.0, y));   // periwinkle crowns high, lilac low",
    "      float warmW = smoothstep(120.0, 340.0, y);",
    "      vec3 halfC = mix(C(196.0, 130.0, 192.0), C(240.0, 138.0, 156.0), warmW);                     // half light: orchid-lilac high, rose low",
    "      vec3 sunC = mix(C(255.0, 160.0, 172.0), C(255.0, 158.0, 150.0), smoothstep(170.0, 290.0, y));   // pink-coral high (alpenglow, not salmon), coral",
    "      sunC = mix(sunC, C(255.0, 160.0, 130.0), smoothstep(280.0, 380.0, y));                         // coral",
    "      sunC = mix(sunC, C(255.0, 178.0, 132.0), smoothstep(370.0, 450.0, y));                         // peach",
    "      sunC = mix(sunC, C(255.0, 192.0, 156.0), nearSun*smoothstep(360.0, 460.0, y)*0.6);",
    "      if (uFoot > 0.5) { sunC = mix(sunC, C(250.0, 136.0, 140.0), 0.6); halfC = mix(halfC, C(180.0, 104.0, 176.0), 0.6); }   // the footer's corner clouds: a deeper rose, so the bar text reads on them",
    "      float glow = (0.8 + 0.2*lift)*(1.0 + 0.25*sc);",
    "      float li = clamp(sunL*mix(0.9, 1.3 + 0.3*nearSun, lowW)*glow, 0.0, 1.0);",
    "      li = 0.18 + 0.82*li;                                            // a little less shadow (per user: \"reduce the shadow of the clouds a little. do not change the shape\")",
    "      vec2 cv = vec2((cp.x - 720.0)/560.0, (cp.y - 312.0)/120.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);                       // the headline keeps clear sky: wider and quieter there",
    "      float typeBox = uFoot > 0.5 ? 0.0 : (1.0 - smoothstep(520.0, 600.0, abs(cp.x - 720.0)))*(1.0 - smoothstep(56.0, 100.0, abs(cp.y - 236.0)));   // the headline's second line, end to end (cp.y 180-292 once the horizon slides to the pill)",
    "      float calmT = max(calm, 0.75*typeBox);",
    "      li *= 1.0 - 0.3*calm;                                           // ROSE: behind the headline the lit faces stay dimmer, so the white type keeps its contrast",
    "      // ...and away from the type (the outer edges of the frame, the low banks under the pill) they glow brighter",
    "      float away = uFoot > 0.5 ? 0.0 : max(max(smoothstep(330.0, 120.0, cp.x), smoothstep(1130.0, 1330.0, cp.x)), smoothstep(405.0, 460.0, cp.y));",
    "      away *= 1.0 - typeBox;",
    "      li = min(li*(1.0 + 0.3*away), 1.0);",
    "      if (uFoot > 0.5) li *= mix(0.95, 0.8, smoothstep(1000.0, 1200.0, cp.x));   // the footer's corner clouds sit under the bar text: a softer light, softest under the links",
    "      vec3 cc = mix(body, skyC, 0.2 + skyL*0.45);",
    "      float lowT = max(bankW, uFoot*mix(0.5, 0.25, smoothstep(1000.0, 1200.0, cp.x)));   // the low banks, and the footer's corner clouds by the dawn under its edge (less under the links)",
    "      cc = mix(cc, halfC, smoothstep(0.28 - 0.14*lowT, 0.55 - 0.14*lowT, li));                 // ROSE: the shaded bodies stay cool lavender (light and shade, not a wash)",
    "      float s0 = mix(0.45, 0.38, away) - 0.18*lowT;                    // only the faces turned to the sun go coral; sooner away from the type and on the low banks",
    "      cc = mix(cc, sunC, smoothstep(s0, s0 + 0.3, li));",
    "      cc = mix(cc, col, 0.18*(1.0 - smoothstep(0.0, 0.5, li)));       // the shadowed bodies are thin: the sky shows through (ROSE: less, so they stay lavender, not sky blue)",
    "      cc *= (1.0 + 0.3*away*smoothstep(0.4, 0.8, li))*(1.0 - 0.16*calm);   // dimmer behind the headline (a multiply, never toward grey), glowing away from it",
    "      float top = smoothstep(250.0, 110.0, cp.y)*(1.0 - smoothstep(700.0, 1000.0, cp.x));",
    "      cc = mix(mix(col, skyC, 0.5), cc, smoothstep(0.15, 0.75, a)*smoothstep(-0.01, 0.1, eA));   // thin edges and hole rims pass through the periwinkle over a few px, not coral straight onto ultramarine",
    "      // ...and inside a heap the holes show thin cloud, not bare ultramarine: a lavender veil where the heap is (colour only,",
    "      // the cloud's alpha and the stars' cover untouched), so the holes stop reading as cut-paper stencils",
    "      float veil = smoothstep(-0.04, 0.14, heap)*smoothstep(0.1, 0.5, m)*(1.0 - 0.8*calmT)*(1.0 - top);",
    "      col = mix(col, mix(skyC, body, 0.35), 0.7*veil);",
    "      col = mix(col, cc, mix(0.88, 0.96, away)*a*(1.0 - 0.88*top)*(1.0 - 0.65*calmT));   // behind the headline the cloud thins (the vivid sky shows), never a darker bruise",
    "      gCloud = a;                                                   // how much cloud is here, for the stars",
    "#else",
    "      float a = smoothstep(th, th + mix(0.04, 0.018, smoothstep(380.0, 440.0, cp.y)), d0)*smoothstep(0.1, 0.4, m);",
    "      // light: full where the sample toward the sun has left the cloud, fading over the puff's body",
    "      float lit = (1.0 - smoothstep(th - 0.02, th + 0.17, d1))*smoothstep(-0.06, 0.02, d0 - d1);   // only faces turned to the sun",
    "      // the sun is level with the low cloudlets: they glow nearly whole, darker only on their tops",
    "      float lowC = smoothstep(380.0, 455.0, y);",
    "      lit = max(lit, lowC*(0.2 + 0.2*nearSun)*(1.0 - smoothstep(0.0, 0.1, d1 - d0)));",
    "      float shadeS = smoothstep(0.0, 0.12, d1 - d0)*(1.0 - lit);   // tops turned away from the sun",
    "      float top = smoothstep(250.0, 110.0, cp.y);",
    "      vec3 body = C(52.0, 60.0, 98.0);",
    "      body = mix(body, C(66.0, 72.0, 110.0), smoothstep(150.0, 260.0, y));",
    "      body = mix(body, C(82.0, 80.0, 114.0), smoothstep(260.0, 350.0, y));",
    "      body = mix(body, C(128.0, 96.0, 118.0), smoothstep(340.0, 405.0, y));",
    "      body = mix(body, C(198.0, 128.0, 118.0), smoothstep(392.0, 455.0, y));",
    "      // the low streaks over the far left hill are in shadow: dark mauve",
    "      body = mix(body, C(96.0, 84.0, 108.0), smoothstep(620.0, 120.0, cp.x)*smoothstep(400.0, 460.0, y)*0.75);",
    "      // low cloudlets beside the sun are lit almost whole",
    "      body = mix(body, C(206.0, 116.0, 106.0), nearSun*smoothstep(380.0, 450.0, y)*0.75);",
    "      body = mix(body, C(230.0, 146.0, 114.0), gauss(dx, 0.0, 230.0)*smoothstep(395.0, 450.0, y)*0.8);",
    "      vec3 shadow = body*vec3(0.84, 0.86, 0.94);",
    "      vec3 rimC = C(150.0, 106.0, 122.0);",
    "      rimC = mix(rimC, C(214.0, 128.0, 112.0), smoothstep(150.0, 260.0, y));",
    "      rimC = mix(rimC, C(238.0, 142.0, 110.0), smoothstep(260.0, 370.0, y));",
    "      rimC = mix(rimC, C(248.0, 164.0, 114.0), smoothstep(370.0, 470.0, y));",
    "      rimC = mix(rimC, C(252.0, 184.0, 120.0), nearSun*smoothstep(360.0, 470.0, y)*0.3);",
    "      float sideL = 1.0 - 0.25*smoothstep(700.0, 150.0, cp.x)*smoothstep(200.0, 330.0, cp.y) - 0.35*smoothstep(500.0, 100.0, cp.x)*smoothstep(420.0, 460.0, cp.y);",
    "      float litA = clamp(lit*sideL*(0.6 + 0.4*lift)*(1.0 + 0.3*sc), 0.0, 1.0);",
    "      // calm behind the headline: same shapes, lower contrast",
    "      vec2 cv = vec2((cp.x - 720.0)/480.0, (cp.y - 312.0)/106.0); cv *= cv;",
    "      float calm = exp(-cv.x*cv.x - cv.y*cv.y);",
    "      vec3 cc = mix(body, shadow, shadeS*0.8);",
    "      cc = mix(cc, rimC, litA*(1.0 - 0.9*top)*(1.0 - 0.5*calm));",
    "      col = mix(col, cc, a*mix(0.8, 1.0, litA)*(1.0 - 0.5*top)*(1.0 - 0.45*calm));",
    "#endif",
    "    }",
    "  }",
    "",
    "  // ---- distant land and mist ----",
    "  if (y > 440.0 && pg.y < cg + 34.0) {   // the grass body is fully opaque by cg + 30",
    "    vec2 pf = P + PARL*0.12;",
    "    float rf = ridgeFar(pf.x);",
    "    vec2 pm = P + PARL*0.3;",
    "    float mn = fbm4(vec2((pm.x - t*3.5)*0.0052, pm.y*0.045 + t*0.006));",
    "    float glowX = gauss(pm.x, sun.x + 20.0, 300.0)*gauss(pm.y, 536.0, 40.0);",
    "    vec3 mistC = mix(C(170.0, 140.0, 206.0), C(255.0, 178.0, 176.0), glowX);   // ROSE: luminous lilac, pink-peach by the sun",
    "    mistC *= 0.94 + 0.14*mn;",
    "    mistC = mix(mistC, mistC*1.12, sc);",
    "    float aa = k;",
    "    // far range: hazy mauve peaks, almost sky where they pass in front of the sun",
    "    if (pf.y > rf - 2.0) {",
    "      vec3 fcol = mix(C(150.0, 118.0, 186.0), C(120.0, 108.0, 186.0), smoothstep(650.0, 1250.0, pf.x));   // ROSE: soft violet-blue range",
    "      fcol = mix(fcol, C(186.0, 126.0, 180.0), gauss(pf.x, 395.0, 55.0)*gauss(pf.y, rf, 14.0)*0.7);",
    "      fcol = mix(fcol, C(98.0, 96.0, 176.0), smoothstep(1150.0, 1350.0, pf.x)*0.8);",
    "      fcol = mix(fcol, C(250.0, 168.0, 168.0), gauss(pf.x, sun.x, 140.0)*0.7*(1.0 - smoothstep(rf + 2.0, rf + 16.0, pf.y)));",
    "      fcol = mix(fcol, mistC, smoothstep(rf + 6.0, rf + 30.0, pf.y)*0.85);",
    "      float ia = smoothstep(rf, rf + aa, pf.y);",
    "      col = mix(col, fcol, ia);",
    "      col += C(250.0, 190.0, 120.0)*(1.0 - smoothstep(0.0, 4.0, pf.y - rf))*gauss(pf.x, sun.x, 170.0)*0.35*ia;",
    "    }",
    "    // layered ridges in the mist, right of the sun, nearer ones darker",
    "    vec2 p1 = P + PARL*0.16;",
    "    float top1 = 526.0 - bump(p1.x, 1170.0, 90.0, 12.0) - bump(p1.x, 1320.0, 120.0, 22.0) - bump(p1.x, 1480.0, 110.0, 26.0) + (noise1(p1.x*0.02 + 11.0) - 0.5)*6.0",
    "                 + 0.22*max(1080.0 - p1.x, 0.0);",
    "    vec3 tmp = hillLayer(col, p1, top1, C(104.0, 100.0, 178.0), mistC, 0.3, 3.0, 0.3, 7.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p1.x));",
    "    // low wooded ridges just under the far line, either side of the sun",
    "    vec2 p0 = P + PARL*0.2;",
    "    float top0 = 515.0 + (noise1(p0.x*0.012 + 5.0) - 0.5)*9.0 + 0.3*max(p0.x - 1060.0, 0.0) + 0.3*max(700.0 - p0.x, 0.0);",
    "    tmp = hillLayer(col, p0, top0, C(142.0, 110.0, 178.0), mistC, 0.7, 27.0, 0.3, 5.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(600.0, 660.0, p0.x)*(1.0 - smoothstep(1080.0, 1130.0, p0.x)));",
    "    // a bright mist sea in front of their feet, between the far range and the nearer hills",
    "    float sea = gauss(pm.y, mix(543.0, 556.0, smoothstep(1000.0, 1180.0, pm.x)), mix(15.0, 21.0, gauss(pm.x, 950.0, 160.0)))*smoothstep(620.0, 740.0, pm.x)*(1.0 - 0.6*smoothstep(1100.0, 1250.0, pm.x));",
    "    float wisp = smoothstep(0.4, 0.68, mn);",
    "    col = mix(col, mistC*(1.04 + 0.18*wisp), clamp(sea*(0.45 + 0.55*wisp), 0.0, 0.95));",
    "    vec2 p2 = P + PARL*0.24;",
    "    float top2 = 550.0 - bump(p2.x, 1190.0, 80.0, 12.0) - bump(p2.x, 1390.0, 110.0, 22.0) + (noise1(p2.x*0.025 + 2.0) - 0.5)*6.0",
    "                 + 0.25*max(1040.0 - p2.x, 0.0);",
    "    tmp = hillLayer(col, p2, top2, C(80.0, 78.0, 156.0), mistC, 0.45, 9.0, 0.42, 9.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(860.0, 920.0, p2.x));",
    "    // and a second sheet of mist in front of that ridge's foot, on the right",
    "    float seaMid = gauss(pm.y, 574.0 - 8.0*smoothstep(1250.0, 1440.0, pm.x) + 6.0*(mn - 0.5), 19.0)*smoothstep(1080.0, 1200.0, pm.x);",
    "    col = mix(col, mistC*(0.98 + 0.16*wisp), clamp(seaMid*(0.3 + 0.6*wisp), 0.0, 0.85));",
    "    vec2 p3 = P + PARL*0.3;",
    "    float top3 = 598.0 - bump(p3.x, 1090.0, 60.0, 10.0) - bump(p3.x, 1300.0, 90.0, 14.0) - bump(p3.x, 1440.0, 90.0, 20.0) + (noise1(p3.x*0.03 + 6.0) - 0.5)*6.0",
    "                 + 0.3*max(1060.0 - p3.x, 0.0);",
    "    tmp = hillLayer(col, p3, top3, C(62.0, 60.0, 132.0), mistC, 0.45, 13.0, 0.45, 11.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(900.0, 960.0, p3.x));",
    "    float seaLow = gauss(pm.y, 618.0 + 6.0*(mn - 0.5), 20.0)*smoothstep(1150.0, 1260.0, pm.x);",
    "    col = mix(col, mistC*(0.95 + 0.16*wisp), clamp(seaLow*(0.35 + 0.65*wisp), 0.0, 0.9));",
    "    vec2 p4 = P + PARL*0.38;",
    "    float top4 = 630.0 - 16.0*smoothstep(1250.0, 1440.0, p4.x) + (noise1(p4.x*0.03 + 1.0) - 0.5)*8.0 + 0.3*max(1250.0 - p4.x, 0.0);",
    "    tmp = hillLayer(col, p4, top4, C(48.0, 46.0, 108.0), mistC, 0.3, 17.0, 0.45, 13.0, aa, mn);",
    "    col = mix(col, tmp, smoothstep(1120.0, 1170.0, p4.x));",
    "    // the dark wooded hill on the left",
    "    vec2 ph = P + PARL*0.42;",
    "    float hl = hillL(ph.x);",
    "    float cnh = canopy(ph.x, 9.0, 21.0, 12.0, (0.35 + 0.65*clumps(ph.x, 4.0, 0.5))*(1.0 - smoothstep(760.0, 860.0, ph.x)));",
    "    float inh = smoothstep(hl - cnh + 2.0, hl - cnh + 2.0 + aa, ph.y);",
    "    vec3 hc = mix(C(56.0, 52.0, 124.0), C(52.0, 48.0, 112.0), smoothstep(hl, hl + 50.0, ph.y));   // ROSE: deep violet-blue",
    "    hc = mix(hc, C(150.0, 104.0, 170.0), (1.0 - smoothstep(hl - 1.0, hl + 5.0, ph.y))*0.75);          // a rose rim light on the crest",
    "    hc *= 0.96 + 0.08*mn;",
    "    col = mix(col, hc, inh);",
    "    // the long lit slope and its tree line",
    "    vec2 pl = P + PARL*0.5;",
    "    float st = slopeTop(pl.x);",
    "    float dl = 0.95*gauss(pl.x, 760.0, 170.0) + 0.6*gauss(pl.x, 1105.0, 22.0) + 0.6*gauss(pl.x, 1290.0, 20.0)",
    "             + 0.35*gauss(pl.x, 1000.0, 40.0) + 0.3*gauss(pl.x, 470.0, 70.0);",
    "    float cnl = canopy(pl.x, 11.0, 33.0, 18.0, clamp(dl, 0.0, 1.0)*(0.45 + 0.55*clumps(pl.x, 8.0, 0.5)));",
    "    float inl = smoothstep(st - cnl + 2.0, st - cnl + 2.0 + aa, pl.y);",
    "    float tl = 1.0 - smoothstep(st + 1.0, st + 6.0, pl.y);",
    "    vec3 cl = mix(C(58.0, 52.0, 124.0), C(70.0, 56.0, 128.0), smoothstep(450.0, 750.0, pl.x));   // ROSE: violet-blue slope, in shadow under the lit sky",
    "    cl = mix(cl, C(46.0, 44.0, 108.0), smoothstep(820.0, 1060.0, pl.x));",
    "    cl = mix(cl, C(122.0, 86.0, 140.0), gauss(pl.x, 880.0, 120.0)*gauss(pl.y, st + 30.0, 30.0)*0.6);   // rose where the light lies on it",
    "    cl = mix(cl, C(60.0, 58.0, 118.0), smoothstep(st + 25.0, st + 110.0, pl.y)*0.7);",
    "    float hz = exp(-max(pl.y - st, 0.0)/14.0)*0.15*gauss(pl.x, sun.x - 80.0, 260.0);",
    "    cl = mix(cl, mistC, hz*(1.0 - tl));",
    "    // the ground rolls: soft bands that follow the slope, and the drifting mist shadow",
    "    cl *= (0.93 + 0.14*noise1(pl.x*0.006 + (pl.y - st)*0.05 + 4.0))*(0.95 + 0.1*mn);",
    "    vec3 treeC = mix(C(48.0, 46.0, 104.0), C(60.0, 50.0, 108.0), smoothstep(500.0, 1000.0, pl.x));",
    "    cl = mix(cl, treeC, tl*smoothstep(0.5, 2.0, cnl));",
    "    col = mix(col, cl, inl);",
    "    // the light breaking over the far land",
    "    col = mix(col, C(255.0, 198.0, 152.0), (0.24 + 0.12*sc)*gauss(P.x, sun.x, 130.0*(1.0 + 0.4*sc))*gauss(P.y, 498.0, 13.0*(1.0 + 0.8*sc)));",
    "  }",
    "",
    "  // ---- foreground hill: dark body, a fringe of thin swaying blades, a few small flowers ----",
    "  if (pg.y > cg - 210.0) {",
    "    float wd = wind(pg.x, t);",
    "    float aa = k;",
    "    float cslope = 0.092 + 1.2e-5*pg.x;           // local slope of the crest (crestG')",
    "    float goldM = 0.14 + 0.7*gauss(pg.x, 560.0, 300.0) + 0.3*gauss(pg.x, 1100.0, 180.0);",
    "    vec3 bladeC = C(18.0, 16.0, 34.0);             // ROSE: violet-black blades, peach tips",
    "    vec3 goldC = C(255.0, 178.0, 140.0);",
    "    for (int L = 0; L < 4; L++) {",
    "      float fl = float(L);",
    "      // back to front: short and dense, then taller and sparser",
    "      float cw   = fl < 0.5 ? 1.7  : (fl < 1.5 ? 2.8  : (fl < 2.5 ? 6.5  : 17.0));",
    "      float hMin = fl < 0.5 ? 18.0 : (fl < 1.5 ? 25.0 : (fl < 2.5 ? 28.0 : 40.0));   // shorter front blades, per user \"this grass is too long\"",
    "      float hRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 30.0 : (fl < 2.5 ? 38.0 : 42.0));",
    "      float dMin = fl < 0.5 ? 8.0  : (fl < 1.5 ? 12.0 : (fl < 2.5 ? 12.0 : 22.0));   // the back rows rooted under the hill's dark edge, per user \"I can see the root, which is looking like the floating\"",
    "      float dRng = fl < 0.5 ? 18.0 : (fl < 1.5 ? 28.0 : (fl < 2.5 ? 50.0 : 60.0));",
    "      float prob = fl < 0.5 ? 1.0  : (fl < 1.5 ? 1.0  : (fl < 2.5 ? 0.88 : 0.62));",
    "      float wid  = fl < 0.5 ? 1.25 : (fl < 1.5 ? 1.45 : (fl < 2.5 ? 1.7  : 2.0));",
    "      float hTyp = hMin + 0.5*hRng;",
    "      float above = max(cg + dMin + 0.5*dRng - pg.y, 0.0);",
    "      float shift = min(wd*(0.5 + hTyp/110.0), 0.85)*(0.3*above + 0.7*above*above/hTyp);",
    "      float ci = floor((pg.x - shift)/cw);",
    "      float cov = 0.0; float tip = 0.0; float shade = 0.0; float seed = 0.0;",
    "      if (pg.y < cg + dMin + dRng + 1.0 && pg.y > cg + dMin - hMin - hRng - 12.0) for (int j = -4; j <= 4; j++) {",
    "        float id = ci + float(j);",
    "        vec2 h = hash22(vec2(id, 31.0 + fl*17.0));",
    "        float h3 = hash11(id*1.37 + fl*7.1);",
    "        if (h3 > prob) continue;",
    "        float rx = (id + h.x)*cw;",
    "        float ry = cg + cslope*(rx - pg.x) + dMin + dRng*h.y;",
    "        float H = (hMin + hRng*fract(h.x*7.13 + h.y*3.1))*(1.0 - 0.12*smoothstep(800.0, 1350.0, rx))*(0.8 + 0.3*noise1(rx*0.011 + fl*5.0));",
    "        float s = (ry - pg.y)/H;",
    "        if (s < 0.0 || s > 1.08) continue;",
    "        float lim = 3.6*cw/H;",
    "        float flut = (0.035 + 0.16*clamp(wd - 0.1, 0.0, 1.0))*sin(t*(2.2 + 1.6*fract(h.x*9.7)) + h.x*40.0);",
    "        float lean = clamp((fract(h.y*5.31) - 0.5)*1.3, -lim, lim) + min(wd*(0.5 + H/110.0), 0.85) + flut;   // a gust bends a blade to about 40 degrees, no flatter",
    "        float bx = rx + lean*H*(0.25*s + 0.75*s*s);",
    "        float w = wid*(1.0 - 0.72*min(s, 1.0));",
    "        float d = abs(pg.x - bx);",
    "        float c = clamp((w + 0.5*aa - d)/aa, 0.0, 1.0)*min(1.0, 2.0*w/aa)*(1.0 - smoothstep(0.98, 1.08, s))*smoothstep(0.0, 0.25, s);   // the base fades into the dark, no cut stub",
    "        // a few tall blades carry a small seed head, lit gold from behind",
    "        float sh = fract(h3*29.3);",
    "        if (fl > 1.5 && sh < 0.12) {",
    "          vec2 sd = vec2(pg.x - (rx + lean*H), (pg.y - (ry - H) - 2.0)*0.34);",
    "          float hm = (1.0 - smoothstep(1.0, 1.0 + aa, length(sd)))*0.7;",
    "          if (hm > c) { c = hm; }",
    "          seed = max(seed, hm);",
    "        }",
    "        if (c > cov) { cov = c; tip = smoothstep(0.55, 0.97, s)*min(1.0, (fract(h3*13.7) > 0.5 ? 1.0 : 0.12) + 2.2*max(wd - 0.12, 0.0)); shade = fract(h.x*31.7); }",
    "      }",
    "      float sunk = smoothstep(cg + 8.0, cg + 46.0, pg.y);",
    "      vec3 bc = mix(bladeC, C(36.0, 30.0, 62.0), shade*shade*0.7*(1.0 - sunk));",
    "      bc = mix(bc, goldC, max(tip*0.8, seed)*goldM*(1.0 - 0.75*sunk));",
    "      bc = mix(bc, C(18.0, 16.0, 32.0), sunk*0.7);",
    "      col = mix(col, bc, cov);",
    "      if (L == 1) {",
    "        // the solid body after the two back layers, its top soft and broken into tufts",
    "        float bt = cg + 12.0 + (noise1(pg.x*0.05 + 3.0) - 0.5)*14.0 + (noise1(pg.x*0.19) - 0.5)*6.0;",
    "        float bodyA = smoothstep(bt - 6.0, bt + 8.0, pg.y);",
    "        vec3 body = mix(C(22.0, 19.0, 40.0), C(13.0, 13.0, 24.0), smoothstep(cg, cg + 80.0, pg.y));",
    "        body = mix(body, PAGE, smoothstep(cg + 60.0, cg + 140.0, pg.y));",
    "        body = mix(body, C(80.0, 54.0, 78.0), (1.0 - smoothstep(bt - 2.0, bt + 12.0, pg.y))*goldM*0.45);",
    "        col = mix(col, body, bodyA);",
    "        // (the wildflowers were removed 2026-10-10, per user \"what are these white dots?\", then \"remove\": at their size they read as specks)",
    "      }",
    "    }",
    "  }",
    "",
    "  // the footer's warm light under its bottom edge, between the bar's two groups of text",
    "  // ROSE: violet to rose to peach (a straight sRGB lerp to peach went through dusty mauve), narrow, off the bar text",
    "  if (uFoot > 0.5) { float wg = gauss(P.x, 740.0, 240.0)*smoothstep(680.0, 800.0, Ppage); col = mix(col, C(234.0, 104.0, 168.0), 0.55*wg); col = mix(col, C(255.0, 168.0, 126.0), 0.6*wg*wg); }",
            "  // EXPO: 0.8 behind the type, as live; under the pill the morning opens up to 0.95 (the horizon, the mist, the land)",
    "  col *= mix(0.8, 0.95, smoothstep(400.0, 520.0, P.y));",
    "  // ---- meet the page: the bottom reaches #090a0e exactly ----",
    "  // the footer (per user \"don't you think the footer need the change to match the hills?\") is this sky with the land",
    "  // under the bottom edge, rising out of the page's black; the hero meets the page at its foot",
    "  // ROSE: the footer's sky rises out of the black sooner (420 of the frame's 800, was 560), so more morning shows above the word",
    "  float fade = uFoot > 0.5 ? 1.0 - smoothstep(0.0, 420.0, Ppage) : smoothstep(700.0, 788.0, Ppage);",
    "  // ROSE: where the hero's fade crosses lit mist (phones) it passes through deep violet, never grey-plum; the dark grass fades",
    "  // straight to the page as before; at fade 1 it is exactly PAGE",
    "  float deepW = uFoot > 0.5 ? 0.0 : (1.0 - smoothstep(0.3, 1.0, fade))*smoothstep(0.06, 0.25, dot(col, vec3(0.3, 0.59, 0.11)));",
    "  vec3 deep = mix(PAGE, C(40.0, 28.0, 100.0), deepW);",
    "  col = mix(col, deep, fade);",
    "  col += (hash12(fc + fract(t*7.13)*61.0) - 0.5)*(1.0/255.0)*max(uFoot, 1.0 - fade);   // the footer's fade from black is dithered too, or it bands",
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "#ifdef SOFT_CLOUDS",
    "  if (uMask > 0.5) gl_FragColor = vec4(gCloud, 0.0, 0.0, 1.0);",
    "#endif",
    "}"
  ].join('\n');

  var SCENES = { sea: FRAG, hills: FRAG_HILLS, hillsSoft: FRAG_HILLS_SOFT, sunrise: FRAG_SUNRISE, dusk: FRAG_DUSK };
  // MOOD PREVIEWS (2026-10-11, per user "home page's visual color on hero and footer can be more dynamic and happy"): a
  // file dawn-<mood>.js registers its own copy of the hills in window.DawnSkyScenes, and Home's ?look=<mood> sets
  // window.DAWN_MOOD, so the hero and the footer both paint it in place of the hills
  function sceneSource(name) {
    var moods = window.DawnSkyScenes || {};
    if (window.DAWN_MOOD && moods[window.DAWN_MOOD] && (name === 'hills' || name === 'hillsSoft' || name === 'sunrise')) name = window.DAWN_MOOD;
    return SCENES[name] || moods[name] || FRAG;
  }

  var MAX_PIXELS = 1600000;

  function noop() {
    return { destroy: function () {}, frame: function () {} };
  }

  function mount(container, opts) {
    opts = opts || {};
    var frozen = typeof opts.time === 'number';
    var fixedPointer = Array.isArray(opts.pointer) ? opts.pointer : null;
    var fixedScroll = typeof opts.scroll === 'number' || typeof opts.scroll === 'function' ? opts.scroll : null;
    var scale = typeof opts.scale === 'number' && opts.scale > 0 ? opts.scale : 0.5;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none';
    container.appendChild(canvas);

    var attrs = { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' };
    var gl = null;
    try { gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs); } catch (e) { gl = null; }
    if (!gl) {
      container.classList.add('sky-failed');
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (opts.onFail) opts.onFail();
      return noop();
    }

    var prog = null, buf = null, vs = null, fs = null, loc = {};
    var lost = false, destroyed = false, ready = false, drawn = false, lostTimer = 0;
    // the GPU builds the shader in the background where the browser can (KHR_parallel_shader_compile): asking for the
    // result at once made the page wait about 90ms on a first visit, right as the hero's opening began
    var parallel = gl.getExtension('KHR_parallel_shader_compile');

    function startBuild() {
      ready = false;
      vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, VERT); gl.compileShader(vs);
      fs = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(fs, sceneSource(opts.scene)); gl.compileShader(fs);
      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.linkProgram(prog);
    }

    function finishBuild() {
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
        var log = gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(prog);
        throw new Error('DawnSky shader: ' + log);
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.useProgram(prog);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      loc.res = gl.getUniformLocation(prog, 'uRes');
      loc.time = gl.getUniformLocation(prog, 'uTime');
      loc.pointer = gl.getUniformLocation(prog, 'uPointer');
      loc.scroll = gl.getUniformLocation(prog, 'uScroll');
      loc.horizon = gl.getUniformLocation(prog, 'uHorizon');
      loc.foot = gl.getUniformLocation(prog, 'uFoot');
      loc.mask = gl.getUniformLocation(prog, 'uMask');
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      ready = true;
    }

    // calls done once the GPU has finished building (at once where the browser cannot build in the background)
    function whenBuilt(done) {
      if (destroyed || lost) return;
      if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
        requestAnimationFrame(function () { whenBuilt(done); });
        return;
      }
      try { finishBuild(); } catch (err) { return failNow(err); }
      done();
    }

    // the painting cannot run: let the page put its own light back (the hero's gradient, the footer's glow)
    function failNow(err) {
      if (destroyed) return;
      if (err && window.console) console.error(String(err.message || err));
      container.classList.add('sky-failed');
      api.destroy();
      if (opts.onFail) opts.onFail();
    }

    // a canvas that fades in on its first painted frame, over whatever the page shows meanwhile
    var fadeMs = typeof opts.fade === 'number' && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? opts.fade : 0;
    if (fadeMs) canvas.style.opacity = '0';

    try { startBuild(); } catch (err) {
      if (window.console) console.error(String(err && err.message || err));
      container.classList.add('sky-failed');
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      var ext0 = gl.getExtension('WEBGL_lose_context');
      if (ext0) ext0.loseContext();
      if (opts.onFail) opts.onFail();
      return noop();
    }

    // ---- size
    var cssW = 0, cssH = 0, dprSeen = window.devicePixelRatio || 1;
    function resize() {
      dprSeen = window.devicePixelRatio || 1;
      var r = container.getBoundingClientRect();
      cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
      var k = Math.min(window.devicePixelRatio || 1, 2) * scale;
      var w = Math.max(1, Math.round(cssW * k)), h = Math.max(1, Math.round(cssH * k));
      var px = w * h;
      if (px > MAX_PIXELS) { var f = Math.sqrt(MAX_PIXELS / px); w = Math.floor(w * f); h = Math.floor(h * f); }
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }

    // ---- pointer: critically damped spring, slow first lean (about 1.4s), then about 0.55s
    var pointer = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    var clientX = null, clientY = null, firstMoveAt = -1;
    if (fixedPointer) { pointer.x = pointer.tx = +fixedPointer[0] || 0; pointer.y = pointer.ty = +fixedPointer[1] || 0; }

    function onMove(e) {
      if (!fine || !fine.matches) return;
      clientX = e.clientX; clientY = e.clientY;
      if (firstMoveAt < 0) firstMoveAt = performance.now();
      wake();
    }
    function onLeave(e) {
      if (!e.relatedTarget) { clientX = null; clientY = null; wake(); }
    }

    function stepPointer(dt, now) {
      if (clientX !== null) {
        var r = container.getBoundingClientRect();
        pointer.tx = Math.max(-0.5, Math.min(0.5, (clientX - r.left) / Math.max(1, r.width) - 0.5));
        pointer.ty = Math.max(-0.5, Math.min(0.5, (clientY - r.top) / Math.max(1, r.height) - 0.5));
      } else { pointer.tx = 0; pointer.ty = 0; }
      var since = firstMoveAt < 0 ? 0 : (now - firstMoveAt) / 1000;
      var w = 4.1 + (10.5 - 4.1) * Math.min(1, since / 1.4);
      var n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
      for (var i = 0; i < n; i++) {
        pointer.vx += (w * w * (pointer.tx - pointer.x) - 2 * w * pointer.vx) * h;
        pointer.vy += (w * w * (pointer.ty - pointer.y) - 2 * w * pointer.vy) * h;
        pointer.x += pointer.vx * h; pointer.y += pointer.vy * h;
      }
    }

    function scrollProgress() {
      if (fixedScroll !== null) return typeof fixedScroll === 'function' ? fixedScroll() : fixedScroll;
      var r = container.getBoundingClientRect();
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var bottom = r.bottom + y;
      if (bottom <= 0) return 0;
      return Math.max(0, Math.min(1, y / bottom));
    }

    // the cloud cover at low resolution (about 64 cells across), so the page can hide its stars behind the clouds: drawn
    // into the corner of the canvas and read back before the frame itself covers it; twice a second while running
    var maskTick = 0, maskBuf = null;
    function readMask() {
      var mw = 64, mh = Math.max(8, Math.round(64 * canvas.height / canvas.width));
      if (!maskBuf || maskBuf.length !== mw * mh * 4) maskBuf = new Uint8Array(mw * mh * 4);
      gl.viewport(0, 0, mw, mh);
      gl.uniform2f(loc.res, mw, mh);
      gl.uniform1f(loc.mask, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.readPixels(0, 0, mw, mh, gl.RGBA, gl.UNSIGNED_BYTE, maskBuf);
      gl.uniform1f(loc.mask, 0);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      opts.onCloudMask(maskBuf, mw, mh);
    }

    function draw(time) {
      if (lost || destroyed || !ready) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, time);
      gl.uniform2f(loc.pointer, pointer.x, pointer.y);
      gl.uniform1f(loc.scroll, scrollProgress());
      gl.uniform1f(loc.horizon, typeof opts.horizon === 'function' ? opts.horizon() : typeof opts.horizon === 'number' ? opts.horizon : 0.545);
      gl.uniform1f(loc.foot, opts.footer ? 1 : 0);
      if (opts.onCloudMask && loc.mask && (maskTick++ % 30 === 0 || !drawn)) readMask();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!drawn) {
        drawn = true;
        container.classList.add('sky-drawn');
        if (fadeMs) {
          canvas.style.transition = 'opacity ' + fadeMs + 'ms cubic-bezier(0.16, 1, 0.3, 1)';
          requestAnimationFrame(function () { requestAnimationFrame(function () { canvas.style.opacity = '1'; }); });
        }
        if (opts.onDrawn) opts.onDrawn();
      }
    }

    // ---- loop
    var STILL_TIME = 6;
    var live = !frozen && !reduce;
    var raf = 0, running = false, onScreen = true, simTime = 0, last = 0;

    function tick(now) {
      raf = 0;
      if (!running) return;
      var dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      simTime += dt;
      if (!fixedPointer) stepPointer(dt, now);
      if ((window.devicePixelRatio || 1) !== dprSeen) resize();
      draw(simTime);
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (!live || running || lost || destroyed || !ready || !onScreen || document.hidden) return;
      running = true; last = 0;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function wake() { if (live) start(); }

    function redrawStill() {
      if (live) return;
      draw(frozen ? opts.time : STILL_TIME);
    }

    resize();

    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { resize(); if (!live) redrawStill(); });
      ro.observe(container);
    } else {
      window.addEventListener('resize', onWinResize);
    }
    function onWinResize() { resize(); if (!live) redrawStill(); }

    var io = null;
    if (live && window.IntersectionObserver) {
      io = new IntersectionObserver(function (entries) {
        var en = entries[entries.length - 1];
        onScreen = en.isIntersecting;
        if (onScreen) start(); else stop();
      }, { rootMargin: '200px 0px' });
      io.observe(container);
    }

    function onVis() { if (document.hidden) stop(); else start(); }

    if (live) {
      document.addEventListener('visibilitychange', onVis);
      if (!fixedPointer) {
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerout', onLeave, { passive: true });
      }
    }

    function onLost(e) {
      e.preventDefault();
      lost = true;
      ready = false;
      stop();
      container.classList.add('sky-lost');
      // a context the browser does not give back within 1.5s (it can block WebGL after GPU crashes) is a failure
      lostTimer = setTimeout(function () { failNow('DawnSky: the WebGL context was lost'); }, 1500);
    }
    function onRestored() {
      clearTimeout(lostTimer);
      if (destroyed) return;
      lost = false;
      try { startBuild(); } catch (err) { return failNow(err); }
      whenBuilt(function () {
        container.classList.remove('sky-lost');
        resize();
        if (live) start(); else redrawStill();
      });
    }
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    var api = {
      destroy: function () {
        if (destroyed) return;
        stop();
        destroyed = true;
        clearTimeout(lostTimer);
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onWinResize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerout', onLeave);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
      frame: function (time) {
        if (destroyed || lost) return;
        if (typeof time === 'number') draw(time); else if (live) draw(simTime); else redrawStill();
      }
    };

    whenBuilt(function () { if (live) start(); else redrawStill(); });
    return api;
  }

  window.DawnSky = { mount: mount };
})();
