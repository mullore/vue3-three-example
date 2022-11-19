import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
export default class {
  #frustmSize = 600; // 比例
  #aspect: number = window.innerWidth / window.innerHeight; // 像素比
  #container: Element; // 容器
  #state: Stats; // 性能(渲染率检测器)
  #scene!: THREE.Scene; // 场景
  #mesh!: THREE.Mesh; // 物体
  #camera!: THREE.PerspectiveCamera; // 屏幕相机
  #renderer!: THREE.WebGLRenderer; // 渲染器

  #cameraRig!: THREE.Group; // 相机组
  #activeCamera!: THREE.PerspectiveCamera | THREE.OrthographicCamera; // 当前选中得的活动相机
  #activeHelper!: THREE.CameraHelper; // 相机助手

  #cameraPerspective!: THREE.PerspectiveCamera; // 活动 透视相机
  #cameraOrtho!: THREE.OrthographicCamera; // 活动 透视相机助手

  #cameraPerspectiveHelper!: THREE.CameraHelper; // 活动 正交相机
  #cameraOrthoHelper!: THREE.CameraHelper; // 活动 正交相机助手

  constructor() {
    // 创建 div 元素
    this.#container = document.createElement('div');
    // 将元素添加到 body元素中
    document.body.appendChild(this.#container);

    // 实例化场景
    this.#scene = new THREE.Scene();

    // 加载 Stats 显示帧数
    this.#state = Stats();
    // 渲染到页面中
    this.#container.appendChild(this.#state.dom);
  }

  // 创建屏幕相机(屏幕相机的投影是整个屏幕(左右两个小窗口共同组成))
  public createCamera() {
    // fov — 摄像机视锥体垂直视野角度
    // aspect — 摄像机视锥体长宽比
    // near — 摄像机视锥体近端面
    // far — 摄像机视锥体远端面
    this.#camera = new THREE.PerspectiveCamera(50, 0.5 * this.#aspect, 1, 10000);
    // 设置相机Z轴位置
    this.#camera.position.z = 2500;
  }

  // 创建带相机助手透视投影相机aspect — 摄像机视锥体长宽比
  public createPerspectiveCamera() {
    this.#cameraPerspective = new THREE.PerspectiveCamera(
      // fov — 摄像机视锥体垂直视野角度
      50,
      // aspect — 摄像机视锥体长宽比
      0.5 * this.#aspect,
      // near — 摄像机视锥体近端面,摄像机视锥体垂直视野角度，从视图的底部到顶部，以角度来表示。默认值是50。
      150,
      // far — 摄像机视锥体远端面(默认值是2000。)
      1000,
    );

    // 绑定相机助手
    this.#cameraPerspectiveHelper = new THREE.CameraHelper(this.#cameraPerspective);
    // 调价到场景中
    this.#scene.add(this.#cameraPerspectiveHelper);
  }

  // 创建带相机助手的正交投影相机
  public createOrthographicCamera() {
    // 正交投影
    this.#cameraOrtho = new THREE.OrthographicCamera(
      // left — 摄像机视锥体左侧面。
      (0.5 * this.#frustmSize * this.#aspect) / -2,
      // right — 摄像机视锥体右侧面。
      (0.5 * this.#frustmSize * this.#aspect) / 2,
      // top — 摄像机视锥体上侧面。
      this.#frustmSize / 2,
      // bottom — 摄像机视锥体下侧面。
      this.#frustmSize / -2,
      // near — 摄像机视锥体近端面(其默认值为0.1.)。
      150,
      // far — 摄像机视锥体远端面(其默认值为2000。)。
      1000,
    );

    // 相机助手绑定相机
    this.#cameraOrthoHelper = new THREE.CameraHelper(this.#cameraOrtho);
    // 添加到场景中
    this.#scene.add(this.#cameraOrthoHelper);

    // 重置相机方向
    this.#cameraOrtho.rotation.y = Math.PI;
    this.#cameraPerspective.rotation.y = Math.PI;
  }

  // 创建对象组合
  public createGroup() {
    // 创建组合
    this.#cameraRig = new THREE.Group();
    // 将透视相机添加到组合中
    this.#cameraRig.add(this.#cameraPerspective);
    // 将正交相机添加到组合中
    this.#cameraRig.add(this.#cameraOrtho);
    // 将对象组合添加到场景中
    this.#scene.add(this.#cameraRig);
    // 请注意，通过.add( object )方法来将对象进行组合，该方法将对象添加为子对象，但为此最好使用Group（来作为父对象）

    // 显示激活相机层，默认活动相机为透视相机
    this.#activeCamera = this.#cameraPerspective;
    this.#activeHelper = this.#cameraPerspectiveHelper;
  }

  // 创建物体
  public createMesh() {
    // 创建白色球体
    this.#mesh = new THREE.Mesh(
      // 球缓冲几何体 (一个用于生成球体的类)
      // adius — 球体半径，默认为1。
      // widthSegments — 水平分段数（沿着经线分段），最小值为3，默认值为32。
      // heightSegments — 垂直分段数（沿着纬线分段），最小值为2，默认值为16。
      new THREE.SphereGeometry(100, 16, 8),
      // 基础网格材质
      // wireframe:将几何体渲染为线框。默认值为false（即渲染为平面多边形）。
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
    );
    // 添加场景
    this.#scene.add(this.#mesh);

    // 创建绿色球体
    const mesh2 = new THREE.Mesh(
      // 球缓冲几何体 (一个用于生成球体的类)
      new THREE.SphereGeometry(50, 16, 8),
      // wireframe:将几何体渲染为线框。默认值为false（即渲染为平面多边形）。
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
    );
    // 设置绿色球体Y轴坐标
    mesh2.position.y = 150;
    // 将蓝色球体和 白色球体 合为一组
    this.#mesh.add(mesh2);

    // 创建蓝色球体
    const mesh3 = new THREE.Mesh(
      // 球缓冲几何体 (一个用于生成球体的类)
      new THREE.SphereGeometry(5, 16, 8),
      // wireframe:将几何体渲染为线框。默认值为false（即渲染为平面多边形）。
      new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }),
    );
    // 设置蓝色球体Z轴坐标
    mesh3.position.z = 150;

    // ？？？？？？？？？？？？？？？？
    // 添加到摄像组合并
    this.#cameraRig.add(mesh3);
  }

  // 创建模型
  public createGeometry() {
    // 实例化模型，星云集合
    const geometry = new THREE.BufferGeometry();
    // 定义顶点变量
    const vertices: any = [];

    // 创建顶点数据
    // THREE.MathUtils(数学库)
    // randFloatSpread(range:Float):Float在区间 [- range / 2, range / 2] 内随机一个浮点数。
    for (let i = 0; i < 10000; i++) {
      // 兰德浮动扩散算法绘制星云扩散点
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
      vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
    }
    // 设置模型顶点，根据 geometry 的信息生成 ponits
    // 在 other.js 中一共有 9 种 BufferAttribute。每种和 JavaScript 中的类型相对应。
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Points( geometry : BufferGeometry, material : Material )
    // geometry —— （可选）是一个BufferGeometry的实例，默认值是一个新的BufferGeometry。
    // material —— （可选） 是一个对象，定义了物体的外观。默认值是一个的PointsMaterial。
    const particles = new THREE.Points(
      geometry,
      // 点材质(PointsMaterial)-Points使用的默认材质。
      new THREE.PointsMaterial({ color: 0x888888 }),
    );

    // 将点添加到场景中
    this.#scene.add(particles);
  }

  // 创建渲染器
  public createRender() {
    this.#renderer = new THREE.WebGLRenderer({ antialias: true });
    // 设置像素比
    // window.devicePixelRatio 返回当前显示设备的物理像素分辨率与CSS像素分辨率之比
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    // 设置渲染器容器大小
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    // 将渲染器添加到 div 元素中
    this.#container.appendChild(this.#renderer.domElement);
    // .autoClear : 定义渲染器是否在渲染每一帧之前自动清除其输出。
    this.#renderer.autoClear = false;
  }

  // 创建监听事件
  public createListen() {
    // 监听屏幕,缩放屏幕时更新相机和渲染器尺寸
    window.onresize = () => {
      // 设置相机长宽比
      this.#aspect = window.innerWidth / window.innerHeight;
      // 重新设置渲染器尺寸
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
      // 屏幕相机的长宽比为 可视窗口长宽比的 一半
      this.#camera.aspect = 0.5 * this.#aspect;

      // 更新屏幕相机
      // 因为threeJs 为了提高渲染效率，three系统每次执行渲染器WebGLRender渲染方法.render() 的时候
      // 不会读取相机相关的参数重新计算一次投影矩阵，所以需要手动刷新
      this.#camera.updateProjectionMatrix();

      // 透视相机的长宽比为 可视窗口的 一半
      this.#cameraPerspective.aspect = 0.5 * this.#aspect;
      // 更新透视相机
      this.#cameraPerspective.updateProjectionMatrix();
      // left — 摄像机视锥体左侧面。
      this.#cameraOrtho.left = (-0.5 * this.#frustmSize * this.#aspect) / 2;
      // right — 摄像机视锥体右侧面。
      this.#cameraOrtho.right = (0.5 * this.#frustmSize * this.#aspect) / 2;
      // top — 摄像机视锥体上侧面。
      this.#cameraOrtho.top = this.#frustmSize / 2;
      // bottom — 摄像机视锥体下侧面。
      this.#cameraOrtho.bottom = -this.#frustmSize / 2;
      // 更新正交相机
      this.#cameraOrtho.updateProjectionMatrix();
    };

    // 按键监听，切换移动相机类型。
    document.onkeydown = (e) => {
      // 按 O 键，选中相机为 正交
      if (e.key === 'o') {
        this.#activeCamera = this.#cameraOrtho;
        this.#activeHelper = this.#cameraOrthoHelper;
      }
      // 按 P 键，选择相机为 透视
      if (e.key === 'p') {
        this.#activeCamera = this.#cameraPerspective;
        this.#activeHelper = this.#cameraPerspectiveHelper;
      }
    };
  }

  // 动画
  public animate() {
    // 重复执行渲染
    requestAnimationFrame(this.animate.bind(this));

    // 渲染
    this.render();

    // 更新 State
    this.#state.update();
  }

  // 渲染
  render() {
    // 设置时间
    const r = Date.now() * 0.0005;

    // ?????????????????????????????????
    // 帧动画
    this.#mesh.position.x = 700 * Math.cos(r);
    this.#mesh.position.y = 700 * Math.sin(r);
    this.#mesh.position.z = 700 * Math.sin(r);

    // 当选中相机为 透视时执行
    if (this.#activeCamera === this.#cameraPerspective) {
      // 设置白色球体Y轴坐标
      this.#mesh.children[0].position.x = 70 * Math.cos(2 * r);
      // 重新设置透视相机的远端面
      this.#cameraPerspective.far = this.#mesh.position.length();
      // 更新相机
      this.#cameraPerspective.updateProjectionMatrix();
      // 透视相机助手更新(基于相机的投影矩阵更新辅助对象.)
      this.#cameraPerspectiveHelper.update();
      // .visible : Boolean 可见性。这个值为true时，物体将被渲染。默认值为true。
      // 渲染透视相机助手
      this.#cameraPerspectiveHelper.visible = true;
      // 隐藏正交相机助手
      this.#cameraOrthoHelper.visible = false;
    }
    // 当 选中相机为 正交时 执行
    if (this.#activeCamera === this.#cameraOrtho) {
      //
      this.#cameraOrtho.far = this.#mesh.position.length();
      // 更新相机
      this.#cameraOrtho.updateProjectionMatrix();
      // 正交助手更新(基于相机的投影矩阵更新辅助对象.)
      this.#cameraOrthoHelper.update();
      // 渲染正交相机助手
      this.#cameraOrthoHelper.visible = true;
      // 隐藏正交相机助手
      this.#cameraPerspectiveHelper.visible = false;
    }
    // .lookAt ( vector : Vector3 ) : undefined
    // .lookAt ( x : Float, y : Float, z : Float ) : undefined
    // vector - 一个表示世界空间中位置的向量。
    // 也可以使用世界空间中x、y和z的位置分量。
    // 旋转物体使其在世界空间中面朝一个点。
    // 这一方法不支持其父级被旋转过或者被位移过的物体。

    // 设置摄像机组位置
    this.#cameraRig.lookAt(this.#mesh.position);

    // 清楚渲染
    // .clear ( color : Boolean, depth : Boolean, stencil : Boolean ) : undefined
    // 告诉渲染器清除颜色、深度或模板缓存. 此方法将颜色缓存初始化为当前颜色。参数们默认都是true
    this.#renderer.clear();
    // 隐藏当前默认的相机助手
    this.#activeHelper.visible = false;

    // setViewport是设置渲染的位置

    // 设置左半边为渲染位置
    this.#renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    // 使用当前 默认相机 渲染场景
    this.#renderer.render(this.#scene, this.#activeCamera);
    // 渲染当前默认的 相机助手
    this.#activeHelper.visible = true;
    // 设置右半边的渲染位置
    this.#renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    // 使用屏幕相机渲染场景
    this.#renderer.render(this.#scene, this.#camera);
  }
}
