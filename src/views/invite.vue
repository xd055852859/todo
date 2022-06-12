<script setup lang="ts">
import { User } from "@/interface/User";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import api from "@/services/api";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import { ResultProps } from "@/interface/Common";

import inviteOutSvg from "../assets/svg/inviteOut.svg";
import Theader from "@/components/theader.vue";
import i18n from "@/language/i18n";

const { addMateList } = appStore.authStore;

const router = useRouter();
const searchName = ref<string>("");
const memberList = ref<User[]>([]);
const searchMember = async () => {
  const searchRes = (await api.request.get("user/search", {
    keyWord: searchName.value,
    filterFriend: true,
  })) as ResultProps;
  if (searchRes.msg === "OK") {
    memberList.value = [...searchRes.data];
    searchName.value = "";
  }
};
const saveMember = async (item: User, index: number) => {
  const saveRes = (await api.request.post("partner", {
    friendKey: item._key,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Adding friends successful`),
      type: "success",
      duration: 1000,
    });
    memberList.value.splice(index, 1);
    addMateList(item);
    // store.dispatch("auth/getGroupList");
    // router.push("/home");
  }
};
// const chooseMember = (key: string) => {
//   memberKey.value = key;
// //   dialogVisible.value = true;
// };
</script>
<template>
  <theader>
    <template v-slot:left>Invite</template>
    <template v-slot:right>
      <div class="right dp--center" @click="router.push('/home/inviteOut')">
        <icon-font name="addMate" :size="30" class="icon-point" />
      </div>
    </template>
  </theader>
  <div class="invite p-3">
    <div class="invite-item">
      <el-input
        v-model="searchName"
        size="large"
        placeholder="Please Enter Name"
        :suffix-icon="Search"
        @change="searchMember"
      />
      <div class="info">
        <div
          class="container dp-space-center"
          v-for="(item, index) in memberList"
          :key="'manage' + index"
          @click="saveMember(item, index)"
        >
          <div class="left dp--center">
            <el-avatar fit="cover" :size="40" :src="item.userAvatar" />
            <div class="name">{{ item.userName }}</div>
          </div>
          <div class="right">
            <icon-font
              class="icon-point del-button"
              name="addMate"
              :size="28"
              style="margin-right: 10px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.invite {
  width: 100vw;
  height: calc(100vh - 55px);
  background: var(--talk-bg-color);
  .invite-item {
    width: 100%;
    height: calc(100vh - 70px);
    background: var(--talk-bg-color);
    .title {
      width: 100%;
      height: 40px;
      line-height: 40px;
    }
    .info {
      height: calc(100% - 40px);
      margin-top: 10px;
      overflow: auto;
      .container {
        .right {
          display: none;
        }
        &:hover .right {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .right {
    cursor: pointer;
    .img {
      width: 20px;
      height: 20px;
      margin-left: 10px;
    }
  }
}
</style>
<style></style>
`
