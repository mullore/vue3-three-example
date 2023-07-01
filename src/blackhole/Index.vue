<template>
  <Loading></Loading>
  <div
    ref="experienceRef"
    class="experience"
  ></div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue';
import Experience from './Experience';
import Loading from '@/components/common/Loading.vue';
const experienceRef = ref<HTMLElement | null>(null);
onMounted(() => {
  const Experiences = new Experience(experienceRef.value as HTMLElement);
  // window.addEventListener('resize', () => { Experiences.resize(); });
});
</script>

<style lang="scss" scoped>
.experience {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}
</style>