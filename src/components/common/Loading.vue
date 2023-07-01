

<template>
  <div
    ref="loading"
    class="loading"
  >
    <div class="loadingwrapper">
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </div>
    <div class="loadingtxt">
      <span>HIGHLY SOPHISTICATED</span>
    </div>
  </div>
</template>

<script lang="ts" setup>

import { onMounted, ref } from 'vue';
const loading = ref<HTMLElement | null>(null);

onMounted(() => {
  const element = loading.value as HTMLElement;



  element.addEventListener('animationend', handleTransitionEnd);
  function handleTransitionEnd() {
    element.classList.add('hide');
    // console.log('触发了');
    // 动画结束后移除事件监听器，并重置元素状态
    element.removeEventListener('animationend', handleTransitionEnd);

  }
});

</script>

<style  lang="scss" scoped>
.loading {
  display: block;
  position: fixed;
  z-index: 100;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #0d0c21;
  -webkit-transition: opacity 1s;
  transition: opacity 1s;
  animation: loading 0.5s 6s 1 linear;
  opacity: 1;

}

.hide {
  opacity: 0;
  display: none;
}

.mobile .loading {
  -webkit-transition-duration: 3s;
  transition-duration: 3s
}

.loadingwrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: rotate(-9deg);
  -ms-transform: rotate(-9deg);
  transform: rotate(-9deg)
}

.loading .loadingwrapper i {
  position: absolute;
  left: -112px;
  top: -109px;
  width: 200px;
  height: 200px;
  -webkit-animation: loadingo 6s infinite linear, loadingt 6s infinite linear;
  animation: loadingo 6s infinite linear, loadingt 6s infinite linear;
  background: url('b.png');
  background-size: contain;
  opacity: 0;
  -webkit-transform-origin: 55% 55%;
  -ms-transform-origin: 55% 55%;
  transform-origin: 55% 55%
}

.loading .loadingwrapper i:nth-of-type(1) {
  -webkit-animation-delay: .1s, .1s;
  animation-delay: .1s, .1s
}

.loading .loadingwrapper i:nth-of-type(2) {
  -webkit-animation-delay: .7s, .7s;
  animation-delay: .7s, .7s
}

.loading .loadingwrapper i:nth-of-type(3) {
  -webkit-animation-delay: 1.3s, 1.3s;
  animation-delay: 1.3s, 1.3s
}

.loading .loadingwrapper i:nth-of-type(4) {
  -webkit-animation-delay: 1.9s, 1.9s;
  animation-delay: 1.9s, 1.9s
}

.loading .loadingwrapper i:nth-of-type(5) {
  -webkit-animation-delay: 2.5s, 2.5s;
  animation-delay: 2.5s, 2.5s
}

.loading .loadingwrapper i:nth-of-type(6) {
  -webkit-animation-delay: 3.1s, 3.1s;
  animation-delay: 3.1s, 3.1s
}

.loading .loadingwrapper i:nth-of-type(7) {
  -webkit-animation-delay: 3.7s, 3.7s;
  animation-delay: 3.7s, 3.7s
}

.loading .loadingwrapper i:nth-of-type(8) {
  -webkit-animation-delay: 4.3s, 4.3s;
  animation-delay: 4.3s, 4.3s
}

.loading .loadingwrapper i:nth-of-type(9) {
  -webkit-animation-delay: 4.9s, 4.9s;
  animation-delay: 4.9s, 4.9s
}

.loading .loadingwrapper i:nth-of-type(10) {
  -webkit-animation-delay: 5.5s, 5.5s;
  animation-delay: 5.5s, 5.5s
}

@keyframes loading {
  0% {
    opacity: 1
  }

  100% {
    opacity: 0
  }

}

@keyframes loadingo {
  0% {
    opacity: 0
  }

  50% {
    opacity: 1
  }

  100% {
    opacity: 0
  }

}

@keyframes loadingt {
  30% {
    -webkit-transform: rotate(-20deg) scale(.6);
    transform: rotate(-20deg) scale(.6)
  }

  60% {
    -webkit-transform: rotate(-45deg) scale(.3);
    transform: rotate(-45deg) scale(.3)
  }

  85% {
    -webkit-transform: rotate(-67deg) scale(.1);
    transform: rotate(-67deg) scale(.1)
  }

  100% {
    -webkit-transform: rotate(-67deg) scale(.1);
    transform: rotate(-67deg) scale(.1)
  }
}

.loadingtxt {
  position: absolute;
  left: 50%;
  top: 50%;
  color: #fff;
  width: 300px;
  margin-left: -150px;
  text-align: center;

  margin-top: 90px;

  i {
    padding-top: 10px;
    display: block;
    font-size: 28px;
    font-style: normal;
  }
}
</style>