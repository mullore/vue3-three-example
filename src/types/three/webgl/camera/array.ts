import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

export default class {
  #ASPECT_RATIO: number = window.innerWidth / window.innerHeight;
  #AMOUNT = 6;
  #camera!: THREE.ArrayCamera;
  readonly #scene!: THREE.Scene;
  #renderer!: THREE.WebGLRenderer;
  #mesh!: THREE.Mesh;
  readonly #container: Element; // 容器
  #state: Stats; // 性能(渲染率检测器)

  constructor() {
    this.#container = document.createElement('div');

    document.body.appendChild(this.#container);

    this.#scene = new THREE.Scene();

    this.#state = Stats();

    this.#container.appendChild(this.#state.dom);
  }

  public init() {
    const WIDTH = (window.innerWidth / this.#AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (window.innerHeight / this.#AMOUNT) * window.devicePixelRatio;
    const cameras = [];

    for (let y = 0; y < this.#AMOUNT; y++) {
      for (let x = 0; x < this.#AMOUNT; x++) {
        const subcamera: THREE.PerspectiveCamera | any = new THREE.PerspectiveCamera(40, this.#ASPECT_RATIO, 0.1, 10);
        subcamera.viewport = new THREE.Vector4(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));
        subcamera.position.x = x / this.#AMOUNT - 0.5;
        subcamera.position.y = 0.5 - y / this.#AMOUNT;
        subcamera.position.z = 1.5;
        subcamera.position.multiplyScalar(2);
        subcamera.lookAt(0, 0, 0);
        subcamera.updateMatrixWorld();
        cameras.push(subcamera);
      }
    }
    this.createCamera(cameras);
    this.createLight();
    this.createBackground();
    this.createCylinder();
    this.createRender();
  }

  private createBackground() {
    const geometryBackground = new THREE.PlaneGeometry(100, 100);
    const materialBackground = new THREE.MeshPhongMaterial({ color: 0x000066 });

    const background = new THREE.Mesh(geometryBackground, materialBackground);
    background.receiveShadow = true;
    background.position.set(0, 0, -1);
    this.#scene.add(background);
  }

  private createCylinder() {
    const geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const materialCylinder = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    this.#mesh = new THREE.Mesh(geometryCylinder, materialCylinder);
    this.#mesh.castShadow = true;
    this.#mesh.receiveShadow = true;
    this.#scene.add(this.#mesh);
  }

  private createCamera(cameras: Array<any>) {
    this.#camera = new THREE.ArrayCamera(cameras);
    this.#camera.position.z = 3;
  }

  private createLight() {
    this.#scene.add(new THREE.AmbientLight(0x222244));
    const light: THREE.DirectionalLight = new THREE.DirectionalLight();
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    this.#scene.add(light);
  }

  private createRender() {
    this.#renderer = new THREE.WebGLRenderer();
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.#renderer.shadowMap.enabled = true;
    document.body.appendChild(this.#renderer.domElement);
  }

  public onResize() {
    window.onresize = () => {
      const WIDTH = (window.innerWidth / this.#AMOUNT) * window.devicePixelRatio;
      const HEIGHT = (window.innerHeight / this.#AMOUNT) * window.devicePixelRatio;

      this.#camera.aspect = this.#ASPECT_RATIO;
      this.#camera.updateProjectionMatrix();

      for (let y = 0; y < this.#AMOUNT; y++) {
        for (let x = 0; x < this.#AMOUNT; x++) {
          const subcamera: any = this.#camera.cameras[this.#AMOUNT * y + x];
          subcamera.viewport.set(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));
          subcamera.aspect = this.#ASPECT_RATIO;
          subcamera.updateProjectionMatrix();
        }
      }
    };
  }

  public animate() {
    this.#mesh.rotation.x += 0.005;
    this.#mesh.rotation.y += 0.01;

    this.#renderer.render(this.#scene, this.#camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}
