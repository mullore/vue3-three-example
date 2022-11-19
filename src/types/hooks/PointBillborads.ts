import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import dat from 'dat.gui';

// composer: any
let scene: any, camera: any, renderer: any, material: any, stats: any ;

let mouseX = 0;
let mouseY = 0;
// 模型
export function creatGeometry() {
  //
  scene = new three.Scene();
  scene.fog = new three.FogExp2(0x000000, 0.001);

  //
  const geometry = new three.BufferGeometry();
  const vertices = [];

  // const sprite:any = new other.TextureLoader().load('dot.png')

  // 设置顶点数量和位置
  for (let i = 0; i < 15000; i++) {
    const x = 2000 * Math.random() - 1000;
    const y = 2000 * Math.random() - 1000;
    const z = 2000 * Math.random() - 1000;
    vertices.push(x, y, z);
  }

  // 为当前几何体设置一个 attribute 属性。在类的内部，有一个存储 .attributes 的 hashmap，
  // 通过该 hashmap，遍历 attributes 的速度会更快。
  // 而使用该方法，可以向 hashmap 内部增加 attribute。 所以，你需要使用该方法来添加 attributes。
  // 设置顶点
  geometry.setAttribute('position', new three.Float32BufferAttribute(vertices, 3));

  material = new three.PointsMaterial({
    // 大小
    size: 9,
    // 指定点的大小是否因相机深度而衰减。（仅限透视摄像头。）默认为true。
    sizeAttenuation: true,
    // 使用Texture中的数据设置点的颜色。
    map: new three.TextureLoader().load('dot.png'),
    // 设置运行alphaTest时要使用的alpha值。如果不透明度低于此值，则不会渲染材质。默认值为0。
    alphaTest: 0.2,
    // 定义此材质是否透明
    transparent: true,
  });
  // HSL是一种将RGB色彩模型中的点在圆柱坐标系中的表示法
  // 色相、饱和度、亮度
  material.color.setHSL(1.0, 0.3, 0.7);

  const particles = new three.Points(geometry, material);
  scene.add(particles);
}

// Bloom主要用来模拟生活中的泛光或说眩光效果,通过threejs后期处理的扩展库UnrealBloomPass通道可实现一个泛光效果。
export function createBloom() {
  // var renderScene = new RenderPass( scene, camera );
  // //Bloom通道创建
  // var bloomPass = new UnrealBloomPass( new other.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  // bloomPass.renderToScreen = true;
  // bloomPass.threshold = 0;
  // bloomPass.strength = 1.5;
  // bloomPass.radius = 0;
  //
  // composer = new EffectComposer( renderer );
  // composer.setSize( window.innerWidth, window.innerHeight );
  // composer.addPass( renderScene );
  // // 眩光通道bloomPass插入到composer
  // composer.addPass( bloomPass );
}

// 相机
export function createCamera() {
  camera = new three.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
  camera.position.z = 1000;
}

// 控制器
export function createOrbitControls() {
  // const clock = new three.Clock(); // 创建THREE.Clock对象，用于计算上次调用经过的时间
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true; // 是否自动旋转
}

// GUI
export function createGui() {
  const gui = new dat.GUI();

  // gui.add( material, 'sizeAttenuation' ).onChange( function () {

  //     material.needsUpdate = true;

  // } );

  gui.open();
}
// 性能State
export function createState() {
  stats = Stats();
  document.body.appendChild(stats.dom);
}
// 灯光
// export function createLight() {

// }
// 渲染器
export function createRender() {
  renderer = new three.WebGLRenderer();

  // setPixelRatio设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  // Window.devicePixelRatio 返回当前显示设备的物理像素分辨率与CSS像素分辨率的比值。
  // 该值也可以被解释为像素大小的比例：即一个CSS像素的大小相对于一个物理像素的大小的比值
  renderer.setPixelRatio(window.devicePixelRatio);

  // .setSize ( width : Integer, height : Integer, updateStyle : Boolean ) : null
  // 将输出canvas的大小调整为(width, height)并考虑设备像素比，
  // 且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
  renderer.setSize(window.innerWidth, window.innerHeight);

  // const container:HTMLElement|null = document.getElementById("demo");
  // container.appendChild(renderer.domElement)
  // container.style.touchAction = 'none';

  document.body.appendChild(renderer.domElement);

  // CSS属性 touch-action 用于设置触摸屏用户如何操纵元素的区域(例如,浏览器内置的缩放功能)
  // CSS 属性 touch-action 用于指定某个给定的区域是否允许用户操作，以及如何响应用户操作（比如浏览器自带的划动、缩放等）。
  // 默认情况下，平移（滚动）和缩放手势由浏览器专门处理。
  // pan-x | pan-y：pan-x支持水平平移交互，而pan-y支持垂直平移。
  // none:这将停止支持浏览器中的所有活动，例如手势和平移。
  document.body.style.touchAction = 'none';

  // 指针移动事件
  // pointermove当指针(鼠标)改变坐标并且指针未被浏览器触摸动作取消时触发该事件。
  document.body.addEventListener('pointermove', function (event) {
    if (event.isPrimary === false) return;
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerWidth / 2;
  });

  // 文档视图调整大小时会触发 resize 事件。
  window.addEventListener('resize', function () {
    /// 重新设置宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机
    camera.updateProjectionMatrix();
    // 更新渲染页面大小
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
// 渲染
function render() {
  const time = Date.now() * 0.00005;
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  // camera为相机看的目标点：因为屏幕显示的是相机视椎体的可视范围，
  // 而相机的lookAt方法指的是相机观察的目标点，故可以得出：
  // 相机lookAt的点一定显示在屏幕的正中央：利用这点，我们可以实现物体移动时，
  // 我们可以一直跟踪物体，让物体永远在屏幕的中央

  // 调整相机的朝向
  camera.lookAt(scene.position);

  // 色相、饱和度、亮度
  const h = ((360 * (1.0 + time)) % 360) / 360;
  material.color.setHSL(h, 0.5, 0.5);
  renderer.render(scene, camera);
}

export function animate() {
  // composer.render();
  requestAnimationFrame(animate);
  render();
  stats.update();
}
