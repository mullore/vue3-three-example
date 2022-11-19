import * as Three from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera';
import { GUI } from 'dat.gui';

interface effectController {
  focalLength: number;
  fstop: number;
  showFocus: boolean;
  focalDepth: number;
}

export default class {
  readonly #container: Element; // 容器
  #camera!: CinematicCamera;
  readonly #sence!: Three.Scene;
  #state!: Stats;
  #raycaster!: Three.Raycaster;
  #renderer!: Three.WebGLRenderer;
  #mouse: Three.Vector2;

  // 这块后续TS技术更熟练后再优化，目前处理感觉很麻烦
  #INTERSECTED!: any;
  #radius = 100;
  #theta = 0;

  #effectController: effectController = {
    focalLength: 15,
    // jsDepthCalculation: true,
    // shaderFocus: false,
    //
    fstop: 2.8,
    // maxblur: 1.0,
    //
    showFocus: false,
    focalDepth: 3,
    // manualdof: false,
    // vignetting: false,
    // depthblur: false,
    //
    // threshold: 0.5,
    // gain: 2.0,
    // bias: 0.5,
    // fringe: 0.7,
    //
    // focalLength: 35,
    // noise: true,
    // pentagon: false,
    //
    // dithering: 0.0001
  };

  constructor() {
    // 创建 div 元素
    this.#container = document.createElement('div');
    // 将元素添加到 body元素中
    document.body.appendChild(this.#container);

    this.#sence = new Three.Scene();
    this.#sence.background = new Three.Color(0xf0f0f0);

    this.#raycaster = new Three.Raycaster();
    this.#mouse = new Three.Vector2();
    this.#state = Stats();
    // 渲染到页面中
    this.#container.appendChild(this.#state.dom);
  }

  public createGeometry() {
    const gemomerty = new Three.BoxGeometry(20, 20, 20);
    for (let i = 0; i < 1000; i++) {
      const object = new Three.Mesh(gemomerty, new Three.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
      object.position.x = Math.random() * 800 - 400;
      object.position.y = Math.random() * 800 - 400;
      object.position.z = Math.random() * 800 - 400;

      this.#sence.add(object);
    }
  }

  public createLight() {
    this.#sence.add(new Three.AmbientLight(0xffffff, 0.3));
    const light = new Three.DirectionalLight(0xffffff, 0.35);
    light.position.set(1, 1, 1).normalize();
    this.#sence.add(light);
  }

  public createCamera() {
    this.#camera = new CinematicCamera(60, window.innerHeight / window.innerWidth, 1, 1000);
    this.#camera.setLens(5);
    this.#camera.position.set(2, 1, 500);
  }

  public createRenderer() {
    this.#renderer = new Three.WebGLRenderer({ antialias: true });
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.#container.appendChild(this.#renderer.domElement);
  }

  public createListen() {
    window.onresize = () => {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();

      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.onmousemove = (event: MouseEvent) => {
      event.preventDefault();
      this.#mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.#mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
  }

  public createGui() {
    const gui = new GUI();
    gui.add(this.#effectController, 'focalLength', 1, 135, 0.01).onChange(this.matChanger.bind(this)).name('焦距');
    gui.add(this.#effectController, 'fstop', 1.8, 22, 0.01).onChange(this.matChanger.bind(this)).name('光圈范围');
    gui.add(this.#effectController, 'focalDepth', 0.1, 100, 0.001).onChange(this.matChanger.bind(this)).name('焦点深度');
    // 貌似选中全部的意思
    gui.add(this.#effectController, 'showFocus', true).onChange(this.matChanger.bind(this)).name('展示选中');
    this.matChanger();

    window.onresize = () => {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();

      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  private matChanger() {
    for (const e in this.#effectController) {
      if (e in this.#camera.postprocessing.bokeh_uniforms) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.#camera.postprocessing.bokeh_uniforms[e].value = this.#effectController[e];
      }
    }
    this.#camera.postprocessing.bokeh_uniforms.znear.value = this.#camera.near;
    this.#camera.postprocessing.bokeh_uniforms.zfar.value = this.#camera.far;

    this.#camera.setLens(this.#effectController?.focalLength as number, undefined, this.#effectController.fstop, this.#camera.coc);

    this.#effectController.focalDepth = this.#camera.postprocessing.bokeh_uniforms.focalDepth.value;
  }

  public animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.#state.update();
  }

  private render() {
    this.#theta += 0.1;
    this.#camera.position.x = this.#radius * Math.sin(Three.MathUtils.degToRad(this.#theta));
    this.#camera.position.y = this.#radius * Math.sin(Three.MathUtils.degToRad(this.#theta));
    this.#camera.position.z = this.#radius * Math.cos(Three.MathUtils.degToRad(this.#theta));

    this.#camera.updateMatrixWorld();
    this.#raycaster.setFromCamera(this.#mouse, this.#camera);

    // this.#sence.children 的类型判断现阶段感觉非常复杂，后续技术提升再行优化
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const intersects = this.#raycaster.intersectObjects(this.#sence.children, false);

    if (intersects.length > 0) {
      const targetDistance = intersects[0].distance;
      this.#camera.focusAt(targetDistance);

      if (this.#INTERSECTED !== intersects[0].object) {
        if (this.#INTERSECTED) this.#INTERSECTED.material.emissive.setHex(this.#INTERSECTED.currentHex);
        this.#INTERSECTED = intersects[0].object;
        this.#INTERSECTED.curentHex = this.#INTERSECTED.material.emissive.getHex();
        this.#INTERSECTED.material.emissive.setHex(0xff0000);
      }
    } else {
      if (this.#INTERSECTED) this.#INTERSECTED.material.emissive.setHex(this.#INTERSECTED.curentHex);
      this.#INTERSECTED = null;
    }

    if (this.#camera.postprocessing.enabled) {
      this.#camera.renderCinematic(this.#sence, this.#renderer);
    } else {
      this.#sence.overrideMaterial = null;
      this.#renderer.clear();
      this.#renderer.render(this.#sence, this.#camera);
    }
  }
}
