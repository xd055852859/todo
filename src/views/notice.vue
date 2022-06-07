<script setup lang="ts">
import { Notice, ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { ElMessage } from "element-plus";
import NoticeItem from "@/components/noticeItem.vue";
import appStore from "@/store";
const { setNoticeNum } = appStore.commonStore;
const noticeType = ref<number>(0);
const noticeList = ref<Notice[]>([]);
const total = ref<number>(0);
const page = ref<number>(1);
const getNotice = async () => {
  const noticeRes: any = (await api.request.get("message/list", {
    page: page.value,
    limit: 30,
    hasRead: noticeType.value,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    total.value = noticeRes.total;
    noticeList.value = [...noticeList.value, ...noticeRes.data];
  }
};
const scrollNotice = (e: any) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    noticeList.value.length < total.value
  ) {
    page.value++;
    getNotice();
  }
};
const clearNotice = async () => {
  const clearRes: any = (await api.request.patch("message/read", {
    type: "all",
  })) as ResultProps;
  if (clearRes.msg === "OK") {
    noticeList.value = [];
    page.value = 1;
    total.value = 0;
    setNoticeNum(0);
  }
};
const applyMessage = (index: number,userItem) => {
  noticeList.value.splice(index);
};
watch(noticeType, () => {
  noticeList.value = [];
  page.value = 1;
});
watchEffect(() => {
  getNotice();
});
</script>
<template>
  <theader isMenu>
    <template #title>Notice</template>
    <template #right v-if="noticeType === 0">
      <tbutton @click="clearNotice"> Set Read </tbutton>
    </template>
  </theader>
  <div class="notice">
    <div class="notice-nav dp-center-center p-5">
      <div
        :style="
          noticeType === 0
            ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
            : {}
        "
        @click="noticeType = 0"
        class="icon-point"
        style="padding: 10px 40px"
      >
        Unread
      </div>
      <div
        style="padding: 10px 40px"
        :style="
          noticeType === 1
            ? { color: '#46a03c', borderBottom: '3px solid #46a03c' }
            : {}
        "
        @click="noticeType = 1"
        class="icon-point"
      >
        Read
      </div>
    </div>
    <div class="notice-container" @scroll="scrollNotice">
      <div class="notice-box p-3">
        <div v-for="(item, index) in noticeList" :key="'noticeItem' + index">
          <notice-item
            :item="item"
            @applyMessage="applyMessage"
            :index="index"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.notice {
  width: 100vw;
  height: calc(100vh - 55px);
  .notice-nav {
    width: 100%;
    height: 45px;
    border-bottom: 1px solid #e2e2e2;
  }
  .notice-container {
    width: 100%;
    height: calc(100% - 45px);
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: 20px;
    box-sizing: border-box;
    .notice-box {
    }
  }
}
</style>
<style></style>
