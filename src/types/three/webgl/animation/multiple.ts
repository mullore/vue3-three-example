import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
export default class multiple {
  // 场景
  #scene: THREE.Scene;
  // 相机
  #camera: THREE.PerspectiveCamera;
  // 渲染器
  #renderer: THREE.WebGLRenderer;
  // 时钟
  #colok: THREE.Clock;
  #mixers: any[] = [];
  constructor() {
    // 实例化时钟对象
    this.#colok = new THREE.Clock();
    // 实例化渲染器对象
    this.#renderer = new THREE.WebGLRenderer({ antialias: true }); // 抗锯齿
    // 实例化相机
    // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
    // fov — 摄像机视锥体垂直视野角度
    // aspect — 摄像机视锥体长宽比
    // near — 摄像机视锥体近端面
    // far — 摄像机视锥体远端面
    this.#camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    // 实例化场景
    this.#scene = new THREE.Scene();
    // 设置场景背景色
    this.#scene.background = new THREE.Color(0xa0a0a0);
    // 场景雾化
    // THREE.Fog(color,near,far)
    // color颜色值，
    // near开始用雾的最小距离，(默认值是:1)
    // far雾扩散的最远距离，(默认值是:1000)
    this.#scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
  }

  // 创建材质
  public createMesh() {
    // 实例化网格/网孔
    // Mesh( geometry : BufferGeometry, material : Material )
    // geometry —— （可选）BufferGeometry的实例，默认值是一个新的BufferGeometry。
    // material —— （可选）一个Material，或是一个包含有Material的数组，默认是一个新的MeshBasicMaterial。
    const mesh = new THREE.Mesh(
      // 平面缓冲几何体
      // PlaneGeometry(width, height, widthSegments, heightSegments)
      // width — 平面沿着X轴的宽度。默认值是1。
      // height — 平面沿着Y轴的高度。默认值是1。
      new THREE.PlaneGeometry(200, 200),
      // Phong网格材质,一种用于具有镜面高光的光泽表面的材质。
      // color:材质的颜色(Color)，默认值为白色 (0xffffff)。
      // depthWrite:这个属性可以用来决定这个材质是否影响 webgl 的深度缓存。
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }),
    );

    // 网格绕X轴旋转
    mesh.rotation.x = -Math.PI / 2;
    // receiveShadow 开启网格阴影
    // 如果要使网格在光照下产生阴影，需要开启castShadow
    mesh.receiveShadow = true;
    // 添加场景
    this.#scene.add(mesh);
  }

  // 加载器加载模型
  public crreateLoader() {
    // 导入GLTF格式的loader
    const loader = new GLTFLoader();
    /// /导入
    loader.load('models/gltf/Soldier.glb', (gltf) => {
      // .traverse ( callback )
      // callback - 第一个参数为Object3D对象的回调函数。
      // 在这个对象和所有的子对象上执行回调。
      gltf.scene.traverse((object) => {
        // （这块不太准确，后续需要优化）
        // 判断模型是不是网格 ，如果是则开启阴影
        if (object.isMesh) object.castShadow = true;
      });

      // 骨架工具（SkeletonUtils）
      // 克隆给定对象及其后代，确保任何 SkinnedMesh 实例都与其骨骼正确关联。
      // 同时，骨骼也会被克隆，且必须是传递给此方法的物体的后代。而其他数据，如几何形状和材料，是通过引用来实现重复使用的。
      const model1 = SkeletonUtils.clone(gltf.scene);
      const model2 = SkeletonUtils.clone(gltf.scene);
      const model3 = SkeletonUtils.clone(gltf.scene);

      // AnimationMixer 动画混合器
      // AnimationMixer是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，可以为每个对象使用一个AnimationMixer。
      const mixer1 = new THREE.AnimationMixer(model1);
      const mixer2 = new THREE.AnimationMixer(model2);
      const mixer3 = new THREE.AnimationMixer(model3);

      // AnimationMixer对象的clipAction方法生成可以控制执行动画的实例,然后调用play方法开始动画
      mixer1.clipAction(gltf.animations[0]).play();
      mixer2.clipAction(gltf.animations[1]).play();
      mixer3.clipAction(gltf.animations[3]).play();

      // 设置几个模型在 平面(X) 的位置
      model1.position.x = -2;
      model2.position.x = 0;
      model3.position.x = 2;
      // 将三个模型添加道场景
      this.#scene.add(model1, model2, model3);

      // 这里是将几个 AnimationMixer对象添加到 单独数组 以供重复执行渲染时更新
      // 统一推进混合器时间并更新动画
      this.#mixers.push(mixer1, mixer2, mixer3);

      // 执行动画
      this.animate();
    });
  }

  // 创建相机
  public createCamera() {
    // this.#camera =  new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1000)
    // 设置相机位置
    this.#camera.position.set(2, 3, -6);
    // 设置相机看向的位置
    this.#camera.lookAt(0, 1, 0);
  }

  // 创建灯光
  public createLight() {
    // 半球光,光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
    // 半球光不能投射阴影。
    // HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
    // skyColor - (可选参数) 天空中发出光线的颜色。 缺省值 0xffffff。
    // groundColor - (可选参数) 地面发出光线的颜色。 缺省值 0xffffff。
    // intensity - (可选参数) 光照强度。 缺省值 1。
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    // 设置半球光的发光位置
    hemiLight.position.set(0, 20, 0);
    // 添加场景
    this.#scene.add(hemiLight);
    // 平行光(THREE.DirectionLight) 可以看作是距离很远的光，它发出的所有光线都是相互平行的。平行光的一个范例就是太阳光。
    const dirLight = new THREE.DirectionalLight(0xffffff);
    // 设置平行光的发光位置
    dirLight.position.set(-3, 10, -10);
    // 开启阴影，如果设置为 true，这个光源就会生成阴影
    dirLight.castShadow = true;
    // 设置投影上边界
    dirLight.shadow.camera.top = 4;
    // 设置投影下边界
    dirLight.shadow.camera.bottom = -4;
    // 设置投影左边界
    dirLight.shadow.camera.left = -4;
    // 设置投影右边界
    dirLight.shadow.camera.right = 4;
    // 设置投影近点，表示距离光源的哪一个位置开始生成阴影。
    dirLight.shadow.camera.near = 0.1;
    // 设置投影远点，表示到距离光源的哪一个位置可以生成阴影。
    dirLight.shadow.camera.far = 40;
    // 添加场景
    this.#scene.add(dirLight);
  }

  // 创建渲染器
  public createRender() {
    // this.#renderer = new THREE.WebGLRenderer({antialias:true});
    // 设置像素比
    // window.devicePixelRatio 返回当前显示设备的物理像素分辨率与CSS像素分辨率之比
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    // 设置渲染器容器大小
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    // 再导入材质时，会默认将贴图编码格式定义为Three.LinearEncoding,故需将带颜色信息手动指定为  THREE.sRGBEncoding
    this.#renderer.outputEncoding = THREE.sRGBEncoding;
    // 开启阴影贴图（或阴影映射）
    this.#renderer.shadowMap.enabled = true;
    // 将渲染器添加道body元素中
    document.body.appendChild(this.#renderer.domElement);
  }

  // 监听
  public createListen() {
    // 监听屏幕，缩放屏幕时更新相机和渲染器尺寸
    window.onresize = () => {
      // 设置相机长宽比，渲染相机横向尺寸和纵向尺寸的比值
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      // 更新相机的投影矩阵
      // 因为threeJs 为了提高渲染效率，three系统每次执行渲染器WebGLRender渲染方法.render() 的时候
      // 不会读取相机相关的参数重新计算一次投影矩阵，所以需要手动刷新
      this.#camera.updateProjectionMatrix();
      // 重新设置渲染器尺寸
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  // 动画
  animate() {
    // 重复执行渲染
    requestAnimationFrame(this.animate.bind(this));
    // getDelta():获取时钟增量，也就是该函数本次调用和上次调用之间的时间间隔。
    const delta = this.#colok.getDelta();
    // update 推进混合器时间并更新动画
    // 通常在渲染循环中完成, 传入按照混合器的时间比例(timeScale)缩放过的clock.getDelta
    for (const mixer of this.#mixers) mixer.update(delta);
    // 渲染器执行渲染(用相机渲染一个场景)
    this.#renderer.render(this.#scene, this.#camera);
  }
}
