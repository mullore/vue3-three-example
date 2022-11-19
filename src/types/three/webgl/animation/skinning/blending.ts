import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Skeleton, SkeletonHelper } from 'three';

export default class bleadings {
  #scene: THREE.Scene;
  #camera: THREE.PerspectiveCamera;
  #renderer: THREE.WebGLRenderer;
  #clock: THREE.Clock;
  #stats: Stats;
  #model: any;
  #skeleton: any;
  #mixer: any;
  #idleAction: any;
  #walkAction: any;
  #runAction: any;
  #idleWeight: any;
  #walkWeight: any;
  #runWeight: any;
  #actions: any;
  #settings: any;
  #singleStepMode = false;
  #sizeOfNextStep = 0;

  crossFadeControls: any = [] as any;

  constructor() {
    this.#scene = new THREE.Scene();
    this.#scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
    this.#scene.background = new THREE.Color(0xa0a0a0);

    this.#clock = new THREE.Clock();

    this.#stats = Stats();
    document.body.append(this.#stats.dom);

    this.#camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.#renderer = new THREE.WebGLRenderer({ antialias: true });
  }

  public createMesh() {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));

    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.#scene.add(mesh);
  }

  public createGeometry() {
    const loader = new GLTFLoader();
    loader.load('models/gltf/Soldier.glb', (gltf) => {
      this.#model = gltf.scene;
      this.#scene.add(this.#model);

      this.#model.traverse((obj: { isMesh: any; castShadow: boolean }) => {
        if (obj.isMesh) obj.castShadow = true;
      });

      this.#skeleton = new SkeletonHelper(this.#model);
      this.#skeleton.visible = false;
      this.#scene.add(this.#skeleton);

      this.createPanel();

      const animations = gltf.animations;
      this.#mixer = new THREE.AnimationMixer(this.#model);

      this.#idleAction = this.#mixer.clipAction(animations[0]);
      this.#walkAction = this.#mixer.clipAction(animations[3]);
      this.#runAction = this.#mixer.clipAction(animations[1]);

      this.#actions = [this.#idleAction, this.#walkAction, this.#runAction];

      this.setWeight(this.#idleAction, this.#settings['modify idle weight']);
      this.setWeight(this.#walkAction, this.#settings['modify walk weight']);
      this.setWeight(this.#runAction, this.#settings['modify run weight']);

      this.#actions.forEach((item: any) => item.play());

      this.animate();
    });
  }

  public createLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.#scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = -2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.#scene.add(dirLight);
  }

  public createCamera() {
    // this.#camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1000)
    this.#camera.position.set(1, 2, -3);
    this.#camera.lookAt(0, 1, 0);
  }

  public createRender() {
    // this.#renderer = new THREE.WebGLRenderer({antialias:true})
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.#renderer.outputEncoding = THREE.sRGBEncoding;
    this.#renderer.shadowMap.enabled = true;
    document.body.append(this.#renderer.domElement);
  }

  public createListen() {
    window.onresize = () => {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  createPanel() {
    const Panel = new GUI({ width: 310 });
    const folder1 = Panel.addFolder('Visibility');
    const folder2 = Panel.addFolder('Activation/Deactivation');
    const folder3 = Panel.addFolder('Pausing/Stepping');
    const folder4 = Panel.addFolder('Crossfading');
    const folder5 = Panel.addFolder('Blend Weights');
    const folder6 = Panel.addFolder('General Speed');

    // 配置顺序好像会有影响
    this.#settings = {
      'show model': true,
      'show skeleton': false,

      'deactivate all': () => {
        this.#actions.forEach((e: { stop: () => void }) => {
          e.stop();
        });
      },
      'activate all': () => {
        this.setWeight(this.#idleAction, this.#settings['modify idle weight']);
        this.setWeight(this.#walkAction, this.#settings['modify walk weight']);
        this.setWeight(this.#runAction, this.#settings['modify run weight']);
        this.#actions.forEach((element: { play: () => void }) => {
          element.play();
        });
      },
      'pause/continue': () => {
        if (this.#singleStepMode) {
          this.#singleStepMode = false;
          this.unPauseAllActions();
        } else {
          this.#idleAction.paused ? this.unPauseAllActions() : this.PauseAllActions();
        }
      },

      'make single step': () => {
        this.unPauseAllActions();
        this.#singleStepMode = true;
        this.#sizeOfNextStep = this.#settings['modify step size'];
      },
      'modify step size': 0.05,

      'from walk to idle': function () {
        //  this.prepareCrossFade( this.#walkAction, this.#idleAction, 1.0 );
      },

      'from idle to walk': () => {
        this.prepareCrossFade(this.#idleAction, this.#walkAction, 0.5);
      },
      'from walk to run': () => {
        this.prepareCrossFade(this.#walkAction, this.#runAction, 2.5);
      },
      'from run to walk': () => {
        this.prepareCrossFade(this.#runAction, this.#walkAction, 5.0);
      },
      // 'use default duration': true,
      // 'set custom duration': 0,
      // 'modify idle weight': 0.0,
      // 'modify walk weight': 0.0,
      // 'modify run weight': 0.0,
      // 'modify time scale': 0.0,
      'use default duration': true,
      'set custom duration': 3.5,
      'modify idle weight': 0.0,
      'modify walk weight': 0.9,
      'modify run weight': 0.0,
      'modify time scale': 1.0,
    };
    folder1.add(this.#settings, 'show model').onChange((visibility: any) => (this.#model = visibility));
    folder1.add(this.#settings, 'show skeleton').onChange((visibility: any) => (this.#skeleton.visible = visibility));
    folder2.add(this.#settings, 'deactivate all');
    folder2.add(this.#settings, 'activate all');
    folder3.add(this.#settings, 'pause/continue');
    folder3.add(this.#settings, 'make single step');
    folder3.add(this.#settings, 'modify step size', 0.01, 0.1, 0.001);
    console.log(this.crossFadeControls);
    this.crossFadeControls.push(folder4.add(this.#settings, 'from walk to idle'));
    // console.log(folder4.add(this.#settings, 'from walk to idle'));
    // console.log(this.crossFadeControls);
    this.crossFadeControls.push(folder4.add(this.#settings, 'from idle to walk'));
    this.crossFadeControls.push(folder4.add(this.#settings, 'from walk to run'));
    this.crossFadeControls.push(folder4.add(this.#settings, 'from run to walk'));

    folder4.add(this.#settings, 'use default duration');
    folder4.add(this.#settings, 'set custom duration', 0, 10, 0.01);

    folder5
      .add(this.#settings, 'modify idle weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange((weight: any) => {
        this.setWeight(this.#idleAction, weight);
      });
    folder5
      .add(this.#settings, 'modify walk weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange((weight: any) => {
        this.setWeight(this.#walkAction, weight);
      });
    folder5
      .add(this.#settings, 'modify run weight', 0.0, 1.0, 0.01)
      .listen()
      .onChange((weight: any) => {
        this.setWeight(this.#runAction, weight);
      });
    folder6.add(this.#settings, 'modify time scale', 0.0, 1.5, 0.01).onChange((speed: any) => (this.#mixer.timeScale = speed));

    // folder1.open();
    // folder2.open();
    // folder3.open();
    // folder4.open();
    // folder5.open();
    // folder6.open();
  }

  // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
  // the start action's timeScale to ((start animation's duration) / (end animation's duration))
  public setWeight(action: any, weight: any) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  unPauseAllActions() {
    this.#actions.forEach((e: { paused: boolean }) => {
      e.paused = false;
    });
  }

  PauseAllActions() {
    this.#actions.forEach((e: { paused: boolean }) => {
      e.paused = true;
    });
  }

  prepareCrossFade(startAction: any, endAction: any, defaultDuration: any) {
    // Switch default / custom crossfade duration (according to the user's choice)

    // Switch default / custom crossfade duration (according to the user's choice)

    const duration = this.setCrossFadeDuration(defaultDuration);

    // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

    this.#singleStepMode = false;
    this.unPauseAllActions();

    // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if (startAction === this.#idleAction) {
      this.executeCrossFade(startAction, endAction, duration);
    } else {
      this.synchronizeCrossFade(startAction, endAction, duration);
    }
  }

  synchronizeCrossFade(startAction: any, endAction: any, duration: any) {
    this.#mixer.addEventListener('loop', onLoopFinished);
    const that = this;
    function onLoopFinished(event: any) {
      if (event.action === startAction) {
        that.#mixer.removeEventListener('loop', onLoopFinished);

        that.executeCrossFade(startAction, endAction, duration);
      }
    }
  }

  // Called by the render loop
  setCrossFadeDuration(defaultDuration: any) {
    // Switch default crossfade duration <-> custom crossfade duration

    if (this.#settings['use default duration']) {
      return defaultDuration;
    } else {
      return this.#settings['set custom duration'];
    }
  }

  executeCrossFade(startAction: any, endAction: any, duration: any) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    this.setWeight(endAction, 1);
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo(endAction, duration, true);
  }

  updateCrossFadeControls() {
    if (this.#idleWeight === 1 && this.#walkWeight === 0 && this.#runWeight === 0) {
      this.crossFadeControls[0].disable();
      this.crossFadeControls[1].enable();
      this.crossFadeControls[2].disable();
      this.crossFadeControls[3].disable();
    }

    if (this.#idleWeight === 0 && this.#walkWeight === 1 && this.#runWeight === 0) {
      this.crossFadeControls[0].enable();
      this.crossFadeControls[1].disable();
      this.crossFadeControls[2].enable();
      this.crossFadeControls[3].disable();
    }

    if (this.#idleWeight === 0 && this.#walkWeight === 0 && this.#runWeight === 1) {
      this.crossFadeControls[0].disable();
      this.crossFadeControls[1].disable();
      this.crossFadeControls[2].disable();
      this.crossFadeControls[3].enable();
    }
  }

  animate() {
    // requestAnimationFrame(this.animate.bind(this))

    this.#idleWeight = this.#idleAction.getEffectiveWeight();
    this.#walkWeight = this.#walkAction.getEffectiveWeight();
    this.#runWeight = this.#runAction.getEffectiveWeight();

    this.#settings['modify idle weight'] = this.#idleWeight;
    this.#settings['modify walk weight'] = this.#walkWeight;
    this.#settings['modify run weight'] = this.#runWeight;

    this.updateCrossFadeControls();
    console.log(this.crossFadeControls[0]);
    // console.log( typeof this.crossFadeControls[0].enable()  );
    // console.log( typeof this.crossFadeControls[1].enable()  );
    // console.log( typeof this.crossFadeControls[2].enable()  );
    // console.log(typeof this.crossFadeControls[3].enable()  );
    let mixerUpdateDelta = this.#clock.getDelta();

    if (this.#singleStepMode) {
      mixerUpdateDelta = this.#sizeOfNextStep;
      this.#sizeOfNextStep = 0;
    }

    this.#mixer.update(mixerUpdateDelta);
    this.#stats.update();
    this.#renderer.render(this.#scene, this.#camera);
  }
}
