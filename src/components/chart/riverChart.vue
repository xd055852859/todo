<script setup lang="ts">
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ElMessage } from "element-plus";
import { Rank } from "@/views/rank.vue";
import { HistoryChartProps } from "@/views/history.vue";
const props = defineProps<{
  data: HistoryChartProps[];
  riverId: string;
  width?: string;
  height?: string;
  zoom?: number;
  onClick?: Function;
}>();
const chart = ref<any>(null);
const seriesChart = ref<any>(null);
onMounted(() => {
  createChart(props.data);
});
const createChart = (data: HistoryChartProps[]) => {
  let root = am5.Root.new(props.riverId);

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([am5themes_Animated.new(root)]);

  // Create chart
  // https://www.amcharts.com/docs/v5/charts/xy-chart/
  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  // Add legend
  // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
  let legend = chart.children.push(
    am5.Legend.new(root, {
      centerY: am5.p50,
      y: am5.p100,
      layout: root.horizontalLayout,
      clickTarget: "none",
    })
  );

  legend.valueLabels.template.set("forceHidden", true);

  // Data
  // let data = [
  //   { data: "5.12", score: 0 },
  //   { data: "1900", score: 0 },
  //   { data: "1904", score: 0 },
  //   { data: "1908", score: 0 },
  //   { data: "1912", score: 0 },
  //   { data: "1916", score: 1 },
  //   { data: "1920", score: 1 },
  // ];

  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  let xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      startLocation: 0.5,
      endLocation: 0.5,
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 40,
      }),
      tooltip: am5.Tooltip.new(root, {}),
    })
  );

  xAxis.data.setAll(data);

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
    })
  );
  // yAxis.events.on("click", function (ev) {
  //   console.log("Clicked on a column", ev.target);
  // });
  //   yAxis.template.events.on("click", function(ev) {
  //   console.log("Clicked on a column", ev.target);
  // });

  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  function createSeries(field, name) {
    seriesChart.value = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueField: field,
        valueYField: field + "_hi",
        openValueYField: field + "_low",
        categoryXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText:
            "[fontSize: 18px]{name}[/]\n{categoryX}: [bold]{" + field + "}[/]",
        }),
      })
    );

    // Do not show tooltip for zero values
    seriesChart.value
      .get("tooltip")
      .adapters.add("visible", function (visible, target) {
        if (target.dataItem && target.dataItem.get("value") > 0) {
          return true;
        }
        return false;
      });
    // seriesChart.value.columns.template.events.on("click", function (e) {
    //   console.log(">???");
    // });
    seriesChart.value.strokes.template.setAll({
      forceHidden: true,
    });

    seriesChart.value.fills.template.setAll({
      visible: true,
      fillOpacity: 1,
    });

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    seriesChart.value.appear();

    legend.data.push(seriesChart.value);
  }
  createSeries("score", "score");

  // Prepare data for the river-stacked series
  for (var i = 0; i < data.length; i++) {
    let row = data[i];
    let sum = 0;

    // Calculate open and close values
    chart.series.each(function (series) {
      let field = series.get("valueField");
      let val = Number(row[field as string]);
      row[field + "_low"] = sum;
      row[field + "_hi"] = sum + val;
      sum += val;
    });

    // Adjust values so they are centered
    let offset = sum / 2;
    chart.series.each(function (series) {
      let field = series.get("valueField");
      row[field + "_low"] -= offset;
      row[field + "_hi"] -= offset;
    });

    chart.series.each(function (series) {
      let field = series.get("valueField");
      series.data.setAll(data);
    });
  }

  // Add cursor
  chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis,
    })
  );

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  chart.appear(1000, 100);
};
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      seriesChart.value.data.setAll(newData);
    }
  }
);
</script>
<template>
  <div :id="riverId" :style="{ width: width, height: height }"></div>
</template>
<style scoped lang="scss"></style>
<style></style>
