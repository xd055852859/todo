<script setup lang="ts">
import * as echarts from "echarts";
import { useThrottleFn } from "@vueuse/core";
const props = defineProps<{
  rankData: number[][];
  XYId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
  name: any;
  day: number;
}>();
const emits = defineEmits<{
  (e: "changeMate", key: string): void;
}>();
const chart = shallowRef<echarts.EChartsType | null>(null);
const option = shallowRef<echarts.EChartsOption | null>(null);
onMounted(() => {
  createChart();
});
const createChart = () => {
  var chartDom = document.getElementById(props.XYId)!;
  chart.value = echarts.init(chartDom);
  let data: number[] = props.rankData[0];
  option.value = {
    xAxis: {
      max: "dataMax",
    },
    yAxis: {
      type: "category",
      data: props.name,
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      triggerEvent: true,
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
        // barWidth: 5,
        // backgroundStyle: {
        //   borderWidth: 40,
        // },
      },
    ],
    legend: {
      show: false
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
  option.value && chart.value.setOption(option.value);
  window.onresize = useThrottleFn(() => {
    if (chart.value) {
      //@ts-ignore
      chart.value.resize();
    }
  }, 50);
  chart.value.on("click", function (params) {
    console.log(params);
    if (params.componentType === "yAxis") {
      emits("changeMate", props.name[params.dataIndex]._key);
    }
  });
};
watch(chart, (newChart) => {
  if (newChart) {
    let data: any = null;
    for (var i = 0; i < props.day; ++i) {
      data = props.rankData[i];
    }
    console.log(i);
    //@ts-ignore
    newChart.setOption<echarts.EChartsOption>({
      yAxis: {
        data: props.name,
      },
      series: [
        {
          data,
        },
      ],
    });
  }
});
watch(
  () => props.rankData,
  (newVal) => {
    let data: any = null;
    for (var i = 0; i < props.day; ++i) {
      data = newVal[i];
    }
    console.log(props.name);
    //@ts-ignore
    chart.value.setOption<echarts.EChartsOption>({
      yAxis: {
        data: props.name,
      },
      series: [
        {
          type: "bar",
          data,
        },
      ],
    });
    //@ts-ignore
    chart.value.resize();
  },
  { deep: true }
);
</script>
<template>
  <div :id="XYId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
