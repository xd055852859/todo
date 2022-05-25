<script setup lang="ts">
import Avatar from "@/components/avatar.vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { Task } from "@/interface/Task";
import TaskItem from "@/components/taskItem.vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import chooseSvg from "@/assets/svg/choose.svg";
const { user, mateList } = storeToRefs(appStore.authStore);
const socket: any = inject("socket");

const createdMateList = computed(() => [user.value, ...mateList.value]);
const searchList = computed(() =>
  createdMateList.value.filter((item) => {
    return item?.userName.indexOf(searchInput.value) !== -1;
  })
);
const page = ref<number>(1);
const hasFinished = ref<number | null>(null);
const total = ref<number>(0);
const sendList = ref<Task[]>([]);
const overKey = ref<string>("");
const createdMateIndex = ref<number>(0);
const searchInput = ref<string>("");
const friendKey = ref<string>("");
const completedIndex = ref<number>(0);
const completedArr = ["All", "Completed", "Todo"];

onMounted(() => {});
const getSendTask = async () => {
  let obj: any = { page: page.value, limit: 30 };
  if (hasFinished.value !== null) {
    obj.hasFinished = hasFinished.value;
    obj.page = 1;
    page.value = 1;
  }
  if (friendKey.value && friendKey.value !== user.value?._key) {
    obj.friendKey = friendKey.value;
    obj.page = 1;
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
const chooseCreatedType = (index: number) => {
  completedIndex.value = index;
  switch (index) {
    case 0:
      hasFinished.value = null;
      break;
    case 1:
      hasFinished.value = 1;
      break;
    case 2:
      hasFinished.value = 0;
      break;
  }
};
const finishTask = (data) => {
  let index = sendList.value.findIndex((item: Task) => data._key === item._key);
  if (index !== -1) {
    if (completedIndex.value !== 0) {
      sendList.value.splice(index, 1);
    } else {
      sendList.value[index].hasFinished = sendList.value[index].hasFinished
        ? 0
        : 1;
      console.log(sendList.value[index]);
    }
  }
};
const delTask = (data) => {
  let index = sendList.value.findIndex((item: Task) => data._key === item._key);
  if (index !== -1) {
    sendList.value.splice(index, 1);
  }
};
watchEffect(() => {
  getSendTask();
});
</script>
<template>
  <theader isMenu>
    <template #left> Created </template>
    <template #right>
      <el-dropdown>
        <div
          class="dp--center icon-point"
          style="font-size: 16px; font-weight: 600"
        >
          <avatar
            :name="createdMateList[createdMateIndex]?.userName"
            :avatar="createdMateList[createdMateIndex]?.userAvatar"
            type="person"
            :index="0"
            :size="30"
            :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
          />
          {{ createdMateList[createdMateIndex]?.userName }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <div class="header-contact" v-if="searchList">
            <div class="contact-top dp-space-center p-5">
              <el-input
                v-model="searchInput"
                placeholder="Search Mate"
                style="height: 35px"
              />
            </div>
            <div class="contact-bottom">
              <div
                class="contact-item container dp--center p-5 icon-point"
                v-for="(item, index) in searchList"
                :key="'listItem' + index"
                @click="
                  //@ts-ignore
                  friendKey = item?._key;
                  createdMateIndex = index;
                "
              >
                <avatar
                  :name="item?.userName"
                  :avatar="item?.userAvatar"
                  type="person"
                  :index="0"
                  :size="30"
                  :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
                />{{ item?.userName }}
              </div>
            </div>
          </div>
        </template>
      </el-dropdown>
    </template>
  </theader>
  <div class="send p-5" @scroll="scrollSend">
    <div
      v-for="(item, index) in sendList"
      :key="'taskItem' + index"
      @mouseenter="overKey = item._key"
    >
      <task-item
        :item="item"
        :overKey="overKey"
        type="send"
        :role="item.role"
        @finishTask="finishTask"
        @delTask="delTask"
      />
    </div>
  </div>
  <div class="footer p-5 dp--center icon-point">
    <el-dropdown>
      <div class="dp--center icon-point" style="height: 100%">
        {{ completedArr[completedIndex] }}
        <el-icon class="el-icon--right">
          <arrow-up />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            class="icon-point container dp-space-center"
            v-for="(item, index) in completedArr"
            :key="'completed' + index"
            @click="chooseCreatedType(index)"
            style="width: 150px"
          >
            <div>{{ item }}</div>
            <div class="right">
              <img
                :src="chooseSvg"
                alt=""
                style="width: 20px; height: 20px"
                v-if="index === completedIndex"
              />
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<style scoped lang="scss">
.send {
  width: 100%;
  height: calc(100vh - 105px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<style></style>
