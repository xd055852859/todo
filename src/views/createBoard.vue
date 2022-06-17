<script setup lang="ts">
import i18n from "@/language/i18n";
import api from "@/services/api";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";

import chooseSvg from "@/assets/svg/choose.svg";
import unchooseSvg from "@/assets/svg/unchoose.svg";

const router = useRouter();

const { user, mateList } = storeToRefs(appStore.authStore);
const { addBoardList } = appStore.boardStore;

const memberArray = computed(() =>
  mateList.value.filter((item) => {
    return item._key !== user.value?._key;
  })
);
const searchList = computed(() =>
  memberArray.value.filter((item) => {
    return item.userName.indexOf(memberName.value) !== -1;
  })
);
const memberKeyList = ref<string[]>([]);
const boardName = ref<string>("");
const memberName = ref<string>("");

const chooseMember = (memberKey: string) => {
  let index = memberKeyList.value.indexOf(memberKey);
  if (index === -1) {
    memberKeyList.value.push(memberKey);
  } else {
    memberKeyList.value.splice(index, 1);
  }
};

const createBoard = async () => {
  if (memberKeyList.value.length === 0) {
    ElMessage({
      message: i18n.global.t(`choose board members`),
      type: "error",
      duration: 1000,
    });
    return;
  }
  if (!boardName.value) {
    ElMessage({
      message: i18n.global.t(`InPut Board Name`),
      type: "error",
      duration: 1000,
    });
    return;
  }
  const boardRes = (await api.request.post("board", {
    title: boardName.value,
    avatar: "",
    memberKeyArr: memberKeyList.value,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`success to new a board`),
      type: "success",
      duration: 1000,
    });
    addBoardList(boardRes.data);
    router.push("/manage/" + boardRes.data._key);
    // store.commit("auth/addGroupList", [groupRes.data]);
  }
};
</script>
<template>
  <theader>
    <template #title>{{ $t(`Creat Board`) }}</template>
    <template #right>
      <tbutton
        style="height: 40px; padding: 0px 30px;margin-right:calc(3vw - 10px)"
        @click="router.push('/home/invite')"
      >
        {{ $t(`Invite`) }}
      </tbutton>
    </template>
  </theader>
  <div class="create p-3">
    <div class="input dp-space-center">
      {{ $t(`Board Name`) }}
      <el-input
        v-model="boardName"
        size="large"
        :placeholder="$t(`InPut Board Name`)"
        style="width: calc(100% - 230px)"
      />
      <tbutton style="height: 40px; padding: 0px 30px" @click="createBoard">
        {{ $t(`Save`) }}
      </tbutton>
    </div>
    <div class="title dp-space-center">
      {{ $t(`Members`) }}
      <el-input
        v-model="memberName"
        size="large"
        :placeholder="$t(`InPut a mate Name`)"
        style="width: calc(100% - 115px)"
        clearable
      >
        <template #append> <el-button :icon="Search" /> </template>
      </el-input>
    </div>

    <div class="info">
      <div
        class="container dp-space-center"
        v-for="(item, index) in searchList"
        :key="'manage' + index"
        @click="chooseMember(item._key as string)"
      >
        <div class="left dp--center">
          <el-avatar fit="cover" :size="40" :src="item.userAvatar" />
          <div class="name">{{ item.userName }}</div>
        </div>
        <div class="right">
          <img
            :src="
              memberKeyList.indexOf(item._key as string) !== -1 ? chooseSvg : unchooseSvg
            "
            alt=""
            style="width: 30px; height: 30px; margin-right: 10px"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.create {
  width: 100vw;
  height: calc(100vh - 55px);
  background: var(--talk-bg-color);
  .input {
    width: 100%;
    height: 50px;
  }
  .title {
    width: 100%;
    height: 45px;
    font-weight: 400;
    line-height: 45px;
    margin: 10px 0px;
  }
  .info {
    width: 100%;
    height: calc(100vh - 180px);
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>
<style></style>
