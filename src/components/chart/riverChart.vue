<script setup lang="ts">
import * as echarts from "echarts";
const props = defineProps<{
  data: (string | number)[];
  riverId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
  name: string[];
}>();
onMounted(() => {
  createChart();
});
const createChart = () => {
  var chartDom = document.getElementById(props.riverId)!;
  var myChart = echarts.init(chartDom);
  var option;

  option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(0,0,0,0.2)",
          width: 1,
          type: "solid",
        },
      },
    },
    legend: {
      data: props.name,
    },
    singleAxis: {
      top: 50,
      bottom: 50,
      axisTick: {},
      axisLabel: {},
      type: "time",
      axisPointer: {
        animation: true,
        label: {
          show: true,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.2,
        },
      },
    },
    series: [
      {
        type: "themeRiver",
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.8)",
          },
        },
        data: props.data,
      },
    ],
  };

  option && myChart.setOption(option);
};
</script>
<template>
  <div :id="riverId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
