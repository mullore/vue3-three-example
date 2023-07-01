// 这段代码实现了通过位置属性和随机属性控制点的外部进度和半径，随着时间的推移使点在空间中旋转，并根据外部进度插值计算点的颜色。点的大小根据尺寸属性、大小参数和视图高度进行计算，保证点在远离相机时更大。最终绘制的点精灵效果具有变化的外部进度、颜色和大小。

#define PI 3.1415926538   // 定义圆周率常量

uniform mat4 projectionMatrix;    // 投影矩阵
uniform mat4 modelViewMatrix;     // 模型视图矩阵
uniform float uTime;              // 时间参数
uniform vec3 uInnerColor;         // 内部颜色
uniform vec3 uOuterColor;         // 外部颜色
uniform float uViewHeight;        // 视图高度
uniform float uSize;              // 点的大小

in float position;                // 位置属性
in float aSize;                   // 点的尺寸属性
in float aRandom;                 // 随机属性

out vec3 vColor;                  // 输出颜色

void main()
{
    float concentration = 0.05;   // 外部进度的初始浓度值
    float outerProgress = smoothstep(0.0, 1.0, position);
    // 计算外部进度，根据位置属性position进行插值
    // smoothstep函数用于将输入值映射到0.0到1.0之间的平滑过渡范围内

    outerProgress = mix(concentration, outerProgress, pow(aRandom, 1.7));
    // 使用随机属性aRandom对外部进度进行调整，使用幂函数进行非线性映射

    float radius = 1.0 + outerProgress * 5.0;
    // 根据外部进度计算半径，使其范围从1.0到6.0

    float angle = outerProgress - uTime * (1.0 - outerProgress) * 3.0;
    // 计算角度，根据外部进度和时间参数进行调整

    vec3 newPosition = vec3(
        sin(angle) * radius,
        0.0,
        cos(angle) * radius
    );
    // 根据计算得到的角度和半径，计算出新的位置坐标

    vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
    // 将新的位置坐标应用模型视图矩阵进行变换

    gl_Position = projectionMatrix * modelViewPosition;
    // 应用投影矩阵进行变换，得到最终的裁剪空间坐标


    gl_PointSize = aSize * uSize * uViewHeight;
    // 计算点的大小，将尺寸属性aSize、大小参数uSize和视图高度参数uViewHeight相乘

    gl_PointSize *= (1.0 / - modelViewPosition.z);
    // 根据模型视图坐标的z分量进行调整，使点在远离相机时更大

    vColor = mix(uInnerColor, uOuterColor, outerProgress);
    // 根据外部进度插值计算颜色，将内部颜色uInnerColor和外部颜色uOuterColor进行插值
}