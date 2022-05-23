<script setup lang="ts">
import TaskItem from "@/components/taskItem.vue";
import TimelineItem from "@/components/timelineItem.vue";
import riverChart from "@/components/chart/riverChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const dayjs: any = inject("dayjs");
const { deviceType } = storeToRefs(appStore.commonStore);

const props = defineProps<{ targetKey: string }>();

const historyChartList = ref<(string | number)[]>([]);
const historyList = ref<any>([]);
const timelineList = ref<any>([]);
const historyType = ref<string>("report");
const historyDate = ref<string>(dayjs().format("YYYY-MM-DD"));
const overKey = ref<string>("");
const historyName = ["创建", "完成"];
const getHistoryChartInfo = async () => {
  const historyRes = (await api.request.get(
    "card/user/report",
    {}
  )) as ResultProps;
  if (historyRes.msg === "OK") {
    let arr1: (string | number)[] = [];
    let arr2: (string | number)[] = [];
    arr1 = historyRes.data.map((item) => {
      console.log(item);
      return [item.fullDate.replace(/-/g, "/"), item.createScore, "创建"];
    });
    arr2 = historyRes.data.map((item) => {
      return [item.fullDate.replace(/-/g, "/"), item.finishScore, "完成"];
    });
    historyChartList.value = [...arr1, ...arr2];
  }
};
const getHistoryInfo = async () => {
  let obj: any = { date: historyDate.value };
  props.targetKey !== "self" ? (obj.friendKey = props.targetKey) : null;
  const historyRes = (await api.request.get("card/user/history", {
    ...obj,
  })) as ResultProps;
  if (historyRes.msg === "OK") {
    historyList.value = historyRes.data;
  }
};
const getTimelineInfo = async () => {
  let obj: any = { date: historyDate.value };
  props.targetKey !== "self" ? (obj.friendKey = props.targetKey) : null;
  const timelineRes = (await api.request.get("card/user/timeline", {
    ...obj,
  })) as ResultProps;
  if (timelineRes.msg === "OK") {
    timelineList.value = timelineRes.data;
    console.log(timelineList.value);
  }
};
watchEffect(() => {
  getHistoryChartInfo();
});
watchEffect(() => {
  if (historyType.value === "report") {
    getHistoryInfo();
  } else {
    getTimelineInfo();
  }
});
</script>
<template>
  <theader isMenu v-if="!deviceType">
    <template #left> History </template>
  </theader>
  <div
    class="history p-5"
    :style="{ height: deviceType ? '100vh' : 'calc(100vh - 55px)' }"
  >
    <template v-if="historyChartList.length > 0">
      <riverChart
        riverId="riverContentId"
        :width="'100%'"
        :height="'30vh'"
        :data="historyChartList"
        :name="historyName"
      />
    </template>

    <div
      class="history-box"
      :style="{
        height: deviceType ? 'calc(70vh - 25px)' : 'calc(70vh - 70px)',
      }"
    >
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
        <template v-if="historyType === 'report'">
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
              <task-item
                :item="taskItem"
                :overKey="overKey"
                type="report"
                :role="0"
              />
            </template>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(taskItem, taskIndex) in timelineList"
            :key="'taskItem' + taskIndex"
            @mouseenter="overKey = taskItem._key"
          >
            <timeline-item :item="taskItem" :overKey="overKey" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.history {
  width: 100%;

  .history-box {
    width: 100%;
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
