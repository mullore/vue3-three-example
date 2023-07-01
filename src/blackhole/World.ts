import BlackHole from './BlackHole';
import Experience from './Experience';
import Stars from './Stars';
import StarsNest from './StarsNest';

import * as THREE from 'three';

/**
 * 表示整个世界的类
 */
export default class World {
  experience: Experience;
  config: { width: number; height: number; pixelRatio: number };
  scenes: {
    space: THREE.Scene;
    distortion: THREE.Scene;
    overlay: THREE.Scene;
  };

  clock: THREE.Clock;
  blackHole: BlackHole;
  stars: Stars;
  StarsNest: StarsNest;

  /**
   * 创建一个世界实例
   * @param {Object} _options - 选项对象
   */
  constructor() {
    this.experience = new Experience(); // 创建 Experience 实例
    this.config = this.experience.config; // 获取 Experience 的配置
    this.scenes = this.experience.scenes; // 获取 Experience 的场景
    // this.resources = this.experience.resources; // 获取 Experience 的资源管理器
    this.clock = new THREE.Clock(); // 创建一个定时器实例
    this.blackHole = new BlackHole(); // 创建黑洞实例
    this.stars = new Stars(); // 创建星星实例
    this.StarsNest = new StarsNest(); // 创建星空实例
  }

  /**
   * 调整窗口大小时更新世界
   */
  resize() {
    if (this.blackHole) this.blackHole.resize(); // 更新黑洞效果
  }

  /**
   * 更新世界
   */

  update() {
    if (this.blackHole) this.blackHole.update(); // 更新黑洞效果
  }

  /**
   * 销毁世界
   */
  destroy() {
    // 清理操作
  }
}
