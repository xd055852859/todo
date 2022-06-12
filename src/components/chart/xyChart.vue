<script setup lang="ts">
import * as echarts from "echarts";
import { useThrottleFn } from "@vueuse/core";
const props = defineProps<{
  rankData: number[];
  XYId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
  name: any;
  // day: number;
}>();
const emits = defineEmits<{
  (e: "changeMate", index: number): void;
}>();
let chart: any = null;
let option: any = null;
onMounted(() => {
  createChart();
});
const createChart = () => {
  var chartDom = document.getElementById(props.XYId)!;
  chart = echarts.init(chartDom);
  // let data: number[] = props.rankData[0];
  option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: [
      {
        type: "value",
      },
    ],
    yAxis: {
      type: "category",
      data: props.name,
      inverse: true,
      triggerEvent: true,
    },
    series: [
      {
        name: props.name,
        label: {
          show: true,
          formatter: "{@value}",
          align: "center",
          verticalAlign: "bottom",
          lineHeight:0
        },
        type: "bar",
        barWidth: "60%",
        data: props.rankData,
      },
    ],
    // legend: {
    //   show: false,
    // },
  };
  option && chart.setOption(option);
  window.onresize = useThrottleFn(() => {
    if (chart) {
      //@ts-ignore
      chart.resize();
    }
  }, 50);
  chart.on("click", function (params) {
    console.log(params);
    if (params.componentType === "yAxis") {
      emits("changeMate", params.dataIndex);
    }
  });
};

watch(
  () => props.rankData,
  (newVal) => {
    //@ts-ignore
    chart.setOption<echarts.EChartsOption>({
      yAxis: {
        data: props.name,
      },
      series: [
        {
          data: newVal,
        },
      ],
    });
    //@ts-ignore
    chart.resize();
  },
  { deep: true }
);
</script>
<template>
  <div :id="XYId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
