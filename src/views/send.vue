<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { Task } from "@/interface/Task";
import TaskItem from "@/components/taskItem.vue";
import { ElMessage } from "element-plus";
const page = ref<number>(1);
const hasFinished = ref<number>(0);
const total = ref<number>(0);
const sendList = ref<Task[]>([]);
const overKey = ref<string>("");
onMounted(() => {});
const getSendTask = async () => {
  let obj: any = { page: page.value, limit: 30 };
  if (hasFinished.value) {
    obj = { ...obj, hasFinished: hasFinished.value, page: 1 };
    page.value = 1;
  }
  if (page.value === 1) {
    sendList.value = [];
  }
  const sentRes: any = (await api.request.get("card/user/sent", {
    ...obj,
  })) as ResultProps;
  if (sentRes.msg === "OK") {
    total.value = sentRes.total;
    sendList.value = [...sendList.value, ...sentRes.data];
  }
};
const scrollSend = (e: any) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    sendList.value.length < total.value
  ) {
    page.value++;
    getSendTask();
  }
};
watchEffect(() => {
  getSendTask();
});
</script>
<template>
  <theader isMenu>
    <template #left> I Send </template>
  </theader>
  <div class="send" @scroll="scrollSend">
    <div
      v-for="(item, index) in sendList"
      :key="'taskItem' + index"
      @mouseenter="overKey = item._key"
    >
      <task-item :item="item" :overKey="overKey" type="send" />
    </div>
  </div>
  <div
    class="footer p-5 dp--center icon-point"
    @click="hasFinished = hasFinished === 1 ? 0 : 1"
  >
    {{ hasFinished === 0 ? "Completed" : "ToDo" }}
  </div>
</template>
<style scoped lang="scss">
.send {
  width: 100%;
  height: calc(100vh - 95px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<style></style>
