/* Hero: the boutique's crimson Dhara as a living surface. A full-bleed WebGL plane that
   breathes like cloth, ripples around the cursor, catches a travelling Muka-gold sheen and
   zooms in as you scroll. store.js drives H.reveal (intro) and H.scroll (scroll). */
import * as THREE from '../assets/vendor/three.module.min.js';

const html = document.documentElement;
const canvas = document.getElementById('hero-gl');
const H = { reveal: 0, scroll: 0, vel: 0 };

function supported() {
  if (!canvas) return false;
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (supported()) { window.__hero = H; init(); }

function init() {
  const touch = html.classList.contains('touch');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'high-performance' }); }
  catch (e) { delete window.__hero; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.25 : 1.6));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const small = innerWidth < 760;
  const tex = new THREE.TextureLoader().load(small ? '../assets/art/cloth-small.webp' : '../assets/art/cloth.webp', (t) => {
    u.uImg.value.set(t.image.width, t.image.height);
    html.classList.add('has-gl');
    document.dispatchEvent(new Event('hero:ready'));
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;

  const u = {
    uTex: { value: tex }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(2048, 1152) },
    uMouse: { value: new THREE.Vector2(.7, .5) }, uHover: { value: 0 }, uReveal: { value: 0 }, uScroll: { value: 0 }, uVel: { value: 0 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform vec2 uRes, uImg, uMouse; uniform float uTime, uHover, uReveal, uScroll, uVel;
      varying vec2 vUv;
      void main(){
        // object-fit: cover, weighted to the right like the photo crop
        float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
        vec2 scale = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
        vec2 uv = (vUv - .5) * scale + vec2(.5);
        // intro: fabric settles from a slight zoom; scroll: drift and zoom in
        float z = 1. + (1. - uReveal) * .18 + uScroll * .22;
        uv = (uv - .5) / z + .5 + vec2(0., uScroll * .06);
        // cloth breathing: slow folds that travel across the warp
        float t = uTime;
        vec2 fold = vec2(sin(uv.y * 9. + t * .7) * .004 + sin(uv.y * 23. - t * 1.3) * .0015,
                         sin(uv.x * 7. + t * .5) * .006);
        uv += fold;
        // cursor breeze: a soft ripple around the pointer
        vec2 asp = vec2(uRes.x / uRes.y, 1.);
        vec2 d = (vUv - uMouse) * asp;
        float dist = length(d);
        float ripple = sin(dist * 38. - t * 5.) * exp(-dist * 5.5) * .012 * uHover;
        uv += normalize(d + 1e-5) * ripple / asp;
        // a touch of colour split when scrolling fast
        float split = clamp(abs(uVel), 0., 1.) * .004;
        vec3 col;
        col.r = texture2D(uTex, uv + vec2(split, 0.)).r;
        col.g = texture2D(uTex, uv).g;
        col.b = texture2D(uTex, uv - vec2(split, 0.)).b;
        // shading from the folds so the surface reads as cloth
        float shade = .82 + fold.y * 22. + sin(uv.y * 9. + t * .7) * .05;
        col *= shade;
        // Muka sheen: a gold band sweeping diagonally, brighter near the cursor
        float band = smoothstep(.14, 0., abs(fract(vUv.x * .55 + vUv.y * .3 - t * .05) - .5));
        col += vec3(1., .8, .45) * band * .14 * (.6 + .8 * exp(-dist * 3.) * uHover);
        // reveal: fade up from black
        col *= smoothstep(0., 1., uReveal);
        gl_FragColor = vec4(col, 1.);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  function size() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    u.uRes.value.set(w, h);
  }
  size(); addEventListener('resize', size);

  let tx = .7, ty = .5, hover = 0, target = 0;
  canvas.parentElement.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; target = 1;
  });
  canvas.parentElement.parentElement.addEventListener('pointerleave', () => { target = 0; });

  let run = true, raf = 0, last = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    u.uTime.value += dt;
    hover += (target - hover) * .05; target *= .992;
    u.uMouse.value.x += (tx - u.uMouse.value.x) * .08; u.uMouse.value.y += (ty - u.uMouse.value.y) * .08;
    u.uHover.value = hover; u.uReveal.value = H.reveal; u.uScroll.value = H.scroll;
    u.uVel.value += (H.vel - u.uVel.value) * .1;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);
  const start = () => { if (!run) { run = true; last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (run) { run = false; cancelAnimationFrame(raf); } };
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); html.classList.remove('has-gl'); });
}
