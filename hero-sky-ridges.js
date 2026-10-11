/* HeroSky: a painted dawn over misty ridges, drawn by one fragment shader.
   window.HeroSky.mount(container, opts) -> { destroy(), frame(t) }
   opts: { time, pointer: [nx, ny], scroll, scale } */
(function () {
  'use strict';

  /* ---------- ridge silhouettes ----------
     Each ridge is a 1D height profile in design pixels (a 1440x800 frame, y down),
     traced from the reference painting, smoothed with a cubic Hermite curve, given
     a little 1D noise and, on the near ridges, conifer tips. Computed once here and
     uploaded as a 4096x8 RGBA texture (16 bits per ridge, two ridges per row), so
     the shader pays one texture fetch per ridge. */
  var DOM0 = -800, DOMW = 3040, TEXW = 4096, TEXH = 8;

  var LAYERS = [
    { id: 'A0', pts: [[-800,440],[-300,440],[-100,436],[0,437],[40,432],[70,429],[110,432],[160,436],[400,440],[600,440],[700,442],[760,447],[820,444],[880,441],[940,441],[1000,436],[1050,441],[1080,446],[1150,438],[1200,437],[1250,433],[1300,438],[1370,433],[1440,438],[1600,436],[1800,440],[2240,438]],
      det: [[70, 2.6], [28, 1.8], [11, 1.0], [4.5, 0.5]] },
    { id: 'A', pts: [[-800,470],[-300,470],[-100,450],[0,447],[100,438],[160,422],[210,410],[255,403],[290,404],[320,410],[360,418],[400,423],[440,431],[480,428],[540,420],[570,422],[600,429],[680,437],[740,446],[800,456],[880,466],[1000,472],[1800,472],[2240,472]],
      det: [[60, 2.6], [24, 2.0], [10, 1.2], [4, 0.6]] },
    { id: 'Bp', pts: [[-800,470],[-300,470],[300,460],[420,450],[520,446],[600,452],[680,459],[760,464],[840,466],[900,474],[960,486],[1000,490],[1060,470],[1120,452],[1200,450],[1280,460],[1340,472],[1440,480],[1600,476],[1800,480],[2240,478]],
      det: [[64, 2.6], [26, 1.4], [10, 0.7], [4, 0.35]] },
    { id: 'C', pts: [[-800,560],[700,560],[820,540],[880,520],[940,505],[1000,502],[1060,512],[1100,506],[1180,492],[1260,485],[1330,480],[1440,478],[1800,480],[2240,480]],
      det: [[56, 2.4], [20, 1.1], [7, 0.5]] },
    { id: 'B', pts: [[-800,478],[-300,480],[-100,472],[0,468],[40,463],[80,459],[120,456],[160,466],[200,474],[240,473],[280,469],[320,477],[360,482],[400,489],[440,481],[480,490],[520,487],[560,495],[600,504],[640,504],[680,514],[720,519],[760,527],[800,533],[840,541],[880,552],[920,566],[960,585],[1000,610],[1100,650],[1800,650],[2240,650]],
      det: [[48, 2.0], [16, 1.0], [6, 0.6]], trees: { h: [1.0, 2.6], k: 1.0, p: 0.6 } },
    { id: 'DR', pts: [[-800,650],[780,650],[860,600],[900,575],[960,552],[1000,543],[1040,544],[1080,528],[1120,520],[1160,523],[1200,515],[1240,514],[1280,501],[1320,487],[1360,473],[1400,470],[1440,468],[1600,472],[1800,476],[2240,470]],
      det: [[44, 2.2], [15, 1.0]], trees: { h: [1.5, 3.5], k: 0.9, p: 0.7 } },
    { id: 'E', pts: [[-800,700],[450,700],[520,660],[560,640],[600,620],[640,612],[680,605],[720,596],[760,588],[800,577],[840,579],[880,584],[920,580],[960,591],[1000,596],[1040,607],[1080,611],[1120,613],[1160,621],[1200,630],[1260,650],[1400,690],[1800,700],[2240,700]],
      det: [[44, 2.0], [15, 1.0]], trees: { h: [1.5, 4], k: 0.9, p: 0.7 } },
    { id: 'DL', pts: [[-800,530],[-300,525],[-100,520],[0,517],[40,513],[80,526],[120,535],[160,541],[200,536],[240,544],[280,563],[320,568],[360,582],[400,598],[440,605],[480,616],[520,620],[560,629],[600,639],[660,650],[720,662],[800,680],[880,700],[960,720],[1100,760],[1800,780],[2240,780]],
      det: [[40, 2.0], [14, 1.0]], trees: { h: [3, 8], k: 0.5, p: 1.0 } },
    { id: 'F', pts: [[-800,612],[-300,615],[-100,618],[0,622],[40,630],[80,641],[120,644],[160,659],[200,661],[240,660],[280,655],[320,662],[400,677],[480,684],[560,690],[640,695],[720,700],[800,706],[860,712],[900,714],[960,700],[1000,690],[1040,680],[1080,668],[1120,655],[1160,645],[1200,636],[1240,630],[1280,626],[1320,620],[1360,612],[1400,606],[1440,602],[1600,598],[1800,600],[2240,604]],
      det: [[40, 2.0], [14, 1.0]], trees: { h: [6, 15], k: 0.46, p: 1.35, q: 1.35, big: true } },
    { id: 'G', pts: [[-800,820],[380,820],[480,610],[530,570],[580,549],[620,543],[660,548],[700,560],[760,585],[820,615],[900,680],[1000,820],[2240,820]],
      det: [[36, 2.0], [12, 1.0]], trees: { h: [1.5, 3.2], k: 0.75, p: 0.75 } }
  ];

  function hermite(pts, x) {
    var n = pts.length, i = 0;
    if (x <= pts[0][0]) return pts[0][1];
    if (x >= pts[n - 1][0]) return pts[n - 1][1];
    while (i < n - 2 && pts[i + 1][0] < x) i++;
    var x0 = pts[i][0], x1 = pts[i + 1][0], t = (x - x0) / (x1 - x0);
    function tan(j) {
      if (j <= 0) return (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]);
      if (j >= n - 1) return (pts[n - 1][1] - pts[n - 2][1]) / (pts[n - 1][0] - pts[n - 2][0]);
      return 0.5 * ((pts[j + 1][1] - pts[j][1]) / (pts[j + 1][0] - pts[j][0]) +
                    (pts[j][1] - pts[j - 1][1]) / (pts[j][0] - pts[j - 1][0]));
    }
    var m1 = tan(i) * (x1 - x0), m2 = tan(i + 1) * (x1 - x0);
    var t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * pts[i][1] + (t3 - 2 * t2 + t) * m1 +
           (-2 * t3 + 3 * t2) * pts[i + 1][1] + (t3 - t2) * m2;
  }
  function hash1(i, s) { var v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); }
  function vnoise1(x, s) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return (hash1(i, s) * (1 - u) + hash1(i + 1, s) * u) * 2 - 1;
  }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function treeScale(x) { // the nearest trees are larger at the frame's edges, smaller in the valley
    var s = 1;
    if (x < 420) s = 1.0 + 0.8 * Math.min(1, (420 - x) / 380);
    if (x > 1120) s = 1.0 + 0.15 * Math.min(1, (x - 1120) / 260);
    var v = Math.exp(-Math.pow((x - 900) / 140, 2));
    return s * (1 - 0.45 * v);
  }

  function buildProfiles() {
    var data = new Uint8Array(TEXW * TEXH * 4), lo = [], hi = [];
    for (var L = 0; L < LAYERS.length; L++) {
      var layer = LAYERS[L], ys = new Float32Array(TEXW), k, i, x;
      for (i = 0; i < TEXW; i++) {
        x = DOM0 + (i + 0.5) / TEXW * DOMW;
        var y = hermite(layer.pts, x);
        for (k = 0; k < layer.det.length; k++) y += layer.det[k][1] * vnoise1(x / layer.det[k][0], L * 7 + k * 3 + 1);
        ys[i] = y;
      }
      if (layer.trees) {
        // conifer crowns: groves of taller trees, uneven spacing, a slight lean, ragged tiers on the big ones
        var T = layer.trees, r = rng(1000 + L * 77), px = DOMW / TEXW, pw = T.p || 1.2;
        var hm = (T.h[0] + T.h[1]) * 0.5;
        var canopy = new Float32Array(TEXW);
        for (i = 0; i < TEXW; i++) {
          x = DOM0 + (i + 0.5) * px;
          canopy[i] = ys[i] + hm * 0.5 * (T.big ? treeScale(x) : 1);
        }
        var out = new Float32Array(canopy);
        for (x = DOM0; x < DOM0 + DOMW;) {
          var sc = T.big ? treeScale(x) : 1;
          var grove = 0.55 + 0.9 * (vnoise1(x / 57, L + 50) * 0.5 + 0.5);
          var h = (T.h[0] + (T.h[1] - T.h[0]) * Math.pow(r(), 1.3)) * sc * grove;
          if (T.big && r() < 0.12) h *= 1.3;
          var wl = h * T.k * (0.75 + 0.5 * r()), wr = h * T.k * (0.75 + 0.5 * r());
          var pp = pw * (0.85 + 0.3 * r()), lean = (r() - 0.5) * 0.25 * Math.min(wl, wr), ph = r() * 6.283;
          var tiers = T.big && h > 7;
          var ci = Math.round((x - DOM0) / px - 0.5);
          if (ci >= 0 && ci < TEXW) {
            var base = canopy[ci] + h * 0.2 * r();
            var i0 = Math.max(0, Math.floor(ci - (wl + 2) / px)), i1 = Math.min(TEXW - 1, Math.ceil(ci + (wr + 2) / px));
            for (i = i0; i <= i1; i++) {
              var dxs = (DOM0 + (i + 0.5) * px) - x;
              var ww = dxs < 0 ? wl : wr;
              var d = Math.abs(dxs - lean * Math.max(0, 1 - Math.abs(dxs) / ww)) / ww;
              if (d < 1) {
                var side = Math.pow(1 - Math.pow(d, T.q || 1), pp);
                var top = base - h * side;
                if (tiers) top += h * 0.09 * Math.sqrt(d) * (0.5 + 0.5 * Math.sin(side * 13 + ph));
                if (top < out[i]) out[i] = top;
              }
            }
          }
          x += Math.max(1.2, (wl + wr) * 0.5 * (T.big ? 0.4 + 0.85 * r() : 0.45 + 1.1 * r()));
        }
        ys = out;
      }
      var mn = Infinity, mx = -Infinity;
      for (i = 0; i < TEXW; i++) { if (ys[i] < mn) mn = ys[i]; if (ys[i] > mx) mx = ys[i]; }
      mn -= 1; mx += 1; lo.push(mn); hi.push(mx);
      var row = L >> 1, ch = (L & 1) * 2;
      for (i = 0; i < TEXW; i++) {
        var v = Math.round((ys[i] - mn) / (mx - mn) * 65535);
        var o = (row * TEXW + i) * 4 + ch;
        data[o] = v >> 8; data[o + 1] = v & 255;
      }
    }
    return { data: data, lo: lo, hi: hi };
  }

  /* ---------- shaders ---------- */
  var VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec2 uPointer;',
    'uniform float uScroll;',
    'uniform float uHorizon;',
    'uniform sampler2D uProf;',
    'uniform vec4 uLo0; uniform vec4 uHi0;',
    'uniform vec4 uLo1; uniform vec4 uHi1;',
    'uniform vec4 uLo2; uniform vec4 uHi2;',
    '#define C(r,g,b) (vec3(r,g,b)/255.0)',
    'float sat(float v){return clamp(v,0.0,1.0);}',
    'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
    'float vnoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
    '  float a=hash12(i),b=hash12(i+vec2(1.0,0.0)),c=hash12(i+vec2(0.0,1.0)),d=hash12(i+vec2(1.0,1.0));',
    '  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
    'const mat2 ROT=mat2(1.6,1.2,-1.2,1.6);',
    // fbm with 4 octaves for the mist; the clouds use their own anisotropic fbm (cfbm5, cfbm3)
    'float fbm4(vec2 p){float s=0.0,a=0.5;for(int i=0;i<4;i++){s+=a*vnoise(p);p=ROT*p+vec2(7.3,3.1);a*=0.5;}return s/0.9375;}',
    'const mat2 CROT=mat2(2.45,0.18,-0.12,1.85);',
    'float cfbm3(vec2 p){float s=0.0,a=0.5;for(int i=0;i<3;i++){s+=a*vnoise(p);p=CROT*p+vec2(5.3,1.7);a*=0.6;}return s/0.98;}',
    'vec2 cfbm5(vec2 p){float s=0.0,a=0.5,s3=0.0;for(int i=0;i<5;i++){s+=a*vnoise(p);if(i==2)s3=s;p=CROT*p+vec2(5.3,1.7);a*=0.6;}return vec2(s/1.1528,s3/0.98);}',
    'float G(vec2 p,vec2 c,vec2 s){vec2 d=(p-c)/s;return exp(-dot(d,d));}',
    'float dec(vec2 v){return (v.x*65280.0+v.y*255.0)/65535.0;}',
    'vec4 prow(float x,float r){return texture2D(uProf,vec2((x+800.0)/3040.0,(r+0.5)/8.0));}',
    'float P0(float x){return mix(uLo0.x,uHi0.x,dec(prow(x,0.0).rg));}',
    'float P1(float x){return mix(uLo0.y,uHi0.y,dec(prow(x,0.0).ba));}',
    'float P2(float x){return mix(uLo0.z,uHi0.z,dec(prow(x,1.0).rg));}',
    'float P3(float x){return mix(uLo0.w,uHi0.w,dec(prow(x,1.0).ba));}',
    'float P4(float x){return mix(uLo1.x,uHi1.x,dec(prow(x,2.0).rg));}',
    'float P5(float x){return mix(uLo1.y,uHi1.y,dec(prow(x,2.0).ba));}',
    'float P6(float x){return mix(uLo1.z,uHi1.z,dec(prow(x,3.0).rg));}',
    'float P7(float x){return mix(uLo1.w,uHi1.w,dec(prow(x,3.0).ba));}',
    'float P8(float x){return mix(uLo2.x,uHi2.x,dec(prow(x,4.0).rg));}',
    'float P9(float x){return mix(uLo2.y,uHi2.y,dec(prow(x,4.0).ba));}',

    'vec3 skyRamp(float y){',
    '  vec3 c=C(33.0,54.0,102.0);',
    '  c=mix(c,C(41.0,61.0,114.0),sat(y/45.0));',
    '  c=mix(c,C(57.0,72.0,125.0),sat((y-45.0)/45.0));',
    '  c=mix(c,C(79.0,85.0,135.0),sat((y-90.0)/45.0));',
    '  c=mix(c,C(103.0,96.0,142.0),sat((y-135.0)/45.0));',
    '  c=mix(c,C(128.0,108.0,148.0),sat((y-180.0)/45.0));',
    '  c=mix(c,C(156.0,121.0,151.0),sat((y-225.0)/45.0));',
    '  c=mix(c,C(178.0,128.0,147.0),sat((y-270.0)/45.0));',
    '  c=mix(c,C(201.0,136.0,143.0),sat((y-315.0)/45.0));',
    '  c=mix(c,C(216.0,142.0,139.0),sat((y-360.0)/50.0));',
    '  return c;}',
    'void main(){',
    '  float k=800.0/uRes.y;',
    '  vec2 fc=gl_FragCoord.xy;',
    '  float x=(fc.x-0.5*uRes.x)*k+720.0;',
    '  float y=(uRes.y-fc.y)*k;',
    '  float yPage=y;',
    // per user "make the text contrast better": the scene slides down until the sun's horizon sits under the pill
    '  if(uHorizon>0.0) y-=uHorizon*800.0-446.0;',
    '  float W=uRes.x*k;',
    '  float t=uTime;',
    '  float aa=max(0.6,0.7*k);',
    '  vec2 par=-uPointer*vec2(48.0,16.0);',
    '  float lean=length(uPointer);',
    '  vec2 sun=vec2(750.0+uPointer.x*0.08*W, 446.0+uPointer.y*24.0-30.0*uScroll);',
    '  float glowAmt=(1.0+0.08*smoothstep(0.0,0.5,lean))*(1.0+0.3*uScroll);',
    '  float spread=1.0+0.45*uScroll;',
    '  vec2 sun0=vec2(sun.x,446.0+uPointer.y*24.0);',

    // sky and the light at the horizon
    '  vec3 col=skyRamp(y+60.0*uScroll);',
    '  float dx=x-sun.x;',
    '  float wide=exp(-dx*dx/(720.0*720.0*spread*spread))*smoothstep(240.0-40.0*uScroll,410.0,y);',
    '  col=mix(col,C(252.0,162.0,133.0),sat(wide*0.92*glowAmt));',
    '  float mid=max(G(vec2(x,y),vec2(sun.x,sun.y-16.0),vec2(280.0,80.0)*spread),G(vec2(x,y),vec2(sun0.x,sun0.y-16.0),vec2(280.0,80.0)));',
    '  col=mix(col,C(253.0,178.0,134.0),sat(mid*0.7*glowAmt));',
    '  float core=max(G(vec2(x,y),sun,vec2(90.0,42.0)*spread),G(vec2(x,y),sun0,vec2(90.0,42.0)));',
    '  col=mix(col,C(255.0,208.0,146.0),sat(core*0.95*glowAmt));',

    // clouds: a painted cloud deck seen in perspective. Its streaks bow toward the sun and thin
    // into strata near the horizon; dusky mauve bodies, coral undersides lit by the sun below.
    '  if(y<448.0){',
    '    vec2 cp=vec2(x,y);',
    '    float cov=0.42*G(cp,vec2(1100.0,128.0),vec2(60.0,9.0))+0.42*G(cp,vec2(1170.0,104.0),vec2(70.0,9.0))+0.36*G(cp,vec2(1230.0,84.0),vec2(50.0,8.0))+0.40*G(cp,vec2(1385.0,138.0),vec2(60.0,10.0))',
    '           +0.62*G(cp,vec2(290.0,186.0),vec2(230.0,40.0))',
    '           +1.0*G(cp,vec2(320.0,322.0),vec2(330.0,44.0))',
    '           +1.15*G(cp,vec2(1320.0,250.0),vec2(240.0,50.0))+1.05*G(cp,vec2(1190.0,344.0),vec2(330.0,34.0))+0.9*G(cp,vec2(1360.0,334.0),vec2(170.0,40.0))',
    '           +1.00*G(cp,vec2(330.0,384.0),vec2(470.0,28.0))+1.00*G(cp,vec2(1170.0,390.0),vec2(420.0,26.0))',
    '           +0.40*G(cp,vec2(760.0,378.0),vec2(260.0,22.0))',
    '           +0.85*smoothstep(760.0,1000.0,abs(x-720.0))*G(vec2(0.0,y),vec2(0.0,300.0),vec2(1.0,80.0));',
    '    cov=sat(cov)*(1.0-0.75*G(cp,vec2(sun.x,410.0),vec2(190.0,55.0)));',
    '    if(cov>0.03){',
    '      float cx=x-750.0;',
    '      float ye=y+0.8e-4*cx*cx*(1.0-smoothstep(250.0,430.0,y));',
    '      float dq=603.0-ye;',
    '      float lw=smoothstep(600.0,1000.0,abs(cx));',
    '      float wx=t*0.0135;',
    '      vec2 nn=cfbm5(vec2(cx*1.9/mix(dq,300.0,lw)+wx,5600.0/dq));',
    '      float dq2=dq-7.0;',
    '      float probe=cfbm3(vec2(cx*1.9/mix(dq2,300.0,lw)+wx,5600.0/dq2));',
    '      float dens=nn.x+0.22*cov-0.62;',
    '      float al=smoothstep(0.0,0.04,dens)*sat(cov*3.0);',
    '      float thick=smoothstep(0.02,0.16,dens);',
    '      float lit=sat((nn.y-probe)*8.0-0.08);',
    '      float hi=1.0-smoothstep(205.0,285.0,y);',
    '      vec3 body=col*mix(vec3(0.86,0.885,0.99),vec3(0.82,0.85,0.98),smoothstep(280.0,345.0,y)*(1.0-smoothstep(360.0,400.0,y)))+C(0.0,0.0,2.0);',
    '      vec3 rim=col+mix(C(30.0,9.0,-3.0),C(20.0,11.0,-1.0),smoothstep(150.0,330.0,y));',
    '      vec3 cc=mix(body,rim,sat(mix(lit*(1.0-0.8*thick),0.85,hi)));',
    '      col=mix(col,cc,al*0.9);',
    '    }',
    '  }',
    '  float sp; float h; float d; float a; vec3 lc;',
    // A0: the farthest range, pale and warm by the sun
    '  {float f=0.04; float xx=x+par.x*f; h=P0(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   sp=exp(-pow((xx-sun.x)/420.0,2.0));',
    '   lc=mix(C(126.0,107.0,139.0),C(160.0,116.0,137.0),sp);',
    '   lc=mix(lc,C(232.0,158.0,136.0),sat(sp*(0.55+0.3*uScroll)*exp(-max(d,0.0)/(3.0+3.0*uScroll))));',
    '   col=mix(col,lc,a);}',
    // A: the big mountain; its sun-facing flanks catch a little warm light
    '  {float f=0.08; float xx=x+par.x*f; h=P1(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   sp=exp(-pow((xx-sun.x)/430.0,2.0));',
    '   float sl=(P1(xx+24.0)-P1(xx-24.0))/48.0;',
    '   float face=sat(sl*clamp((sun.x-xx)/140.0,-1.0,1.0)*4.0);',
    '   lc=mix(C(115.0,100.0,134.0),C(166.0,118.0,136.0),sp);',
    '   lc=mix(lc,C(106.0,98.0,135.0),smoothstep(10.0,60.0,d)*(1.0-sp*0.5));',
    '   lc=mix(lc,C(214.0,146.0,138.0),sat(sp*0.6*exp(-max(d,0.0)/3.0)+0.12*face*(0.4+sp)*exp(-max(d,0.0)/30.0)));',
    '   col=mix(col,lc,a);}',
    // Bp: lavender mid-far range
    '  {float f=0.14; float xx=x+par.x*f; h=P2(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   sp=exp(-pow((xx-sun.x)/420.0,2.0));',
    '   lc=mix(C(112.0,100.0,135.0),C(126.0,103.0,134.0),sp);',
    '   lc=mix(lc,C(104.0,96.0,132.0),smoothstep(1050.0,1300.0,xx));',
    '   lc=mix(lc,C(130.0,110.0,140.0),smoothstep(8.0,50.0,d));',
    '   lc=mix(lc,C(200.0,140.0,140.0),sp*0.2*exp(-max(d,0.0)/2.5));',
    '   col=mix(col,lc,a);}',
    // mist M1: the far sea of mist in the central valley
    '  {float f=0.19; float xx=x+par.x*f; float yy=y-par.y*f;',
    '   float top=486.0+12.0*smoothstep(1100.0,1350.0,xx);',
    '   if(yy>top-28.0&&yy<605.0){',
    '   vec2 q=vec2((xx-t*3.0)/110.0,yy/22.0);',
    '   q.y+=0.3*sin(q.x*0.7+t*0.05);',
    '   float n=fbm4(q+vec2(11.0,0.0));',
    '   float env=smoothstep(top-30.0,top+45.0,yy);',
    '   float hx=smoothstep(250.0,450.0,xx)*(1.0-0.8*smoothstep(980.0,1180.0,xx));',
    '   float m=smoothstep(0.38,0.62,n+env*0.6-0.28)*hx*smoothstep(top-26.0,top-4.0,yy);',
    '   vec3 mc=mix(C(156.0,124.0,150.0),C(112.0,103.0,138.0),smoothstep(880.0,1150.0,xx));',
    '   mc=mix(mc,mc*0.86,smoothstep(top,top+60.0,yy));',
    '   col=mix(col,mix(mc*0.84,mc*1.12,sat(n*1.6-0.3)),m*(0.38+0.42*n));}}',
    // C: hazy hills standing in the far sea of mist, their feet lost in it
    '  {float f=0.24; float xx=x+par.x*f; h=P3(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   lc=mix(C(88.0,86.0,124.0),C(70.0,74.0,112.0),smoothstep(900.0,1300.0,xx));',
    '   lc=mix(lc,C(104.0,98.0,134.0),smoothstep(28.0,64.0,d));',
    '   col=mix(col,lc,a);}',
    // B: the blue ridge on the left, sloping into the valley
    '  {float f=0.32; float xx=x+par.x*f; h=P4(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   lc=mix(C(52.0,58.0,93.0),C(46.0,53.0,86.0),smoothstep(150.0,400.0,xx));',
    '   lc=mix(lc,C(60.0,65.0,99.0),smoothstep(560.0,820.0,xx));',
    '   float fold=P4(xx*0.93+173.0)+44.0;',
    '   lc=mix(lc,C(62.0,68.0,104.0),smoothstep(-4.0,18.0,y-fold)*0.7);',
    '   lc=mix(lc,C(64.0,70.0,106.0),smoothstep(50.0,120.0,d));',
    '   float slB=(P4(xx+32.0)-P4(xx-32.0))/64.0;',
    '   lc+=C(16.0,11.0,9.0)*sat(slB*clamp((sun.x-xx)/140.0,-1.0,1.0)*3.0)*exp(-max(d,0.0)/24.0)*exp(-pow((xx-sun.x)/700.0,2.0));',
    '   col=mix(col,lc,a);}',
    // DR: the dark ridge rising to the right
    '  {float f=0.40; float xx=x+par.x*f; h=P5(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   lc=mix(C(41.0,49.0,80.0),C(33.0,40.0,68.0),smoothstep(920.0,1050.0,xx));',
    '   lc=mix(lc,C(29.0,35.0,59.0),smoothstep(1150.0,1350.0,xx));',
    '   float fold=P5(xx*0.9+141.0)+40.0;',
    '   lc=mix(lc,lc+C(7.0,8.0,12.0),smoothstep(-4.0,18.0,y-fold)*0.8);',
    '   lc=mix(lc,C(44.0,53.0,86.0),0.6*smoothstep(60.0,130.0,d));',
    '   float slD=(P5(xx+32.0)-P5(xx-32.0))/64.0;',
    '   lc+=C(14.0,10.0,9.0)*sat(slD*clamp((sun.x-xx)/140.0,-1.0,1.0)*3.0)*exp(-max(d,0.0)/24.0)*exp(-pow((xx-sun.x)/700.0,2.0));',
    '   col=mix(col,lc,a);}',
    // G: a small hill standing in the near mist
    '  {float f=0.42; float xx=x+par.x*f; h=P9(xx)+par.y*f; d=y-h; float ag=mix(aa,12.0,smoothstep(568.0,600.0,y)); a=smoothstep(-ag,ag,d);',
    '   lc=mix(C(38.0,45.0,75.0),C(52.0,58.0,92.0),smoothstep(10.0,50.0,d));',
    '   col=mix(col,lc,a*(1.0-smoothstep(22.0,70.0,d)));}',
    // mist M2: the bright mist between the middle ridges and the near hills
    '  {float f=0.45; float xx=x+par.x*f; float yy=y-par.y*f;',
    '   float top=548.0+16.0*smoothstep(380.0,580.0,xx)-22.0*G(vec2(xx,0.0),vec2(930.0,0.0),vec2(110.0,1.0))+28.0*smoothstep(980.0,1150.0,xx)+12.0*G(vec2(xx,0.0),vec2(610.0,0.0),vec2(90.0,1.0))+6.0*sin(xx/97.0+1.3)+4.0*sin(xx/41.0);',
    '   if(yy>top-34.0&&yy<705.0&&xx>190.0){',
    '   vec2 q=vec2((xx-t*5.0)/75.0,yy/22.0);',
    '   q.y+=0.3*sin(q.x*0.8+t*0.07);',
    '   float n=fbm4(q+vec2(37.0,5.0));',
    '   float env=smoothstep(top-12.0,top+42.0,yy);',
    '   float hx=smoothstep(200.0,380.0,xx);',
    '   float R=smoothstep(920.0,1160.0,xx);',
    '   float m=smoothstep(0.38+0.05*R,0.58+0.02*R,n+env*(0.7-0.15*R)-0.26)*hx*smoothstep(top-32.0,top-2.0,yy)*(1.0-0.3*R);',
    '   vec3 mc=mix(C(98.0,95.0,132.0),C(52.0,60.0,95.0),smoothstep(950.0,1250.0,xx));',
    '   mc=mix(mc,mc*0.88,smoothstep(top+10.0,top+80.0,yy));',
    '   col=mix(col,mix(mc*0.84,mc*1.12,sat(n*1.6-0.3)),m*(0.6+0.4*n));}}',
    // E: the dark hill in the centre
    '  {float f=0.55; float xx=x+par.x*f; h=P6(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   lc=mix(C(30.0,37.0,62.0),C(23.0,29.0,49.0),smoothstep(560.0,760.0,xx));',
    '   lc=mix(lc,C(27.0,35.0,59.0),smoothstep(900.0,1100.0,xx));',
    '   float fold=P6(xx*0.92+97.0)+34.0;',
    '   lc=mix(lc,lc+C(5.0,6.0,10.0),smoothstep(-4.0,18.0,y-fold)*0.8);',
    '   col=mix(col,lc,a);}',
    // mist M3: soft wisps of low mist hugging the centre hill's lower slopes, over a faint veil
    '  {float f=0.65; float xx=x+par.x*f; float yy=y-par.y*f;',
    '   if(yy>600.0&&yy<735.0&&xx>470.0&&xx<1310.0){',
    '   float dz=yy-P6(x+par.x*0.55)+par.y*0.55;',
    '   vec2 q=vec2((xx-t*7.0)/95.0,dz/13.0);',
    '   q.y+=0.3*sin(q.x*0.8+t*0.09);',
    '   float n=fbm4(q+vec2(71.0,13.0));',
    '   float hx=smoothstep(480.0,680.0,xx)*(1.0-smoothstep(1080.0,1300.0,xx));',
    '   float band=smoothstep(30.0,58.0,dz)*(1.0-smoothstep(85.0,125.0,dz));',
    '   col=mix(col,C(34.0,42.0,70.0),0.35*hx*smoothstep(620.0,690.0,yy));',
    '   float m=smoothstep(0.46,0.72,n)*band*hx;',
    '   col=mix(col,mix(C(44.0,52.0,85.0),C(62.0,70.0,108.0),sat(n*2.2-1.0)),m*0.6);}}',
    // DL: the near ridge on the left, wooded crest
    '  {float f=0.75; float xx=x+par.x*f; h=P7(xx)+par.y*f; d=y-h; a=smoothstep(-aa,aa,d);',
    '   lc=mix(C(25.0,32.0,53.0),C(19.0,25.0,42.0),smoothstep(0.0,45.0,d));',
    '   col=mix(col,lc,a);}',
    // F: the foreground tree line
    '  {float f=1.0; float xx=x+par.x*f; h=P8(xx)+par.y*f; d=y-h; a=smoothstep(-aa*0.8,aa*0.8,d);',
    '   lc=mix(C(11.0,13.0,22.0),C(9.0,11.0,18.0),smoothstep(0.0,25.0,d));',
    '   col=mix(col,lc,a);}',

    // meet the page: the bottom 18% settles exactly on #090a0e
    '  col*=0.8;',
    '  float fade=smoothstep(700.0,792.0,yPage);',
    '  col=mix(col,C(9.0,10.0,14.0),fade);',
    '  col+=(hash12(fc)-0.5)/255.0*(1.0-fade);',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  /* ---------- runtime ---------- */
  var MAX_PIXELS = 1.6e6;

  function noop() { return { destroy: function () {}, frame: function () {} }; }

  function mount(container, opts) {
    opts = opts || {};
    var scale = typeof opts.scale === 'number' && opts.scale > 0 ? opts.scale : 0.5;
    var frozen = typeof opts.time === 'number';
    var fixedPointer = opts.pointer && opts.pointer.length === 2;
    var fixedScroll = typeof opts.scroll === 'number';
    var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var mqFine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
    var STILL_T = 6;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none';
    container.appendChild(canvas);

    var attrs = { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power', depth: false, stencil: false };
    var gl = null;
    try { gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs); } catch (e) { gl = null; }
    if (!gl) { fail(); return noop(); }

    var prof = buildProfiles();
    var prog, buf, tex, loc = {};
    var lost = false, destroyed = false;

    function fail() {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      container.classList.add('sky-failed');
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        if (window.console) console.error('HeroSky shader:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    function build() {
      var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, 'aPos');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) {
        if (window.console) console.error('HeroSky link:', gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEXW, TEXH, 0, gl.RGBA, gl.UNSIGNED_BYTE, prof.data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ['uRes', 'uTime', 'uPointer', 'uScroll', 'uHorizon', 'uProf', 'uLo0', 'uHi0', 'uLo1', 'uHi1', 'uLo2', 'uHi2'].forEach(function (n) {
        loc[n] = gl.getUniformLocation(prog, n);
      });
      var lo = prof.lo, hi = prof.hi;
      gl.uniform1i(loc.uProf, 0);
      gl.uniform4f(loc.uLo0, lo[0], lo[1], lo[2], lo[3]); gl.uniform4f(loc.uHi0, hi[0], hi[1], hi[2], hi[3]);
      gl.uniform4f(loc.uLo1, lo[4], lo[5], lo[6], lo[7]); gl.uniform4f(loc.uHi1, hi[4], hi[5], hi[6], hi[7]);
      gl.uniform4f(loc.uLo2, lo[8], lo[9], 0, 0); gl.uniform4f(loc.uHi2, hi[8], hi[9], 1, 1);
      return true;
    }

    if (!build()) { fail(); return noop(); }

    /* state */
    var cssW = 0, cssH = 0, bw = 0, bh = 0;
    var simT = frozen ? opts.time : STILL_T;
    var pTarget = [0, 0], pPos = [0, 0], pVel = [0, 0], firstMove = -1;
    if (fixedPointer) { pPos = [opts.pointer[0], opts.pointer[1]]; pTarget = pPos.slice(); }
    var scroll = fixedScroll ? opts.scroll : 0, rect = null, scrollDirty = true;
    var visible = true, raf = 0, last = 0, clock = 0;

    function reduced() { return !!(mqReduce && mqReduce.matches); }
    function live() { return !frozen && !reduced(); }

    function measure() {
      rect = container.getBoundingClientRect();
      if (!fixedScroll) {
        if (reduced()) scroll = 0;
        else {
          var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
          var den = sy + rect.bottom;
          scroll = den > 0 ? Math.min(1, Math.max(0, sy / den)) : 1;
        }
      }
      scrollDirty = false;
    }

    function resize() {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      cssW = w; cssH = h;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var f = dpr * scale;
      var nw = Math.max(1, Math.round(w * f)), nh = Math.max(1, Math.round(h * f));
      if (nw * nh > MAX_PIXELS) { var c = Math.sqrt(MAX_PIXELS / (nw * nh)); nw = Math.max(1, Math.floor(nw * c)); nh = Math.max(1, Math.floor(nh * c)); }
      if (nw !== bw || nh !== bh) { bw = canvas.width = nw; bh = canvas.height = nh; }
      scrollDirty = true;
      draw(simT);
    }

    function draw(t) {
      if (lost || destroyed || !bw) return;
      if (scrollDirty) measure();
      gl.viewport(0, 0, bw, bh);
      gl.uniform2f(loc.uRes, bw, bh);
      gl.uniform1f(loc.uTime, t);
      gl.uniform2f(loc.uPointer, pPos[0], pPos[1]);
      gl.uniform1f(loc.uScroll, scroll);
      gl.uniform1f(loc.uHorizon, typeof opts.horizon === 'function' ? opts.horizon() : typeof opts.horizon === 'number' ? opts.horizon : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function stepPointer(dt, now) {
      if (fixedPointer || firstMove < 0) return;
      var since = (now - firstMove) / 1000;
      // first lean eases in over ~1.4s; afterwards moves settle in ~0.55s (critically damped)
      var e = Math.min(1, Math.max(0, (since - 0.9) / 0.6));
      var w = 3.4 + (8.6 - 3.4) * e * e * (3 - 2 * e);
      for (var i = 0; i < 2; i++) {
        var acc = w * w * (pTarget[i] - pPos[i]) - 2 * w * pVel[i];
        pVel[i] += acc * dt;
        pPos[i] += pVel[i] * dt;
      }
    }

    function tick(now) {
      raf = 0;
      if (!running()) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      simT += dt;
      stepPointer(dt, now);
      draw(simT);
      raf = requestAnimationFrame(tick);
    }

    function running() { return live() && visible && !document.hidden && !lost && !destroyed; }
    function update() {
      if (running()) { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function onMove(e) {
      if (fixedPointer || !live() || !(mqFine && mqFine.matches)) return;
      if (!rect) rect = container.getBoundingClientRect();
      var nx = (e.clientX - rect.left) / rect.width - 0.5, ny = (e.clientY - rect.top) / rect.height - 0.5;
      pTarget[0] = Math.max(-0.5, Math.min(0.5, nx));
      pTarget[1] = Math.max(-0.5, Math.min(0.5, ny));
      if (firstMove < 0) firstMove = performance.now();
    }
    function onScroll() { scrollDirty = true; }
    function onVis() { update(); }
    function onReduce() {
      if (reduced()) { pPos = [0, 0]; pVel = [0, 0]; pTarget = [0, 0]; simT = STILL_T; scrollDirty = true; draw(simT); }
      update();
    }
    function onLost(e) {
      e.preventDefault(); lost = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      container.classList.add('sky-lost');
    }
    function onRestored() {
      lost = false;
      if (!build()) { fail(); return; }
      container.classList.remove('sky-lost');
      bw = bh = 0; resize(); update();
    }

    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    var ro = null, io = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { resize(); }); ro.observe(container); }
    else window.addEventListener('resize', resize);
    resize();

    if (!frozen) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      document.addEventListener('visibilitychange', onVis);
      if (mqReduce) { if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduce); else if (mqReduce.addListener) mqReduce.addListener(onReduce); }
      if (window.IntersectionObserver) {
        io = new IntersectionObserver(function (entries) {
          visible = entries[entries.length - 1].isIntersecting;
          if (visible) scrollDirty = true;
          update();
        }, { rootMargin: '200px 0px' });
        io.observe(container);
      }
      update();
    }

    return {
      frame: function (t) { if (typeof t === 'number') simT = t; draw(simT); },
      destroy: function () {
        destroyed = true;
        if (raf) cancelAnimationFrame(raf); raf = 0;
        if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
        if (io) io.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        document.removeEventListener('visibilitychange', onVis);
        if (mqReduce) { if (mqReduce.removeEventListener) mqReduce.removeEventListener('change', onReduce); else if (mqReduce.removeListener) mqReduce.removeListener(onReduce); }
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        container.classList.remove('sky-lost');
      }
    };
  }

  window.HeroSky = { mount: mount };
})();
