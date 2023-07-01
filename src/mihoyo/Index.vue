
<template>
  <Draggable>
    <div ref="Daier" />
  </Draggable>
</template>

<script lang="ts" setup>
import Draggable from '@/components/common/Draggable.vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';

// import { GUI } from 'dat.gui';
import Gui from './gui';
import { onMounted, ref } from 'vue';
import { MMDPhysicsHelper } from 'three/examples/jsm/animation/MMDPhysics';
import { CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver';

let helper: MMDAnimationHelper;
let effect: OutlineEffect;
let ikHelper: CCDIKHelper;
let physicsHelper: MMDPhysicsHelper;
let Controls: Gui;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera; let renderer: THREE.WebGLRenderer;
const clock = new THREE.Clock();
function animate() {

  requestAnimationFrame(animate);
  // 获取时间差（delta）
  const delta = clock.getDelta();
  // 更新MMDAnimationHelper
  helper.update(delta);
  // 更新相机

  effect.render(scene, camera);

}

const Daier = ref<HTMLElement | null>(null);

onMounted(() => {


  // 38
  camera = new THREE.PerspectiveCamera(55, 350 / 300, 0.1, 1000);
  camera.position.z = 20;

  // scene
  scene = new THREE.Scene(); // 创建场景对象
  // scene.background = new THREE.Color(0xffffff); // 设置背景颜色为白色
  // scene.background.set(0); // 设置背景颜色为白色，并将 alpha 通道值设置为 0

  // 环境光
  const ambient = new THREE.AmbientLight(0x666666); // 创建环境光对象
  scene.add(ambient); // 将环境光对象添加到场景中
  // 定向光
  const directionalLight = new THREE.DirectionalLight(0x887766); // 创建定向光对象
  directionalLight.position.set(-1, 1, 1).normalize(); // 设置定向光的位置并进行归一化
  scene.add(directionalLight); // 将定向光对象添加到场景中

  //
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // 创建渲染器对象
  renderer.setClearColor(0x000000, 0); // 设置清除颜色为透明
  renderer.clearDepth(); // 清除深度缓冲区
  renderer.setSize(350, 300);
  renderer.setPixelRatio(window.devicePixelRatio); // 设置渲染器的像素比例
  // renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器的尺寸
  Daier.value?.appendChild(renderer.domElement); // 将渲染器的 DOM 元素添加到容器中



  // // 网格辅助对象
  // const gridHelper = new THREE.PolarGridHelper(30, 10); // 创建极坐标网格辅助对象
  // gridHelper.position.y = -10; // 设置网格辅助对象的位置
  // scene.add(gridHelper); // 将网格辅助对象添加到场景中

  const modelFile = '/daier/daier.pmx';

  const vmdFiles = ['/models/mmd/vmds/wavefile_v2.vmd'];
  const cameraFiles = '/models/mmd/vmds/wavefile_camera.vmd';
  const audioFile = '/models/mmd/audios/wavefile_short.mp3';
  // const audioParams = { delayTime: (160 * 1) / 30 };

  function onProgress(xhr: { lengthComputable: any; loaded: number; total: number; }) {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      // console.log(Math.round(percentComplete) + '% downloaded');
    }
  }

  effect = new OutlineEffect(renderer); // 创建轮廓效果对象
  effect.enabled = false; // 将轮廓设置为false

  // 创建一个带有配置选项的 MMDAnimationHelper 对象。
  helper = new MMDAnimationHelper({
    afterglow: 2.0, // 光晕效果的强度
  });


  // 创建一个 MMDLoader 对象，用于加载 MMD 模型和动画。
  const loader = new MMDLoader();
  // 创建一个 THREE.AudioListener 对象，并将其添加到摄像机中，然后将摄像机添加到场景中。
  // const listener = new THREE.AudioListener();

  // 使用 MMDLoader 的 loadWithAnimation 方法加载模型和关联的动画文件。
  loader.loadWithAnimation(
    modelFile, // 模型文件路径
    vmdFiles, // 动画文件路径数组
    function (mmd) {

      const mesh = mmd.mesh; // 获取加载的 MMD 模型


      // console.log(mesh);
      // 加载相机的动画文件。
      loader.loadAnimation(
        cameraFiles, // 相机动画文件路径数组
        camera, // 相机对象

        function (cameraAnimation) { // eslint-disable-line

          // 将相机动画添加到 MMDAnimationHelper 中进行管理。
          // helper.add(camera, {
          //   animation: cameraAnimation, // 相机的动画数据
          //   physics: false, //  是否使用物理模拟
          // });

          // 将模型添加到 MMDAnimationHelper 中进行动画管理，传递模型的动画和物理选项。
          helper.add(mesh, {
            animation: mmd.animation, // 模型的动画数据
            physics: true, // 是否使用物理模拟
          });

          const mixer = helper.objects.get(mesh)?.mixer;
          const action = mixer?.clipAction(mmd.animation);
          action?.setLoop(THREE.LoopOnce, 0);
          helper.update(100);
          // //console.log('obj', helper.objects.get(mesh));
          mesh.position.y = -6; // 设置模型的位置
          scene.add(mesh);

          // 创建 IK 辅助器并将其添加到场景中。
          ikHelper = helper.objects.get(mesh)?.ikSolver.createHelper() as CCDIKHelper;
          // console.log('ikHelper', ikHelper);
          ikHelper.visible = false; // 设置 IK 辅助器的可见性
          scene.add(ikHelper);

          // 创建物理辅助器并将其添加到场景中。
          physicsHelper = helper.objects.get(mesh)?.physics?.createHelper() as MMDPhysicsHelper;
          // //console.log('physicsHelper', physicsHelper);
          physicsHelper.visible = false; // 设置物理辅助器的可见性
          scene.add(physicsHelper);


          helper.enable('physics', false);

          // 加载音频文件。
          new THREE.AudioLoader().load(
            audioFile, // 音频文件路径
            function (buffer) {
              // 创建一个 THREE.Audio 对象，并设置音频缓冲区。
              const audio = new THREE.Audio(new THREE.AudioListener()).setBuffer(buffer);

              audio.setLoop(false); // 设置不循环播放
              // 将音量设置为 0.5
              audio.setVolume(0.2);



              mixer?.addEventListener('finished', () => {
                // console.log('finished触发执行');
                Controls.physicsEnable(false);
                helper.enable('physics', false);
                audio.pause();
                audio.stop();
                // action?.stop(); // 停止动画播放
                // action?.reset(); // 重置动画状态
              });


              //
              document.addEventListener('keydown', function (event) {
                if (event.ctrlKey && event.altKey && event.key === 't') {
                  // console.log('ctrl+Alt+T');
                  if (audio.isPlaying) audio.stop();
                  helper.enable('physics', true);
                  // 在这里触发混合器播放动画的代码
                  // 停止当前播放的所有动画
                  mixer?.stopAllAction();

                  // 获取要重新播放的动画剪辑
                  const clip = mixer?.clipAction(mmd.animation);
                  // 开始播放动画
                  clip?.play();
                  audio.play(5);

                  Controls.physicsEnable(true);
                  Controls.audioEndable(true);


                }
              });

              Controls = new Gui(mmd, effect, helper, ikHelper, physicsHelper, audio);
              Controls.init();
              Controls.physicsEnable(false);

            },
            onProgress, // 加载音频文件时的进度回调函数

          );


        },
        onProgress, // 加载相机动画文件时的进度回调函数
      );

    },
    onProgress, // 加载模型和动画文件时的进度回调函数
  );

  // 创建 OrbitControls 控制器，并指定相机和渲染器的 DOM 元素。
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10; // 控制相机的最小距离
  controls.maxDistance = 100; // 控制相机的最大距离

  controls.enablePan = false;

});
// ammoScript.src = '/public/ammo.wasm.js';
const ammoScript = document.createElement('script');

ammoScript.src = './ammo.wasm.js';
ammoScript.onload = () => {
  // @ts-ignore
  Ammo().then(() => {  // eslint-disable-line
    animate();
  });

};

document.head.appendChild(ammoScript);

</script>
<style lang="scss" scoped>
canvas {
  margin: 0;
  display: inline-block;
}
</style>




