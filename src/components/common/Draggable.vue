<template>
  <div
    ref="dragElement"
    class="dragElement"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick, ref } from 'vue';

const dragElement = ref<HTMLElement>(document.createElement('div'));


const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

function handleMouseDown(event: MouseEvent) {
  if (event.button === 2) {
    // 只在右键按下时触发
    isDragging.value = true;
    startX.value = event.clientX - dragElement.value?.offsetLeft;
    startY.value = event.clientY - dragElement.value?.offsetTop;
  }
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    const newLeft = event.clientX - startX.value;
    const newTop = event.clientY - startY.value;

    // 更新拖动元素的位置
    dragElement.value.style.left = newLeft + 'px';
    dragElement.value.style.top = newTop + 'px';

    // 确保拖动范围不超过屏幕
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const maxLeft = screenWidth - dragElement.value.offsetWidth;
    const maxTop = screenHeight - dragElement.value.offsetHeight;
    // 限制拖动范围在屏幕内
    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const boundedTop = Math.max(0, Math.min(newTop, maxTop));

    if (newLeft < 0) {
      dragElement.value.style.left = '0px';
    } else if (newLeft + dragElement.value.offsetWidth > screenWidth) {
      dragElement.value.style.left = boundedLeft + 'px';
    }

    if (newTop < 0) {
      dragElement.value.style.top = '0px';
    } else if (newTop + dragElement.value.offsetHeight > screenHeight) {
      dragElement.value.style.top = boundedTop + 'px';
    }
  }
}

function handleMouseUp() {
  isDragging.value = false;
}
onMounted(() => {
  nextTick(() => {
    dragElement.value.style.left = window.innerWidth - dragElement.value.clientWidth + 'px';
    dragElement.value.style.top = window.innerHeight - dragElement.value.clientHeight + 'px';
  });
});
</script>
<style lang="scss" scoped>
.dragElement {
  position: absolute;
  display: inline-block;
}
</style>
