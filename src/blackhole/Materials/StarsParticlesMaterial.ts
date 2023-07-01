import * as THREE from 'three';

import vertexShader from '../shaders/starsParticles/vertex.glsl?raw';
import fragmentShader from '../shaders/starsParticles/fragment.glsl?raw';
// 这段代码是用于创建星星粒子材质的函数 BlackHoleParticlesMaterial()
function StarsParticlesMaterial() {
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 指定GLSL版本为3
    // blending: THREE.AdditiveBlending,
    depthWrite: false, // 禁用深度写入
    depthTest: false, // 禁用深度测试
    transparent: true,
    uniforms: {
      uViewHeight: { value: 1024 }, // 视口高度的uniform变量
      uSize: { value: 0.001 }, // 粒子大小的uniform变量
    },
    vertexShader,
    fragmentShader,
  });

  return material;
}

export default StarsParticlesMaterial;
