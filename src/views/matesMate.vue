<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Avatar from "@/components/avatar.vue";
import { ElMessage } from "element-plus";
import i18n from "@/language/i18n";

const { user } = storeToRefs(appStore.authStore);
const props = defineProps<{
  id: string;
}>();
const friendMateList = ref<User[]>([]);
onMounted(() => {
  getfriendMateInfo();
});
const getfriendMateInfo = async () => {
  const friendMateRes = (await api.request.get("partner/friend", {
    friendKey: props.id,
  })) as ResultProps;
  if (friendMateRes.msg === "OK") {
    friendMateList.value = friendMateRes.data;
  }
};
const saveMate = async (key:string,index: number) => {
  const saveRes = (await api.request.post("partner", {
    friendKey: key,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
       message: i18n.global.t(`Adding friends successful`),
      type: "success",
      duration: 1000,
    });
    friendMateList.value[index].added = true;
  }
};
const delMate = async (key:string,index: number) => {
  const saveRes = (await api.request.delete("partner", {
    friendKey: key,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
       message: i18n.global.t(`Delete Friend Success`),
      type: "success",
      duration: 1000,
    });
    friendMateList.value[index].added = false;
  }
};
</script>
<template>
  <theader>
    <template #left> MatesMate </template>
  </theader>
  <div class="matesMate p-3">
    <el-row :gutter="20">
      <el-col
        v-for="(item, index) in friendMateList"
        :key="'contact' + index"
        :xs="8"
        :sm="6"
        :md="4"
        :lg="3"
        :xl="2"
        style="cursor: pointer"
      >
        <div
          class="dp-center-center partner-item"
        >
          <!-- <div class="partner-item-img">
            <img :src="item.userAvatar" alt="" />
          </div> -->
          <avatar
            :name="item.userName"
            :avatar="item.userAvatar"
            type="person"
            :index="index"
            :size="90"
            showOnline
            :online-state="item.online"
          />
          <div class="name single-to-long">
            {{ item.userName }}
          </div>
          <div
            class="matesMate-button common-color dp-center-center"
            v-if="item._key !== user?._key"
          >
            <div
              class="unfollow dp-center-center"
              v-if="item.added"
              @click="delMate(item._key,index)"
            >
              Unfollow
            </div>
            <div
              class="follow dp-center-center"
              v-else
              @click="saveMate(item._key,index)"
            >
              Follow
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<style scoped lang="scss">
.matesMate {
  width: 100%;
  height: calc(100vh - 55px);
  overflow-x: hidden;
  overflow-y: auto;
  .partner-item {
    width: 130px;
    height: 130px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
    .el-avatar {
      margin-right: 0px;
    }
    .name {
      width: 100%;
      margin-top: 5px;
      text-align: center;
    }
    .matesMate-button {
      width: 100%;
      height: 20px;
      position: absolute;
      bottom: 30px;
      left: 0px;
      z-index: 5;
      font-size: 12px;
      > div {
        width: 70px;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #46a03c;
        border-radius: 17px;
      }
      .unfollow {
        display: none;
      }
    }
    &:hover .matesMate-button .unfollow {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
<style></style>
