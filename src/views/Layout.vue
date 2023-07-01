
<template>
  <router-view />
  <Mihoyo />
</template>
<script setup lang="ts">
// import Mihoyo from '@/mihoyo/Index.vue';
import { defineAsyncComponent } from 'vue';
const Mihoyo = defineAsyncComponent({
  loader: () => import('@/mihoyo/Index.vue'),
  delay: 200,

});


</script>




