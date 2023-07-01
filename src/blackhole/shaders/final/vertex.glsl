in vec3 position;   // 输入顶点的位置信息
in vec2 uv;         // 输入顶点的纹理坐标信息

out vec2 vUv;       // 输出经过插值的纹理坐标信息

void main()
{
    vUv = uv;                      // 将输入的纹理坐标信息传递给输出变量
    gl_Position = vec4(position, 1.0);   // 设置顶点的裁剪空间位置
}