import * as THREE from 'three';
import Experience from './Experience';
import FinalMaterial from './Materials/FinalMaterial';

interface CompositionFinal {
  material: THREE.RawShaderMaterial;
  plane: THREE.Mesh<THREE.PlaneGeometry, any>;
  scene: THREE.Scene;
}

/**
 * Renderer类用于管理渲染器相关的设置和渲染过程。
 */
export default class Renderer {
  experience: Experience;
  config: { width: number; height: number; pixelRatio: number };
  scenes: {
    final: THREE.Scene;
    space: THREE.Scene;
    distortion: THREE.Scene;
    overlay: THREE.Scene;
  };

  camera: any;
  instance!: THREE.WebGLRenderer;
  clearColor!: string;
  context!: WebGLRenderingContext | WebGL2RenderingContext;
  composition!: {
    space: THREE.WebGLRenderTarget;
    distortion: THREE.WebGLRenderTarget;
  };

  compositionFinal!: CompositionFinal;

  postProcess!: any;
  renderTarget: any;

  constructor() {
    // 创建Experience实例并获取所需的属性
    this.experience = new Experience();
    this.config = this.experience.config;

    this.scenes = this.experience.scenes;
    this.camera = this.experience.camera;

    // 设置渲染器实例和渲染器相关的设置
    this.setInstance();
    this.setComposition();
  }

  /**
   * 设置渲染器实例。
   */
  setInstance() {
    // 渲染区域的背景色
    this.clearColor = '#000000';

    // 创建WebGLRenderer实例
    this.instance = new THREE.WebGLRenderer({
      alpha: false, // 是否支持透明背景
      antialias: true, // 是否开启抗锯齿
    });

    // 设置渲染器实例的清除颜色
    this.instance.setClearColor(this.clearColor, 1);

    // 设置渲染器实例的大小和像素比例
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // 设置渲染器实例的相关属性
    this.instance.physicallyCorrectLights = true; // 是否启用物理正确的光照计算
    this.instance.outputEncoding = THREE.sRGBEncoding; // 输出编码格式
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap; // 阴影贴图类型
    this.instance.shadowMap.enabled = true; // 是否启用阴影贴图
    this.instance.toneMapping = THREE.NoToneMapping; // 色调映射方式
    this.instance.toneMappingExposure = 1; // 曝光值

    // 获取渲染器实例的上下文
    this.context = this.instance.getContext();
  }

  /**
   * 设置渲染器的渲染目标和后期处理相关设置。
   */
  setComposition() {
    this.composition = {
      // 空间渲染目标
      space: new THREE.WebGLRenderTarget(
        window.innerWidth * 2, // 宽度
        window.innerHeight * 2, // 高度
        {
          magFilter: THREE.LinearFilter, // 放大过滤器
          minFilter: THREE.LinearFilter, // 缩小过滤器
        },
      ),
      // 扭曲渲染目标
      distortion: new THREE.WebGLRenderTarget(
        window.innerWidth * 0.5, // 宽度
        window.innerHeight * 0.5, // 高度
        {
          magFilter: THREE.LinearFilter, // 放大过滤器
          minFilter: THREE.LinearFilter, // 缩小过滤器
          format: THREE.RedFormat, // 像素格式
          type: THREE.FloatType, // 数据类型
        },
      ),
    };

    // 最终渲染目标
    this.compositionFinal = {} as CompositionFinal; // 创建最终合成效果的对象
    // 创建最终合成效果的材质
    this.compositionFinal.material = FinalMaterial();
    // 设置最终合成效果材质的纹理属性
    this.compositionFinal.material.uniforms.uSpaceTexture.value = this.composition.space.texture;
    this.compositionFinal.material.uniforms.uDistortionTexture.value =
      this.composition.distortion.texture;
    // 创建最终合成效果的平面网格对象
    this.compositionFinal.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.compositionFinal.material,
    );
    // 设置最终合成效果的平面网格对象不进行视锥剔除
    this.compositionFinal.plane.frustumCulled = false;
    // 创建最终合成效果的场景对象
    this.compositionFinal.scene = this.scenes.final;
    // 将最终合成效果的平面网格对象添加到最终合成效果的场景中
    this.compositionFinal.scene.add(this.compositionFinal.plane);
  }

  /**
   * 调整渲染器和后期处理的大小。
   */
  resize() {
    // 调整渲染器实例的大小和像素比例
    // this.instance.setSize(this.config.width, this.config.height);
    this.instance.setSize(this.config.width, this.config.height);
    this.instance.setPixelRatio(this.config.pixelRatio);

    // 调整后期处理的大小和像素比例
    this.postProcess.composer.setSize(this.config.width, this.config.height);
    this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
  }

  /**
   * 更新渲染器的渲染过程。
   */
  update() {
    // 渲染空间场景到空间渲染目标
    this.instance.autoClearColor = true;
    this.instance.setRenderTarget(this.composition.space);
    this.instance.render(this.scenes.space, this.camera.instance);

    // 渲染扭曲场景到扭曲渲染目标
    this.instance.setRenderTarget(this.composition.distortion);
    this.instance.render(this.scenes.distortion, this.camera.instance);

    // 渲染覆盖场景到屏幕
    this.instance.autoClearColor = false;
    this.instance.setRenderTarget(null);
    this.instance.render(this.scenes.overlay, this.camera.instance);

    // 渲染最终场景到屏幕
    this.instance.setRenderTarget(null);
    this.instance.render(this.compositionFinal.scene, this.camera.instance);
  }

  /**
   * 销毁渲染器相关的资源。
   */
  destroy() {
    this.instance.renderLists.dispose();
    this.instance.dispose();
    this.renderTarget.dispose();

    this.postProcess.composer.renderTarget1.dispose();
    this.postProcess.composer.renderTarget2.dispose();
  }
}
