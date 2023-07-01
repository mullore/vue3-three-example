import * as THREE from 'three';

import vertexShader from '../shaders/starNest/vertex.glsl?raw';
import fragmentShader from '../shaders/starNest/fragment.glsl?raw';
// 这段代码是用于创建星星粒子材质的函数 BlackHoleParticlesMaterial()
function StarNestMaterial() {
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 指定GLSL版本为3
    // blending: THREE.AdditiveBlending,
    depthWrite: false, // 禁用深度写入
    depthTest: false, // 禁用深度测试
    // transparent: true,
    uniforms: {
      // uViewHeight: { value: 1024 }, // 视口高度的uniform变量
      // uSize: { value: 0.001 }, // 粒子大小的uniform变量
      u_time: { value: 0.0 },
      u_mouse: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader,
    fragmentShader,
  });

  return material;
}

export default StarNestMaterial;
