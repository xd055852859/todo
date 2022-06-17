<script setup lang="ts">
import { ElMessage } from "element-plus";
import lineChart from "@/components/chart/lineChart.vue";
import xyChart from "@/components/chart/xyChart.vue";
import { ArrowDown } from "@element-plus/icons-vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { userInfo } from "os";
export interface Rank extends User {
  totalBean: number;
  createDate: string;
}
const router = useRouter();
const dayjs: any = inject("dayjs");
const { user } = storeToRefs(appStore.authStore);
const { deviceType } = storeToRefs(appStore.commonStore);
const rankMark = ref<string>("today");
const rankList = ref<any>([]);
const rankArray = ref<any>([]);
const seeAll = ref<number>(0);

const rankDay = ref<number>(1);
const rankStr = ref<string>("Today");
const rankUser = ref<any>({});
const timeList = ref<string[]>([]);
const chartUser = ref<any>([]);
onMounted(() => {
  getRankInfo();
});
const getRankInfo = async () => {
  let obj: any = {};
  timeList.value = [];
  rankList.value = [];
  chartUser.value = [];
  rankUser.value = {};

  if (rankMark.value === "today") {
    obj.startDate = dayjs()
      .subtract(rankDay.value - 1, "day")
      .format("YYYY-MM-DD");
    obj.endDate = dayjs().format("YYYY-MM-DD");
  } else {
    obj.mark = rankMark.value;
  }
  for (let i = 0; i < rankDay.value; i++) {
    timeList.value.unshift(dayjs().subtract(i, "day").format("MM-DD"));
  }
  const rankRes = (await api.request.get("partner/rank", {
    ...obj,
  })) as ResultProps;
  if (rankRes.msg === "OK") {
    let arr: any = [];
    let obj1: any = {};
    if (rankRes.data.length > 0) {
      rankRes.data.forEach((item: Rank) => {
        if (!rankUser.value[item._key]) {
          rankUser.value[item._key] = {};
          chartUser.value.push(item.userName);
        }
        rankUser.value[item._key][dayjs(item.createDate).format("MM-DD")] =
          item.totalBean;
        // obj1[item._key] = {
        //   name: item.userName,
        //   type: "line",
        //   // data: [],
        //   data: 0,
        //   emphasis: {
        //     focus: "series",
        //   },
        //   areaStyle: {},
        //   smooth: true,
        // };
        obj1[item._key] = {
          name: item.userName,
          type: "line",
          // data: [],
          data: 0,
          _key: item._key,
        };
      });
      console.log(rankUser.value);
      // rankList.value = [...rankList.value];
      timeList.value.forEach((item, index) => {
        for (let key in rankUser.value) {
          let userItem = rankUser.value[key];
          if (!userItem[item]) {
            userItem[item] = 0;
          }
          // obj1[key].data.push(userItem[item]);
          obj1[key].data = obj1[key].data + userItem[item];
        }
      });
      rankArray.value = Object.values(obj1);
      rankList.value = rankArray.value.map((item: any) => {
        return item.data;
      });
    }
    console.log(chartUser.value);
    console.log(rankList.value);
    console.log(timeList.value);
  }
};
const changeMate = (index: number) => {
  console.log(rankArray.value);
  console.log(index);
  let key = rankArray.value[index]._key;
  if (key !== user.value?._key) {
    router.push("/home/mate/" + key);
  }
};
</script>
<template>
  <theader isMenu>
    <template #left>
      {{ $t(`Ranking of Beans`) }}
    </template>
    <template #right>
      <el-dropdown>
        <div class="icon-point">
          {{ $t(rankStr) }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              @click="
                rankStr = $t(`Today`);
                rankDay = 1;
                getRankInfo();
              "
            >
              {{ $t(`Today`) }}</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = $t(`yesterday`);
                rankDay = 2;
                getRankInfo();
              "
              >{{ $t(`yesterday`) }}</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = $t(`Last 7 days`);
                rankDay = 7;
                getRankInfo();
              "
              >{{ $t(`Last 7 days`) }}</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = $t(`Last 30 days`);
                rankDay = 30;
                getRankInfo();
              "
              >{{ $t(`Last 30 days`) }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </theader>
  <div
    class="rank"
    :class="{ 'p-3': deviceType !== 'mobile' }"
    :style="{
      height: deviceType === 'mobile' ? '100vh' : 'calc(100vh - 55px)',
    }"
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
      <!-- <lineChart
        lineId="XYContentId"
        :width="'100%'"
        :height="'100%'"
        :rankData="rankList"
        :timeList="timeList"
        :nameList="chartUser"
        @changeMate="changeMate"
      /> -->
      <xyChart
        XYId="XYContentId"
        :width="'100%'"
        :height="'100%'"
        :rankData="rankList"
        :timeList="timeList"
        :name="chartUser"
        @changeMate="changeMate"
      />
    </div>
    <el-empty :description="'No Rank'" v-else />
    <!-- <div class="rank-button p-3">
      <span class="icon-point" @click="seeAll = 1" v-if="seeAll === 0"
        >See All</span
      >
      <span class="icon-point" @click="seeAll = 0" v-if="seeAll === 1"
        >See Single</span
      >
    </div> -->
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
    height: 100%;
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
