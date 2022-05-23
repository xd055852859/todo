<script setup lang="ts">
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { Rank } from "@/views/rank.vue";
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
onMounted(() => {
  createChart();
});
const createChart = () => {
  type EChartsOption = echarts.EChartsOption;

  var chartDom = document.getElementById(props.XYId)!;
  var myChart = echarts.init(chartDom);
  let option: EChartsOption;
  let stepDay = 0;
  console.log(myChart);
  let data: number[] = props.rankData[stepDay];
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

  setTimeout(function () {
    run();
  }, 0);
  let timer = setInterval(function () {
    run();
    if (stepDay > props.day) {
      clearInterval(timer);
    }
  }, 3000);
  function run() {
    for (var i = 0; i < props.day; ++i) {
      data = props.rankData[i];
      stepDay++;
    }
    console.log(data);
    myChart.setOption<echarts.EChartsOption>({
      series: [
        {
          type: "bar",
          data,
        },
      ],
    });
  }
  option && myChart.setOption(option);
};
</script>
<template>
  <div :id="XYId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
