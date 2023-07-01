import * as THREE from 'three';

// 导入顶点着色器和片段着色器的源代码
import vertexShader from '../shaders/blackHoleDisc/vertex.glsl?raw';
import fragmentShader from '../shaders/blackHoleDisc/fragment.glsl?raw';

// 这段代码是一个用于创建黑洞盘材质的函数 BlackHoleDiscMaterial
function BlackHoleDiscMaterial() {
  // 创建一个RawShaderMaterial材质对象
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 指定GLSL版本为3
    side: THREE.DoubleSide, // 设置面剔除为双面
    blending: THREE.AdditiveBlending, // 使用加法混合模式
    depthWrite: false, // 禁用深度写入
    depthTest: false, // 禁用深度测试
    transparent: true, // 开启透明度
    uniforms: {
      // 声明uniform变量
      uTime: { value: 0 }, // 时间
      uNoiseTexture: { value: null }, // 噪声纹理
      // uInnerColor: { value: new THREE.Color('#ff8080') }, // 内部颜色
      // uOuterColor: { value: new THREE.Color('#3633ff') }, // 外部颜色
    },
    vertexShader, // 设置顶点着色器源代码
    fragmentShader, // 设置片段着色器源代码
  });

  return material;
}

export default BlackHoleDiscMaterial;
