/* Hero cloth: the boutique's crimson Dhara (real photo texture) hangs from a rod,
   unrolls on load, sways, parts around the cursor like a breeze and catches a Muka-gold sheen.
   main.js drives P.reveal (intro) and P.unfurl / P.fade (scroll). */
import * as THREE from '../assets/vendor/three.module.min.js';

const html = document.documentElement;
const canvas = document.getElementById('cloth');
const P = { reveal: 0, unfurl: 0, fade: 1, mx: 0, my: 0, tx: 0, ty: 0, wind: 1 };

function ok() {
  if (!canvas || html.classList.contains('reduced')) return false;
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (ok()) { window.__cloth = P; init(); }
else document.dispatchEvent(new Event('cloth:none'));

function init() {
  const touch = html.classList.contains('touch');
  const small = innerWidth < 760;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !touch, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !touch });
  } catch (e) { delete window.__cloth; document.dispatchEvent(new Event('cloth:none')); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  const W = 4.6, H = 2.6;
  const seg = touch ? [96, 56] : [180, 104];
  const geo = new THREE.PlaneGeometry(W, H, seg[0], seg[1]);

  const tex = new THREE.TextureLoader().load(small ? 'assets/art/cloth-small.webp' : 'assets/art/cloth.webp', () => {
    html.classList.add('has-gl');
    document.dispatchEvent(new Event('cloth:ready'));
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const uniforms = {
    uTex: { value: tex }, uTime: { value: 0 }, uReveal: { value: 0 }, uUnfurl: { value: 0 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uMouseForce: { value: 0 }, uFade: { value: 1 },
    uH: { value: H }, uW: { value: W }, uWind: { value: 1 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, transparent: true,
    vertexShader: /* glsl */`
      uniform float uTime, uReveal, uUnfurl, uH, uW, uMouseForce, uWind;
      uniform vec2 uMouse;
      varying vec2 vUv; varying vec3 vPos; varying float vRoll; varying float vShade;
      void main(){
        vUv = uv;
        vec3 p = position;
        float d = (uH*0.5 - p.y);              // distance from the rod (top edge)
        float hang = d / uH;                    // 0 at rod, 1 at hem
        // breeze: layered travelling waves, stronger toward the hem
        float t = uTime;
        float amp = (0.10 + 0.20*hang*hang) * uWind;
        float z = sin(p.x*1.6 + t*1.1 + hang*2.4)*amp
                + sin(p.x*3.1 - t*1.7 + hang*5.0)*amp*0.35
                + sin(p.y*2.2 + t*0.8)*0.05*hang;
        // folds: soft vertical pleats like a draped Dhara
        z += sin(p.x*5.2 + 0.6)*0.06*(0.4+hang);
        // cursor breeze pushes the cloth back in a soft bump
        vec2 m = uMouse; float md = distance(p.xy, m);
        z -= exp(-md*md*1.6) * 0.42 * uMouseForce * (0.35 + hang);
        float sway = sin(t*0.6)*0.08*hang*hang*uWind;
        p.x += sway;
        p.z += z;
        // unfurl on scroll: the hem lifts toward the viewer, like cloth spread across a table
        p.z += uUnfurl * hang*hang * 2.2;
        p.y += uUnfurl * hang*hang * 0.9;
        // roll: below the reveal line the cloth is wound on a cylinder at the rod
        float L = uReveal * uH;                 // unrolled length
        vRoll = 0.0;
        if (d > L) {
          float R = 0.11;
          float s = d - L;
          float th = s / R;
          float r = R * (1.0 + 0.012*th);
          float yR = uH*0.5 - L;
          p.y = yR - sin(th)*r;
          p.z = (1.0 - cos(th))*r + z*0.15;
          vRoll = 1.0;
        }
        vShade = hang;
        vec4 wp = modelMatrix * vec4(p,1.0);
        vPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform float uTime, uFade;
      varying vec2 vUv; varying vec3 vPos; varying float vRoll; varying float vShade;
      void main(){
        vec3 col = texture2D(uTex, vUv).rgb;
        vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
        if (!gl_FrontFacing) n = -n;
        vec3 L = normalize(vec3(-0.4, 0.6, 1.0));
        vec3 V = normalize(cameraPosition - vPos);
        float diff = clamp(dot(n, L), 0.0, 1.0);
        // anisotropic silk sheen: highlights stretch along the warp
        vec3 Hh = normalize(L + V);
        float aniso = pow(1.0 - abs(dot(normalize(vec3(n.x, 0.0, n.z)+1e-4), Hh)), 3.0);
        float spec = pow(clamp(dot(n, Hh), 0.0, 1.0), 28.0);
        // Muka sweep: a gold band travels diagonally across the cloth
        float band = smoothstep(0.16, 0.0, abs(fract(vUv.x*0.6 - vUv.y*0.35 - uTime*0.07) - 0.5));
        vec3 gold = vec3(1.0, 0.82, 0.48);
        vec3 c = col * (0.42 + 0.72*diff);
        c += gold * (spec*0.35 + aniso*0.10 + band*0.20*(0.4+diff));
        if (!gl_FrontFacing) c *= 0.55;
        c *= mix(1.0, 0.7, vRoll);
        // fade the hem and side edges softly into the page
        float edge = smoothstep(0.0, 0.035, vUv.x) * smoothstep(1.0, 0.965, vUv.x);
        gl_FragColor = vec4(c, uFade * edge);
      }`
  });
  mat.extensions = { derivatives: true };

  const cloth = new THREE.Mesh(geo, mat);
  scene.add(cloth);

  // the rod
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, W + 0.5, 24),
    new THREE.MeshBasicMaterial({ color: 0xd9ad58, transparent: true })
  );
  rod.rotation.z = Math.PI / 2;
  rod.position.y = H / 2 + 0.02;
  scene.add(rod);
  const knobGeo = new THREE.SphereGeometry(0.07, 16, 12);
  [-1, 1].forEach(s => { const k = new THREE.Mesh(knobGeo, rod.material); k.position.set(s * (W / 2 + 0.25), H / 2 + 0.02, 0); scene.add(k); });

  const group = new THREE.Group();
  scene.add(group);
  [cloth, rod].forEach(o => group.add(o));
  scene.children.filter(o => o.geometry === knobGeo).forEach(k => group.add(k));

  function layout() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const mobile = w < 760;
    // desktop: hang right of the headline; phones: high and centred behind the type
    group.position.set(mobile ? 0.15 : 1.25, mobile ? 1.1 : 0.18, 0);
    const s = mobile ? Math.min(1.02, (w / h) * 2.2) : 1;
    group.scale.setScalar(s);
    camera.position.z = mobile ? 8.6 : 7.2;
  }
  layout();
  addEventListener('resize', layout);

  // pointer -> local cloth coords
  let force = 0, targetForce = 0;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  addEventListener('pointermove', e => {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    P.tx = ndc.x; P.ty = ndc.y;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      group.worldToLocal(hit);
      uniforms.uMouse.value.set(hit.x, hit.y);
      targetForce = 1;
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { targetForce = 0; });

  let running = true, visible = true, raf = 0, last = performance.now(), t = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    t += dt;
    force += (targetForce - force) * 0.06;
    targetForce *= 0.985;
    P.mx += (P.tx - P.mx) * 0.05; P.my += (P.ty - P.my) * 0.05;
    uniforms.uTime.value = t;
    uniforms.uReveal.value = P.reveal;
    uniforms.uUnfurl.value = P.unfurl;
    uniforms.uFade.value = P.fade;
    uniforms.uMouseForce.value = force;
    uniforms.uWind.value = P.wind;
    rod.material.opacity = P.fade;
    group.rotation.y = -0.22 + P.mx * 0.12 - P.unfurl * 0.25;
    group.rotation.x = P.my * -0.05 - P.unfurl * 0.55;
    group.position.z = P.unfurl * 1.1;
    renderer.render(scene, camera);
  }
  function start() { if (!running && visible && P.fade > 0.01) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (running) { running = false; cancelAnimationFrame(raf); } }
  raf = requestAnimationFrame(frame);

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  P.wake = start; P.sleep = stop;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); html.classList.remove('has-gl'); });
}
