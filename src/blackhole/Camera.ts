import * as THREE from 'three';
import Experience from './Experience.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Camera类负责管理和更新相机。
 */
export default class Camera {
  experience: Experience;
  config: { width: number; height: number; pixelRatio: number };
  targetElement: HTMLElement;
  scenes: { space: THREE.Scene; distortion: THREE.Scene; overlay: THREE.Scene };
  mode: string;
  instance!: THREE.PerspectiveCamera;
  modes: any;
  /**
   * 初始化Camera类。
   * @param {Object} _options - 选项对象
   */
  constructor() {
    // 获取Experience实例的引用
    this.experience = new Experience();

    // 获取配置信息
    this.config = this.experience.config;

    // 获取渲染目标元素
    this.targetElement = this.experience.targetElement;

    // 获取场景管理器
    this.scenes = this.experience.scenes;

    // 设置模式，默认为'debug'模式
    this.mode = 'debug';

    // 创建相机实例
    this.setInstance();

    // 设置相机模式
    this.setModes();
  }

  /**
   * 创建相机实例。
   */
  setInstance() {
    // 创建透视相机实例
    this.instance = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      // this.config.width / this.config.height,
      0.1,
      1000,
    );
    this.instance.rotation.reorder('YXZ');

    // 将相机添加到空间场景中
    this.scenes.space.add(this.instance);
  }

  /**
   * 设置不同的相机模式。
   */
  setModes() {
    this.modes = {};

    // 默认模式
    this.modes.default = {};
    this.modes.default.instance = this.instance.clone();
    this.modes.default.instance.rotation.reorder('YXZ');

    // 调试模式
    this.modes.debug = {};
    this.modes.debug.instance = this.instance.clone();
    this.modes.debug.instance.rotation.reorder('YXZ');
    this.modes.debug.instance.position.set(5, 2, 5);

    // 创建轨道控制器实例
    this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement);
    // this.modes.debug.orbitControls.enableRotate = false;
    this.modes.debug.orbitControls.enabled = this.modes.debug.active;
    this.modes.debug.orbitControls.screenSpacePanning = true;
    this.modes.debug.orbitControls.enableKeys = false;
    this.modes.debug.orbitControls.zoomSpeed = 0.25;
    this.modes.debug.orbitControls.enableDamping = true;
    this.modes.debug.orbitControls.update();
  }

  /**
   * 调整相机尺寸。
   */
  resize() {
    this.instance.aspect = this.config.width / this.config.height;
    this.instance.updateProjectionMatrix();

    this.modes.default.instance.aspect = this.config.width / this.config.height;
    this.modes.default.instance.updateProjectionMatrix();

    this.modes.debug.instance.aspect = this.config.width / this.config.height;
    this.modes.debug.instance.updateProjectionMatrix();
  }

  /**
   * 更新相机状态。
   */
  update() {
    // 更新调试模式下的轨道控制器
    this.modes.debug.orbitControls.update();

    // 应用坐标
    const source = this.modes[this.mode].instance;

    source.updateWorldMatrix(true, false);

    this.instance.position.set(0, 0, 0);
    this.instance.quaternion.set(0, 0, 0, 0);
    this.instance.scale.set(1, 1, 1);
    this.instance.applyMatrix4(source.matrixWorld);
    this.instance.scale.set(1, 1, 1);
  }

  /**
   * 销毁相机实例。
   */
  destroy() {
    // this.modes.debug.orbitControls.destroy();
  }
}
