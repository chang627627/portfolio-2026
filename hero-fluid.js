/* The Living Gradient — a fluid-field renderer for the g2 hero.
 *
 * The CSS gradient stops being a picture of light and becomes light with
 * physics: a WebGL2 Navier-Stokes velocity sim STIRS THE LOOKUP into the
 * same six-pool field the CSS paints — the field itself is procedural and
 * driven by the SAME animated custom properties (read live off .hero-orbs,
 * which keeps animating at opacity 0), so the composition, the seam under
 * headline line 1, and the 13s/9s weather can never drift from the CSS
 * definition. Dye is never advected: distortion decays, so the hand-tuned
 * composition is the attractor the fluid always relaxes back to.
 *
 * Fallback is the whole architecture: this file only ever ADDS a canvas and
 * a `hero--gl` class. Mobile, touch, reduced-motion, no-WebGL2, software
 * rasterizers (failIfMajorPerformanceCaveat), context loss, and ?gl=0 all
 * end at the same place — the CSS hero, byte-identical to today.
 *
 * Integration surface is deliberately tiny: reads window.__heroDrag (set by
 * Script A's drag grip) to widen and strengthen the stir; never touches the
 * type engine, tilt, or specular (which reads --g2-warm-x off the same
 * still-animating element and therefore stays in sync with this renderer).
 */
(() => {
  'use strict';

  if (new URLSearchParams(location.search).get('gl') === '0') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth <= 768) return;

  const hero = document.querySelector('.hero');
  const orbs = hero && hero.querySelector('.hero-orbs');
  if (!hero || !orbs) return;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: true, failIfMajorPerformanceCaveat: true
  });
  if (!gl) return;
  // rendering into half-float targets needs this; near-universal on desktop
  if (!gl.getExtension('EXT_color_buffer_float')) return;

  /* ---------- shaders ---------- */

  const VERT = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      // css-oriented uv (y down) everywhere, so pointer input and the pool
      // positions from the stylesheet need no per-site flipping
      vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  const FRAG = {
    advect: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVel, uSrc;
      uniform float uDt, uDiss;
      void main() {
        vec2 back = vUv - uDt * texture2D(uVel, vUv).xy;
        gl_FragColor = uDiss * texture2D(uSrc, back);
      }`,
    // displacement field: advected by the flow AND fed by it, decaying — the
    // "stir the lookup" core. As velocity dies, displacement relaxes to zero
    // and the exact CSS composition re-forms.
    displace: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVel, uDisp;
      uniform float uDt, uDiss;
      void main() {
        vec2 v = texture2D(uVel, vUv).xy;
        vec2 back = vUv - uDt * v;
        vec2 d = uDiss * texture2D(uDisp, back).xy + v * uDt;
        gl_FragColor = vec4(d, 0.0, 1.0);
      }`,
    splat: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform vec2 uPoint, uForce;
      uniform float uRadius, uAspect;
      void main() {
        vec2 p = vUv - uPoint;
        p.x *= uAspect;
        vec2 base = texture2D(uTarget, vUv).xy;
        gl_FragColor = vec4(base + uForce * exp(-dot(p, p) / uRadius), 0.0, 1.0);
      }`,
    curl: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVel;
      uniform vec2 uTexel;
      void main() {
        float L = texture2D(uVel, vUv - vec2(uTexel.x, 0.0)).y;
        float R = texture2D(uVel, vUv + vec2(uTexel.x, 0.0)).y;
        float B = texture2D(uVel, vUv - vec2(0.0, uTexel.y)).x;
        float T = texture2D(uVel, vUv + vec2(0.0, uTexel.y)).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`,
    // vorticity confinement: re-energizes the small swirls the coarse grid
    // dissipates — this is what makes a drag carve a living vortex
    vorticity: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVel, uCurl;
      uniform vec2 uTexel;
      uniform float uEps, uDt;
      void main() {
        float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
        float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
        float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
        float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 grad = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        grad /= (length(grad) + 1e-4);
        vec2 v = texture2D(uVel, vUv).xy;
        v += uEps * uDt * C * vec2(grad.y, -grad.x);
        gl_FragColor = vec4(v, 0.0, 1.0);
      }`,
    divergence: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVel;
      uniform vec2 uTexel;
      void main() {
        float L = texture2D(uVel, vUv - vec2(uTexel.x, 0.0)).x;
        float R = texture2D(uVel, vUv + vec2(uTexel.x, 0.0)).x;
        float B = texture2D(uVel, vUv - vec2(0.0, uTexel.y)).y;
        float T = texture2D(uVel, vUv + vec2(0.0, uTexel.y)).y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`,
    pressure: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPressure, uDiv;
      uniform vec2 uTexel;
      void main() {
        float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
        float div = texture2D(uDiv, vUv).x;
        gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
      }`,
    gradSub: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPressure, uVel;
      uniform vec2 uTexel;
      void main() {
        float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
        vec2 v = texture2D(uVel, vUv).xy;
        gl_FragColor = vec4(v - 0.5 * vec2(R - L, T - B), 0.0, 1.0);
      }`,
    // the g2 field itself: six pools, transcribed 1:1 from .hero-orbs--g2.
    // Geometry, ramps and alphas must match style.css exactly — if the CSS
    // block ever changes, this shader must follow (same rule as api/chat.js
    // mirroring matchData).
    render: `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uDisp;
      uniform float uDispGain, uScale;
      uniform vec2 uTrans;          // computed transform translate, box fractions
      uniform vec2 uC[6];           // pool centers (css uv, lift folded in)
      const vec2 RAD[6] = vec2[6](  // ellipse radii (fractions of box w/h)
        vec2(0.92, 0.52), vec2(0.96, 0.50), vec2(0.96, 0.50),
        vec2(0.58, 0.34), vec2(0.40, 0.24), vec2(1.16, 0.60));
      const vec3 COL[6] = vec3[6](
        vec3(255.,214.,0.), vec3(255.,30.,58.), vec3(255.,48.,176.),
        vec3(10.,132.,255.), vec3(96.,214.,255.), vec3(22.,120.,255.));
      const float ALP[6] = float[6](0.90, 0.85, 0.82, 0.50, 0.32, 0.88);
      const float STP[6] = float[6](0.62, 0.60, 0.60, 0.68, 0.70, 0.66);
      void main() {
        // stir: displace the lookup, never the paint
        vec2 uv = vUv - uDispGain * texture2D(uDisp, vUv).xy;
        // invert the element's animated transform (scale-breathe + drift)
        vec2 q = uv - 0.5;
        q = (q - uTrans) / uScale;
        vec2 f = q + 0.5;
        // composite back-to-front: blue, cyan, azure, pink, warm, yellow
        vec3 rgb = vec3(0.0);
        float a = 0.0;
        for (int i = 5; i >= 0; i--) {
          vec2 e = (f - uC[i]) / RAD[i];
          float d = length(e);
          float pa = ALP[i] * clamp(1.0 - d / STP[i], 0.0, 1.0);
          rgb = mix(rgb, COL[i] / 255.0, pa);
          a = pa + a * (1.0 - pa);
        }
        // rgb is ALREADY premultiplied: the back-to-front mix chain
        // (rgb = COL*pa + rgb*(1-pa)) is the premultiplied source-over
        // recurrence. Multiplying by alpha again darkened the whole field
        // by its own alpha -- the "too dark" bug. (No backticks in these
        // comments: they live inside a JS template literal.)
        gl_FragColor = vec4(rgb, a);
      }`
  };

  /* ---------- GL plumbing ---------- */

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  };
  const vert = compile(gl.VERTEX_SHADER, VERT);
  const programs = {};
  for (const name in FRAG) {
    // the render shader uses GLSL array constructors — needs ES 3.00
    const src = name === 'render'
      ? '#version 300 es\n' + FRAG[name]
          .replace('varying vec2 vUv', 'in vec2 vUv')
          .replace(/texture2D/g, 'texture')
          .replace(/gl_FragColor/g, 'fragColor')
          .replace('void main()', 'out vec4 fragColor;\nvoid main()')
      : FRAG[name];
    const vs = name === 'render'
      ? compile(gl.VERTEX_SHADER, '#version 300 es\n' + VERT
          .replace('attribute vec2 aPos', 'in vec2 aPos')
          .replace('varying vec2 vUv', 'out vec2 vUv'))
      : vert;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'aPos'); // location 0 assumed by the vertex setup
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(p));
    }
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name);
    }
    programs[name] = { p, u };
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);

  const makeTex = (w, h, internal, format) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, fb, w, h };
  };
  const doubleTex = (w, h, i, f) => {
    let a = makeTex(w, h, i, f), b = makeTex(w, h, i, f);
    return {
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; }
    };
  };

  /* ---------- sim state ---------- */

  const SIM_W = 192;
  let simH = 108, texel = [1 / SIM_W, 1 / 108];
  let velocity, pressure, displacement, divergence, curlTex;
  const allocSim = (aspect) => {
    simH = Math.max(64, Math.round(SIM_W / aspect));
    texel = [1 / SIM_W, 1 / simH];
    velocity = doubleTex(SIM_W, simH, gl.RG16F, gl.RG);
    pressure = doubleTex(SIM_W, simH, gl.R16F, gl.RED);
    displacement = doubleTex(SIM_W, simH, gl.RG16F, gl.RG);
    divergence = makeTex(SIM_W, simH, gl.R16F, gl.RED);
    curlTex = makeTex(SIM_W, simH, gl.R16F, gl.RED);
  };

  const bindTex = (tex, unit) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex.t);
    return unit;
  };
  const blit = (target) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  /* ---------- layout ---------- */

  let boxW = 1, boxH = 1;
  const layout = () => {
    // the canvas matches the ORBS box (incl. the -12% bleed Script A sets),
    // because every pool position is a percentage of that box
    canvas.style.cssText =
      'position:absolute;pointer-events:none;z-index:0;' +
      `left:${orbs.offsetLeft}px;top:${orbs.offsetTop}px;` +
      `width:${orbs.offsetWidth}px;height:${orbs.offsetHeight}px;` +
      'filter:blur(26px);';   // the CSS layer's blur(32px), minus the sim's own softness
    boxW = orbs.offsetWidth; boxH = orbs.offsetHeight;
    const res = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    canvas.width = Math.max(2, Math.round(boxW * res));
    canvas.height = Math.max(2, Math.round(boxH * res));
    if (!velocity) allocSim(boxW / boxH);
  };

  /* ---------- pointer ---------- */

  let last = null;
  const splats = [];
  hero.addEventListener('mousemove', (e) => {
    // fresh rect every event: it moves with scroll (same pattern as Script A)
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      if (dx * dx + dy * dy > 1e-8) splats.push({ x, y, dx, dy, drag: !!window.__heroDrag });
      if (splats.length > 12) splats.shift();
    }
    last = { x, y };
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { last = null; }, { passive: true });

  // ambient weather: a faint seeded stir so the fluid is alive before the
  // visitor touches it — per-visit unique (the generative seeding fold-in),
  // amplitude far below the cursor so at rest the field reads as the CSS one
  let seed = 0;
  try {
    seed = +sessionStorage.getItem('fluidSeed') || (Math.random() * 1e9 | 0);
    sessionStorage.setItem('fluidSeed', seed);
  } catch (e) { seed = 42424242; }
  let rngState = seed || 1;
  const rng = () => ((rngState = (rngState * 1664525 + 1013904223) >>> 0) / 4294967296);
  let nextAmbient = 1200;

  /* ---------- per-frame uniforms from the live CSS ---------- */

  const POOLS = [
    ['--g2-yellow-x', '--g2-yellow-y'], ['--g2-warm-x', '--g2-warm-y'],
    ['--g2-pink-x', '--g2-pink-y'], ['--g2-azure-x', '--g2-azure-y'],
    ['--g2-cyan-x', '--g2-cyan-y'], ['--g2-blue-x', '--g2-blue-y']
  ];
  const centers = new Float32Array(12);
  let uScale = 1.03, uTransX = -0.02, uTransY = -0.01;
  const readField = () => {
    const cs = getComputedStyle(orbs);
    const lift = parseFloat(cs.getPropertyValue('--g2-lift')) || 0;
    for (let i = 0; i < 6; i++) {
      centers[i * 2] = (parseFloat(cs.getPropertyValue(POOLS[i][0])) || 50) / 100;
      centers[i * 2 + 1] = ((parseFloat(cs.getPropertyValue(POOLS[i][1])) || 50) + lift) / 100;
    }
    const m = /matrix\(([^)]+)\)/.exec(cs.transform);
    if (m) {
      const v = m[1].split(',').map(parseFloat);
      uScale = v[0];
      uTransX = v[4] / boxW;
      uTransY = v[5] / boxH;
    } else { uScale = 1; uTransX = 0; uTransY = 0; }
  };

  /* ---------- frame ---------- */

  const stats = { frames: 0, fps: 0, t0: performance.now() };
  window.__fluidStats = stats;
  // verification hook: mean |displacement| over the sim grid centre
  window.__fluidProbe = () => {
    try {
      gl.bindFramebuffer(gl.FRAMEBUFFER, displacement.read.fb);
      const px = new Float32Array(4 * 64);
      gl.readPixels(SIM_W / 2 - 32, simH >> 1, 64, 1, gl.RGBA, gl.FLOAT, px);
      let s = 0;
      for (let i = 0; i < 64; i++) s += Math.hypot(px[i * 4], px[i * 4 + 1]);
      return s / 64;
    } catch (e) { return -1; }
  };

  let running = false, lastT = 0, fieldT = 0;
  const frame = (t) => {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min((t - lastT) / 1000 || 0.016, 0.025);
    lastT = t;

    // ambient stir
    nextAmbient -= dt * 1000;
    if (nextAmbient <= 0) {
      nextAmbient = 2200 + rng() * 1600;
      const ang = rng() * Math.PI * 2;
      splats.push({
        x: 0.15 + rng() * 0.7, y: 0.25 + rng() * 0.6,
        dx: Math.cos(ang) * 0.004, dy: Math.sin(ang) * 0.004, drag: false
      });
    }

    // field uniforms at ~30Hz — the pools drift over 13s, this is plenty
    fieldT -= dt;
    if (fieldT <= 0) { fieldT = 0.033; readField(); }

    const aspect = boxW / boxH;

    // 1. advect velocity
    let pr = programs.advect;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 0));
    gl.uniform1i(pr.u.uSrc, bindTex(velocity.read, 0));
    gl.uniform1f(pr.u.uDt, dt);
    gl.uniform1f(pr.u.uDiss, Math.pow(0.988, dt * 60));
    blit(velocity.write); velocity.swap();

    // 2. pointer + ambient splats
    pr = programs.splat;
    gl.useProgram(pr.p);
    while (splats.length) {
      const s = splats.shift();
      gl.uniform1i(pr.u.uTarget, bindTex(velocity.read, 0));
      gl.uniform2f(pr.u.uPoint, s.x, s.y);
      const gain = s.drag ? 14.0 : 7.0;
      const fx = Math.max(-2.5, Math.min(2.5, s.dx * gain / Math.max(dt, 0.008)));
      const fy = Math.max(-2.5, Math.min(2.5, s.dy * gain / Math.max(dt, 0.008)));
      gl.uniform2f(pr.u.uForce, fx * 0.01, fy * 0.01);
      gl.uniform1f(pr.u.uRadius, s.drag ? 0.012 : 0.0035);
      gl.uniform1f(pr.u.uAspect, aspect);
      blit(velocity.write); velocity.swap();
    }

    // 3. vorticity confinement
    pr = programs.curl;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 0));
    gl.uniform2f(pr.u.uTexel, texel[0], texel[1]);
    blit(curlTex);
    pr = programs.vorticity;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 0));
    gl.uniform1i(pr.u.uCurl, bindTex(curlTex, 1));
    gl.uniform2f(pr.u.uTexel, texel[0], texel[1]);
    gl.uniform1f(pr.u.uEps, 14.0);
    gl.uniform1f(pr.u.uDt, dt);
    blit(velocity.write); velocity.swap();

    // 4. pressure projection (what makes it fluid, not smear)
    pr = programs.divergence;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 0));
    gl.uniform2f(pr.u.uTexel, texel[0], texel[1]);
    blit(divergence);
    pr = programs.pressure;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uDiv, bindTex(divergence, 1));
    gl.uniform2f(pr.u.uTexel, texel[0], texel[1]);
    for (let i = 0; i < 18; i++) {
      gl.uniform1i(pr.u.uPressure, bindTex(pressure.read, 0));
      blit(pressure.write); pressure.swap();
    }
    pr = programs.gradSub;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uPressure, bindTex(pressure.read, 0));
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 1));
    gl.uniform2f(pr.u.uTexel, texel[0], texel[1]);
    blit(velocity.write); velocity.swap();

    // 5. displacement (the stirred lookup)
    pr = programs.displace;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uVel, bindTex(velocity.read, 0));
    gl.uniform1i(pr.u.uDisp, bindTex(displacement.read, 1));
    gl.uniform1f(pr.u.uDt, dt);
    gl.uniform1f(pr.u.uDiss, Math.pow(0.962, dt * 60));
    blit(displacement.write); displacement.swap();

    // 6. render the field through the stirred lookup
    pr = programs.render;
    gl.useProgram(pr.p);
    gl.uniform1i(pr.u.uDisp, bindTex(displacement.read, 0));
    gl.uniform1f(pr.u.uDispGain, 0.9);
    gl.uniform1f(pr.u.uScale, uScale);
    gl.uniform2f(pr.u.uTrans, uTransX, uTransY);
    gl.uniform2fv(pr.u.uC, centers);
    blit(null);

    stats.frames++;
    if (stats.frames % 60 === 0) {
      const now = performance.now();
      stats.fps = Math.round(60000 / (now - stats.t0));
      stats.t0 = now;
    }
  };

  /* ---------- lifecycle ---------- */

  const start = () => {
    layout();
    readField();
    orbs.parentNode.insertBefore(canvas, orbs.nextSibling);
    // render one frame BEFORE hiding the CSS layer — no flash of nothing
    lastT = performance.now();
    running = true;
    requestAnimationFrame((t) => {
      frame(t);
      hero.classList.add('hero--gl');
    });

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); }
      } else {
        running = false;
      }
    }).observe(hero);

    window.addEventListener('resize', () => { layout(); }, { passive: true });

    canvas.addEventListener('webglcontextlost', () => {
      // no recovery dance: the CSS hero is still there, let it take over
      running = false;
      hero.classList.remove('hero--gl');
      canvas.remove();
    });
  };

  try { start(); } catch (e) {
    running = false;
    hero.classList.remove('hero--gl');
    canvas.remove();
  }
})();
