<script setup lang="ts">
import { ElMessage } from "element-plus";
import xyChart from "@/components/chart/xyChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
export interface Rank extends User {
  totalBean: number;
  pictureSettings: {
    src: string;
  };
}
const rankMark = ref<string>("today");
const rankList = ref<Rank[]>([]);
const seeAll = ref<number>(0);
const getRankInfo = async () => {
  let obj: any = { mark: rankMark.value };
  seeAll.value ? (obj.seeAll = seeAll.value) : null;
  const rankRes = (await api.request.get("partner/rank", {
    ...obj,
  })) as ResultProps;
  if (rankRes.msg === "OK") {
    rankList.value = rankRes.data.map((item: Rank) => {
      item.pictureSettings = {
        src: item.userAvatar,
      };
      return item;
    });
    rankList.value = [...rankList.value];
  }
};
watchEffect(() => {
  getRankInfo();
});
</script>
<template>
  <theader isMenu>
    <template #left>
      {{ rankMark === "today" ? "Ranking of Beans" : "Ranking of Todo" }}
    </template>
  </theader>
  <div class="rank">
    <div class="rank-nav dp-center-center">
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
    </div>
    <div class="rank-chart" v-if="rankList.length > 0">
      <xyChart
        XYId="XYContentId"
        :width="'100vw'"
        :height="rankList.length * 30 + 150 + 'px'"
        :data="rankList"
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
  height: calc(100vh - 55px);

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
    min-height: calc(100% - 40px);
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
