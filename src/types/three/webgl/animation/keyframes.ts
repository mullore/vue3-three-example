import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 导入模型的材质文件。
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class keyframes {
  // 场景
  #scene: three.Scene;
  // 相机
  #camera: three.PerspectiveCamera;
  // 渲染器
  #renderer: three.WebGLRenderer;
  // 相机控件(控制器)
  #controls: OrbitControls;
  // 时钟
  #clock: three.Clock;
  #mixer: three.AnimationMixer | any;

  constructor() {
    // this.#dom = dom
    // 实例化场景
    this.#scene = new three.Scene();
    // 实例化时钟(用于demo中的小车运动)
    this.#clock = new three.Clock();
    // 实例化透视相机
    // PerspectiveCamera构造函数参数列表，参数的数据类型都是number。
    // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    // fov — 摄像机视锥体垂直视野角度
    // aspect — 摄像机视锥体长宽比
    // near — 摄像机视锥体近端面
    // far — 摄像机视锥体远端面
    this.#camera = new three.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    // 实例化渲染器
    this.#renderer = new three.WebGLRenderer({ antialias: true }); // 抗锯齿
    // 实例化相机控件(控制器)
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
  }

  // 给场景添加背景色 添加HDR贴图（这块不太准确，后续需要优化）
  public createPmremGenerator() {
    // 预过滤的Mipmapped辐射环境贴图
    // PMREMGenerator（渲染器：WebGLRenderer）
    // 此构造函数创建一个新的 PMREMGenerator。
    // 在 THREE 中使用 HDR 需要经过 PMREMGenerator 处理才能使用
    // 这个类从cubeMap环境纹理生成一个预过滤的mipmap辐射环境贴图(PMREM)。
    // 这允许根据材料粗糙度快速获得不同级别的模糊。 它被打包成一种特殊的CubeUV格式，
    // 允许我们执行自定义插值，这样我们就可以支持非线性格式，比如RGBE。 与传统的mipmap链不同，它只会下降到LOD_MIN级别(以上)，
    // 然后在相同的LOD_MIN分辨率下创建额外的甚至更多过滤的“mips”，与更高的粗糙度级别相关。
    // 通过这种方式，我们在限制采样计算的同时保持分辨率，以平滑地插值漫射照明。
    // 将renderer元素添加到container中,生成一个亮度环境，传入renderer 并赋值给pmremGenerator
    // （这块不太准确，后续需要优化）
    const pmremGenerator = new three.PMREMGenerator(this.#renderer);
    // 设置场景背景色
    this.#scene.background = new three.Color(0xbfe3dd);

    // 给场景添加环境光效果
    // .fromScene(scene : Scene，sigma: Number, near: Number, far: Number): WebGLRenderTarget
    // scene -给定的场景。
    // sigma -(可选)指定在PMREM生成之前应用于场景的模糊半径(以弧度为单位)。 默认值为0。
    // near -(可选)近平面值。 默认是0.1。
    // far -(可选)远平面值。 默认是100。
    // 从提供的场景生成PMREM，如果网络带宽较低，可以比使用图像更快。 可选的近和远平面确保场景是完整渲染的(cubeCamera被放置在原点)。
    // UV映射，其本质上就是把平面图像的不同区块映射到3D模型的不同面上去。
    // RoomEnvironment 大概是 other 内置的场景
    this.#scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  }

  // 创建模型
  public createGeometry(): void {
    // 导入DRACO格式的loader
    const dracoLoader = new DRACOLoader();
    // 设置loader路径解压压缩模型
    dracoLoader.setDecoderPath('js/libs/draco/gltf/');
    // 导入GLTF格式的loader
    const loader = new GLTFLoader();
    // 设置DRACOloader
    loader.setDRACOLoader(dracoLoader);
    // 导入
    loader.load(
      'models/gltf/LittlestTokyo.glb',
      (gltf) => {
        // 获取
        const model = gltf.scene;
        // 定位
        model.position.set(1, 1, 0);
        // 缩放
        model.scale.set(0.01, 0.01, 0.01);
        // 添加
        this.#scene.add(model);
        // AnimationMixer 动画混合器
        // AnimationMixer是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，可以为每个对象使用一个AnimationMixer。
        this.#mixer = new three.AnimationMixer(model);
        // AnimationMixer对象的clipAction方法生成可以控制执行动画的实例,然后调用play方法开始动画
        this.#mixer.clipAction(gltf.animations[0]).play();
        // 执行动画
        this.animate();
      },
      undefined,
    );
  }

  // 创建相机
  public createCamera(): void {
    // 设置相机位置
    this.#camera.position.set(5, 2, 8);
  }

  // 创建渲染器
  public createRender() {
    // 像素比设置
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    // 渲染容器大小设置
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    // 在导入材质时,会默认将贴图编码格式定义为Three.LinearEncoding,故需将带颜色信息手动指定为Three.sRGBEncodin
    this.#renderer.outputEncoding = three.sRGBEncoding;
    // 将渲染容器添加道 body 元素中
    document.body.appendChild(this.#renderer.domElement);
  }

  // 创建监听
  public createEventListener(): void {
    // 监听屏幕，缩放屏幕个更新相机和渲染器尺寸
    window.onresize = () => {
      // 设置相机长宽比,渲染结果横向尺寸和纵向尺寸的比值
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      // 更新相机对象的投影矩阵
      // 因为Threejs为了提高渲染效率，
      // Threejs系统每次执行渲染器WebGLRenderer渲染方法.rener()的时候不会读取相机相关的参数重新计算一次投影矩阵，所有需要手动刷新。
      this.#camera.updateProjectionMatrix();
      // 设置渲染器尺寸
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  // 创建相机控件
  public createOrbitControls(): void {
    /// /设置控制器目的坐标
    this.#controls.target.set(0, 0.5, 0);
    // 更新控制器。必须在摄像机的变换发生任何手动改变后调用，
    // 或如果.autoRotate或.enableDamping被设置时，在update循环里调用。
    this.#controls.update();
    // 是否禁止右键拖拽
    this.#controls.enablePan = false;
    /// /是否开起控制器阻尼系数（理解为对旋转的阻力，系数越小阻力越小）
    this.#controls.enableDamping = true;
  }

  // 执行动画
  animate() {
    // 循环更新渲染
    requestAnimationFrame(this.animate.bind(this));
    // 获得前后两次执行该方法的时间间隔
    // .getDelta ()获取自 .oldTime 设置后到当前的秒数。 同时将 .oldTime 设置为当前时间。
    // 如果 .autoStart 设置为 true 且时钟并未运行，则该方法同时启动时钟
    const delta = this.#clock.getDelta();
    // update 推进混合器时间并更新动画
    // 通常在渲染循环中完成, 传入按照混合器的时间比例(timeScale)缩放过的clock.getDelta
    this.#mixer.update(delta);
    // 更新控制器
    this.#controls.update();
    // 渲染器执行渲染(用相机渲染一个场景)
    this.#renderer.render(this.#scene, this.#camera);
  }
}
