

// 这段代码实现了一个简单的径向渐变效果。它根据输入的纹理坐标计算出与中心距离的强度值，并将该强度值作为红色通道的值输出。通过调整距离中心的距离和映射范围，可以控制渐变的形状和强度。

// 具体效果是，从纹理坐标的中心开始，向外辐射的区域颜色逐渐减弱。距离中心越远，强度越低，距离中心越近，强度越高。这样就实现了一个径向渐变的效果，中心颜色较强，边缘颜色较弱。

// 该效果可以用于各种图形渲染和图像处理的场景，例如创建光照效果、制作辐射状的纹理、创建渐变背景等。


precision highp float;   // 高精度浮点数精度限定词
precision highp int;     // 高精度整数精度限定词

in vec2 vUv;             // 输入的纹理坐标

layout(location = 0) out vec4 pc_FragColor;   // 片段着色器的输出颜色

float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

void main()
{
    float distanceToCenter = length(vUv - 0.5);   // 计算纹理坐标到中心的距离
    float radialStrength = remap(distanceToCenter, 0.0, 0.15, 1.0, 0.0);   // 将距离映射为强度值
    radialStrength = smoothstep(0.0, 1.0, radialStrength);   // 对强度值进行平滑过渡

    // float gradientStrength = abs(vUv.y - 0.5) * 20.0;
    // gradientStrength = smoothstep(0.0, 1.0, gradientStrength);

    float strength = radialStrength;   // 使用径向强度作为最终的强度值

    // pc_FragColor.r = strength;   // 将强度值赋给输出颜色的红色通道
    pc_FragColor = vec4(strength, 1.0, 1.0, 1.0);   // 将强度值作为输出颜色的红色通道，并设置其他通道为1.0
    // pc_FragColor = vec4(1.0, 1.0, 1.0, 1.0);   // 将强度值作为输出颜色的红色通道，并设置其他通道为1.0
}