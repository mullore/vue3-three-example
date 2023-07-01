// 这段代码是一个简单的片段着色器，其作用是根据顶点到纹理坐标中心点的距离来确定片段的颜色和透明度，实现了一个径向渐变效果。
// 渲染出的图形将具有以红色为中心向外呈现径向渐变的效果，并且在距离中心点较远的区域会有较低的透明度，从而形成一个局部的径向渐变效果。

// 设置浮点数和整数的精度
precision highp float;
precision highp int;

// 输入纹理坐标
in vec2 vUv;

// 输出片段颜色
layout(location = 0) out vec4 pc_FragColor;

// 根据给定值在最小值和最大值之间进行反线性插值
float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}

// 将给定值从输入范围映射到输出范围
float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    // 计算归一化的插值参数
    float t = inverseLerp(v, inMin, inMax);
    // 使用插值参数对输出范围进行线性插值
    return mix(outMin, outMax, t);
}

void main()
{
    // 计算顶点到中心点的距离
    float distanceToCenter = length(vUv - vec2(0.5));
    // 根据距离计算径向强度，将距离映射到0.0到0.15范围内的强度值
    float radialStrength = remap(distanceToCenter, 0.0, 0.15, 1.0, 0.0);
    // 使用平滑阶梯函数对径向强度进行过渡，使其在0.0到1.0之间变化
    radialStrength = smoothstep(0.0, 1.0, radialStrength);

    // 计算顶点到中心点距离在0.4到0.5范围内的透明度
    float alpha = smoothstep(0.0, 1.0, remap(distanceToCenter, 0.4, 0.5, 1.0, 0.0));

    // 设置片段颜色，使用径向强度作为红色通道值，其它通道值为0，透明度使用计算得到的alpha值
    pc_FragColor = vec4(radialStrength, 0.0, 0.0, alpha);
    // pc_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}