import { GUI } from 'dat.gui';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import { CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver';
import { MMDPhysicsHelper } from 'three/examples/jsm/animation/MMDPhysics';

const gui = new GUI(); // 创建一个 GUI 对象
const morphs = gui.addFolder('表情管理'); // 创建 "Morphs" 文件夹
const folder = gui.addFolder('MMD模型');
// const poses = gui.addFolder('姿势'); // 创建 "Poses" 文件夹
const japaneseToChineseMap = new Map([
  ['まばたき', '眨眼'],
  ['ウィンク', '眨眼'],
  ['ｳｨﾝｸ２', '眨眼2'],
  ['ｳｨﾝｸ右', '眨眼右'],
  ['ｳｨﾝｸ２右', '眨眼2右'],
  ['笑い', '笑'],
  ['微笑', '微笑'],
  ['ｶﾏﾎﾞｺ目', '卡通眼'],
  ['なごみ', '宁静'],
  ['はぅ', '哈'],
  ['XX', 'XX'],
  ['びっくり', '吃惊'],
  ['瞳小', '瞳孔缩小'],
  ['黒楕円', '黑色椭圆'],
  ['じと目', '凝视'],
  ['睨み', '瞪眼'],
  ['うずまき', '漩涡'],
  ['ハート', '心形'],
  ['あ', '嘴型(哈欠)'],
  ['い', '嘴型(一)'],
  ['う', '嘴型(う)'],
  ['え', '嘴型(え)'],
  ['お', '嘴型(お)'],
  ['にやり', '嘴型(傻笑)'],
  ['▲', '嘴型(▲)'],
  ['∞', '嘴型(∞)'],
  ['叫び', '嘴型(尖叫)'],
  ['むっ', '嘴型(嘟嘴)'],
  ['もぐもぐ', '嘴型(咀嚼)'],
  ['ぷう', '嘴型(吹)'],
  ['・', '嘴型(・)'],
  ['ふー', '嘴型(哈气)'],
  ['青ざめ', '惊讶'],
  ['頬（狭）', '脸颊（窄）'],
  ['頬（広）', '脸颊（宽）'],
  ['頬（ぷう）', '脸颊（鼓）'],
  ['真面目', '认真'],
  ['にこり', '微笑'],
  ['困る', '困惑'],
  ['困る２', '困惑2'],
  ['怒り', '愤怒'],
  ['上', '上'],
  ['下', '下'],
  ['前へ', '前'],
  ['ウィンク２', '眨眼2'],
  ['はちゅ目縦潰れ', '压缩纵向'],
  ['はちゅ目横潰れ', '压缩横向'],
  ['はちゅ目', '压缩眼'],
  ['白眼', '白眼'],
  ['白眼1', '白眼1'],
]);

class Gui {
  helper: MMDAnimationHelper;
  effect: OutlineEffect;
  ikHelper: CCDIKHelper;
  physicsHelper: MMDPhysicsHelper;
  dictionary;
  keys: any[] = []; // 形态目标键值数组
  controls: any; // 控制器对象
  vpds: object[] = [];
  mmd;
  mesh;
  audio;

  api = {
    animation: true,
    ik: true,
    outline: false,
    physics: true,
    'show IK bones': false,
    'show rigid bodies': false,
    start: false,
    audio: false,
  };

  constructor(
    mmd: any,
    effect: OutlineEffect,
    helper: MMDAnimationHelper,
    ikHelper: CCDIKHelper,
    physicsHelper: MMDPhysicsHelper,
    audio: any,
  ) {
    this.helper = helper;
    this.effect = effect;
    this.ikHelper = ikHelper;
    this.physicsHelper = physicsHelper;
    this.dictionary = mmd.mesh.morphTargetDictionary;
    this.mesh = mmd.mesh;
    this.mmd = mmd;
    this.audio = audio;
  }

  getBaseName(s: any) {
    return s.slice(s.lastIndexOf('/') + 1); // 获取文件路径中的基本名称
  }

  init() {
    // gui.close();
    this.initKeys(); // 初始化形态目标键值数组
    this.initModels();
    this.initMorphs(); // 初始化 "Morphs" 文件夹
  }

  initKeys() {
    // 初始化形态目标键值数组

    for (const key in this.dictionary) {
      this.keys.push(key);
    }
    // console.log('keys', this.keys);
  }

  initModels() {
    // 创建一个文件夹并设置标题

    // 添加动画控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'animation')
      .onChange(() => {
        this.helper.enable('animation', this.api.animation);
      })
      .name('动画执行开关');

    // 添加 IK 控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'ik')
      .onChange(() => {
        this.helper.enable('ik', this.api.ik);
      })
      .name('IK(骨骼链)');

    // 添加轮廓效果控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'outline')
      .onChange(() => {
        this.effect.enabled = this.api.outline;
      })
      .name('轮廓效果');

    // 添加物理模拟控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'physics')
      .onChange(() => {
        this.helper.enable('physics', this.api.physics);
      })
      .name('物理模拟控制');

    // 添加显示 IK 骨骼的控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'show IK bones')
      .onChange(() => {
        // console.log(this.ikHelper);
        this.ikHelper.visible = this.api['show IK bones'];
      })
      .name('显示IK 骨骼控件');

    // 添加显示刚体的控制选项，并在值改变时调用相应的回调函数
    folder
      .add(this.api, 'show rigid bodies')
      .onChange(() => {
        // console.log(this.physicsHelper);
        if (this.physicsHelper !== undefined) this.physicsHelper.visible = this.api['show rigid bodies'];
      })
      .name('显示刚体');
    folder
      .add(this.api, 'start')
      .onChange(() => {
        if (this.api.start === true) {
          this.physicsEnable(true);
          this.helper.enable('physics', true);
          // 停止当前播放的所有动画
          this.helper.objects.get(this.mesh)?.mixer?.stopAllAction();

          // 获取要重新播放的动画剪辑
          const clip = this.helper.objects.get(this.mesh)?.mixer?.clipAction(this.mmd.animation);
          // 开始播放动画
          clip?.play();
          this.audio.play(5);
        }
        if (this.api.start === false) {
          this.physicsEnable(false);
          this.helper.enable('physics', false);
          this.helper.update(100);
        }
      })
      .name('动画Ctrl+Alt+T');

    folder
      .add(this.api, 'audio')
      .onChange(() => {
        // console.log(this.physicsHelper);
        if (this.api.audio === true) {
          if (this.audio.isPlaying === false) this.audio.play();
        }
        if (this.api.audio === false) this.audio.stop();
      })
      .name('音乐播放');
  }

  audioEndable(params = false) {
    this.api.audio = params;
    gui.updateDisplay();
  }

  physicsEnable(params = true) {
    this.api.physics = params;
    gui.updateDisplay(); // 更新 GUI 控件的显示状态
  }

  initMorphs() {
    // 初始化 "Morphs" 文件夹
    // //console.log(this.dictionary);
    for (const key in this.dictionary) {
      const index = this.dictionary[key];
      this.dictionary[key] = 0;
      morphs
        .add(this.dictionary, key, 0.0, 1.0, 0.01)
        .onChange(() => {
          this.mesh.morphTargetInfluences[index] = this.dictionary[key];
        })
        .name(japaneseToChineseMap.get(key) ?? key);
    }
  }
}

export default Gui;
