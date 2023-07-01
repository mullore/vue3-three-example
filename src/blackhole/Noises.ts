import * as THREE from 'three';
import Experience from './Experience';
import NoisesMaterial from './Materials/NoisesMaterial';

// 生成噪声纹理的类
class Noises {
  static instance: any;
  experience!: Experience;
  renderer!: any;
  scenes!: { space: THREE.Scene; distortion: THREE.Scene; overlay: THREE.Scene };
  customRender!: {
    scene: THREE.Scene; // 自定义渲染场景
    camera: THREE.OrthographicCamera;
  };

  material!: THREE.RawShaderMaterial;
  plane!: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial>;

  constructor() {
    // 单例模式，确保只创建一个 Noises 实例
    if (Noises.instance) {
      return Noises.instance;
    }
    Noises.instance = this;

    // 创建 Experience 类的实例，用于访问相关组件
    this.experience = new Experience();
    this.renderer = this.experience.renderer; // 渲染器实例
    this.scenes = this.experience.scenes; // 场景实例

    // 设置自定义渲染场景和相机
    this.setCustomRender();
    this.setMaterial();
    this.setPlane();
  }

  // 设置自定义渲染场景和相机
  setCustomRender() {
    // 自定义渲染对象
    this.customRender = {
      scene: new THREE.Scene(), // 自定义渲染场景
      camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10), // 自定义渲染相机
    };
  }

  // 设置材质
  setMaterial() {
    this.material = NoisesMaterial(); // 使用 NoisesMaterial 类创建材质实例
  }

  // 设置平面
  setPlane() {
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material); // 使用平面几何和材质创建平面网格
    this.plane.frustumCulled = false; // 禁用平截头体裁剪
    this.customRender.scene.add(this.plane); // 将平面添加到自定义渲染场景中
  }

  // 创建噪声纹理
  // width: 纹理的宽度
  // height: 纹理的高度
  create(width: number, height: number) {
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      generateMipmaps: false, // 禁用纹理的多级渐远纹理
      wrapS: THREE.RepeatWrapping, // 纹理在水平方向上的循环方式
      wrapT: THREE.RepeatWrapping, // 纹理在垂直方向上的循环方式
    });

    this.renderer.instance.setRenderTarget(renderTarget); // 设置渲染目标为自定义渲染目标

    // console.log(this.customRender.scene);
    // console.log(this.customRender.camera);
    this.renderer.instance.render(this.customRender.scene, this.customRender.camera); // 渲染自定义渲染场景到渲染目标
    this.renderer.instance.setRenderTarget(null); // 恢复默认渲染目标

    const texture = renderTarget.texture; // 获取渲染目标的纹理
    // texture.wrapS = THREE.RepeatWrapping
    // texture.wrapT = THREE.RepeatWrapping

    // if (this.debugPlane) this.debugPlane.material.map = texture; // 如果存在调试平面，则将纹理应用于材质

    return texture; // 返回生成的噪声纹理
  }
}

export default Noises;
