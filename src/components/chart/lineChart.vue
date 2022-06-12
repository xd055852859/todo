<script setup lang="ts">
import * as echarts from "echarts";
const props = defineProps<{
  rankData: any;
  timeList: string[];
  nameList: string[];
  lineId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
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
  var chartDom = document.getElementById(props.lineId)!;
  chart = echarts.init(chartDom);
  var option = {
    tooltip: {
      trigger: "axis",
      // axisPointer: {
      //   type: "cross",
      //   label: {
      //     backgroundColor: "#6a7985",
      //   },
      // },
    },
    legend: {
      data: props.nameList,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: props.timeList,
    },
    yAxis: {
      type: "value",
    },
    series: props.rankData,
  };
  option && chart.setOption(option);
  //   console.log(props.data);
  // chart.on("click", function (params) {
  //   console.log(params.componentType);
  //   console.log(params.value);
  //   // if (params.componentType === "singleAxis") {
  //   //   emits("changeDate", dayjs(params.value).format("YYYY-MM-DD"));
  //   // }
  // });
};
watch(
  () => props.rankData,
  (newVal) => {
    chart.value.setOption({
      series: newVal,
    });
  }
);
</script>
<template>
  <div :id="lineId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
