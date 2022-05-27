<script setup lang="ts">
import { ElMessage } from "element-plus";
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
const seeAll = ref<number>(0);

const rankDay = ref<number>(1);
const rankStr = ref<string>("Today");
const rankUser = ref<any>({});
const timeList = ref<string[]>([]);
const chartUser = ref<any>([]);
const chartUserObj = ref<any>({});
onMounted(()=>{
  getRankInfo()
})
const getRankInfo = async () => {
  let obj: any = {};
  timeList.value = [];
  rankList.value = [];
  chartUser.value = [];
  chartUserObj.value = {};
  rankUser.value = {};

  if (rankMark.value === "today") {
    obj.startDate = dayjs()
      .subtract(rankDay.value - 1, "day")
      .format("YYYY-MM-DD");
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
        if (!chartUserObj.value[userItem._key]) {
          chartUser.value.push({
            value: userItem.userName,
            _key: userItem._key,
          });
          chartUserObj.value[userItem._key] = {
            value: userItem.userName,
            _key: userItem._key,
          };
        }
        if (!userItem[item]) {
          userItem[item] = { totalBean: 0 };
        }
        if (index === 0) {
          rankList.value[index].push(userItem[item].totalBean);
        } else {
          rankList.value[index].push(
            userItem[item].totalBean +
              rankList.value[index - 1][rankList.value[index].length]
          );
        }
      }
    });
  }
};
const changeMate = (key: string) => {
  console.log(key);
  if (key !== user.value?._key) {
    router.push("/home/mate/" + key);
  }
};

</script>
<template>
  <theader isMenu>
    <template #left>
      {{ rankMark === "today" ? "Ranking of Beans" : "Ranking of Todo" }}
    </template>
    <template #right>
      <el-dropdown>
        <div>
          {{ rankStr }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              @click="
                rankStr = 'Today';
                rankDay = 1;
                getRankInfo()
              "
              >Today</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = 'Yesterday';
                rankDay = 2;
                getRankInfo()
              "
              >Yesterday</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = 'Latest 7 days';
                rankDay = 7;
                getRankInfo()
              "
              >Latest 7 days</el-dropdown-item
            >
            <el-dropdown-item
              @click="
                rankStr = 'Latest 30 days';
                rankDay = 30;
                getRankInfo()
              "
              >Latest 30 days</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </theader>
  <div
    class="rank"
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
        :timeList="timeList"
        :name="chartUser"
        :day="rankDay"
        @changeMate="changeMate"
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
