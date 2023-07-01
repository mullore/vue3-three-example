// 定义常量 PI
#define PI 3.1415926538

// 声明投影矩阵和模型视图矩阵的 uniform 变量
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

// 输入变量，表示顶点位置、点的大小和顶点颜色
in vec3 position;

void main()
{
    // 根据模型视图矩阵对顶点进行变换
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    // 计算变换后的顶点位置，并将其乘以投影矩阵得到最终的裁剪空间位置
    // gl_Position = projectionMatrix * modelViewPosition;
    gl_Position = vec4(position, 1.0);

    // 设置点的大小，乘以顶点属性中的大小和大小 uniform 变量以及视图高度
    gl_PointSize = 1.0;


}