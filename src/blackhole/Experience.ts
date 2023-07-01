import * as THREE from 'three';

import Renderer from './Renderer';
import Camera from './Camera';
import World from './World';
import Stars from './Stars';
import StarsNest from './StarsNest';
import * as TWEEN from '@tweenjs/tween.js';

interface config {
  width: number;
  height: number;
  pixelRatio: number;
}

/**
 * 表示整个体验的类
 */
export default class Experience {
  // eslint-disable-next-line no-use-before-define
  static instance: Experience;
  world!: World;
  camera!: Camera;
  renderer!: Renderer;
  stars!: Stars;
  scenes!: {
    space: THREE.Scene;
    distortion: THREE.Scene;
    overlay: THREE.Scene;
    final: THREE.Scene;
  };

  targetElement!: HTMLElement;
  config!: config;
  starsNest!: StarsNest;

  /**
   * 创建一个体验实例
   * @param {Object} _options - 选项对象
   */
  constructor(_options?: HTMLElement) {
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    // Options
    this.targetElement = _options as HTMLElement;

    if (!this.targetElement) {
      // console.warn("Missing 'targetElement' property");
      return;
    }

    this.setConfig();
    this.setScenes(); // 设置场景
    this.setCamera(); // 设置相机
    this.setRenderer(); // 设置渲染器
    this.setWorld(); // 设置世界
    // this.setStarNest();
    // this.update(); // 更新体验
    this.setTweenUpdate();
  }

  setConfig() {
    // Pixel ratio
    this.config = {
      pixelRatio: Math.min(Math.max(window.devicePixelRatio, 1), 2),
    } as config;

    // Width and height
    const boundings = this.targetElement.getBoundingClientRect();
    this.config.width = boundings.width;
    this.config.height = boundings.height || window.innerHeight;
  }

  /**
   * 设置场景
   */
  setScenes() {
    this.scenes = {
      space: new THREE.Scene(), // 创建空间场景
      distortion: new THREE.Scene(), // 创建扭曲场景
      overlay: new THREE.Scene(), // 创建覆盖层场景
      final: new THREE.Scene(),
    };
  }

  /**
   * 设置相机
   */
  setCamera() {
    this.camera = new Camera(); // 创建相机实例
  }

  /**
   * 设置渲染器
   */
  setRenderer() {
    this.renderer = new Renderer(); // 创建渲染器实例

    this.targetElement.appendChild(this.renderer.instance.domElement);
  }

  /**
   * 设置世界
   */
  setWorld() {
    this.world = new World(); // 创建世界实例
  }

  // 设置星星
  setStarNest() {
    this.starsNest = new StarsNest();
  }

  // 设置星空
  setStar() {
    this.stars = new Stars();
  }

  setTweenUpdate() {
    if (this.renderer) this.renderer.update();
    const tween = new TWEEN.Tween({ x: 0 })
      .to({ x: 100 }, 2000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        // this.update();
        // console.log(targetObject.x);
      })
      .onComplete(() => {
        this.update();
        console.log('onUpdate 完成');
      })
      .start();
    window.requestAnimationFrame(() => {
      this.animate();
    });
  }

  animate() {
    window.requestAnimationFrame(() => {
      this.animate();
    });
    TWEEN.update();
  }

  /**
   * 更新体验
   */
  update() {
    // if (this.stats) this.stats.update();
    if (this.starsNest) this.starsNest.update();

    if (this.world) this.world.update();

    this.camera.update();

    if (this.renderer) this.renderer.update();

    window.requestAnimationFrame(() => {
      this.update();
    });
  }

  /**
   * 调整窗口大小时更新体验
   */
  resize() {
    // Config
    const boundings = this.targetElement.getBoundingClientRect();
    this.config.width = boundings.width;
    this.config.height = boundings.height;

    this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

    if (this.camera) this.camera.resize();

    if (this.renderer) this.renderer.resize();

    if (this.world) this.world.resize();
  }

  /**
   * 销毁体验
   */
  destroy() {
    // 清理操作
  }
}
