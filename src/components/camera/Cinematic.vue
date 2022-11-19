<template>
  
</template>

<script lang="ts" setup>
import  Cinematic from '@/types/three-webgl/camera/cinematic'
import {onMounted} from "@vue/runtime-core";
onMounted(()=>{
  const Camera = new Cinematic()
  Camera.createLight()
  Camera.createCamera()
  Camera.createGeometry()
  Camera.createRenderer()
  Camera.createListen()
  Camera.createGui()
  Camera.animate()
})
</script>

<style>

</style>