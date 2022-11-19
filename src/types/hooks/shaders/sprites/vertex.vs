// uniform mat4 projectionMatrix; // 矩阵将坐标转换为剪辑空间坐标
// uniform mat4 viewMatrix; // 应用相对于相机的转换(位置，旋转，视野，近，远)
// uniform mat4 modelMatrix; // 应用相对于网格的转换(位置，旋转，比例)
// attribute vec3 position;
// attribute vec2 uv;

// vscode 检测飘红不用管，这些用ShaderMaterial自动会引入


attribute float scale;

void main(){
  vec4 mvPosition = modelViewMatrix * vec4( position,1.0);
  gl_PointSize = scale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}