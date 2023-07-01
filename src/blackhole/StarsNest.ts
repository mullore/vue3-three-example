import * as THREE from 'three';
import Experience from './Experience';
import StarNestMaterial from './Materials/StarNestMaterial';

/**
 * 表示星星的类
 */
export default class StarsNest {
  experience: Experience;

  camera: any;
  renderer: any;
  config: { width: number; height: number; pixelRatio: number };
  scenes: {
    final: any;
    space: THREE.Scene;
    distortion: THREE.Scene;
    overlay: THREE.Scene;
  };

  particlesSky!: {
    count: number;
    geometry: THREE.BufferGeometry;
    material: THREE.RawShaderMaterial;
    points: THREE.Points;
    time: number;
  };

  material!: THREE.RawShaderMaterial;
  time: number;
  mesh!: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;

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
    this.time = 0.0;
    // 设置粒子效果
    this.setParticles();
  }

  /**
   * 设置粒子效果
   */
  setParticles() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    // const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    this.material = StarNestMaterial();

    this.material.uniforms.u_mouse.value = new THREE.Vector3(0.0, 0.0, 0.0);
    this.material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // 创建粒子的网格对象
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;

    // 将粒子网格对象添加到场景中
    this.scenes.space.add(this.mesh);
  }

  /**
   * 更新粒子效果
   */
  update() {
    this.time += 0.001;
    // 粒子效果更新逻辑
    this.material.uniforms.u_time.value = this.time; // 更新材质的视图高度属性
    // console.log(this.time);
  }
}
