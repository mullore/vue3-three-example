import * as THREE from 'three';

// 导入顶点着色器和片元着色器的源代码
import vertexShader from '../shaders/final/vertex.glsl?raw';
import fragmentShader from '../shaders/final/fragment.glsl?raw';

// 这段代码创建了一个 FinalMaterial 材质函数，用于创建最终效果的材质。
function FinalMaterial() {
  // 创建最终材质（Final material）
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, // 使用的GLSL版本
    depthWrite: false, // 是否写入深度缓冲区
    depthTest: false, // 是否进行深度测试
    transparent: true, // 是否启用透明
    uniforms: {
      uSpaceTexture: { value: null }, // 空间纹理
      uDistortionTexture: { value: null }, // 扭曲纹理
      uBlackHolePosition: { value: new THREE.Vector2() }, // 黑洞位置
      uRGBShiftRadius: { value: 0.00001 }, // RGB偏移半径
    }, // 传递给着色器的数据
    defines: {}, // 着色器中的预处理指令
    vertexShader, // 顶点着色器源代码
    fragmentShader, // 片元着色器源代码
  });

  return material;
}

export default FinalMaterial;
