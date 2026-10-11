/* HeroSky: a painted dawn over a sea of clouds, drawn by one fragment shader.
   window.HeroSky.mount(container, opts) -> { destroy(), frame(t) }
   opts: { time: freeze at this time (one frame, no loop), pointer: [nx, ny] fixed,
           scroll: fixed scroll progress, scale: backing scale (default 0.5) } */
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

const float H0 = 0.545;                       // the cloud horizon, fraction of height from the top
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
      return noop();
    }

    var prog = null, buf = null, loc = {};
    var lost = false, destroyed = false;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        var log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('HeroSky shader: ' + log);
      }
      return s;
    }

    function build() {
      var vs = compile(gl.VERTEX_SHADER, VERT);
      var fs = compile(gl.FRAGMENT_SHADER, FRAG);
      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
        throw new Error('HeroSky link: ' + gl.getProgramInfoLog(prog));
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
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
    }

    try { build(); } catch (err) {
      if (window.console) console.error(String(err && err.message || err));
      container.classList.add('sky-failed');
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      return noop();
    }

    // ---- size
    var cssW = 0, cssH = 0;
    function resize() {
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

    function draw(time) {
      if (lost || destroyed) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, time);
      gl.uniform2f(loc.pointer, pointer.x, pointer.y);
      gl.uniform1f(loc.scroll, scrollProgress());
      gl.uniform1f(loc.horizon, typeof opts.horizon === 'function' ? opts.horizon() : typeof opts.horizon === 'number' ? opts.horizon : 0.545);
      gl.uniform1f(loc.foot, opts.footer ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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
      draw(simTime);
      raf = requestAnimationFrame(tick);
    }
    function start() {
      if (!live || running || lost || destroyed || !onScreen || document.hidden) return;
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
      stop();
      container.classList.add('sky-lost');
    }
    function onRestored() {
      lost = false;
      try { build(); } catch (err) {
        if (window.console) console.error(String(err && err.message || err));
        container.classList.add('sky-failed');
        return;
      }
      container.classList.remove('sky-lost');
      resize();
      if (live) start(); else redrawStill();
    }
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    if (live) start(); else redrawStill();

    return {
      destroy: function () {
        if (destroyed) return;
        stop();
        destroyed = true;
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
        draw(typeof time === 'number' ? time : simTime);
      }
    };
  }

  window.HeroSky = { mount: mount };
})();
