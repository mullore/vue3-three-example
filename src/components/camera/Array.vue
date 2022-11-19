<template></template>
<script lang="ts" setup>
import ArrayCamera from '@/types/three-webgl/camera/array';
import {onMounted} from "@vue/runtime-core";
onMounted(()=>{
  let camera = new ArrayCamera()
  camera.init()
  camera.animate()
  // camera.onResize()
})
</script>