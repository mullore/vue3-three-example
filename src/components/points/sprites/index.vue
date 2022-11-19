<script lang="ts" setup>
import { onMounted } from 'vue';

import { createGeometry, createCamera, createRender, animate, createListen } from '@/types/hooks/pointSprites';

onMounted(() => {
  createGeometry();
  createCamera();
  createRender();
  createListen();
  animate();
})
</script>