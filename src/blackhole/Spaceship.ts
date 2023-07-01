import * as THREE from 'three';
import Experience from './Experience';

/**
 * 表示飞船的类
 */
export default class Spaceship {
  experience: Experience;
  scenes: any;
  camera: any;
  group: THREE.Group;
  directionalLight: any;
  cursor: any;
  sizes: any;
  view: any;
  time: any;
  /**
   * 创建一个飞船实例
   * @param {Object} _options - 飞船的选项
   */
  constructor(_options = {}) {
    this.experience = new Experience();
    this.scenes = this.experience.scenes;

    this.camera = this.experience.camera;

    // 创建飞船的群组
    this.group = new THREE.Group();
    this.group.position.y = 1;
    this.group.scale.set(0.1, 0.1, 0.1);
    this.scenes.overlay.add(this.group);

    // 创建环境光
    const ambientLight = new THREE.AmbientLight(0xb98aff, 0.05);
    this.group.add(ambientLight);

    // 设置平行光源
    this.setDirectionalLight();

    // 设置光标
    this.setCursor();

    // 设置视图
    this.setView();
  }

  /**
   * 设置平行光源
   */
  setDirectionalLight() {
    this.directionalLight = {};

    // 创建平行光

    this.directionalLight.instance = new THREE.DirectionalLight(0xb98aff, 5); // 创建定向光源对象

    // 设置定向光源对象的位置
    this.directionalLight.instance.position.set(0, 0, 0);

    // 开启定向光源对象的阴影投射
    this.directionalLight.instance.castShadow = true;

    // 设置定向光源对象的阴影相关属性
    this.directionalLight.instance.shadow.camera.near = 0; // 设置阴影相机的近裁剪面
    this.directionalLight.instance.shadow.camera.far = 1; // 设置阴影相机的远裁剪面
    this.directionalLight.instance.shadow.camera.top = 0.5; // 设置阴影相机的顶部裁剪面位置
    this.directionalLight.instance.shadow.camera.right = 0.5; // 设置阴影相机的右侧裁剪面位置
    this.directionalLight.instance.shadow.camera.bottom = -0.5; // 设置阴影相机的底部裁剪面位置
    this.directionalLight.instance.shadow.camera.left = -0.5; // 设置阴影相机的左侧裁剪面位置
    this.directionalLight.instance.shadow.mapSize.set(1024, 1024); // 设置阴影贴图的尺寸
    this.directionalLight.instance.shadow.bias = 0; // 设置阴影偏移量
    this.directionalLight.instance.shadow.normalBias = 0.00252; // 设置阴影法线偏移量

    // 将定向光源对象添加到叠加场景中
    this.scenes.overlay.add(this.directionalLight.instance);

    // 将定向光源的目标对象添加到叠加场景中
    this.scenes.overlay.add(this.directionalLight.instance.target);

    // 创建平行光辅助器
    this.directionalLight.helper = new THREE.DirectionalLightHelper(
      this.directionalLight.instance,
      5,
    );
    // this.scenes.overlay.add(this.directionalLight.helper)

    // 创建平行光相机辅助器
    this.directionalLight.cameraHelper = new THREE.CameraHelper(
      this.directionalLight.instance.shadow.camera,
    );
  }

  /**
   * 设置光标
   */
  setCursor() {
    this.cursor = {};
    this.cursor.x = this.sizes.width * 0.5;
    this.cursor.y = this.sizes.height * 0.5;
    this.cursor.normalisedX = 0;
    this.cursor.normalisedY = 0;

    window.addEventListener('mousemove', (_event) => {
      this.cursor.x = _event.clientX;
      this.cursor.y = _event.clientY;

      this.cursor.normalisedX = this.cursor.x / this.sizes.width - 0.5;
      this.cursor.normalisedY = this.cursor.y / this.sizes.height - 0.5;
    });
  }

  /**
   * 设置视图
   */
  setView() {
    this.view = {};

    // 设置视图相机
    this.view.camera = this.camera.modes.default.instance;
    this.group.add(this.view.camera);

    // 设置视图旋转
    this.view.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.view.targetRotation = new THREE.Euler(0, 0, 0, 'YXZ');
  }

  /**
   * 更新飞船状态
   */
  update() {
    this.view.targetRotation.x = -this.cursor.normalisedY;
    this.view.targetRotation.y = -this.cursor.normalisedX;

    this.view.rotation.x += (this.view.targetRotation.x - this.view.rotation.x) * 16 * 2;
    this.view.rotation.y += (this.view.targetRotation.y - this.view.rotation.y) * 16 * 2;

    this.view.camera.position.set(0, 0, 2);
    this.view.camera.rotation.copy(this.view.rotation);

    this.group.position.x = -1;
    this.group.position.y = 1;
    this.group.position.z = Math.sin(this.time.elapsed * 0.5) * 6;

    this.group.rotation.y = 0.5;

    const centerToSpaceship = this.group.position.clone();
    // centerToSpaceship.normalize()

    this.directionalLight.instance.position.copy(centerToSpaceship);
    this.directionalLight.instance.position.setLength(centerToSpaceship.length() - 0.5);
    this.directionalLight.instance.target.position.copy(centerToSpaceship);
    // this.directionalLight.instance.target.position.negate()

    // console.log(this.directionalLight.instance.position)
    this.directionalLight.helper.update();
    this.directionalLight.cameraHelper.update();
  }

  // destroy() {}
}
