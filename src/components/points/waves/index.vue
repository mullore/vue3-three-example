<script lang="ts" setup>
import {
	attribute,
	createGeometry,
	createCamera,
	createRender,
	createListener,
	render,
	animate,
} from '@/types/hooks/pointsWanves';
import { onMounted } from 'vue';
onMounted(() => {
	attribute();
	createGeometry();
	createCamera();
	createRender();
	createListener();
	render();
	animate();
})
</script>

