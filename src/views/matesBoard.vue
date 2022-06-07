<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Avatar from "@/components/avatar.vue";
import { ElMessage } from "element-plus";
import { Board } from "@/interface/Board";
import router from "@/router";
const { setBoardKey } = appStore.boardStore;
const { user } = storeToRefs(appStore.authStore);
const props = defineProps<{
  id: string;
}>();
const friendBoardList = ref<Board[]>([]);
onMounted(() => {
  getfriendBoardInfo();
});
const getfriendBoardInfo = async () => {
  const friendBoardRes = (await api.request.get("board/friend", {
    friendKey: props.id,
  })) as ResultProps;
  if (friendBoardRes.msg === "OK") {
    friendBoardList.value = friendBoardRes.data;
  }
};
const joinBoard = async (key, index) => {
  const boardRes = (await api.request.post("board/applyJoin", {
    boardKey: key,
  })) as ResultProps;
  if (boardRes.msg === "OK") {
    ElMessage({
      message: "Apply Join Board Successful",
      type: "success",
      duration: 1000,
    });
    friendBoardList.value[index].applyed = true;
  }
};
const toBoard = (added: boolean, key: string) => {
  if (added) {
    setBoardKey(key);
    router.push("/home/board");
  }
};
</script>
<template>
  <theader>
    <template #left> MatesBoard </template>
  </theader>
  <div class="matesBoard p-5">
    <div
      v-for="(item, index) in friendBoardList"
      class="container dp-space-center"
      @click="toBoard(item.added as boolean,item._key)"
    >
      <div class="left">{{ item.title }}</div>
      <div class="right matesBoard-button">
        <span v-if="!item.added && item.applyed">Pending...</span>
        <tbutton
          @click="joinBoard(item._key, index)"
          v-if="!item.added && !item.applyed"
          round
        >
          Join
        </tbutton>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.matesBoard {
  width: 100%;
  height: calc(100vh - 55px);
  overflow-x: hidden;
  overflow-y: auto;
  .matesBoard-button {
    font-weight: 400;
    color: var(--talk-font-color-3);
  }
}
</style>
<style></style>
