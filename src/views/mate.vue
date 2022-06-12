<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { Mate } from "@/interface/User";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { MoreFilled, Delete } from "@element-plus/icons-vue";

import appStore from "@/store";
import logoSvg from "../assets/svg/logo.svg";
import Avatar from "@/components/avatar.vue";
import RiverChart from "@/components/chart/riverChart.vue";
import i18n from "@/language/i18n";
const socket: any = inject("socket");
const dayjs: any = inject("dayjs");
const { user } = storeToRefs(appStore.authStore);
const { setFriendInfo } = appStore.authStore;
const { addMateList, delMateList } = appStore.authStore;
const route = useRoute();
const router = useRouter();

const mateKey = ref<string>("");
const mateInfo = ref<Mate | null>(null);
const shareTitle = ref<string>("");
const allTitle = ref<string>("");
const delVisible = ref<boolean>(false);
const historyDate = ref<string>(dayjs().format("YYYY-MM-DD"));
const historyChartList = ref<(string | number)[]>([]);
const historyName = ["创建", "完成"];
onMounted(() => {
  mateKey.value = route.params.id as string;
  console.log(mateKey.value);
  getMateInfo();
  getHistoryChartInfo();
  socket.on("onlineStatus", (data) => {
    console.log(data, "onlineStatus");
    if (data._key === mateKey.value) {
      mateInfo.value = { ...mateInfo.value, ...data };
    }
  });
});
const getMateInfo = async () => {
  const targetRes = (await api.request.get("user/target", {
    targetUser: mateKey.value,
  })) as ResultProps;
  if (targetRes.msg === "OK") {
    mateInfo.value = targetRes.data;
    if (targetRes.data.yShareBeans === 0 && targetRes.data.shareBeans > 0) {
      shareTitle.value = "↑ 100%";
    } else if (
      targetRes.data.shareBeans === 0 &&
      targetRes.data.yShareBeans > 0
    ) {
      shareTitle.value = "↓ 100%";
    } else if (
      targetRes.data.shareBeans === 0 &&
      targetRes.data.yShareBeans === 0
    ) {
      shareTitle.value = "0%";
    } else {
      let num = parseInt(
        ((targetRes.data.shareBeans - targetRes.data.yShareBeans) /
          targetRes.data.yShareBeans) *
          100 +
          ""
      );
      shareTitle.value = num < 0 ? "↓ " + num + "%" : "↑ " + num + "%";
    }
    if (targetRes.data.yTotalBeans === 0 && targetRes.data.totalBeans > 0) {
      allTitle.value = "↑ 100%";
    } else if (
      targetRes.data.totalBeans === 0 &&
      targetRes.data.yTotalBeans > 0
    ) {
      allTitle.value = "↓ 100%";
    } else if (
      targetRes.data.totalBeans === 0 &&
      targetRes.data.yTotalBeans === 0
    ) {
      allTitle.value = "0%";
    } else {
      let num = parseInt(
        (targetRes.data.totalBeans -
          targetRes.data.yTotalBeans / targetRes.data.yTotalBeans) *
          100 +
          ""
      );
      allTitle.value = num < 0 ? "↓ " + (num - 100) + "%" : "↑ " + num + "%";
    }
  }
};
const getHistoryChartInfo = async () => {
  const historyRes = (await api.request.get("card/user/report", {
    date: historyDate.value,
    friendKey: mateKey.value,
  })) as ResultProps;
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
const saveMate = async () => {
  const saveRes = (await api.request.post("partner", {
    friendKey: mateKey.value,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Adding friends successful`),
      type: "success",
      duration: 1000,
    });
    addMateList(saveRes.data);
    getMateInfo();
    // store.dispatch("auth/getGroupList");
    // router.push("/home");
  }
};
const delMate = async () => {
  const saveRes = (await api.request.delete("partner", {
    friendKey: mateKey.value,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Delete Friend Success`),
      type: "success",
      duration: 1000,
    });
    delMateList(mateKey.value);
    // store.dispatch("auth/getGroupList");
    router.back();
  }
};
</script>
<template>
  <theader>
    <template #left>Mate</template>
    <template #right>
      <el-dropdown>
        <el-icon>
          <MoreFilled />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="mateInfo?.added" @click="delVisible = true">
              <icon-font name="delMate" :size="22" class="icon-point" />
              Delete Mate
            </el-dropdown-item>
            <el-dropdown-item v-else @click="saveMate">
              <icon-font name="addMate" :size="22" class="icon-point" />
              Add Mate
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- <icon-font
        name="eye"
        :size="14"
        style="margin-left: 8px; margin-right: 8px"
      />
      <span style="font-size: 14px">{{ mateInfo?.viewNum }}</span> -->
    </template>
  </theader>
  <div class="mate p-3" v-if="mateInfo">
    <div class="mate-top dp-center-center">
      <div class="mate-avatar dp-center-center">
        <!-- <img :src="mateInfo.userAvatar" alt="" /> -->
        <avatar
          :name="mateInfo.userName"
          :avatar="mateInfo.userAvatar"
          type="person"
          :index="0"
          :size="150"
          showOnline
          :online-state="mateInfo.online"
        />
      </div>
      <div class="mate-name">{{ mateInfo.userName }}</div>
      <div class="mate-info dp-space-center">
        <div
          class="dp-center-center"
          :class="{ 'icon-point': mateInfo?.added }"
          style="width: 33%"
          @click="
            if(mateInfo?.added){
              setFriendInfo({
                _key:  mateKey,
                userAvatar: mateInfo?.userAvatar as string,
                userName: mateInfo?.userName as string
              });
              $router.push('/home/list')
            }"
        >
          <icon-font name="list" :size="24" style="margin-right: 8px" />{{$t(`Todo`)}} (
          {{ mateInfo.todoNum }} )
        </div>
        <div
          class="dp-center-center"
          :class="{ 'icon-point': mateInfo?.added }"
          style="width: 33%"
          @click="
            mateInfo?.added
              ? $router.push({
                  name: 'matesBoard',
                  params: { id: mateKey, name: mateInfo.userName },
                })
              : null
          "
        >
          <icon-font name="boards" :size="24" style="margin-right: 8px" />{{$t(`Boards`)}}
          ( {{ mateInfo.boardNum }} )
        </div>
        <div
          class="dp-center-center"
          :class="{ 'icon-point': mateInfo?.added }"
          style="width: 33%"
          @click="
            mateInfo?.added ? $router.push('/home/matesMate/' + mateKey) : null
          "
        >
          <icon-font name="mates" :size="24" style="margin-right: 8px" />{{$t(`Mates`)}} (
          {{ mateInfo.partnerNum }} )
        </div>
      </div>
    </div>
    <div
      v-if="historyChartList.length > 0"
      @click="$router.push('/history/' + mateKey)"
    >
      <river-chart
        riverId="riverContentId"
        :width="'100%'"
        :height="'30vh'"
        :data="historyChartList"
        :name="historyName"
        simpleState
      />
    </div>
    <div
      class="mate-box p-3"
      :style="{ background: mateInfo.added ? '#fff' : '' }"
    >
      <div class="mate-bottle dp-center-center">
        <div class="mate-bottle-title common-color">{{$t(`Beans History`)}}</div>
      </div>
      <div class="mate-data dp-space-center">
        <div class="mate-data-item dp-center-center common-color">
          <div>{{ mateInfo.historyShareBeans }}</div>
          <div>{{$t(`share`)}}</div>
        </div>
        <div class="mate-data-item dp-center-center common-color">
          <div>{{ mateInfo.historyTotalBeans }}</div>
          <div>{{$t(`all`)}}</div>
        </div>
      </div>
    </div>
    <div
      class="mate-box p-3"
      :style="{ background: mateInfo.added ? '#fff' : '' }"
    >
      <div class="mate-bottle dp-center-center">
        <div class="mate-bottle-title common-color">{{$t(`Beans Today`)}}</div>
      </div>
      <div class="mate-data dp-space-center">
        <div class="mate-data-item dp-center-center common-color">
          <div>{{ mateInfo.shareBeans }}</div>
          <div>{{$t(`share`)}}</div>
          <div>
            {{$t(`Compare yesterday`)}} <span>{{ shareTitle }}</span>
          </div>
        </div>
        <div class="mate-data-item dp-center-center common-color">
          <div>{{ mateInfo.totalBeans }}</div>
          <div>{{$t(`all`)}}</div>
          <div>
           {{$t(`Compare yesterday`)}} <span>{{ allTitle }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="delVisible" title="Delete prompt" width="350px">
    <span>Delete Mate</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="delVisible = false" bgColor="#d1dbe5">
          {{$t(`Cancel`)}}
        </tbutton>
        <tbutton @click="delMate">{{$t(`Confirm`)}}</tbutton>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.mate {
  width: 100%;
  height: calc(100vh - 55px);
  overflow-x: hidden;
  overflow-y: auto;
  .mate-top {
    width: 100%;
    // min-height: 300px;
    // height: 40%;
    flex-wrap: wrap;
    align-content: center;
    margin-bottom: 10px;
    .mate-avatar {
      width: 100%;
      height: 150px;
      .mate-avatar-img {
        width: 150px;
        height: 150px;
        border-radius: 35%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .mate-name {
      width: 100%;
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
    }
    .mate-bean {
      width: 100%;
      height: 30px;
      .logo {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }
    .mate-info {
      width: 100%;
      height: 50px;
      margin-bottom: 10px;
    }
  }

  .mate-box {
    border-radius: 12px;
    margin-bottom: 15px;
    padding: 20px 0px;
    .mate-bottle {
      width: 100%;
      // height: 30px;
      .mate-bottle-title {
        width: 100%;
        height: 30px;
        font-size: 18px;
        text-align: center;
        color: var(--talk-font-color-1);
        line-height: 37px;
        font-weight: 600;
        margin-bottom: 30px;
      }
    }
    .mate-data {
      width: 100%;
      // height: 100px;
      .mate-data-item {
        width: 50%;
        flex-wrap: wrap;
        & > div {
          width: 100%;
          text-align: center;
          &:nth-child(1) {
            font-size: 26px;
          }
          &:nth-child(2) {
            font-size: 12px;
            margin-bottom: 10px;
          }
          &:nth-child(3) {
            font-size: 12px;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
<style></style>
