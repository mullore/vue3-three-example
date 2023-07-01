
// 假设你已经了解基本的C++编程和着色器编程的知识。它使用了向量和矩阵操作，因此你可能需要了解一些基本的线性代数知识。此外，这段代码是为3D Perlin噪声而编写的，如果你需要2D或4D Perlin噪声，你需要相应地进行修改。

//	Classic Perlin 3D Noise
//	by Stefan Gustavson
//
// 生成随机梯度向量的表格
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

// 用于快速计算平方根倒数的函数
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

// 缓动函数
vec4 fade(vec4 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Perlin噪声生成函数
float perlin4d(vec4 P){
  // 将 P 向下取整，得到索引的整数部分
  vec4 Pi0 = floor(P);

  // 将 Pi0 的每个分量加上 1.0，得到索引的整数部分 + 1
  vec4 Pi1 = Pi0 + 1.0;

  // 对 Pi0 和 Pi1 进行取模运算，确保索引在范围内（0 到 289）
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);

  // 将 P 的小数部分提取出来，用于插值
  vec4 Pf0 = fract(P);

  // 将 Pf0 减去 1.0，得到小数部分 - 1.0
  vec4 Pf1 = Pf0 - 1.0;

  // 构造用于索引的向量
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = vec4(Pi0.zzzz);
  vec4 iz1 = vec4(Pi1.zzzz);
  vec4 iw0 = vec4(Pi0.wwww);
  vec4 iw1 = vec4(Pi1.wwww);

  // 执行排列操作，用于获取梯度向量
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);


  // gx00
  vec4 gx00 = ixy00 / 7.0; // 将 ixy00 除以 7.0，得到 gx00
  vec4 gy00 = floor(gx00) / 7.0; // 将 gx00 向下取整并除以 7.0，得到 gy00
  vec4 gz00 = floor(gy00) / 6.0; // 将 gy00 向下取整并除以 6.0，得到 gz00
  gx00 = fract(gx00) - 0.5; // 对 gx00 进行小数部分处理，并减去 0.5，得到 gx00 的小数部分
  gy00 = fract(gy00) - 0.5; // 对 gy00 进行小数部分处理，并减去 0.5，得到 gy00 的小数部分
  gz00 = fract(gz00) - 0.5; // 对 gz00 进行小数部分处理，并减去 0.5，得到 gz00 的小数部分
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00); // 计算 gw00，等于 0.75 减去 gx00、gy00、gz00 的绝对值之和
  vec4 sw00 = step(gw00, vec4(0.0)); // 使用 step 函数判断 gw00 是否大于等于 0.0，将判断结果保存在 sw00 中
  gx00 -= sw00 * (step(0.0, gx00) - 0.5); // 根据 sw00 的值，通过一系列计算将 gx00 进行修正
  gy00 -= sw00 * (step(0.0, gy00) - 0.5); // 根据 sw00 的值，通过一系列计算将 gy00 进行修正


  /*这段代码主要用于生成噪声纹理中的随机值，并对其进行一系列操作和修正*/
  // 计算 gx01
  vec4 gx01 = ixy01 / 7.0;
  // 计算 gy01
  vec4 gy01 = floor(gx01) / 7.0;
  // 计算 gz01
  vec4 gz01 = floor(gy01) / 6.0;
  // 计算 gx01 的小数部分，并进行偏移
  gx01 = fract(gx01) - 0.5;
  // 计算 gy01 的小数部分，并进行偏移
  gy01 = fract(gy01) - 0.5;
  // 计算 gz01 的小数部分，并进行偏移
  gz01 = fract(gz01) - 0.5;
  // 计算 gw01
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  // 计算 sw01，当 gw01 大于等于 0.0 时为 1.0，否则为 0.0
  vec4 sw01 = step(gw01, vec4(0.0));
  // 根据 sw01 进行修正，如果 gx01 大于 0.0，则减去 0.5，否则加上 0.5
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  // 根据 sw01 进行修正，如果 gy01 大于 0.0，则减去 0.5，否则加上 0.5
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);


  /*这段代码与前面提供的代码类似，用于生成噪声纹理中的随机值，并进行一系列操作和修正。*/
  // 计算 gx10
  vec4 gx10 = ixy10 / 7.0;
  // 计算 gy10
  vec4 gy10 = floor(gx10) / 7.0;
  // 计算 gz10
  vec4 gz10 = floor(gy10) / 6.0;
  // 计算 gx10 的小数部分，并进行偏移
  gx10 = fract(gx10) - 0.5;
  // 计算 gy10 的小数部分，并进行偏移
  gy10 = fract(gy10) - 0.5;
  // 计算 gz10 的小数部分，并进行偏移
  gz10 = fract(gz10) - 0.5;
  // 计算 gw10
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  // 计算 sw10，当 gw10 大于等于 0.0 时为 1.0，否则为 0.0
  vec4 sw10 = step(gw10, vec4(0.0));
  // 根据 sw10 进行修正，如果 gx10 大于 0.0，则减去 0.5，否则加上 0.5
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  // 根据 sw10 进行修正，如果 gy10 大于 0.0，则减去 0.5，否则加上 0.5
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  /*这段代码与之前的代码类似，用于生成噪声纹理中的随机值，并进行一系列操作和修正。*/
  // 计算 gx11
  vec4 gx11 = ixy11 / 7.0;
  // 计算 gy11
  vec4 gy11 = floor(gx11) / 7.0;
  // 计算 gz11
  vec4 gz11 = floor(gy11) / 6.0;
  // 计算 gx11 的小数部分，并进行偏移
  gx11 = fract(gx11) - 0.5;
  // 计算 gy11 的小数部分，并进行偏移
  gy11 = fract(gy11) - 0.5;
  // 计算 gz11 的小数部分，并进行偏移
  gz11 = fract(gz11) - 0.5;
  // 计算 gw11
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  // 计算 sw11，当 gw11 大于等于 0.0 时为 1.0，否则为 0.0
  vec4 sw11 = step(gw11, vec4(0.0));
  // 根据 sw11 进行修正，如果 gx11 大于 0.0，则减去 0.5，否则加上 0.5
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  // 根据 sw11 进行修正，如果 gy11 大于 0.0，则减去 0.5，否则加上 0.5
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);


  /*这段代码使用了 taylorInvSqrt 函数来计算向量的模长的倒数，然后将每个分量归一化。通过计算每个向量的模长的倒数，我们可以保证向量的长度在单位范围内，从而避免过大或过小的影响。*/

  // 计算 g0000 的模长的倒数并归一化
  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  // 计算 g0001 的模长的倒数并归一化
  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  // 计算 g0010 的模长的倒数并归一化
  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  // 计算 g0011 的模长的倒数并归一化
  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  // 计算每个顶点的梯度向量与 Pf 的点乘结果
  /*这段代码计算了每个顶点（Pf0 和 Pf1）与对应梯度向量的点乘结果，用于计算噪声值。点乘结果存储在对应的 n0000、n1000、n0100、n1100、n0010、n1010、n0110、n1110、n0001、n1001、n0101、n1101、n0011、n1011、n0111、n1111 变量中*/
  // 这些值将用于后续的插值计算和生成最终的噪声值。
  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
  float n1111 = dot(g1111, Pf1);

  /* 这段代码使用淡出函数 fade() 对 Pf0 进行插值和缩放，以生成最终的噪声值。
   通过在每个轴上进行插值操作，从 n0000、n1000、n0100、n1100、n0010、n1010、n0110、n1110、n0001、n1001、n0101、n1101、n0011、n1011、n0111、n1111 中获取相应的值，
   并在每个轴上进行插值操作。最终，将插值结果乘以一个缩放因子 2.2，然后返回作为最终的噪声值。*/

  // 计算淡出函数对 Pf0 的应用
  vec4 fade_xyzw = fade(Pf0);
  // 在 w 轴方向上进行插值
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  // 在 z 轴方向上进行插值
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  // 在 y 轴方向上进行插值
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  // 在 x 轴方向上进行插值，得到最终的噪声值
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  // 返回经过缩放的噪声值
  return 2.2 * n_xyzw;
}
