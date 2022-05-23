<script setup lang="ts">
import { ElMessage } from "element-plus";
import xyChart from "@/components/chart/xyChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
import { storeToRefs } from "pinia";
import appStore from "@/store";
export interface Rank extends User {
  totalBean: number;
  createDate: string;
}
const dayjs: any = inject("dayjs");
const { deviceType } = storeToRefs(appStore.commonStore);
const rankMark = ref<string>("today");
const rankList = ref<any>([]);
const seeAll = ref<number>(0);

const rankDay = ref<number>(7);
const rankUser = ref<any>({});
const timeList = ref<string[]>([]);
const chartUser = ref<any>([]);
const getRankInfo = async () => {
  let obj: any = {};
  if (rankMark.value === "today") {
    obj.startDate = dayjs().subtract(rankDay.value, "day").format("YYYY-MM-DD");
    obj.endDate = dayjs().format("YYYY-MM-DD");
  } else {
    obj.mark = rankMark.value;
  }
  seeAll.value ? (obj.seeAll = seeAll.value) : null;
  for (let i = 0; i < rankDay.value; i++) {
    timeList.value.unshift(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
  }
  const rankRes = (await api.request.get("partner/rank", {
    ...obj,
  })) as ResultProps;
  if (rankRes.msg === "OK") {
    rankRes.data.forEach((item: Rank) => {
      if (!rankUser.value[item._key]) {
        rankUser.value[item._key] = {
          userAvatar: item.userAvatar,
          userName: item.userName,
          _key: item._key,
        };
      }
      rankUser.value[item._key][item.createDate] = {
        totalBean: item.totalBean,
      };
    });
    // rankList.value = [...rankList.value];
    timeList.value.forEach((item, index) => {
      rankList.value[index] = [];
      for (let key in rankUser.value) {
        let userItem = rankUser.value[key];
        chartUser.value.push(userItem.userName);
        if (!userItem[item]) {
          userItem[item] = { totalBean: 0 };
        }
        rankList.value[index].push(userItem[item].totalBean);
      }
    });
    console.log(rankList.value)
  }
};
watchEffect(() => {
  getRankInfo();
});
</script>
<template>
  <theader isMenu v-if="!deviceType">
    <template #left>
      {{ rankMark === "today" ? "Ranking of Beans" : "Ranking of Todo" }}
    </template>
  </theader>
  <div
    class="rank p-5"
    :style="{ height: deviceType ? '100vh' : 'calc(100vh - 55px)' }"
  >
    <!-- <div class="rank-nav dp-center-center">
      <div
        :style="
          rankMark === 'today'
            ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
            : {}
        "
        @click="rankMark = 'today'"
      >
        Today
      </div>
      <div
        style="margin: 0px 35px"
        :style="
          rankMark === 'next'
            ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
            : {}
        "
        @click="rankMark = 'next'"
      >
        NextDay
      </div>
      <div
        :style="
          rankMark === 'future'
            ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
            : {}
        "
        @click="rankMark = 'future'"
      >
        Future
      </div>
    </div> -->
    <div class="rank-chart" v-if="rankList.length > 0">
      <xyChart
        XYId="XYContentId"
        :width="'100%'"
        :height="rankList.length * 40 + 150 + 'px'"
        :rankData="rankList"
        :name="chartUser"
        :day="rankDay"
      />
    </div>

    <div class="rank-button p-5">
      <span class="icon-point" @click="seeAll = 1" v-if="seeAll === 0"
        >See All</span
      >
      <span class="icon-point" @click="seeAll = 0" v-if="seeAll === 1"
        >See Single</span
      >
    </div>
  </div>
</template>
<style scoped lang="scss">
.rank {
  width: 100%;
  position: relative;
  z-index: 1;
  padding-bottom: 40px;
  box-sizing: border-box;
  .rank-nav {
    width: 100%;
    height: 30px;
    margin-bottom: 10px;
    & > div {
      height: 100%;
      padding: 0px 10px;
      cursor: pointer;
    }
  }
  .rank-chart {
    width: 100%;
    height: calc(100% - 40px);
    overflow-x: hidden;
    overflow-y: auto;
  }
  .rank-button {
    width: 100%;
    height: 40px;
    position: absolute;
    left: 0px;
    bottom: 0px;
    z-index: 2;
    text-align: right;
  }
}
</style>
<style></style>
