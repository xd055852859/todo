<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { Mate } from "@/interface/User";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import logoSvg from "../assets/svg/logo.svg";
import Avatar from "@/components/avatar.vue";
const socket: any = inject("socket");
const { addMateList, delMateList } = appStore.authStore;
const route = useRoute();
const router = useRouter();

const mateKey = ref<string>("");
const mateInfo = ref<Mate | null>(null);
const shareTitle = ref<string>("");
const allTitle = ref<string>("");
const delVisible = ref<boolean>(false);
onMounted(() => {
  mateKey.value = route.params.id as string;
  console.log(mateKey.value);
  getMateInfo();
  socket.on("onlineStatus", (data) => {
    console.log(data, "onlineStatus");
    mateInfo.value = { ...mateInfo.value, ...data };
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
const saveMate = async () => {
  const saveRes = (await api.request.post("partner", {
    friendKey: mateKey.value,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
      message: "Add Mate successful",
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
      message: "Delete Mate successful",
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
      <el-tooltip content="Delete Mate" v-if="mateInfo?.added">
        <icon-font
          name="delMate"
          :size="22"
          class="icon-point"
          @click="delVisible = true"
        />
      </el-tooltip>
      <el-tooltip content="Add Mate" v-else>
        <icon-font
          name="addMate"
          :size="22"
          class="icon-point"
          @click="saveMate"
        />
      </el-tooltip>

      <icon-font
        name="eye"
        :size="14"
        style="margin-left: 8px; margin-right: 8px"
      />
      <span style="font-size: 14px">{{ mateInfo?.viewNum }}</span>
    </template>
  </theader>
  <div class="mate p-5 dp-center-center" v-if="mateInfo">
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
      <template v-if="mateInfo.added">
        <div class="mate-bean common-color dp-center-center">
          <img :src="logoSvg" alt="" class="logo" />{{ mateInfo.beans }}
        </div>
        <div class="mate-info dp-space-center">
          <div
            class="dp-center-center icon-point"
            style="width: 50%"
            @click="$router.push('/home/matesBoard/' + mateKey)"
          >
            <icon-font
              name="boards"
              :size="24"
              style="margin-right: 8px"
            />Boards ( {{ mateInfo.boardNum }} )
          </div>
          <div
            class="dp-center-center icon-point"
            style="width: 50%"
            @click="$router.push('/home/matesMate/' + mateKey)"
          >
            <icon-font
              name="mates"
              :size="24"
              style="margin-right: 8px"
            />Parnter ( {{ mateInfo.partnerNum }} )
          </div>
        </div>
      </template>
    </div>

    <div
      class="mate-box p-5 dp-center-center"
      :style="{ background: mateInfo.added ? '#fff' : '' }"
    >
      <template v-if="mateInfo.added">
        <div class="mate-bottle dp-center-center">
          <div class="mate-bottle-img dp-center-center">
            <div class="mate-bottle-title common-color">Beans Today</div>
          </div>
        </div>
        <div class="mate-data dp-space-center">
          <div class="mate-data-item dp-center-center common-color">
            <div>{{ mateInfo.shareBeans }}</div>
            <div>Share</div>
            <div>
              较昨日 <span>{{ shareTitle }}</span>
            </div>
          </div>
          <div class="mate-data-item dp-center-center common-color">
            <div>{{ mateInfo.totalBeans }}</div>
            <div>All</div>
            <div>
              较昨日 <span>{{ allTitle }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <el-dialog v-model="delVisible" title="Delete prompt" width="350px">
    <span>Delete Mate</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="delVisible = false" bgColor="#d1dbe5">
          Cancel
        </tbutton>
        <tbutton @click="delMate">OK</tbutton>
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
  flex-wrap: wrap;
  align-content: center;
  .mate-top {
    width: 100%;
    min-height: 300px;
    height: 40%;
    flex-wrap: wrap;
    align-content: center;
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
    min-height: 390px;
    height: 50%;
    flex-wrap: wrap;
    .mate-bottle {
      width: 100%;
      height: 280px;
      .mate-bottle-img {
        width: 200px;
        height: 250px;
        background-size: 60%;
        background-image: url("@/assets/img/fullBean.png");
        background-repeat: no-repeat;
        background-position: center center;
        align-content: flex-end;
        flex-wrap: wrap;
        padding-bottom: 40px;
        .mate-bottle-title {
          width: 100%;
          height: 30px;
          font-size: 18px;
          text-align: center;
          color: var(--talk-font-color-1);
          line-height: 37px;
          font-weight: 600;
        }
      }
    }
    .mate-data {
      width: 100%;
      height: 100px;
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
