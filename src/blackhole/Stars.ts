import * as THREE from 'three';
import Experience from './Experience';
import StarsParticlesMaterial from './Materials/StarsParticlesMaterial';

/**
 * 表示星星的类
 */
export default class Stars {
  experience: Experience;

  camera: any;
  renderer: any;
  config: { width: number; height: number; pixelRatio: number };
  scenes: { space: THREE.Scene; distortion: THREE.Scene; overlay: THREE.Scene };
  particles!: {
    count: number;
    geometry: THREE.BufferGeometry;
    material: THREE.RawShaderMaterial;
    points: THREE.Points;
  };

  /**
   * 创建一个星星实例
   */
  constructor() {
    // 选项
    this.experience = new Experience(); // 创建 Experience 实例
    this.config = this.experience.config; // 获取 Experience 的配置
    this.scenes = this.experience.scenes; // 获取 Experience 的场景
    this.camera = this.experience.camera; // 获取 Experience 的相机
    this.renderer = this.experience.renderer; // 获取 Experience 的渲染器

    // 设置粒子效果
    this.setParticles();
  }

  /**
   * 设置粒子效果
   */
  setParticles() {
    this.particles = {
      count: 1000, // 粒子数量
      geometry: new THREE.BufferGeometry(), // 创建粒子的几何体
      material: StarsParticlesMaterial() as THREE.RawShaderMaterial, // 粒子的材质
      points: new THREE.Points<THREE.BufferGeometry, THREE.Material | THREE.Material[]>(),
    };

    // 创建粒子的几何体
    const positionArray = new Float32Array(this.particles.count * 3); // 位置数组
    const sizeArray = new Float32Array(this.particles.count); // 大小数组
    const colorArray = new Float32Array(this.particles.count * 3); // 颜色数组

    for (let i = 0; i < this.particles.count; i++) {
      const iStride3 = i * 3;

      // 随机生成粒子的位置
      const theta = 2 * Math.PI * Math.random(); // 极角
      const phi = Math.acos(2 * Math.random() - 1.0); // 仰角
      const x = Math.cos(theta) * Math.sin(phi) * 400; // X 坐标
      const y = Math.sin(theta) * Math.sin(phi) * 400; // Y 坐标
      const z = Math.cos(phi) * 400; // Z 坐标

      positionArray[iStride3 + 0] = x; // 设置位置数组中的 X 坐标
      positionArray[iStride3 + 1] = y; // 设置位置数组中的 Y 坐标
      positionArray[iStride3 + 2] = z; // 设置位置数组中的 Z 坐标

      sizeArray[i] = Math.random(); // 设置大小数组中的大小

      const color = new THREE.Color(`hsl(${Math.round(360 * Math.random())}, 100%, 80%)`); // 随机生成颜色
      colorArray[iStride3 + 0] = color.r; // 设置颜色数组中的红色分量
      colorArray[iStride3 + 1] = color.g; // 设置颜色数组中的绿色分量
      colorArray[iStride3 + 2] = color.b; // 设置颜色数组中的蓝色分量
    }

    // 设置几何体的属性
    this.particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
    // 设置位置属性
    this.particles.geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1)); // 设置大小属性
    this.particles.geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colorArray, 3)); // 设置颜色属性

    // 设置材质的视图高度属性
    this.particles.material.uniforms.uViewHeight.value = this.renderer.composition.space.height;

    // 创建粒子的网格对象
    this.particles.points = new THREE.Points(this.particles.geometry, this.particles.material);
    this.particles.points.frustumCulled = false;

    // const textureLoader = new THREE.TextureLoader();
    // const backgroundTexture = textureLoader.load('starry-sky.jpg');
    // this.scenes.space.background = backgroundTexture;

    // 将粒子网格对象添加到场景中
    this.scenes.space.add(this.particles.points);
  }

  /**
   * 调整窗口大小时更新粒子效果
   */
  resize() {
    this.particles.material.uniforms.uViewHeight.value = window.innerWidth; // 更新材质的视图高度属性
  }

  /**
   * 更新粒子效果
   */
  update() {
    // 粒子效果更新逻辑
  }
}
