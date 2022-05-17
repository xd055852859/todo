<script setup lang="ts">
import TaskItem from "@/components/taskItem.vue";
import riverChart from "@/components/chart/riverChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
export interface HistoryChartProps {
  date: string;
  score: number;
}
const dayjs: any = inject("dayjs");
const historyChartList = ref<HistoryChartProps[]>([]);
const historyList = ref<any>([]);
const historyType = ref<string>("report");
const historyDate = ref<string>(dayjs().format("YYYY-MM-DD"));
const overKey = ref<string>("");
const getHistoryChartInfo = async () => {
  const historyRes = (await api.request.get(
    "card/user/report",
    {}
  )) as ResultProps;
  if (historyRes.msg === "OK") {
    historyChartList.value = historyRes.data;
  }
};
const getHistoryInfo = async () => {
  let obj: any = { date: historyDate.value };
  // targetKey.value ? (obj.friendKey = targetKey.value) : null;
  const historyRes = (await api.request.get("card/user/history", {
    ...obj,
  })) as ResultProps;
  if (historyRes.msg === "OK") {
    historyList.value = historyRes.data;
  }
};
watchEffect(() => {
  getHistoryChartInfo();
});
watchEffect(() => {
  getHistoryInfo();
});
</script>
<template>
  <theader isMenu>
    <template #left> History </template>
  </theader>
  <div class="history">
    <template v-if="historyChartList.length > 0">
      <riverChart
        riverId="riverContentId"
        :width="'100vw'"
        :height="'30vh'"
        :data="historyChartList"
      />
    </template>
    <div class="history-box">
      <div class="history-nav dp-center-center">
        <div
          :style="
            historyType === 'report'
              ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
              : {}
          "
          @click="historyType = 'report'"
        >
          Report
        </div>
        <div
          style="margin: 0px 35px"
          :style="
            historyType === 'timeline'
              ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
              : {}
          "
          @click="historyType = 'timeline'"
        >
          Timeline
        </div>
      </div>
      <div class="history-container">
        <div
          v-for="(item, index) in historyList"
          :key="'task' + index"
          class="task"
        >
          <div class="task-title"># {{ item.boardInfo.title }}</div>
          <template
            v-for="(taskItem, taskIndex) in item.cards"
            :key="'taskItem' + taskIndex"
            @mouseenter="overKey = taskItem._key"
          >
            <task-item :item="taskItem" :overKey="overKey" type="report" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.history {
  width: 100%;
  height: calc(100vh - 55px);

  .history-box {
    width: 100%;
    height: calc(70vh - 70px);
    margin-top: 15px;
    .history-nav {
      width: 100%;
      height: 30px;
      margin-bottom: 10px;
      & > div {
        height: 100%;
        padding: 0px 10px;
        cursor: pointer;
      }
    }
    .history-container {
      width: 100%;
      height: calc(100% - 40px);
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
</style>
<style></style>
