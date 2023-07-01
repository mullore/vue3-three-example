import * as THREE from 'three';

import vertexShader from '../shaders/blackHoleParticles/vertex.glsl?raw';
import fragmentShader from '../shaders/blackHoleParticles/fragment.glsl?raw';

// 这段代码是用于创建黑洞扭曲遮罩材质的函数 BlackHoleDistortionMaskMaterial()
function BlackHoleParticlesMaterial() {
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 使用的 GLSL 版本
    blending: THREE.AdditiveBlending, // 混合模式
    depthWrite: false, // 是否写入深度缓冲
    depthTest: false, // 是否进行深度测试
    transparent: true, // 是否启用透明度
    uniforms: {
      // 材质的 uniform 变量
      uTime: { value: 0 }, // 时间
      // uInnerColor: { value: new THREE.Color('#ff8080') }, // 内部颜色
      // uOuterColor: { value: new THREE.Color('#3633ff') }, // 外部颜色
      uViewHeight: { value: 1024 }, // 视口高度
      uSize: { value: 0.015 }, // 大小
    },
    vertexShader, // 顶点着色器代码
    fragmentShader, // 片元着色器代码
  });

  return material;
}

export default BlackHoleParticlesMaterial;
