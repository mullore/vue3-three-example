in vec3 position;   // 输入的顶点位置信息
in vec2 uv;         // 输入的纹理坐标信息

out vec2 vUv;       // 输出的纹理坐标信息

void main()
{
    gl_Position = vec4(position, 1.0);   // 更新顶点位置为输入的位置信息

    vUv = uv;   // 更新纹理坐标为输入的纹理坐标信息
}