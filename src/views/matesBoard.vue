<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { User } from "@/interface/User";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Avatar from "@/components/avatar.vue";
import { ElMessage } from "element-plus";
import { Board } from "@/interface/Board";

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
</script>
<template>
  <theader>
    <template #left> MatesBoard </template>
  </theader>
  <div class="matesBoard p-5">
    <div
      v-for="(item, index) in friendBoardList"
      class="container dp-space-center"
    >
      <div class="left">{{ item.title }}</div>
      <div class="right">
        <icon-font
          name="addTask"
          :size="22"
          class="icon-point"
          @click=""
          v-if="!item.added"
        />
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
}
</style>
<style></style>
