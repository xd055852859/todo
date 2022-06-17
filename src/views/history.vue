<script setup lang="ts">
import TaskItem from "@/components/taskItem.vue";
import TimelineItem from "@/components/timelineItem.vue";
import riverChart from "@/components/chart/riverChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { ArrowDown } from "@element-plus/icons-vue";
import { Task } from "@/interface/Task";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Avatar from "@/components/avatar.vue";
const dayjs: any = inject("dayjs");
const route = useRoute();
const { user, mateList } = storeToRefs(appStore.authStore);
const { deviceType, chartType } = storeToRefs(appStore.commonStore);
const createdMateList = computed(() => [user.value, ...mateList.value]);

const searchList = computed(() =>
  createdMateList.value.filter((item) => {
    return item?.userName.indexOf(searchInput.value) !== -1;
  })
);

const historyChartList = ref<(string | number)[]>([]);
const historyList = ref<any>([]);
const timelineList = ref<any>([]);
const historyType = ref<string>("report");
const historyDate = ref<string>(dayjs().format("YYYY-MM-DD"));
const overKey = ref<string>("");
const friendKey = ref<string>("");
const searchInput = ref<string>("");
const historyName = ["创建", "完成"];
const createdMateIndex = ref<number>(0);
onMounted(() => {
  console.log(route.params.id);
  console.log(route.params.id && route.params.id !== "create");
  if (route.params.id && route.params.id !== "create") {
    let index = createdMateList.value.findIndex(
      (item) => item?._key === route.params.id
    );
    if (index !== -1) {
      friendKey.value = route.params.id as string;
      createdMateIndex.value = index;
    }
  }
});
const getHistoryChartInfo = async (friendKey) => {
  let obj: any = { date: historyDate.value };
  friendKey ? (obj.friendKey = friendKey) : null;
  const historyRes = (await api.request.get("card/user/report", {
    ...obj,
  })) as ResultProps;
  if (historyRes.msg === "OK") {
    let arr1: (string | number)[] = [];
    let arr2: (string | number)[] = [];
    arr1 = historyRes.data.map((item) => {
      return [item.fullDate.replace(/-/g, "/"), item.createScore, "创建"];
    });
    arr2 = historyRes.data.map((item) => {
      return [item.fullDate.replace(/-/g, "/"), item.finishScore, "完成"];
    });
    historyChartList.value = [...arr1, ...arr2];
    console.log(historyChartList.value);
  }
};
const getHistoryInfo = async (friendKey) => {
  let obj: any = { date: historyDate.value };
  friendKey ? (obj.friendKey = friendKey) : null;
  const historyRes = (await api.request.get("card/user/history", {
    ...obj,
  })) as ResultProps;
  if (historyRes.msg === "OK") {
    historyList.value = historyRes.data;
  }
};
const getTimelineInfo = async (friendKey) => {
  let obj: any = { date: historyDate.value };
  friendKey ? (obj.friendKey = friendKey) : null;
  const timelineRes = (await api.request.get("card/user/timeline", {
    ...obj,
  })) as ResultProps;
  if (timelineRes.msg === "OK") {
    timelineList.value = timelineRes.data;
    console.log(timelineList.value);
  }
};
const changeDate = (date: string) => {
  historyDate.value = date;
};
watchEffect(() => {
  if (user.value) {
    getHistoryChartInfo(friendKey.value);
    if (historyType.value === "report") {
      getHistoryInfo(friendKey.value);
    } else {
      getTimelineInfo(friendKey.value);
    }
  }
});
</script>
<template>
  <theader isMenu v-if="!chartType">
    <template #left> {{ $t(`History`) }} </template>
    <template #right>
      <el-dropdown>
        <div
          class="dp--center icon-point"
          style="font-size: 16px; font-weight: 600"
        >
          <avatar
            :name="createdMateList[createdMateIndex]?.userName"
            :avatar="createdMateList[createdMateIndex]?.userAvatar"
            type="person"
            :index="0"
            :size="30"
            :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
          />
          {{ createdMateList[createdMateIndex]?.userName }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <div class="header-contact" v-if="searchList">
            <div class="contact-top dp-space-center p-3">
              <el-input
                v-model="searchInput"
                placeholder="Search Mate"
                style="height: 35px"
              />
            </div>
            <div class="contact-bottom">
              <div
                class="contact-item container dp--center p-3 icon-point"
                v-for="(item, index) in searchList"
                :key="'listItem' + index"
                @click="
                  //@ts-ignore
                  friendKey = item?._key;
                  createdMateIndex = index;
                "
              >
                <avatar
                  :name="item?.userName"
                  :avatar="item?.userAvatar"
                  type="person"
                  :index="0"
                  :size="30"
                  :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
                />{{ item?.userName }}
              </div>
            </div>
          </div>
        </template>
      </el-dropdown>
    </template>
  </theader>
  <div
    class="history"
    :style="
      chartType
        ? {}
        : {
            height: deviceType==='mobile' ? '100vh' : 'calc(100vh - 55px)',
          }
    "
  >
    <template v-if="historyChartList.length > 0">
      <riverChart
        riverId="riverContentId"
        :width="'100%'"
        :height="chartType ? '100vh' : '30vh'"
        :data="historyChartList"
        :name="historyName"
        @changeDate="changeDate"
        :simpleState="!!chartType"
      />
    </template>

    <div
      class="history-box p-3"
      :style="{
        height: deviceType==='mobile' ? 'calc(70vh - 25px)' : 'calc(70vh - 70px)',
      }"
      v-if="!chartType"
    >
      <div class="dp-space-center">
        <div class="history-nav dp--center">
          {{ dayjs(historyDate).format("MM.DD") }} 周{{
            "日一二三四五六".split("")[dayjs(historyDate).day()]
          }}
        </div>
        <div class="dp--center">
          <div
            :style="
              historyType === 'report'
                ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
                : {}
            "
            @click="historyType = 'report'"
            class="icon-point"
          >
            {{ $t(`Report`) }}
          </div>
          <div
            style="margin: 0px 15px"
            :style="
              historyType === 'timeline'
                ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
                : {}
            "
            @click="historyType = 'timeline'"
            class="icon-point"
          >
            {{ $t(`Timeline`) }}
          </div>
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
  max-height: calc(100vh - 55px);
  .history-box {
    width: 100%;
    margin-top: 15px;
    .history-nav {
      // width: 100%;
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
