import * as three from 'three';
// import fragment from '@/shaders/sprites/fragment.fs';
// import vertex from '@/shaders/sprites/vertex.vs'
const SEPARTION = 100;
const AMOUNTX = 50;
const AMOUNTY = 50;

let container, stats;
let camera: any;
const scene = new three.Scene();
let renderer: any;

let particles: any;
let count = 0;
let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let positions: any, scales: any;

export function attribute() {
  const numParticles = AMOUNTX * AMOUNTY;

  positions = new Float32Array(numParticles * 3);
  scales = new Float32Array(numParticles);

  let i = 0;
  let j = 0;
  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i] = ix * SEPARTION - (AMOUNTX * SEPARTION) / 2; // x
      positions[i + 1] = 0; // y
      positions[i + 2] = iy * SEPARTION - (AMOUNTY * SEPARTION) / 2; // Z

      scales[j] = 1;
      i += 3;
      j++;
    }
  }
}
export function createGeometry() {
  const geometry = new three.BufferGeometry();
  geometry.setAttribute('position', new three.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new three.BufferAttribute(scales, 1));

  const material = new three.ShaderMaterial({
    uniforms: {
      color: { value: new three.Color(0x1e80ff) },
    },
    fog: true,
    vertexShader: `attribute float scale;

    void main(){
      vec4 mvPosition = modelViewMatrix * vec4( position,1.0);
      gl_PointSize = scale * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }`,
    fragmentShader: `uniform vec3 color;

    void main(){
      if(length(gl_PointCoord - vec2(0.5,0.5)) > 0.475) discard;
      gl_FragColor = vec4(color,1.0);
    }`,
  });

  particles = new three.Points(geometry, material);
  scene.add(particles);
}

export function createCamera() {
  camera = new three.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 5, 10000);
  camera.position.set(0, 0, 1500);
}

export function createRender() {
  renderer = new three.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  document.body.style.touchAction = 'none';
}

export function createListener() {
  document.body.addEventListener('pointermove', function (event) {
    if (event.isPrimary === false) return;
    mouseX = event.clientX - windowHalfX;

    mouseY = event.clientY - windowHalfY;
  });

  window.addEventListener('resize', function () {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.size(window.innerWidth, window.innerHeight);
  });
}
function particlesRender() {
  const positions = particles.geometry.attributes.position.array;
  const scales = particles.geometry.attributes.scale.array;

  let i = 0;
  let j = 0;

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      positions[i + 1] = Math.sin((ix + count) * 0.3) * 50 + Math.sin((iy + count) * 0.5) * 50;

      scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 + (Math.sin((iy + count) * 0.5) + 1) * 20;

      i += 3;
      j++;
    }
  }
}
export function render() {
  // camera.position.x += ( mouseX - camera.position.x ) * .05;
  // camera.position.y += ( - mouseY - camera.position.y ) * .05;
  // 控制相机位置
  camera.position.x = 0;
  camera.position.y = 600;
  camera.lookAt(scene.position);
  particlesRender();
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.scale.needsUpdate = true;

  renderer.render(scene, camera);

  count += 0.1;
}

export function animate() {
  requestAnimationFrame(animate);

  render();
}

export function init() {
  attribute();
  createGeometry();
  createCamera();
  createRender();
  createListener();
  render();
  animate();
}
