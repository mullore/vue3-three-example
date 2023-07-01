
// 这段代码的作用是绘制点精灵（Point Sprite），根据片段相对于点精灵中心的距离来决定片段是否进行渲染。超过中心距离的片段将被丢弃，只保留距离中心0.5范围内的片段。最终的颜色值由顶点着色器传递的颜色值vColor和固定的透明度0.5组合而成。

precision highp float;           // 浮点数精度修饰符
precision highp int;             // 整数精度修饰符

layout(location = 0) out vec4 pc_FragColor;   // 输出颜色值到缓冲区的片段着色器输出

in vec3 vColor;                   // 从顶点着色器传递过来的顶点颜色值

void main()
{
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    // 计算片段相对于点精灵中心的距离，使用gl_PointCoord表示当前片段在点精灵上的坐标
    // vec2(0.5)表示点精灵的中心坐标，即(0.5, 0.5)

    if (distanceToCenter > 0.5)
        discard;
    // 如果片段距离中心超过了0.5的距离，丢弃该片段，不进行渲染

    pc_FragColor = vec4(vColor, 0.5);
    // pc_FragColor = color;
    // 将顶点颜色值vColor与透明度0.5组合成vec4，并赋值给片段着色器的输出颜色pc_FragColor
}