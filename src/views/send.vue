<script setup lang="ts">
import Avatar from "@/components/avatar.vue";
import { ArrowDown } from "@element-plus/icons-vue";
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

const createdMateList = computed(() => [
  { _key: "all", userName: "all", userAvatar: "" },
  user.value,
  ...mateList.value,
]);
const executedMateList = computed(() => [
  { _key: "all", userName: "all", userAvatar: "" },
  user.value,
  ...mateList.value,
]);
const searchCreateList = computed(() =>
  createdMateList.value.filter((item) => {
    return item?.userName.indexOf(searchCreateInput.value) !== -1;
  })
);
const searchExecuteList = computed(() =>
  createdMateList.value.filter((item) => {
    return item?.userName.indexOf(searchExecuteInput.value) !== -1;
  })
);
const page = ref<number>(1);
const hasFinished = ref<number | null>(null);
const total = ref<number>(0);
const sendList = ref<Task[]>([]);
const overKey = ref<string>("");
const createdMateIndex = ref<number>(0);
const executedMateIndex = ref<number>(0);
const searchCreateInput = ref<string>("");
const searchExecuteInput = ref<string>("");
const creatorKey = ref<string>("all");
const executorKey = ref<string>("all");
const completedIndex = ref<number>(0);
const completedArr = ["All tasks", "Completed", "Todo"];

onMounted(() => {});
const getSendTask = async () => {
  let obj: any = {
    page: page.value,
    limit: 30,
    creator: creatorKey.value,
    executor: executorKey.value,
  };
  if (hasFinished.value !== null) {
    obj.hasFinished = hasFinished.value;
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
    // sentRes.data = sentRes.data.map((item) => {
    //   item.creatorInfo = createdMateList.value[createdMateIndex.value];
    //   return item;
    // });
    sendList.value = [...sendList.value, ...sentRes.data];
    console.log(sendList);
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
    // getSendTask();
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
  console.log(data);
  let index = sendList.value.findIndex((item: Task) => data._key === item._key);
  if (index !== -1) {
    console.log(completedIndex.value);
    if (completedIndex.value !== 0) {
      sendList.value.splice(index, 1);
    } else {
      sendList.value[index].hasFinished = data.hasFinished;
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
    <template #left>
      <el-dropdown>
        <div class="dp--center icon-point" style="height: 100%;color: var(--talk-font-color);">
          {{ completedArr[completedIndex] }}
          <el-icon class="el-icon--right">
            <arrow-down />
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
        </template> </el-dropdown
    ></template>
  </theader>
  <div class="send-nav dp-center-center">
    <el-dropdown style="margin-right: 10px">
      <div
        class="dp--center icon-point"
        style="font-size: 16px; font-weight: 600;color: var(--talk-font-color);"
      >
        <avatar
          :name="createdMateList[createdMateIndex]?.userName"
          :avatar="createdMateList[createdMateIndex]?.userAvatar"
          type="person"
          :index="0"
          :size="30"
          :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
          v-if="createdMateIndex !== 0"
        />
        {{ createdMateList[createdMateIndex]?.userName }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <div class="header-contact" v-if="searchCreateList">
          <div class="contact-top dp-space-center p-3">
            <el-input
              v-model="searchCreateInput"
              placeholder="Search Mate"
              style="height: 35px"
            />
          </div>
          <div class="contact-bottom">
            <div
              class="contact-item container dp--center p-3 icon-point"
              v-for="(item, index) in searchCreateList"
              :key="'listItem' + index"
              @click="
                //@ts-ignore
                creatorKey = item?._key;
                createdMateIndex = index;
                page = 1;
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
    ⇀
    <el-dropdown style="margin-left: 10px">
      <div
        class="dp--center icon-point"
        style="font-size: 16px; font-weight: 600;color: var(--talk-font-color);"
      >
        <avatar
          :name="executedMateList[executedMateIndex]?.userName"
          :avatar="executedMateList[executedMateIndex]?.userAvatar"
          type="person"
          :index="0"
          :size="30"
          :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
          v-if="executedMateIndex !== 0"
        />
        {{ executedMateList[executedMateIndex]?.userName }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <div class="header-contact" v-if="searchExecuteList">
          <div class="contact-top dp-space-center p-3">
            <el-input
              v-model="searchExecuteInput"
              placeholder="Search Mate"
              style="height: 35px"
            />
          </div>
          <div class="contact-bottom">
            <div
              class="contact-item container dp--center p-3 icon-point"
              v-for="(item, index) in searchCreateList"
              :key="'listItem' + index"
              @click="
                //@ts-ignore
                executorKey = item?._key;
                executedMateIndex = index;
                page = 1;
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
  </div>
  <div class="send p-3" @scroll="scrollSend">
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
  <!-- <div class="footer p-3 dp--center icon-point">
  
  </div> -->
</template>
<style scoped lang="scss">
.send-nav {
  width: 100%;
  height: 30px;
}
.send {
  width: 100%;
  height: calc(100vh - 90px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<style></style>
