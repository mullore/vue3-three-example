import * as THREE from 'three';

// 导入顶点着色器和片段着色器的源代码
import vertexShader from '../shaders/noises/vertex.glsl?raw';
import fragmentShader from '../shaders/noises/fragment.glsl?raw';

// 这段代码是用于创建噪声材质的函数 NoisesMaterial()
function NoisesMaterial() {
  // 创建一个RawShaderMaterial材质对象
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 指定GLSL版本为3
    uniforms: {}, // 声明uniform变量，此处为空对象
    vertexShader, // 设置顶点着色器源代码
    fragmentShader, // 设置片段着色器源代码
  });

  return material;
}

export default NoisesMaterial;
