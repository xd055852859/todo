<script setup lang="ts">
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { Rank } from "@/views/rank.vue";
import { watchPostEffect } from "vue";
const props = defineProps<{
  rankData: number[][];
  XYId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
  name: string[];
  day: number;
}>();
const chart = shallowRef<echarts.EChartsType | null>(null);
onMounted(() => {
  createChart();
});
const createChart = () => {
  type EChartsOption = echarts.EChartsOption;

  var chartDom = document.getElementById(props.XYId)!;
  chart.value = echarts.init(chartDom);
  let option: EChartsOption;
  let data: number[] = props.rankData[0];
  option = {
    xAxis: {
      max: "dataMax",
    },
    yAxis: {
      type: "category",
      data: props.name,
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      max: props.rankData[0].length - 1, // only the largest 3 bars will be displayed
    },
    series: [
      {
        realtimeSort: true,
        name: "X",
        type: "bar",
        data: data,
        label: {
          show: true,
          position: "right",
          valueAnimation: true,
        },
      },
    ],
    legend: {
      show: false,
    },
    animationDuration: 0,
    animationDurationUpdate: 3000,
    animationEasing: "linear",
    animationEasingUpdate: "linear",
  };

  // let timer = setInterval(function () {
  //   run();
  //   if (stepDay > props.day) {
  //     clearInterval(timer);
  //   }
  // }, 3000);

  option && chart.value.setOption(option);
};
watch(chart,(newVal) => {
  if (newVal) {
    let stepDay = 0;
    let data: number[] = props.rankData[stepDay];
    for (var i = 0; i < props.day; ++i) {
      data = props.rankData[i];
      stepDay++;
    }
    console.log(i);
    //@ts-ignore
    newVal.setOption<echarts.EChartsOption>({
      series: [
        {
          type: "bar",
          data,
        },
      ],
    });
  }
});
</script>
<template>
  <div :id="XYId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
