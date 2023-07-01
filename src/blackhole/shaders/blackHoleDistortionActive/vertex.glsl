uniform mat4 projectionMatrix;  // 投影矩阵，传入的投影矩阵，用于将顶点位置从视图空间变换到裁剪空间。
uniform mat4 modelViewMatrix;   // 模型视图矩阵，传入的模型视图矩阵，用于将顶点从模型空间变换到视图空间。

in vec3 position;   // 输入的顶点位置
in vec2 uv;         // 输入的纹理坐标

out vec2 vUv;       // 输出的纹理坐标

void main()
{
    // 将顶点位置乘以模型视图矩阵和投影矩阵，得到变换后的位置
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 将输入的纹理坐标直接传递给输出
    vUv = uv;
}