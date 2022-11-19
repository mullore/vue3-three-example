<template>
  <div id="info">
    <p>
    <span>按<b>O</b>键切换<span>正交相机</span></span>
    <span style="margin:0 10px">|</span>
    <span>按<b>P</b>键切换<span>透视相机</span></span>
    </p>
    </div>
</template>

<script lang="ts">
import camera from "@/types/three-webgl/camera/camera"
export default {
  setup() {
    let demo = new camera();
    demo.createCamera();
    demo.createPerspectiveCamera();
    demo.createOrthographicCamera();
    demo.createGroup();
    demo.createMesh();
    demo.createGeometry();
    demo.createRender();
    demo.createListen();
    demo.animate();

  }
}
</script>

<style></style>