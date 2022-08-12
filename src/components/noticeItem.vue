<script setup lang="ts">
import { Notice, ResultProps } from "@/interface/Common";
import i18n from "@/language/i18n";
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
const noticeLog = ref<string>("");
const roleArray = ref<string[]>([]);
onMounted(() => {
  noticeTime.value = dayjs(props.item.time).fromNow();
  roleArray.value = [
    i18n.global.t(`Owner`),
    i18n.global.t(`Admin`),
    i18n.global.t(`Editer`),
    i18n.global.t(`Author`),
    i18n.global.t(`Follower`),
  ];
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
    props.item.type === "update" ||
    props.item.type === "changeExecutor"
  ) {
    noticeType.value = "task";
  } else {
    noticeType.value = "common";
  }
  let str = "";
  switch (props.item.type) {
    case "create":
      str = i18n.global.t(`creat todo`);
      break;
    case "finish":
      str = i18n.global.t(`completed a todo`);
      break;
    case "cancelFinish":
      str = i18n.global.t(`set a todo as uncomplete`);
      break;
    case "delete":
      str = i18n.global.t(`Delete a todo`);
      break;
    case "update":
      str = i18n.global.t(`changed a todo`);
      break;
    case "invite":
      str = i18n.global.t(`invite into a board`, {
        boardname: props.item.boardInfo.title,
      });
      break;
    case "remove":
      str = i18n.global.t(`remove you from board`, {
        boardname: props.item.boardInfo.title,
      });
      break;
    case "changeRole":
      str = i18n.global.t(`set you as authority`, {
        boardname: props.item.boardInfo.title,
        authority: props.item.newRole
          ? roleArray.value[props.item.newRole]
          : "",
      });
      break;
    case "setExecutor":
      str = i18n.global.t(`set Executor`, {
        boardname: props.item.boardInfo.title,
      });
      break;
    case "transfer":
      str = i18n.global.t(`set owner`, {
        boardname: props.item.boardInfo.title,
      });
      break;
    case "join":
      str = i18n.global.t(`apply`, {
        boardname: props.item.boardInfo.title,
      });
      break;
    case "addFriends":
      str = i18n.global.t(`Add you to mate`);
      break;
    case "removeFriends":
      str = i18n.global.t(`Remove mate`);
      break;
    case "changeExecutor":
      str = "changeExecutor";
      break;
  }
  noticeLog.value = str;
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
      class="notice-left"
      :style="{ width: item.type === 'join' ? 'calc(100% - 155px)' : '100%' }"
    >
      <div class="notice-left-avatar">
        <avatar
          :name="item.fromUserInfo.userName"
          :avatar="item.fromUserInfo.userAvatar"
          type="person"
          :index="0"
          :size="55"
          :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
        />
      </div>
      <div class="notice-left-info">
        <div class="notice-title single-to-long">
          <span class="notice-title-name">{{
            item.fromUserInfo.userName
          }}</span>
          {{ noticeLog }}
        </div>
        <!-- <div v-if="noticeType === 'board'" class="notice-info-name">
          {{ item.boardInfo.title }}
        </div> -->
        <div v-if="noticeType === 'task'" class="notice-info-name" style="">
          {{ item.cardInfo?.title }}
        </div>
        <div class="notice-time dp-space-center">
          <div>{{ item.boardInfo.title ? item.boardInfo.title : "" }}</div>
          <div>{{ noticeTime }}</div>
        </div>
      </div>
    </div>
    <div class="dp-center-center notice-right" v-if="item.type === 'join'">
      <template v-if="item.status === 1">
        <tbutton @click="changeJoin(true)" style="margin-right: 15px">
          {{ $t(`agree`) }}
        </tbutton>
        <tbutton @click="changeJoin(false)" :bgColor="'#F2494A'">
          {{ $t(`refuse`) }}
        </tbutton>
      </template>
      <div v-else-if="item.status === 0">{{ $t(`refuse`) }}</div>
      <div v-else>{{ $t(`agree`) }}</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.notice-item {
  width: 100%;
  min-height: 90px;
  margin-bottom: 15px;
  padding: 0px 2vw;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0px 4px 9px 0px var(--talk-hover-shadow);
  }
  .notice-left {
    display: flex;
    justify-content: space-between;
    .notice-left-avatar {
      width: 60px;
    }
    .notice-left-info {
      width: calc(100% - 70px);
      .notice-title {
        width: 100%;
        height: 35px;
        line-height: 35px;
        .notice-title-name {
          font-size: 20px;
          font-weight: 600;
          margin-right: 10px;
        }
      }
      .notice-time,
      .notice-info-name {
        width: 100%;
        min-height: 25px;
        font-size: 14px;
        color: var(--talk-font-color-3);
        line-height: 25px;
      }
      .notice-time {
        height: 25px;
      }
    }
  }
}
</style>
<style></style>
