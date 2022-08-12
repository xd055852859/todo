<script setup lang="ts">
import lineChart from "@/components/chart/lineChart.vue";
import { ElMessage } from "element-plus";
import beanSvg from "@/assets/svg/bean.svg";
import addBeanSvg from "@/assets/svg/addBean.svg";

import { storeToRefs } from "pinia";
import appStore from "@/store";

const { user } = storeToRefs(appStore.authStore);
const imgArray = ref<any>([]);
const imgNum = ref<number>(20);
let createArr = ref<number[]>([]);
onMounted(() => {});
const init = () => {
  let right = 0;
  let bottom = 20;
  console.log(user.value);
  let createScore = user.value?.createScore ? user.value?.createScore : 0;
  let finishScore = user.value?.finishScore ? user.value?.finishScore : 0;
  imgNum.value = createScore + finishScore;
  console.log(imgNum.value);
  createArr.value = [...new Array(user.value?.createScore)].map(() => {
    let num = Math.floor(Math.random() * imgNum.value);
    if (createArr.value.indexOf(num) === -1) {
      return num;
    } else {
      return Math.floor(Math.random() * imgNum.value);
    }
  });
  imgArray.value = [...new Array(imgNum.value)].map((item, index) => {
    if (index < 6) {
      right = right + 30;
    } else {
      if (index % 6 === 0) {
        bottom = bottom + 25;
        right = 25;
      } else {
        right = right + 30;
      }
    }
    addBean(right, bottom, index);
  });
  console.log(imgArray.value);
};
const addBean = (right, bottom, index) => {
  let randomNum = Math.floor(Math.random() * 361);
  let randomIndex = Math.floor(Math.random() * 10);
  let bottle: any = document.getElementById("bottle");
  let img = document.createElement("img");
  img.src = createArr.value.indexOf(index) !== -1 ? addBeanSvg : beanSvg;
  img.className = "board-img-item";
  img.style.opacity = "0";
  img.style.right = "125px";
  img.style.bottom = "350px";
  img.style.transform = `rotate(${randomNum}deg)`;
  img.style.zIndex = randomIndex + "";
  img.style.transition =
    "opacity 1s linear, right 1s linear, bottom 1s cubic-bezier(0.5, -0.5, 1, 1)";
  bottle.appendChild(img);
  // 添加动画属性
  let timer = setTimeout(() => {
    img.style.right = right + "px";
    img.style.bottom = bottom + "px";
    img.style.opacity = "1";
  }, index * 300);

  // /**
  //  * 动画结束后，删除自己
  //  */
  img.ontransitionend = function () {
    clearTimeout(timer);
  };
};
watch(
  user,
  (newVal) => {
    if (newVal) {
      init();
    }
  },
  { immediate: true }
);
</script>
<template>
  <div>Beans of Today</div>
  <div>Beans of Today</div>
  <div class="board-empty dp-center-center">
    <div class="board-img" id="bottle"></div>
  </div>
</template>
<style scoped lang="scss">
.board-empty {
  width: 100%;
  height: calc(100% - 80px);

  .board-img {
    width: 250px;
    height: 350px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center center;
    align-content: flex-end;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    padding: 25px 20px 30px 25px;
    box-sizing: border-box;
    background-image: url("@/assets/img/bottlenew.png");
    position: relative;
    z-index: 1;
  }
}
</style>
<style>
.board-img-item {
  width: 40px;
  height: 40px;
  position: absolute;
}
</style>
