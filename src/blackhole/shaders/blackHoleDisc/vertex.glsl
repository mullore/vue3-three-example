uniform mat4 projectionMatrix;    // 投影矩阵
uniform mat4 modelViewMatrix;     // 模型视图矩阵

in vec3 position;   // 顶点位置输入变量
in vec2 uv;         // 纹理坐标输入变量

out vec2 vUv;       // 纹理坐标输出变量

void main()
{
    // 将顶点位置转换到裁剪空间坐标系
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 将纹理坐标传递给片段着色器
    vUv = uv;
}