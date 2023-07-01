<script setup lang="ts">
// 转载 https://juejin.cn/post/7168627514615529508#heading-3
import * as THREE from 'three';
// 装three.js最常用的一些功能，并且使项目的结构也能变得更加清楚
import * as kokomi from 'kokomi.js';
// 动画库
import gsap from 'gsap';
// ShuffleText 是一款纯js文字洗牌式切换特效插件。该插件在鼠标滑过指定的文本时，文字会不停的逐个进行翻转，类似洗牌效果，非常炫酷。
import ShuffleText from 'shuffle-text';
import { onMounted } from 'vue';
const vertexShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

varying vec3 vNormal;
varying vec4 vMvPosition;
varying vec3 vPosition;

uniform vec2 uMouse;
uniform float uRandom;
uniform float uLayerId;

// transform
mat2 rotation2d(float angle){
    float s=sin(angle);
    float c=cos(angle);

    return mat2(
        c,-s,
        s,c
    );
}

mat4 rotation3d(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;

    return mat4(
        oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
        0.,0.,0.,1.
    );
}

vec2 rotate(vec2 v,float angle){
    return rotation2d(angle)*v;
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    return(rotation3d(axis,angle)*vec4(v,1.)).xyz;
}

vec3 distort(vec3 p){
    vec3 tx1=vec3(-uMouse.x*uRandom*.05,-uMouse.y*uRandom*.02,0.);
    p+=tx1;

    float angle=iTime*uRandom;
    p=rotate(p,vec3(0.,1.,0.),angle);

    vec3 tx2=vec3(-uMouse.x*uRandom*.5,-uMouse.y*uRandom*.2,0.);
    p+=tx2;

    p*=(.6-uLayerId*.5);

    return p;
}

void main(){
    vec3 p=position;
    vec3 N=normal;

    p=distort(p);
    N=distort(N);

    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);

    vUv=uv;

    vNormal=N;
    vMvPosition=modelViewMatrix*vec4(p,1.);
    vPosition=p;
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

varying vec3 vNormal;
varying vec4 vMvPosition;
varying vec3 vPosition;

uniform sampler2D uTexture;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uRandom;
uniform vec2 uMouse;

// transform
mat2 rotation2d(float angle){
    float s=sin(angle);
    float c=cos(angle);

    return mat2(
        c,-s,
        s,c
    );
}

mat4 rotation3d(vec3 axis,float angle){
    axis=normalize(axis);
    float s=sin(angle);
    float c=cos(angle);
    float oc=1.-c;

    return mat4(
        oc*axis.x*axis.x+c,oc*axis.x*axis.y-axis.z*s,oc*axis.z*axis.x+axis.y*s,0.,
        oc*axis.x*axis.y+axis.z*s,oc*axis.y*axis.y+c,oc*axis.y*axis.z-axis.x*s,0.,
        oc*axis.z*axis.x-axis.y*s,oc*axis.y*axis.z+axis.x*s,oc*axis.z*axis.z+c,0.,
        0.,0.,0.,1.
    );
}

vec2 rotate(vec2 v,float angle){
    return rotation2d(angle)*v;
}

vec3 rotate(vec3 v,vec3 axis,float angle){
    return(rotation3d(axis,angle)*vec4(v,1.)).xyz;
}

// lighting
float saturate(float a){
    return clamp(a,0.,1.);
}

float diffuse(vec3 n,vec3 l){
    float diff=saturate(dot(n,l));
    return diff;
}

float specular(vec3 n,vec3 l,float shininess){
    float spec=pow(saturate(dot(n,l)),shininess);
    return spec;
}

float blendSoftLight(float base,float blend){
    return(blend<.5)?(2.*base*blend+base*base*(1.-2.*blend)):(sqrt(base)*(2.*blend-1.)+2.*base*(1.-blend));
}

vec3 blendSoftLight(vec3 base,vec3 blend){
    return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

// distort
vec2 distort(vec2 p){
    vec2 m=uMouse;

    p.x-=(uRandom-m.x*.8)*.5;
    p.y-=uRandom*.1-iTime*.1;

    p.x-=.25;
    p.y-=.5;
    p=rotate(p,uRandom);
    p*=2.;
    return p;
}

vec3 distortNormal(vec3 p){
    p*=vec3(-1.*uRandom*15.,-1.*uRandom*15.,30.5);
    return p;
}

// lighting
vec4 lighting(vec3 tex,vec3 normal){
    vec4 viewLightPosition=viewMatrix*vec4(uLightPosition,0.);
    vec3 N=normalize(normal);
    vec3 L=normalize(viewLightPosition.xyz);

    vec3 dif=tex*uLightColor*diffuse(N,L);

    vec3 C=-normalize(vMvPosition.xyz);
    vec3 R=reflect(-L,N);

    vec3 spe=uLightColor*specular(R,C,500.);

    vec4 lightingColor=vec4(dif+spe,.5);

    vec3 softlight=blendSoftLight(tex,spe);
    float dotRC=dot(R,C);
    float theta=acos(dotRC/length(R)*length(C));
    float a=1.-theta*.3;

    vec4 col=vec4(tex,a*.01)+vec4(softlight,.02)+(lightingColor*a);
    return col;
}

void main(){
    vec2 p=vUv;
    vec3 N=vNormal;

    p=distort(p);

    N=distortNormal(N);

    vec4 tex=texture2D(uTexture,p);

    vec4 col=tex;

    col=lighting(tex.xyz,N);

    gl_FragColor=col;
}
`;

const vertexShader2 = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

void main(){
    vec3 p=position;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);

    vUv=uv;
}
`;

const fragmentShader2 = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

uniform sampler2D tDiffuse;

varying vec2 vUv;

uniform float uRGBShift;

vec4 RGBShift(sampler2D t,vec2 rUv,vec2 gUv,vec2 bUv){
    vec4 color1=texture2D(t,rUv);
    vec4 color2=texture2D(t,gUv);
    vec4 color3=texture2D(t,bUv);
    vec4 color=vec4(color1.r,color2.g,color3.b,color2.a);
    return color;
}

highp float random(vec2 co)
{
    highp float a=12.9898;
    highp float b=78.233;
    highp float c=43758.5453;
    highp float dt=dot(co.xy,vec2(a,b));
    highp float sn=mod(dt,3.14);
    return fract(sin(sn)*c);
}

void main(){
    vec2 p=vUv;

    vec4 col=vec4(0.);

    // RGB Shift
    float n=random(p+mod(iTime,1.))*.1+.5;
    vec2 offset=vec2(cos(n),sin(n))*.0025*uRGBShift;
    vec2 rUv=p+offset;
    vec2 gUv=p;
    vec2 bUv=p-offset;
    col=RGBShift(tDiffuse,rUv,gUv,bUv);

    gl_FragColor=col;
}
`;
// 多边形形状
// 这就要用到kokomi.js的这2个函数createPolygonShape和polySort：前者能接收一系列的点来创造一个多边形Shape，后者能给无序的点进行排序以符合多边形的描画
// 创建形状Shape后，再传进ExtrudeGeometry将其3D化成geometry即可，这里depth等值故意设得很小，是为了模拟玻璃碎片的纤细程度

class Fragment extends kokomi.Component {
  points: any;
  mesh: any;
  uj: any;
  constructor(base: any, config = {}) {
    super(base);

    const { material, points } = config as any;

    this.points = kokomi.polySort(points);

    // const geometry = new THREE.PlaneGeometry(0.1, 0.1, 16, 16);

    const shape = kokomi.createPolygonShape(this.points, {
      scale: 0.01,
    });
    const geometry = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.0001,
      bevelEnabled: true,
      bevelThickness: 0.0005,
      bevelSize: 0.0005,
      bevelSegments: 1,
    });
    geometry.center();

    const matClone = material.clone();
    matClone.uniforms.uRandom.value = THREE.MathUtils.randFloat(0.1, 1.1);

    const mesh = new THREE.Mesh(geometry, matClone);
    this.mesh = mesh;

    const uj = new kokomi.UniformInjector(this.base);
    this.uj = uj;
  }

  addExisting() {
    this.base.scene.add(this.mesh);
  }

  update() {
    this.uj.injectShadertoyUniforms(this.mesh.material.uniforms);
    gsap.to(this.mesh.material.uniforms.uMouse.value, {
      x: this.base.interactionManager.mouse.x,
    });
    gsap.to(this.mesh.material.uniforms.uMouse.value, {
      y: this.base.interactionManager.mouse.y,
    });

    const lp = this.base.clock.elapsedTime * 0.01;
    this.mesh.material.uniforms.uLightPosition.value.copy(new THREE.Vector3(Math.cos(lp), Math.sin(lp), 10));
  }
}

class FragmentGroup extends kokomi.Component {
  g: any;
  frags: any;
  constructor(base: any, config = {}) {
    super(base);

    const { material, layerId = 0, polygons } = config as any;

    const g = new THREE.Group();
    this.g = g;

    const frags = polygons.map((points: any, i: any) => {
      const frag = new Fragment(this.base, {
        material,
        points,
      });
      frag.addExisting();
      const firstPoint = frag.points[0];
      frag.mesh.position.set(firstPoint.x * 0.01, firstPoint.y * -0.01, THREE.MathUtils.randFloat(-3, -1));
      frag.mesh.material.uniforms.uLayerId.value = layerId;
      g.add(frag.mesh);
      return frag;
    });

    this.g.position.z = 2 - 1.5 * layerId;

    this.frags = frags;
  }

  addExisting() {
    this.base.scene.add(this.g);
  }

}
// 随机多边形
const generatePolygons = (config = {}) => {
  const { gridX = 10, gridY = 20, maxX = 9, maxY = 9 } = config as any;

  const polygons = [];

  for (let i = 0; i < gridX; i++) {
    for (let j = 0; j < gridY; j++) {
      const points = [];
      let edgeCount = 3;
      const randEdgePossibility = Math.random();
      if (randEdgePossibility > 0 && randEdgePossibility <= 0.2) {
        edgeCount = 3;
      } else if (randEdgePossibility > 0.2 && randEdgePossibility <= 0.55) {
        edgeCount = 4;
      } else if (randEdgePossibility > 0.55 && randEdgePossibility <= 0.9) {
        edgeCount = 5;
      } else if (randEdgePossibility > 0.9 && randEdgePossibility <= 0.95) {
        edgeCount = 6;
      } else if (randEdgePossibility > 0.95 && randEdgePossibility <= 1) {
        edgeCount = 7;
      }
      let firstPoint = {
        x: 0,
        y: 0,
      };
      let angle = THREE.MathUtils.randFloat(0, 2 * Math.PI);
      for (let k = 0; k < edgeCount; k++) {
        if (k === 0) {
          firstPoint = {
            x: (i % maxX) * 10,
            y: (j % maxY) * 10,
          };
          points.push(firstPoint);
        } else {
          // random polar
          const r = 10;
          angle += THREE.MathUtils.randFloat(0, Math.PI / 2);
          const anotherPoint = {
            x: firstPoint.x + r * Math.cos(angle),
            y: firstPoint.y + r * Math.sin(angle),
          };
          points.push(anotherPoint);
        }
      }
      polygons.push(points);
    }
  }

  return polygons;
};

class FragmentWorld extends kokomi.Component {
  fgs: any;
  totalG: any;
  floatDistance: any;
  floatSpeed: any;
  floatMaxDistance: any;
  isDashing: any;
  constructor(base: any, config = {}) {
    super(base);

    const { material } = config as any;

    const fgsContainer = new THREE.Group();
    this.base.scene.add(fgsContainer);
    fgsContainer.position.copy(new THREE.Vector3(-0.36, 0.36, 0.1));

    // fragment groups
    const polygons = generatePolygons();

    const fgs = [...Array(2).keys()].map((item, i) => {
      const fg = new FragmentGroup(this.base, {
        material,
        layerId: i,
        polygons,
      });
      fg.addExisting();
      fgsContainer.add(fg.g);
      return fg;
    });
    this.fgs = fgs;

    // clone group for infinite loop
    const fgsContainer2 = new THREE.Group().copy(fgsContainer.clone());
    fgsContainer2.position.y = fgsContainer.position.y - 1;

    const totalG = new THREE.Group();
    totalG.add(fgsContainer);
    totalG.add(fgsContainer2);
    this.totalG = totalG;

    // anime
    this.floatDistance = 0;
    this.floatSpeed = 1;
    this.floatMaxDistance = 1;
    this.isDashing = false;
  }

  addExisting() {
    this.base.scene.add(this.totalG);
  }

  // 漂浮动画
  update() {
    this.floatDistance += this.floatSpeed;

    const y = this.floatDistance * 0.001;
    if (y > this.floatMaxDistance) {
      this.floatDistance = 0;
    }
    if (this.totalG) {
      this.totalG.position.y = y;
    }
  }

  speedUp() {
    gsap.to(this, {
      floatSpeed: 50,
      duration: 4,
      ease: 'power2.in',
    });
  }

  speedDown() {
    gsap.to(this, {
      floatSpeed: 1,
      duration: 6,
      ease: 'power3.inOut',
    });
  }

  async dash(duration = 5000, cb: any) {
    if (this.isDashing) {
      return;
    }

    this.isDashing = true;

    this.speedUp();

    await kokomi.sleep(duration);

    if (cb) {
      cb();
    }

    this.speedDown();
  }

  changeTexture(name: String) {
    this.fgs.forEach((fg: any) => {
      fg.frags.forEach((frag: any) => {
        // @ts-ignore
        const tex = this.base.am.items[name];
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        frag.mesh.material.uniforms.uTexture.value = tex;
      });
    });
  }
}

class Sketch extends kokomi.Base {
  am: any;
  fw: any;
  create() {
    this.camera.position.set(0, 0, 1.5);
    // @ts-ignore
    this.camera.fov = 10;
    this.camera.near = 0.01;
    this.camera.far = 10000;
    this.camera.updateProjectionMatrix();

    const resourceList = [
      {
        name: 'tex1',
        type: 'texture',
        path: 'https://s2.loli.net/2022/11/19/cqOho3ZKCXfTdzw.jpg',
      },
      {
        name: 'tex2',
        type: 'texture',
        path: 'https://s2.loli.net/2022/11/20/8E6yHP9kAawc7Wr.jpg',
      },
    ];

    const am = new kokomi.AssetManager(this, resourceList as any);
    this.am = am;
    am.on('ready', async () => {
      const tex = am.items.tex1;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;

      const uj = new kokomi.UniformInjector(this);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          ...uj.shadertoyUniforms,
          uTexture: {
            value: tex,
          },
          uLightPosition: {
            value: new THREE.Vector3(-0.2, -0.2, 3),
          },
          uLightColor: {
            value: new THREE.Color('#eeeeee'),
          },
          uRandom: {
            value: THREE.MathUtils.randFloat(0.1, 1.1),
          },
          uMouse: {
            value: new THREE.Vector2(0.5, 0.5),
          },
          uLayerId: {
            value: 0,
          },
        },
      });

      // fragment world
      const fw = new FragmentWorld(this, {
        material,
      });
      fw.addExisting();
      this.fw = fw;

      // postprocessing
      const ce = new kokomi.CustomEffect(this, {
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        uniforms: {
          uRGBShift: {
            value: 1,
          },
        },
      });
      ce.addExisting();

      // DOM
      const shuffleText = (sel: any) => {
        gsap.set(sel, {
          display: 'block',
        });
        const st = new ShuffleText(document.querySelector(sel));
        st.start();
      };

      const start = async () => {
        document.querySelector('.loader-screen')?.classList.add('hollow');

        await kokomi.sleep(500);

        gsap.to('#sketch', {
          opacity: 1,
        });

        await kokomi.sleep(1000);

        await startScene1();
      };

      const startScene2 = async () => {
        gsap.set('.scene-2', {
          display: 'block',
        });

        shuffleText('.shuffle-text-4');

        await kokomi.sleep(1000);

        shuffleText('.shuffle-text-5');

        await kokomi.sleep(1000);

        shuffleText('.shuffle-text-6');

        await kokomi.sleep(6000);

        gsap.to('.scene-2', {
          opacity: 0,
          pointerEvents: 'none',
        });
      };

      const startScene1 = async () => {
        gsap.set('.scene-1', {
          display: 'block',
        });

        shuffleText('.shuffle-text-1');

        await kokomi.sleep(1000);

        shuffleText('.shuffle-text-2');

        await kokomi.sleep(1000);

        shuffleText('.shuffle-text-3');

        await kokomi.sleep(1000);

        gsap.to('.dash-btn', {
          opacity: 1,
          pointerEvents: 'auto',
        });

        document.querySelector('.dash-btn')?.addEventListener('click', async () => {
          gsap.set('.dash-btn', {
            pointerEvents: 'none',
          });
          gsap.to('.scene-1', {
            opacity: 0,
            pointerEvents: 'none',
            display: 'none',
          });
          await this.fw.dash(5000, () => {
            this.fw.changeTexture('tex2');
          });
          await kokomi.sleep(5000);
          await startScene2();
        });
      };

      await start();
    });
  }
}

onMounted(() => {
  const createSketch = () => {
    const sketch = new Sketch();
    sketch.create();
    return sketch;
  };

  createSketch();
});
</script>

<template>
  <div id="sketch"></div>
  <div class="content">
    <div class="fixed z-5 top-0 left-0 loader-screen w-screen h-screen transition-all duration-300 bg-black">
      <div class="absolute hv-center">
        <div class="loading text-white text-3xl tracking-widest whitespace-no-wrap">
          <span style="--i: 0">L</span>
          <span style="--i: 1">O</span>
          <span style="--i: 2">A</span>
          <span style="--i: 3">D</span>
          <span style="--i: 4">I</span>
          <span style="--i: 5">N</span>
          <span style="--i: 6">G</span>
        </div>
      </div>
    </div>
    <div class="fixed z-4 top-0 left-0 w-screen h-screen text-white text-xl">
      <div class="absolute hv-center">
        <div class="scene-1 space-y-10 text-center whitespace-no-wrap">
          <div class="space-y-4">
            <div class="shuffle-text shuffle-text-1">欢迎来到时空裂缝！</div>
            <div class="shuffle-text shuffle-text-2">在这里，你可以体验穿梭时空的感觉！</div>
            <div class="shuffle-text shuffle-text-3">准备好了，就点击下面的按钮吧~</div>
          </div>
          <button
            data-text="开始穿梭"
            class="dash-btn btn btn-primary btn-ghost btn-border-stroke btn-text-float-up"
          >
            <div class="btn-borders">
              <div class="border-top"></div>
              <div class="border-right"></div>
              <div class="border-bottom"></div>
              <div class="border-left"></div>
            </div>
            <span class="btn-text">开始穿梭</span>
          </button>
        </div>
        <div class="scene-2 space-y-10 text-center whitespace-no-wrap">
          <div class="space-y-4">
            <div class="shuffle-text shuffle-text-4">穿梭的感觉如何？</div>
            <div class="shuffle-text shuffle-text-5">如果觉得不错，可以推荐给其他小伙伴~</div>
            <div class="shuffle-text shuffle-text-6">我是alphardex，一个爱写特效的前端</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  overflow: hidden;
}

#sketch {
  width: 100vw;
  height: 100vh;
  background: black;
}

.content {
  position: absolute;
  top: 50%;
  right: 50%;
  z-index: 10;
}

body {
  background: black;
}

* {
  user-select: none;
}

#sketch {
  opacity: 0;
}

.scene-1,
.scene-2 {
  display: none;
}

.loading span {
  animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate infinite;
}

@keyframes blur {
  to {
    filter: blur(5px);
  }
}

.shuffle-text {
  display: none;
  opacity: 0.6;
}

.dash-btn {
  opacity: 0;
  pointer-events: none;
}

.btn {
  --hue: 190;
  --ease-in-duration: 0.25s;
  --ease-in-exponential: cubic-bezier(0.95, 0.05, 0.795, 0.035);
  --ease-out-duration: 0.65s;
  --ease-out-delay: var(--ease-in-duration);
  --ease-out-exponential: cubic-bezier(0.19, 1, 0.22, 1);
  position: relative;
  padding: 1rem 3rem;
  font-size: 1rem;
  line-height: 1.5;
  color: white;
  text-decoration: none;
  background-color: hsl(var(--hue), 100%, 41%);
  border: 1px solid hsl(var(--hue), 100%, 41%);
  outline: transparent;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: 0.25s;
}

.btn:hover {
  background: hsl(var(--hue), 100%, 31%);
}

.btn-primary {
  --hue: 171;
}

.btn-ghost {
  color: hsl(var(--hue), 100%, 41%);
  background-color: transparent;
  border-color: hsl(var(--hue), 100%, 41%);
}

.btn-ghost:hover {
  color: white;
}

.btn-border-stroke {
  border-color: hsla(var(--hue), 100%, 41%, 0.35);
}

.btn-border-stroke .btn-borders {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.btn-border-stroke .btn-borders .border-top {
  position: absolute;
  top: 0;
  width: 100%;
  height: 1px;
  background: hsl(var(--hue), 100%, 41%);
  transform: scaleX(0);
  transform-origin: left;
}

.btn-border-stroke .btn-borders .border-right {
  position: absolute;
  right: 0;
  width: 1px;
  height: 100%;
  background: hsl(var(--hue), 100%, 41%);
  transform: scaleY(0);
  transform-origin: bottom;
}

.btn-border-stroke .btn-borders .border-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: hsl(var(--hue), 100%, 41%);
  transform: scaleX(0);
  transform-origin: left;
}

.btn-border-stroke .btn-borders .border-left {
  position: absolute;
  left: 0;
  width: 1px;
  height: 100%;
  background: hsl(var(--hue), 100%, 41%);
  transform: scaleY(0);
  transform-origin: bottom;
}

.btn-border-stroke .btn-borders .border-left {
  transition: var(--ease-out-duration) var(--ease-out-delay) var(--ease-out-exponential);
}

.btn-border-stroke .btn-borders .border-bottom {
  transition: var(--ease-out-duration) var(--ease-out-delay) var(--ease-out-exponential);
}

.btn-border-stroke .btn-borders .border-right {
  transition: var(--ease-in-duration) var(--ease-in-exponential);
}

.btn-border-stroke .btn-borders .border-top {
  transition: var(--ease-in-duration) var(--ease-in-exponential);
}

.btn-border-stroke:hover {
  color: hsl(var(--hue), 100%, 41%);
  background: transparent;
}

.btn-border-stroke:hover .border-top,
.btn-border-stroke:hover .border-bottom {
  transform: scaleX(1);
}

.btn-border-stroke:hover .border-left,
.btn-border-stroke:hover .border-right {
  transform: scaleY(1);
}

.btn-border-stroke:hover .border-left {
  transition: var(--ease-in-duration) var(--ease-in-exponential);
}

.btn-border-stroke:hover .border-bottom {
  transition: var(--ease-in-duration) var(--ease-in-exponential);
}

.btn-border-stroke:hover .border-right {
  transition: var(--ease-out-duration) var(--ease-out-delay) var(--ease-out-exponential);
}

.btn-border-stroke:hover .border-top {
  transition: var(--ease-out-duration) var(--ease-out-delay) var(--ease-out-exponential);
}

.btn-text-float-up::after {
  position: absolute;
  content: attr(data-text);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transform: translateY(35%);
  transition: 0.25s ease-out;
}

.btn-text-float-up .btn-text {
  display: block;
  transition: 0.75s 0.1s var(--ease-out-exponential);
}

.btn-text-float-up:hover .btn-text {
  opacity: 0;
  transform: translateY(-25%);
  transition: 0.25s ease-out;
}

.btn-text-float-up:hover::after {
  opacity: 1;
  transform: translateY(0);
  transition: 0.75s 0.1s var(--ease-out-exponential);
}
</style>
