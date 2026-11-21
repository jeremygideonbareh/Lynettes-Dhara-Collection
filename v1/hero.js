// The resting state is a transparent Blender render of the same mesh. Its
// lighting and photographic border stay registered as the drape moves.
const host = document.querySelector('#hero-art');
const canvas = document.querySelector('#cloth');
const poster = document.querySelector('#cloth-poster');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const touch = matchMedia('(pointer: coarse)');

function readMesh(THREE, buffer) {
  const values = new Int16Array(buffer);
  const [columns, rows] = values;
  const count = (columns + 1) * (rows + 1);
  if (values.length !== count * 3 + 2) throw new Error('Incomplete drape mesh');
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const edges = new Float32Array(count);
  const lengthwise = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    for (let axis = 0; axis < 3; axis++) {
      positions[i * 3 + axis] = values[2 + i * 3 + axis] / 4096;
    }
    uvs[i * 2] = 0.5 + positions[i * 3] / 8.24;
    uvs[i * 2 + 1] = 0.5 + positions[i * 3 + 1] / (8.24 * 11 / 12);
    edges[i] = i % (columns + 1) / columns;
    lengthwise[i] = Math.floor(i / (columns + 1)) / rows;
  }
  const indices = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col;
      indices.push(a, a + 1, a + columns + 2, a, a + columns + 2, a + columns + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('selvage', new THREE.BufferAttribute(edges, 1));
  geometry.setAttribute('warp', new THREE.BufferAttribute(lengthwise, 1));
  geometry.setIndex(indices);
  return geometry;
}

// A reduced-order membrane around the sculpted rest pose. Adjacent samples
// exchange tension along warp and weft. The top row hangs from fixed pins.
function springCloth() {
  const width = 6, height = 8;
  const displacements = new Float32Array(width * height);
  const speeds = new Float32Array(width * height);
  function step(dt, time, wind, pointerHeight) {
    // Two substeps keep the damped spring system stable at a 20 Hz render cap.
    const h = dt / 2;
    for (let n = 0; n < 2; n++) {
      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const d = displacements[i];
          const weft = displacements[x > 0 ? i - 1 : i] + displacements[x + 1 < width ? i + 1 : i] - 2 * d;
          const warp = displacements[y > 0 ? i - width : i] + displacements[i + width] - 2 * d;
          const pressure = 0.5 * Math.sin(time * 0.78 + y * 0.65 + x * 0.45);
          const localWind = wind * Math.exp(-Math.pow((y / (height - 1) - pointerHeight) * 3.3, 2));
          const acceleration = 22 * weft + 36 * warp - 5.6 * d - 2.5 * speeds[i] + pressure + 2.15 * localWind;
          speeds[i] += acceleration * h;
        }
      }
      for (let i = 0; i < width * (height - 1); i++) displacements[i] += speeds[i] * h;
    }
  }
  return { displacements, step };
}

async function prepare() {
  const THREE = await import('./assets/vendor/three.module.min.js');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !touch.matches, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch.matches ? 1.15 : 1.5));
  let geometry, texture;
  try {
    // Three r160 sizes a texture from image.width. A detached image retains
    // its intrinsic dimensions when the visible poster has responsive CSS.
    const plate = new Image();
    plate.src = poster.currentSrc || poster.src;
    const [buffer, image] = await Promise.all([
      fetch(new URL('./assets/art/drape.bin', import.meta.url)).then(r => {
        if (!r.ok) throw new Error('Could not load drape mesh');
        return r.arrayBuffer();
      }),
      plate.decode().then(() => plate),
    ]);
    geometry = readMesh(THREE, buffer);
    texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;
  } catch (error) {
    renderer.dispose();
    throw error;
  }

  const fabric = springCloth();
  const uniforms = {
    photo: { value: texture },
    time: { value: 0 },
    breeze: { value: new THREE.Vector2() },
    scroll: { value: 0 },
    stretch: { value: fabric.displacements },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      attribute float selvage;
      attribute float warp;
      uniform float stretch[48];
      uniform float time;
      uniform vec2 breeze;
      uniform float scroll;
      varying vec2 sampleUV;
      varying float sheen;
      float tensionAt(vec2 uv) {
        vec2 samplePoint = uv * vec2(5.0, 7.0);
        ivec2 low = ivec2(floor(samplePoint));
        ivec2 high = ivec2(min(vec2(low) + 1.0, vec2(5.0, 7.0)));
        vec2 blend = fract(samplePoint);
        float lowRow = mix(stretch[low.y * 6 + low.x], stretch[low.y * 6 + high.x], blend.x);
        float highRow = mix(stretch[high.y * 6 + low.x], stretch[high.y * 6 + high.x], blend.x);
        return mix(lowRow, highRow, blend.y);
      }
      void main() {
        vec3 p = position;
        float bend = tensionAt(vec2(selvage, warp));
        float wave = sin(time * 0.64 + p.y * 0.72 + 2.1 * selvage);
        float response = 0.045 + 0.085 * selvage;
        p.x += response * wave + bend * (0.58 + 0.15 * selvage);
        p.y += 0.032 * sin(time * 0.56 + p.z) + breeze.y * 0.07 * selvage;
        p.z += 0.11 * wave + bend;
        p.x += scroll * (0.26 * (selvage - 0.5) + 0.055 * p.y);
        p.y += scroll * 0.18;
        sampleUV = uv;
        sheen = 1.0 + wave * response * 0.14;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D photo;
      varying vec2 sampleUV;
      varying float sheen;
      void main() {
        vec4 colour = texture2D(photo, sampleUV);
        if (colour.a < 0.08) discard;
        gl_FragColor = vec4(colour.rgb * sheen, colour.a);
        #include <colorspace_fragment>
      }`,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4.12, 4.12, 3.78, -3.78, 0.1, 28);
  camera.position.z = 13;
  scene.add(new THREE.Mesh(geometry, mat));

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!(width > 0 && height > 0)) return;
    const ratio = width / height;
    // Match object-fit: cover on the responsive poster.
    const frameWidth = Math.min(8.24, 8.24 * 11 / 12 * ratio);
    camera.left = -frameWidth / 2;
    camera.right = frameWidth / 2;
    camera.top = frameWidth / ratio / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const dimensions = new ResizeObserver(resize);
  dimensions.observe(host);
  resize();
  const wind = new THREE.Vector2();
  const hitArea = host.closest('section') || host;
  hitArea.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = hitArea.getBoundingClientRect();
    wind.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
  }, { passive: true });
  hitArea.addEventListener('pointerleave', () => wind.set(0, 0));

  let last = 0;
  let scrollVelocity = 0;
  function render(now) {
    if (last && now - last < (touch.matches ? 33 : 25)) return false;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    uniforms.time.value += dt;
    uniforms.breeze.value.lerp(wind, 1 - Math.exp(-dt * 3));
    const rect = host.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    const speed = Math.max(-1, Math.min(1, (progress - uniforms.scroll.value) / Math.max(dt, 0.001)));
    scrollVelocity += (speed - scrollVelocity) * (1 - Math.exp(-dt * 4));
    uniforms.scroll.value = progress;
    fabric.step(dt, uniforms.time.value, uniforms.breeze.value.x + scrollVelocity * 1.25, uniforms.breeze.value.y * 0.5 + 0.5);
    renderer.render(scene, camera);
    return true;
  }
  return { render };
}

function init() {
  let active = false;
  let failed = false;
  let loading = null;
  let engine = null;
  let raf = 0;
  const root = document.documentElement;
  const mediaOff = () => reduced.matches || root.classList.contains('reduced') ||
    ['off', 'reduced'].includes(root.dataset.motion);
  const canDraw = () => active && !document.hidden && !mediaOff() && !failed;
  const showPoster = () => {
    canvas.style.opacity = '0';
    poster.style.opacity = '1';
  };
  showPoster();
  function draw(now) {
    raf = 0;
    if (!engine || !canDraw()) return;
    if (engine.render(now)) {
      canvas.style.opacity = '1';
      poster.style.opacity = '0';
    }
    raf = requestAnimationFrame(draw);
  }
  function update() {
    if (!canDraw()) {
      cancelAnimationFrame(raf);
      raf = 0;
      showPoster();
      return;
    }
    if (!loading) {
      loading = prepare().then(instance => { engine = instance; update(); }).catch(() => {
        failed = true;
        showPoster();
      });
    } else if (engine && !raf) raf = requestAnimationFrame(draw);
  }
  canvas.addEventListener('webglcontextlost', () => { failed = true; update(); });
  new IntersectionObserver(([entry]) => { active = entry.isIntersecting; update(); }).observe(host);
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['class', 'data-motion'] });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
}

if (host && canvas && poster && 'IntersectionObserver' in window &&
    !navigator.connection?.saveData && (navigator.deviceMemory || 8) > 2) init();
