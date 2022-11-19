import * as three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const scene: any = new three.Scene();
let camera: any;
let renderer: any;
const clock: any = new three.Clock();
let mixer: any;
let composer: any;

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0,
};

// 模型
export function createGeometry() {
  new GLTFLoader().load('models/gltf/PrimaryIonDrive.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    // AnimationMixer对象是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，
    // 可以为每个对象使用一个AnimationMixer。我们需要透过这个对象实现动画。
    mixer = new three.AnimationMixer(model);
    const clip = gltf.animations[0];

    // 再用AnimationMixer对象的clipAction方法生成可以控制执行动画的实例,然后调用play方法开始动画即可
    mixer.clipAction(clip.optimize()).play();
    animate();
  });
}
// 相机
export function createCamera() {
  camera = new three.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
  camera.position.set(-5, 2.5, -3.5);
  scene.add(camera);
}
// 渲染器
export function createRender() {
  // 是否开启反锯齿，设置为true开启反锯齿。
  renderer = new three.WebGLRenderer({ antialias: true });
  // setPixelRatio(value) 设置设备像素比
  // Window 接口的devicePixelRatio返回当前显示设备的物理像素分辨率与CSS像素分辨率之比。
  renderer.setPixelRatio(window.devicePixelRatio);
  // setSize(width,height) 设置渲染目标的大小
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 色调映射
  renderer.toneMapping = three.ReinhardToneMapping;
  document.body.appendChild(renderer.domElement);
}
// 相机轨道控制器
export function createOrbitControls() {
  const controls = new OrbitControls(camera, renderer.domElement);
  // 设置旋转范围
  controls.maxPolarAngle = Math.PI * 0.5;
  // 最小距离
  controls.minDistance = 1;
  // 最大距离
  controls.maxDistance = 10;
}
// 渲染通道(灯光、阴影、反射、高光和全局光照。)需要注意的是通道是顺序执行的，加入时要注意顺序
export function createRenderPass() {
  // 根据scene和camera渲染出一个场景，和普通的webGLRenderer一样
  // RenderPass这个通道会渲染场景，但不会将渲染结果输出到屏幕上
  const renderScene = new RenderPass(scene, camera);

  // 高亮虚幻效果相机分层渲染
  // THREE.BloomPass(strength, kernelSize, sigma, Resolution)
  // strength 定义泛光效果的强度，值越高，明亮的区域越明亮，而且渗入较暗区域的也就越多
  // kernelSize 控制泛光的偏移量
  // sigma 控制泛光的锐利程度，值越高，泛光越模糊
  // Resolution 定义泛光的解析图，如果该值太低，结果的方块化就会越严重
  const bloomPass = new UnrealBloomPass(new three.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);

  // 图像的二值化，就是将图像上的像素点的灰度值设置为0或255，也就是将整个图像呈现出明显的只有黑和白的视觉效果。
  bloomPass.threshold = params.bloomThreshold;

  // Strength:光的强度
  bloomPass.strength = params.bloomStrength;

  // 半径
  bloomPass.radius = params.bloomRadius;

  // 创建效果组合器对象，可以在该对象上添加后期处理通道，通过配置该对象，
  // 使它可以渲染我们的场景，并应用额外的后期处理步骤，
  // 在render循环中，使用EffectComposer渲染场景、应用通道，并输出结果。
  composer = new EffectComposer(renderer);

  composer.addPass(renderScene);
  // 眩光通道bloomPass插入到composer
  composer.addPass(bloomPass);
}
// 灯光
export function createLight() {
  // 环境光
  scene.add(new three.AmbientLight(0x404040));
  // 点光
  camera.add(new three.PointLight(0xffffff, 1));
}

//
export function reSize() {
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机对象的投影矩阵属性
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}
// 动画
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // 控制动画的速度
  mixer.update(delta);

  // stats.update();

  composer.render();

  // 渲染器清除颜色、深度或模板缓存. 此方法将颜色缓存初始化为当前颜色
  //  renderer.clear()
  //  camera.layers.set(1)

  // 清除深度缓存
  renderer.clearDepth();
  camera.layers.set(0);
}
