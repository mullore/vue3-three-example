

// 这段代码是一个用于渲染动态墙效果的片段着色器（Fragment Shader）。它通过迭代计算，在屏幕上绘制出一系列具有颜色和强度变化的环形图案，形成了动态墙的效果。 （星空粒子）
// 设置浮点数精度
precision highp float;
precision highp int;

// uniform变量
uniform float uTime;                 // 时间
uniform sampler2D uNoiseTexture;      // 噪声纹理
uniform vec3 uInnerColor;             // 内部颜色
uniform vec3 uOuterColor;             // 外部颜色

// 输入变量
in vec2 vUv;

// 输出变量
layout(location = 0) out vec4 pc_FragColor;

// 线性插值的反函数
float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}

// 值映射函数
float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}

// 颜色叠加函数
float blendAdd(float base, float blend)
{
    return min(base + blend, 1.0);
}

// 颜色叠加函数
vec3 blendAdd(vec3 base, vec3 blend)
{
    return min(base + blend, vec3(1.0));
}

// 颜色叠加函数
vec3 blendAdd(vec3 base, vec3 blend, float opacity)
{
    return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{
    // 初始化颜色
    vec4 color = vec4(0.0);
    color.a = 1.0;

    // 迭代次数
    float iterations = 3.0;

    // 迭代计算
    for (float i = 0.0; i < iterations; i++)
    {
        // 计算进度
        float progress = i / (iterations - 1.0);

        // 计算强度
        float intensity = 1.0 - ((vUv.y - progress) * iterations) * 0.5;
        intensity = smoothstep(0.0, 1.0, intensity);

        // 计算纹理坐标
        vec2 uv = vUv;
        uv.y *= 2.0;
        uv.x += uTime / ((i * 10.0) + 1.0);

        // 获取噪声强度
        float noiseIntensity = texture(uNoiseTexture, uv).r;

        // 根据进度混合颜色
        vec3 ringColor = mix(uInnerColor, uOuterColor, progress);

        // 根据噪声强度和强度调整环的颜色
        ringColor = mix(vec3(0.0), ringColor.rgb, noiseIntensity * intensity);

        // 颜色叠加
        color.rgb = blendAdd(color.rgb, ringColor);
    }

    // 边缘衰减
    float edgesAttenuation = min(inverseLerp(vUv.y, 0.0, 0.02), inverseLerp(vUv.y, 1.0, 0.5));
    color.rgb = mix(vec3(0.0), color.rgb, edgesAttenuation);

    // 输出颜色
    pc_FragColor = color;
    // pc_FragColor = vec4(1.0,1.0,1.0,1.0);
}