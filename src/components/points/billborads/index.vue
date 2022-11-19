<script lang="ts" setup>
import { onMounted } from 'vue';
import {
  creatGeometry,
  createCamera,
  createGui,
  createState,
  createOrbitControls,
  createBloom,
  createRender,
  animate,
} from '@/types/hooks/PointBillborads';
onMounted(() => {
  createGui();
  createState();
  creatGeometry();
  createCamera();
  createBloom();
  createRender();
  createOrbitControls();
  animate();
});
</script>