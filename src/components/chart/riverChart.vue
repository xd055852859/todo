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
const emits = defineEmits<{
  (e: "changeDate", date: string): void;
}>();
const dayjs: any = inject("dayjs");
onMounted(() => {
  createChart();
});
const chart = ref<any>(null);
const createChart = () => {
  var chartDom = document.getElementById(props.riverId)!;
  chart.value = echarts.init(chartDom);
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
      triggerEvent: true,
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
        label: { show: false },
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

  option && chart.value.setOption(option);
  console.log(props.data);
  chart.value.on("click", function (params) {
    if (params.componentType === "singleAxis") {
      emits("changeDate", dayjs(params.value).format("YYYY-MM-DD"));
    }
  });
};
watch(
  () => props.data,
  (newVal) => {
    chart.value.setOption({
      series: [
        {
          data: newVal,
        },
      ],
    });
  }
);
</script>
<template>
  <div :id="riverId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
