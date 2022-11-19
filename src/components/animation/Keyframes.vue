<template></template>

<script lang="ts">
// import Keyframes from "@/other-ts/three-other-webgl/animation/keyframes.ts";
import Keyframes from "@/types/three-webgl/animation/keyframes";
export default {
    setup() {
        const keyframe = new Keyframes();
        keyframe.createPmremGenerator();
        keyframe.createGeometry();
        keyframe.createCamera();
        keyframe.createRender();
        keyframe.createEventListener();
        keyframe.createOrbitControls();
    },
};
</script>

<style scoped>
</style>