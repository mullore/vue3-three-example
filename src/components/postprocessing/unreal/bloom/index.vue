<script lang="ts" setup>
import {
  createGeometry,
  createCamera,
  createRender,
  createOrbitControls,
  createRenderPass,
  createLight,
  reSize,
} from '@/types/hooks/UnrealBloom';
import { onMounted } from 'vue';
onMounted(() => {
  createCamera();
  createRender();
  createOrbitControls();
  createRenderPass();
  createLight();
  createGeometry();
  reSize();
});
</script>