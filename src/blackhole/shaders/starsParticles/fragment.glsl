// 这段代码中，通过计算片段距离中心点的距离，判断片段是否在一个半径为0.5的圆内。
// 如果片段距离中心点的距离超过0.5，则丢弃该片段，即不进行渲染。否则，将片段的颜色设置为输入的顶点颜色，并将透明度设置为1.0。最终的颜色值存储在 pc_FragColor 变量中，将被输出到屏幕上。

// 设置浮点数和整数的高精度精度限定词
precision highp float;
precision highp int;

// 定义输出颜色变量
layout(location = 0) out vec4 pc_FragColor;

// 输入变量，表示顶点的颜色
in vec3 vColor;

void main()
{
    // 计算当前片段距离中心点的距离
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));

    // 如果距离中心点的距离大于0.5，则丢弃该片段
    if (distanceToCenter > 0.5)
        discard;

    // 将片段颜色设置为输入的顶点颜色，并设置透明度为1.0
    pc_FragColor = vec4(vColor, 1.0);
    // pc_FragColor = vec4(1.0,1.0,1.0, 1.0);
}