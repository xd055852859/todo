<script setup lang="ts">
import { useThrottleFn } from "@vueuse/shared";
import * as echarts from "echarts";
const props = defineProps<{
  data: (string | number)[];
  riverId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
  name: string[];
  simpleState?: boolean;
}>();
const emits = defineEmits<{
  (e: "changeDate", date: string): void;
}>();
const dayjs: any = inject("dayjs");
onMounted(() => {
  createChart();
});
let chart: any = null;
const createChart = () => {
  var chartDom = document.getElementById(props.riverId)!;
  chart = echarts.init(chartDom);
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
      show: !props.simpleState,
      data: props.name,
    },
    singleAxis: {
      top: 50,
      bottom: 50,
      triggerEvent: true,
      axisLine: {
        show: !props.simpleState,
      },
      axisTick: {
        show: !props.simpleState,
      },
      axisLabel: {
        show: !props.simpleState,
        formatter: "{M}-{dd} ",
        fontWeight: "bolder",
      },
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
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.8)",
          },
        },
        data: [...props.data],
      },
    ],
  };

  option && chart.setOption(option);
  console.log(props.data);
  window.onresize = useThrottleFn(() => {
    if (chart) {
      //@ts-ignore
      chart.resize();
    }
  }, 50);
  chart.on("click", function (params) {
    console.log(params);
    if (params.componentType === "singleAxis") {
      emits("changeDate", dayjs(params.value).format("YYYY-MM-DD"));
    }
    // if (params.componentType === "series") {
    //   emits("changeDate", dayjs(params.value[0]).format("YYYY-MM-DD"));
    // }
  });
};
watch(
  () => props.data,
  (newVal) => {
    chart.setOption({
      series: [
        {
          data: newVal,
        },
      ],
    });
    //@ts-ignore
    chart.resize();
  }
);
</script>
<template>
  <div :id="riverId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
