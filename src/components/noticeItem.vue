<script setup lang="ts">
import { Notice, ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { ElMessage } from "element-plus";
import Avatar from "./avatar.vue";
const dayjs: any = inject("dayjs");
const props = defineProps<{
  item: Notice;
  index: number;
}>();
const emits = defineEmits(["applyMessage"]);
const noticeTime = ref<string>("");
// const noticeTitle = ref<string>("");
const noticeType = ref<string>("");
onMounted(() => {
  noticeTime.value = dayjs(props.item.time).fromNow();
  if (
    props.item.type === "invite" ||
    props.item.type === "remove" ||
    props.item.type === "changeRole" ||
    props.item.type === "transfer" ||
    props.item.type === "join"
  ) {
    noticeType.value = "board";
  } else if (
    props.item.type === "create" ||
    props.item.type === "finish" ||
    props.item.type === "cancelFinish" ||
    props.item.type === "delete" ||
    props.item.type === "update"
  ) {
    noticeType.value = "task";
  } else {
    noticeType.value = "common";
  }
});
const changeJoin = async (verifyResult: boolean) => {
  let joinRes = (await api.request.patch("board/apply/verify", {
    applyKey: props.item.applyKey,
    verifyResult: verifyResult,
  })) as ResultProps;
  if (joinRes.msg === "OK") {
    emits("applyMessage", props.index, props.item.fromUserInfo);
  }
};
</script>
<template>
  <div
    class="notice-item dp-space-center"
    :style="item.cardInfo ? {} : { marginBottom: '20px' }"
  >
    <div
      class="dp-space-center notice-left"
      :style="{ width: item.type === 'join' ? 'calc(100% - 155px)' : '100%' }"
    >
      <div class="notice-left-avatar dp-center-center">
        <avatar
          :name="item.fromUserInfo.userName"
          :avatar="item.fromUserInfo.userAvatar"
          type="person"
          :index="0"
          :size="70"
          :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
        />
      </div>
      <div class="notice-left-info">
        <div class="notice-title single-to-long">
          <span class="notice-title-name">{{
            item.fromUserInfo.userName
          }}</span>
          {{ item.log }}
        </div>
        <div v-if="noticeType === 'board'" class="notice-time">
          {{ item.boardInfo.title }}
        </div>
        <div v-else-if="noticeType === 'task'" class="notice-time">
          {{ item.cardInfo?.title }}
        </div>
        <div class="notice-time">{{ noticeTime }}</div>
      </div>
    </div>
    <div
      class="dp-center-center notice-right"
      v-if="item.type === 'join'"
      
    >
      <template v-if="item.status === 1">
        <tbutton
          @click="changeJoin(true)"
          style="margin-right: 15px"
        >
          agree
        </tbutton>
        <tbutton @click="changeJoin(false)" :bgColor="'#F2494A'">
          reject
        </tbutton>
      </template>
      <div v-else-if="item.status === 0">reject</div>
      <div v-else>agree</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.notice-item {
  width: 100%;
  height: 90px;
  .notice-left {
    .notice-left-avatar {
      width: 80px;
    }
    .notice-left-info {
      width: calc(100% - 90px);
      .notice-title {
        width: 100%;
        height: 30px;
        line-height: 30px;
        .notice-title-name {
          font-size: 20px;
          font-weight: 600;
          margin-right: 10px;
        }
      }
      .notice-time {
        width: 100%;
        height: 25px;
        font-size: 14px;
        color: var(--talk-font-color-3);
        line-height: 25px;
      }
    }
  }
}
</style>
<style></style>
