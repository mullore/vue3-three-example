

// 该代码通过调用 perlin3dPeriodic 函数，
// 在给定纹理坐标和频率参数的情况下，计算出三个分量的噪声值，并将其作为颜色输出。噪声值的范围在 [0, 1] 之间，通过归一化后分别赋值给 pc_FragColor 的 RGB 分量，最终输出一个彩色的噪声图像。

precision highp float;
precision highp int;

in vec2 vUv;   // 输入的纹理坐标信息

vec3 mod289(vec3 x)
{
  // 将向量的每个分量乘以 1.0/289.0 并向下取整，然后再乘以 289.0
  // 目的是将向量的每个分量映射到 0-289 的范围内
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  // 同上，对四维向量进行相同的操作
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  // 对输入向量进行置换操作
  // 先将向量每个分量乘以 34.0，再加上常数 10.0，再乘以原始向量 x
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  // 使用 Taylor 级数展开计算倒数的近似值
  // 先将 r 乘以常数 0.85373472095314，再减去常数 1.79284291400159
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  // 渐变函数，用于平滑过渡
  // 对输入向量的每个分量进行 t^3*(t*(t*6.0-15.0)+10.0) 的计算
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float perlin3dPeriodic(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  // 将 P 的每个分量向下取整，并对每个分量取模得到周期内的整数部分 Pi0
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  // Pi0 加上 1.0 再取模得到整数部分加 1 的结果 Pi1
  Pi0 = mod289(Pi0);
  // 将 Pi0 中的每个分量映射到 0-289 的范围内
  Pi1 = mod289(Pi1);
  // 将 Pi1 中的每个分量映射到 0-289 的范围内
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  // 将 P 的小数部分提取出来用于插值
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  // 小数部分减去 1.0 得到 Pf1，用于插值计算
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  // 构造一个向量 ix，包含了 Pi0.x, Pi1.x, Pi0.x, Pi1.x 四个分量
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  // 构造一个向量 iy，包含了 Pi0.y, Pi1.y 两个分量
  vec4 iz0 = Pi0.zzzz;
  // 构造一个向量 iz0，包含了 Pi0.z 四个分量
  vec4 iz1 = Pi1.zzzz;
  // 构造一个向量 iz1，包含了 Pi1.z 四个分量

  vec4 ixy = permute(permute(ix) + iy);
  // 对 ix 进行置换，并将结果与 iy 相加，再进行置换得到 ixy
  vec4 ixy0 = permute(ixy + iz0);
  // ixy 和 iz0 相加再进行置换得到 ixy0
  vec4 ixy1 = permute(ixy + iz1);
  // ixy 和 iz1 相加再进行置换得到 ixy1

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  // ixy0 的每个分量乘以常数 1/7 得到 gx0
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  // gx0 向下取整并乘以常数 1/7，再对结果取小数部分，再减去常数 0.5，得到 gy0
  gx0 = fract(gx0);
  // 对 gx0 的每个分量取小数部分
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  // 构造一个向量 gz0，其中每个分量等于 0.5 减去 gx0 的绝对值再减去 gy0 的绝对值
  vec4 sz0 = step(gz0, vec4(0.0));
  // 对 gz0 的每个分量与 0.0 进行 step 函数的比较，得到一个由 0 和 1 组成的向量 sz0
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  // 对 gx0 的每个分量进行修正

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  // ixy1 的每个分量乘以常数 1/7 得到 gx1
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  // gx1 向下取整并乘以常数 1/7，再对结果取小数部分，再减去常数 0.5，得到 gy1
  gx1 = fract(gx1);
  // 对 gx1 的每个分量取小数部分
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  // 构造一个向量 gz1，其中每个分量等于 0.5 减去 gx1 的绝对值再减去 gy1 的绝对值
  vec4 sz1 = step(gz1, vec4(0.0));
  // 对 gz1 的每个分量与 0.0 进行 step 函数的比较，得到一个由 0 和 1 组成的向量 sz1
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  // 对 gx1 的每个分量进行修正

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  // 构造一个向量 g000，其中每个分量等于 gx0.x, gy0.x, gz0.x
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  // 构造一个向量 g100，其中每个分量等于 gx0.y, gy0.y, gz0.y
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  // 构造一个向量 g010，其中每个分量等于 gx0.z, gy0.z, gz0.z
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  // 构造一个向量 g110，其中每个分量等于 gx0.w, gy0.w, gz0.w
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  // 构造一个向量 g001，其中每个分量等于 gx1.x, gy1.x, gz1.x
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  // 构造一个向量 g101，其中每个分量等于 gx1.y, gy1.y, gz1.y
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  // 构造一个向量 g011，其中每个分量等于 gx1.z, gy1.z, gz1.z
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  // 构造一个向量 g111，其中每个分量等于 gx1.w, gy1.w, gz1.w

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  // 对 g000, g010, g100, g110 的长度进行归一化
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  // 对 g001, g011, g101, g111 的长度进行归一化
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  // 将 g000 和 Pf0 进行点乘
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  // 将 g100 和 Pf1.x, Pf0.yz 进行点乘
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  // 将 g010 和 Pf0.x, Pf1.y, Pf0.z 进行点乘
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  // 将 g110 和 Pf1.xy, Pf0.z 进行点乘
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  // 将 g001 和 Pf0.xy, Pf1.z 进行点乘
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  // 将 g101 和 Pf1.x, Pf0.y, Pf1.z 进行点乘
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  // 将 g011 和 Pf0.x, Pf1.yz 进行点乘
  float n111 = dot(g111, Pf1);
  // 将 g111 和 Pf1 进行点乘

  vec3 fade_xyz = fade(Pf0);
  // 对 Pf0 应用渐变函数
  vec4 fade_xyzw = vec4(fade_xyz.x, fade_xyz.y, fade_xyz.z, fade(Pf1));
  // 对 Pf0 和 Pf1 分别应用渐变函数得到 fade_xyz 和 fade(Pf1)，构造 fade_xyzw

  vec4 n_0 = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyzw.z);
  // 在 n000, n100, n010, n110 和 n001, n101, n011, n111 之间进行线性插值，权重由 fade_xyzw.z 控制
  vec2 n_1 = mix(n_0.xy, n_0.zw, fade_xyzw.y);
  // 在 n_0.xy 和 n_0.zw 之间进行线性插值，权重由 fade_xyzw.y 控制
  float n_2 = mix(n_1.x, n_1.y, fade_xyzw.x);
  // 在 n_1.x 和 n_1.y 之间进行线性插值，权重由 fade_xyzw.x 控制

  return 2.2 * n_2;
  // 将结果乘以常数 2.2 并返回
}

layout(location = 0) out vec4 pc_FragColor;   // 输出的颜色值

void main()
{
    float uFrequency = 8.0;   // 噪声频率参数

    // 计算纹理坐标经过噪声函数的结果，并进行归一化处理
    float noiseR = perlin3dPeriodic(vec3(vUv * uFrequency, 123.456), vec3(uFrequency)) * 0.5 + 0.5;
    float noiseG = perlin3dPeriodic(vec3(vUv * uFrequency, 456.789), vec3(uFrequency)) * 0.5 + 0.5;
    float noiseB = perlin3dPeriodic(vec3(vUv * uFrequency, 789.123), vec3(uFrequency)) * 0.5 + 0.5;

    pc_FragColor = vec4(noiseR, noiseG, noiseB, 1.0);   // 将噪声值作为颜色输出
    // pc_FragColor = vec4(0, 0, 0, 1.0);   // 将噪声值作为颜色输出
}