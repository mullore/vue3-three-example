import * as THREE from 'three';
import Experience from './Experience';
import Noises from './Noises';
import BlackHoleDiscMaterial from './Materials/BlackHoleDiscMaterial';
import BlackHoleParticlesMaterial from './Materials/BlackHoleParticlesMaterial';
import BlackHoleDistortionActiveMaterial from './Materials/BlackHoleDistortionActiveMaterial';
import BlackHoleDistortionMaskMaterial from './Materials/BlackHoleDistortionMaskMaterial';
interface config {
  width: number;
  height: number;
  pixelRatio: number;
}
export default class BlackHole {
  experience: Experience;
  noises: Noises;
  delta: number;
  elapsed: number;
  start: number;
  current: number;
  config: config;
  scenes: { space: THREE.Scene; distortion: THREE.Scene; overlay: THREE.Scene };
  camera: any;
  renderer: any;
  commonUniforms: any;
  disc: any;
  particles: any;
  distortion: any;

  constructor() {
    // 创建 Experience 实例
    this.experience = new Experience();
    this.config = this.experience.config;
    this.scenes = this.experience.scenes;

    this.camera = this.experience.camera;
    this.renderer = this.experience.renderer;

    this.start = Date.now() / 1000;
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;

    // 创建 Noises 实例
    this.noises = new Noises();

    // 设置共享的 uniforms
    this.setCommonUniforms();

    // 创建黑洞的圆盘
    this.setDisc();

    // 创建黑洞的粒子
    this.setParticles();

    // 创建黑洞的扭曲效果
    this.setDistortion();

    // 创建黑洞的扭曲遮罩
    this.setMask();
  }

  /**
   * 设置共享的 uniforms
   */
  setCommonUniforms() {
    // 创建共享的 uniforms 对象
    this.commonUniforms = {};
    this.commonUniforms.uInnerColor = { value: new THREE.Color('#FF8C00') };
    this.commonUniforms.uOuterColor = { value: new THREE.Color('#FF4500') };
  }

  /**
   * 创建黑洞的圆盘
   */
  setDisc() {
    this.disc = {};

    // 创建圆盘的几何体
    this.disc.geometry = new THREE.CylinderGeometry(5, 1, 0, 64, 10, true);

    // 创建圆盘的材质
    this.disc.noiseTexture = this.noises.create(128, 128); // 创建噪声纹理
    // 创建黑洞圆盘材质
    this.disc.material = BlackHoleDiscMaterial();
    // 设置噪声纹理到材质的uniform变量
    this.disc.material.uniforms.uNoiseTexture.value = this.disc.noiseTexture;
    // 设置内部颜色到材质的uniform变量
    this.disc.material.uniforms.uInnerColor = this.commonUniforms.uInnerColor;
    // 设置外部颜色到材质的uniform变量
    this.disc.material.uniforms.uOuterColor = this.commonUniforms.uOuterColor;

    // 创建黑洞圆盘网格对象
    this.disc.mesh = new THREE.Mesh(this.disc.geometry, this.disc.material);

    // 将黑洞圆盘网格对象添加到场景中
    this.scenes.space.add(this.disc.mesh);
  }

  /**
   * 创建黑洞的粒子
   */
  setParticles() {
    this.particles = {};
    // this.particles.count = 50000;
    this.particles.count = 10000;

    // 创建粒子的几何体

    const distanceArray = new Float32Array(this.particles.count); // 创建存储距离数据的 Float32Array 数组

    const sizeArray = new Float32Array(this.particles.count); // 创建存储尺寸数据的 Float32Array 数组

    const randomArray = new Float32Array(this.particles.count); // 创建存储随机数据的 Float32Array 数组

    // 为每个粒子生成随机的距离、尺寸和随机值
    for (let i = 0; i < this.particles.count; i++) {
      distanceArray[i] = Math.random();
      sizeArray[i] = Math.random();
      randomArray[i] = Math.random();
    }

    // 创建粒子系统的几何体对象
    this.particles.geometry = new THREE.BufferGeometry();
    // 将距离数据添加到几何体的 position 属性中
    this.particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(distanceArray, 1));
    // 将尺寸数据添加到几何体的 aSize 属性中
    this.particles.geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1));
    // 将随机数据添加到几何体的 aRandom 属性中
    this.particles.geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randomArray, 1));

    // 创建粒子的材质
    this.particles.material = BlackHoleParticlesMaterial();
    // 设置粒子系统材质的 uViewHeight 属性值为渲染器的 composition 的空间高度
    this.particles.material.uniforms.uViewHeight.value = this.renderer.composition.space.height;
    // 设置粒子系统材质的 uInnerColor 属性为 commonUniforms 的 uInnerColor
    this.particles.material.uniforms.uInnerColor = this.commonUniforms.uInnerColor;
    // 设置粒子系统材质的 uOuterColor 属性为 commonUniforms 的 uOuterColor
    this.particles.material.uniforms.uOuterColor = this.commonUniforms.uOuterColor;

    // 创建粒子的点云
    this.particles.points = new THREE.Points(this.particles.geometry, this.particles.material); // 创建粒子点集对象，并将粒子系统的几何体和材质赋值给它

    this.particles.points.frustumCulled = false; // 禁用粒子点集对象的视锥体裁剪

    this.scenes.space.add(this.particles.points); // 将粒子点集对象添加到场景中
  }

  /**
   * 创建黑洞的扭曲效果
   */
  setDistortion() {
    this.distortion = {};
    /* 扭曲效果 */
    // 创建扭曲效果的 active 几何体和材质
    this.distortion.active = {}; // 创建扭曲效果激活状态的对象
    // 创建扭曲效果激活状态的几何体
    this.distortion.active.geometry = new THREE.PlaneBufferGeometry(1, 1);
    // 创建扭曲效果激活状态的材质
    this.distortion.active.material = BlackHoleDistortionActiveMaterial();
    // 创建扭曲效果激活状态的网格对象，并将几何体和材质赋值给它
    this.distortion.active.mesh = new THREE.Mesh(this.distortion.active.geometry, this.distortion.active.material);
    // 设置扭曲效果激活状态的网格对象的缩放
    this.distortion.active.mesh.scale.set(10, 10, 10);
    // 将扭曲效果激活状态的网格对象添加到扭曲场景中
    this.scenes.distortion.add(this.distortion.active.mesh);
  }

  /* 扭曲效果遮罩 */
  setMask() {
    // 创建扭曲效果的 mask 几何体和材质
    this.distortion.mask = {}; // 创建扭曲效果遮罩状态的对象
    // 创建扭曲效果遮罩状态的几何体
    this.distortion.mask.geometry = new THREE.PlaneBufferGeometry(1, 1);
    // 创建扭曲效果遮罩状态的材质
    this.distortion.mask.material = BlackHoleDistortionMaskMaterial();
    // 创建扭曲效果遮罩状态的网格对象，并将几何体和材质赋值给它
    this.distortion.mask.mesh = new THREE.Mesh(this.distortion.mask.geometry, this.distortion.mask.material);
    // 设置扭曲效果遮罩状态的网格对象的缩放
    this.distortion.mask.mesh.scale.set(10, 10, 10);
    // 设置扭曲效果遮罩状态的网格对象的旋转
    this.distortion.mask.mesh.rotation.x = Math.PI * 0.5;
    // 将扭曲效果遮罩状态的网格对象添加到扭曲场景中
    this.scenes.distortion.add(this.distortion.mask.mesh);
  }

  /**
   * 更新黑洞的状态
   */
  update() {
    const current = Date.now() / 1000;

    // this.delta = current - this.current;
    this.elapsed += current - this.current;
    this.current = current;

    // 将相机的位置映射到屏幕上的位置
    const screenPosition = new THREE.Vector3(0, 0, 0);
    screenPosition.project(this.camera.instance);
    screenPosition.x = screenPosition.x * 0.5 + 0.5;
    screenPosition.y = screenPosition.y * 0.5 + 0.5;

    // 更新圆盘的时间属性
    if (this.disc) this.disc.material.uniforms.uTime.value = this.elapsed;

    // 更新粒子的时间属性
    if (this.particles) this.particles.material.uniforms.uTime.value = this.elapsed + 9999.0;

    // 使扭曲效果朝向相机的位置
    if (this.distortion) this.distortion.active.mesh.lookAt(this.camera.instance.position);

    // 更新最终渲染的材质的黑洞位置属性
    this.renderer.compositionFinal.material.uniforms.uBlackHolePosition.value.set(screenPosition.x, screenPosition.y);
  }

  /**
   * 调整窗口大小时调用的方法
   */
  resize() {
    this.particles.material.uniforms.uViewHeight.value = window.innerHeight;
  }
}
