<template></template>

<script lang="ts">
// import Keyframes from "@/other-ts/three-other-webgl/animation/keyframes.ts";
import multiples from "@/types/three-webgl/animation/multiple";
export default {
    setup() {
        const multiple = new multiples();
        Multiple.createMesh();
        Multiple.crreateLoader();
        Multiple.createCamera();
        Multiple.createLight();
        Multiple.createRender();
        Multiple.createListen();

    },
};
</script>

<style scoped>
</style>