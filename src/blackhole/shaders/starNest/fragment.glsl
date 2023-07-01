precision highp float;
precision highp int;


uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_mouse;


#define iMouse            u_mouse
#define iTime            u_time
#define iResolution      u_resolution
float TK = 1.;
float PI = 3.1415926535;

// 定义迭代次数
#define iterations 17
// 定义形态参数
#define formuparam 0.53

// 定义体素步数
// #define volsteps 20
#define volsteps 2
// 定义步长
#define stepsize 0.1

// 定义缩放因子
#define zoom 0.800
// 定义平铺因子
#define tile 0.850
// 定义速度
#define speed 0.010

// 定义亮度
#define brightness 0.0015
// 定义暗物质
#define darkmatter 0.300
// 定义距离衰减
#define distfading 0.730
// 定义饱和度
#define saturation 0.850

layout(location = 0) out vec4 pc_FragColor;

void main() {
	// 获取像素坐标和方向
	// 将像素坐标转换为uv坐标。gl_FragCoord.xy表示当前像素的坐标，iResolution.xy表示屏幕分辨率。
	// 将得到的坐标除以分辨率，并减去0.5，将坐标范围映射到[-0.5, 0.5]区间。
	vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
	// 根据屏幕宽高比进行纵向的缩放。将纵坐标乘以iResolution.y/iResolution.x，实现纵向坐标与横向坐标相同比例的缩放。
	uv.y *= iResolution.y / iResolution.x;
	// 根据缩放后的uv坐标和缩放因子zoom，构建一个三维方向向量。将uv乘以zoom得到缩放后的uv坐标，然后将其与z轴上的1.0组成一个三维向量。
	vec3 dir = vec3(uv * zoom, 1.0);
	// 根据时间参数iTime和速度因子speed计算时间值。将iTime乘以speed并加上0.25，得到最终的时间值。
	float time = iTime * speed + 0.25;

	// 鼠标旋转
	// 根据鼠标在x轴上的位置，将其归一化到[0, 1]范围内，并乘以2后加上0.5，得到旋转角度a1。这个角度用于控制摄像机的水平旋转。
	float a1 = 0.5 + iMouse.x / iResolution.x * 2.0;
	// 根据鼠标在y轴上的位置，将其归一化到[0, 1]范围内，并乘以2后加上0.8，得到旋转角度a2。这个角度用于控制摄像机的垂直旋转。
	float a2 = 0.8 + iMouse.y / iResolution.y * 2.0;
	// 根据角度a1构建一个2x2的旋转矩阵rot1。该矩阵用于在xz平面上旋转dir向量。
	mat2 rot1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
	// 根据角度a2构建一个2x2的旋转矩阵rot2。该矩阵用于在xy平面上旋转dir和from向量。
	mat2 rot2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));
	// 将dir向量在xz平面上应用rot1旋转矩阵，实现水平旋转效果。
	dir.xz *= rot1;
	// 将dir向量在xy平面上应用rot2旋转矩阵，实现垂直旋转效果。
	dir.xy *= rot2;
	// 设置摄像机的起始位置from为(1.0, 0.5, 0.5)。
	vec3 from = vec3(1.0, 0.5, 0.5);
	// 根据时间值time对摄像机的起始位置进行平移。将时间值time乘以2后加到from的x和y坐标上，同时将-2加到from的z坐标上。
	from += vec3(time * 2.0, time, -2.0);

	// 将from向量在xz平面上应用rot1旋转矩阵，保持与dir的水平旋转一致。
	from.xz *= rot1;
	// 将from向量在xy平面上应用rot2旋转矩阵，保持与dir的垂直旋转一致。
	from.xy *= rot2;

	// 体积渲染
	float s = 0.1, fade = 1.0;  //初始化步长s和衰减因子fade。
	vec3 v = vec3(0.0); //初始化最终的颜色向量v。
		for (int r = 0; r < volsteps; r++) {
			// 计算当前采样点p的位置，通过从起始位置from出发，按照步长s沿着dir方向前进的距离的一半。
			vec3 p = from + s * dir * 0.5;
			// 对采样点p进行平铺折叠，使其在指定的范围内循环。
			p = abs(vec3(tile) - mod(p, vec3(tile * 2.0))); // 平铺折叠
			float pa, a = pa = 0.0;
			// 初始化前一次采样点的距离pa和当前距离a。
			for (int i = 0; i < iterations; i++) {
				p = abs(p) / dot(p, p) - formuparam; // 根据神奇的公式对采样点p进行变换，得到新的采样点。该公式用于产生有趣的形状。
				a += abs(length(p) - pa); //计算平均变化的绝对和，用于增加图像的细节和纹理。
				pa = length(p); //更新前一次采样点的距离。
			}
			float dm = max(0.0, darkmatter - a * a * 0.001); // 根据平均变化的绝对和计算暗物质的强度。较大的变化会减少暗物质的影响。
			a *= a * a; // 增加对比度，将距离变化的平均和乘以自身的平方
			if (r > 6) fade *= 1.0 - dm; // 如果渲染步骤大于6，则根据暗物质的强度减少衰减因子fade，避免在暗物质附近渲染。
			v += fade; //累加衰减因子fade，用于控制整体颜色的亮度。
			v += vec3(s, s * s, s * s * s * s) * a * brightness * fade;
			// 根据距离和颜色参数，将采样点的颜色叠加到最终的颜色向量v中。根据步长s的不同次方，可以产生不同程度的颜色叠加效果
			fade *= distfading; // 根据距离衰减因子distfading，减小衰减因子fade的值
			s += stepsize; //增加步长s，进行下一次采样

		}
	v = mix(vec3(length(v)), v, saturation); // 调整颜色
	pc_FragColor = vec4(v * 0.01, 1.0);
	// pc_FragColor = vec4(1.0,1.0,1.0, 1.0);
}
