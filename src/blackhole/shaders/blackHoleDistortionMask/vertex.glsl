uniform mat4 projectionMatrix;      // 投影矩阵
uniform mat4 modelViewMatrix;       // 模型视图矩阵

in vec3 position;                   // 顶点位置
in vec2 uv;                         // 纹理坐标

out vec2 vUv;                       // 输出的纹理坐标

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // 计算最终的裁剪空间坐标，将顶点位置乘以模型视图矩阵和投影矩阵的乘积，并赋值给gl_Position

    vUv = uv;
    // 将输入的纹理坐标直接赋值给输出的纹理坐标vUv
}