
// 该代码通过使用空间纹理和扭曲纹理，根据扭曲强度和黑洞位置对纹理进行扭曲。然后，使用RGB偏移将扭曲后的纹理采样到屏幕上。通过调整参数，可以实现不同程度的图像扭曲和RGB偏移效果。


#define PI 3.1415926538   // 定义圆周率常量

precision highp float;
precision highp int;

in vec2 vUv;   // 输入的纹理坐标

uniform sampler2D uSpaceTexture;         // 空间纹理采样器
uniform sampler2D uDistortionTexture;    // 扭曲纹理采样器
uniform vec2 uBlackHolePosition;         // 黑洞位置
uniform float uRGBShiftRadius;           // RGB偏移半径

layout(location = 0) out vec4 pc_FragColor;   // 输出颜色



// 获取经过RGB偏移的颜色
vec3 getRGBShiftedColor(sampler2D _texture, vec2 _uv, float _radius)
{
    vec3 angle = vec3(
        PI * 2.0 / 3.0,
        PI * 4.0 / 3.0,
        0
    );
    vec3 color = vec3(0.0);

    // 使用纹理采样对三个通道进行偏移
    color.r = texture(_texture, _uv + vec2(sin(angle.r) * _radius, cos(angle.r) * _radius)).r;
    color.g = texture(_texture, _uv + vec2(sin(angle.g) * _radius, cos(angle.g) * _radius)).g;
    color.b = texture(_texture, _uv + vec2(sin(angle.b) * _radius, cos(angle.b) * _radius)).b;

    return color;
}

void main()
{
    vec4 distortionColor = texture(uDistortionTexture, vUv);
    float distortionIntensity = distortionColor.r;

    // 根据扭曲纹理的R通道值获取扭曲强度
    // distortionIntensity /= 4.0;

    vec2 towardCenter = vUv - uBlackHolePosition;
    towardCenter *= - distortionIntensity * 2.0;

    // 根据扭曲强度和黑洞位置计算朝向中心的向量
    // 向量方向与强度成比例，并取负值使其朝向黑洞

    // towardCenter *= 0.0;   // 可以取消注释以禁用朝向中心的效果

    vec2 distortedUv = vUv + towardCenter;

    // 使用扭曲后的纹理坐标采样空间纹理，并应用RGB偏移
    vec3 outColor = getRGBShiftedColor(uSpaceTexture, distortedUv, uRGBShiftRadius);

    pc_FragColor = vec4(outColor, 1.0);   // 输出最终的颜色
    // pc_FragColor = vec4(0.0,0.0,0.0, 1.0);   // 输出最终的颜色
    // pc_FragColor = distortionColor;   // 可以取消注释以直接输出扭曲纹理的颜色
}