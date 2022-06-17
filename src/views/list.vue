<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { Task } from "@/interface/Task";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import TaskItem from "@/components/taskItem.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import bottlePng from "@/assets/img/bottle.png";
import Avatar from "@/components/avatar.vue";
import i18n from "@/language/i18n";
const { user, mateList, friend } = storeToRefs(appStore.authStore);
const { dark, noticeNum } = storeToRefs(appStore.commonStore);
const { taskList, inboxList, completedList, targetKey } = storeToRefs(
  appStore.taskStore
);
const {
  getTaskList,
  delList,
  updateList,
  addList,
  clearInboxList,
  setTargetKey,
} = appStore.taskStore;
const { setFriendInfo, changeMateList } = appStore.authStore;
const { boardList } = storeToRefs(appStore.boardStore);
const { setNoticeNum } = appStore.commonStore;
const socket: any = inject("socket");

const listMateList = computed(() => [user.value, ...mateList.value]);
const friendBoardList = computed(
  () =>
    boardList.value &&
    boardList.value.filter(
      (item) => item.executorInfo._key === friend.value?._key
    )
);
const searchList = computed(() =>
  listMateList.value.filter((item) => {
    return item?.userName.indexOf(searchInput.value) !== -1;
  })
);
const navKey = ref<string>("today");
const overKey = ref<string>("");
const completeNum = ref<number>(0);
const listIndex = ref<number>(0);
const targetType = ref<string>("self");
const completedVisible = ref<boolean>(false);
const searchInput = ref<string>("");
const taskNum = reactive({
  today: 0,
  next: 0,
  future: 0,
  unRead: 0,
});
onMounted(() => {
  getTaskList("today");
  getTaskNum();

  socket.on("create", (data) => {
    console.log("create", data);
    if (
      data.creatorInfo._key !== user.value?._key &&
      !data.mark &&
      data.executorInfo._key === user.value?._key
    ) {
      //新建 创建者不是自己则在inbox inboxList
      addList(inboxList.value, data);
      taskNum.unRead++;
    }
    //创建者是自己直接在已读列表里 taskList
  });
  socket.on("finish", (data) => {
    console.log("finish", data);
    if (
      data.operator !== user.value?._key &&
      data.creatorInfo._key !== user.value?._key &&
      data.executorInfo._key === user.value?._key
    ) {
      finishTask(data);
    }
  });
  socket.on("delete", (data) => {
    console.log("del", data);
    if (
      data.operator !== user.value?._key &&
      data.creatorInfo._key !== user.value?._key &&
      data.executorInfo._key === user.value?._key
    ) {
      delTask(data);
    }
  });
  socket.on("cancelFinish", (data) => {
    if (
      data.operator !== user.value?._key &&
      data.creatorInfo._key !== user.value?._key &&
      data.executorInfo._key === user.value?._key
    ) {
      delList(completedList.value, data);
      if (data.executorInfo._key === user.value?._key) {
        completeNum.value--;
      }
      addList(taskList.value, data);
      if (data.executorInfo._key === user.value?._key) {
        taskNum.today++;
      }
    }
  });
  socket.on("update", (data) => {
    console.log("update", data);
    if (data.creatorInfo._key !== user.value?._key) {
      //新建 创建者不是自己则在inbox inboxList
      //创建者是自己直接在已读列表里 taskList
      updateList(data.mark ? taskList.value : inboxList.value, data);
    }
  });
});
const getTaskNum = async () => {
  let obj: any = {};
  targetKey.value ? (obj.friendKey = targetKey.value) : null;
  const numRes = (await api.request.get("card/user/collect", {
    ...obj,
  })) as ResultProps;
  if (numRes.msg === "OK") {
    completeNum.value = numRes.data.completeNum;
    taskNum.today = numRes.data.todayNum;
    taskNum.next = numRes.data.nextDayNum;
    taskNum.future = numRes.data.futureNum;
    taskNum.unRead = numRes.data.unreadNum;
  }
};
const getTargetTask = async (item, index) => {
  listIndex.value = index;
  targetType.value = user.value?._key === item._key ? "self" : "other";
  if (targetType.value === "self") {
    setTargetKey("");
  } else {
    setTargetKey(item._key);
  }
};
const changeNum = (type: string, item, listType: string) => {
  switch (type) {
    case "today":
      taskNum.today++;
      break;
    case "next":
      taskNum.next++;
      break;
    case "future":
      taskNum.future++;
      break;
  }
  if (item.mark) {
    taskNum[navKey.value]--;
  } else {
    taskNum.unRead--;
  }
  delList(item.mark ? taskList.value : inboxList.value, item);
};
const clearInbox = async () => {
  const clearRes = (await api.request.patch("message/read")) as ResultProps;
  if (clearRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Empty inbox successfully`),
      type: "success",
      duration: 1000,
    });
    taskNum.today = taskNum.today + inboxList.value.length;
    clearInboxList();
    getTaskList("today");
    setNoticeNum(noticeNum.value - inboxList.value.length);
  }
};
const finishTask = (data) => {
  delList(data.mark ? taskList.value : inboxList.value, data);
  completeNum.value++;
  if (data.executorInfo._key === user.value?._key) {
    if (data.mark) {
      taskNum[data.mark]--;
    } else {
      taskNum.unRead--;
    }
  }
};
const delTask = (data, type?: string) => {
  if (data.hasFinished || type === "cancel") {
    delList(completedList.value, data);
    if (data.executorInfo._key === user.value?._key) {
      completeNum.value--;
    }
    if (type === "cancel") {
      addList(taskList.value, data);
      if (data.executorInfo._key === user.value?._key) {
        taskNum.today++;
      }
    }
  } else {
    delList(data.mark ? taskList.value : inboxList.value, data);
    if (data.executorInfo._key === user.value?._key) {
      console.log(data);
      if (data.mark) {
        taskNum[data.mark]--;
      } else {
        taskNum.unRead--;
      }
    }
  }
};

const chooseFriend = (friend) => {
  setFriendInfo(friend);
  let index = mateList.value.findIndex(
    (mateItem) => mateItem._key === friend._key
  );
  if (index !== -1) {
    api.request.patch("partner/cooperation", {
      friendKey: friend._key,
    });
    changeMateList(index, 0);
  }
};
watch(targetKey, () => {
  getTaskList("today");
  getTaskNum();
});
watch(
  [user, friend],
  ([newVal, newFriend], [oldVal]) => {
    if (!oldVal && newVal && !newFriend) {
      setFriendInfo(newVal);
    }
  },
  { immediate: true }
);
watchEffect(() => {
  if (friend.value) {
    if (user.value && friend.value._key !== user.value._key) {
      let index = listMateList.value.findIndex(
        (item) => item?._key === friend.value?._key
      );
      // console.log(friend.value);
      // console.log(listMateList.value);
      // listIndex.value = index;
      getTargetTask(friend.value, index);
    } else {
      getTargetTask(friend.value, 0);
    }
  }
});
</script>
<template>
  <theader isMenu>
    <template #title
      ><el-dropdown>
        <div
          class="dp-space-center icon-point"
          style="font-size: 16px; font-weight: 600"
        >
          <avatar
            :name="friend?.userName"
            :avatar="friend?.userAvatar"
            type="person"
            :index="0"
            :size="30"
            :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
          />
          {{ friend?.userName }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <div class="board-header-contact" v-if="listMateList">
            <div class="board-contact-top dp-space-center p-3">
              <el-input
                v-model="searchInput"
                placeholder="Search Mate"
                style="height: 35px"
              />
            </div>
            <div class="board-contact-bottom">
              <div
                class="board-contact-item container dp--center p-3 icon-point"
                v-for="(item, index) in searchList"
                :key="'listItem' + index"
                @click="chooseFriend(item)"
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
      </el-dropdown></template
    >
    <template #right>
      <icon-font
        name="home"
        style="margin-right: 8px"
        :size="22"
        class="icon-point"
        @click="$router.push('/home/mate/' + friend?._key)"
      />
      <icon-font
        name="addTask"
        style="margin-right: 8px"
        :size="22"
        class="icon-point"
        @click="$router.push('/home/board')"
      />
      <!-- <el-dropdown v-if="friendBoardList && friendBoardList.length > 0">
        <icon-font
          name="addTask"
          style="margin-right: 8px"
          :size="22"
          class="icon-point"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in friendBoardList"
              :key="'friend' + index"
              @click="
                setBoardKey(item._key);
                $router.push('/home/board');
              "
            >
              {{ item.title }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown> -->
    </template>
  </theader>
  <div class="board">
    <div class="board-nav dp-space-center p-3">
      <div
        class="board-nav-item dp--center"
        :class="{ 'board-choose': navKey === 'today' }"
        @click="
          navKey = 'today';
          getTaskList('today');
        "
      >
        <div>{{ taskNum.today }}</div>
        <div class="dp-center-center">
          <icon-font
            name="sun"
            style="margin-right: 10px"
            :size="16"
            :color="
              navKey === 'today'
                ? dark
                  ? '#333'
                  : '#fff'
                : dark
                ? '#fff'
                : '#333'
            "
          />
          {{ $t(`Today`) }}
        </div>
      </div>
      <div
        class="board-nav-item dp--center"
        :class="{ 'board-choose': navKey === 'next' }"
        @click="
          navKey = 'next';
          getTaskList('next');
        "
      >
        <div>{{ taskNum.next }}</div>
        <div class="dp-center-center">
          <icon-font
            name="moon"
            style="margin-right: 10px"
            :size="16"
            :color="
              navKey === 'next'
                ? dark
                  ? '#333'
                  : '#fff'
                : dark
                ? '#fff'
                : '#333'
            "
          />
          {{ $t(`Nextday`) }}
        </div>
      </div>
      <div
        class="board-nav-item dp--center"
        :class="{ 'board-choose': navKey === 'future' }"
        @click="
          navKey = 'future';
          getTaskList('future');
        "
      >
        <div>{{ taskNum.future }}</div>
        <div class="dp-center-center">
          <icon-font
            name="future"
            style="margin-right: 10px"
            :size="16"
            :color="
              navKey === 'future'
                ? dark
                  ? '#333'
                  : '#fff'
                : dark
                ? '#fff'
                : '#333'
            "
          />
          {{ $t(`Future`) }}
        </div>
      </div>
    </div>
    <div
      class="board-box p-3"
      v-if="inboxList.length > 0 || taskList.length > 0"
    >
      <div class="inbox" v-if="navKey === 'today' && inboxList.length > 0">
        <div class="inbox-title dp-space-center">
          {{ $t(`InBox`) }}
          <tbutton
            style="height: 40px; padding: 0px 30px"
            @click="clearInbox"
            round
            v-if="targetType === 'self'"
          >
            {{ $t(`Set Read`) }} ( {{ taskNum.unRead }} )
          </tbutton>
        </div>
        <div
          v-for="(item, index) in inboxList"
          :key="'taskItem' + index"
          class="task"
        >
          <div class="task-title">
            # {{ item.boardInfo.title }} From
            {{ item.creatorInfo.userName }}
          </div>
          <div
            v-for="(taskItem, taskIndex) in item.cards"
            :key="'taskItem' + index"
            @mouseenter="overKey = taskItem._key"
          >
            <task-item
              :item="taskItem"
              :overKey="overKey"
              :type="targetType === 'self' ? 'inbox' : 'other'"
              @changeNum="changeNum"
              @finishTask="finishTask"
              @delTask="delTask"
              amimateType
              :role="
                targetType === 'self'
                  ? 0
                  : item.boardInfo.role
                  ? item.boardInfo.role
                  : 0
              "
            />
          </div>
        </div>
      </div>
      <div
        v-for="(item, index) in taskList"
        :key="'taskItem' + index"
        class="task"
      >
        <div class="task-title">
          # {{ item.boardInfo.title }} From
          {{ item.creatorInfo.userName }}
        </div>
        <div
          v-for="(taskItem, taskIndex) in item.cards"
          :key="'taskItem' + index"
          @mouseenter="overKey = taskItem._key"
        >
          <task-item
            :item="taskItem"
            :overKey="overKey"
            :type="targetType === 'self' ? 'task' : 'other'"
            @changeNum="changeNum"
            @finishTask="finishTask"
            @delTask="delTask"
            amimateType
            :role="item.boardInfo.role"
          />
        </div>
      </div>
    </div>

    <div
      class="board-full dp-center-center"
      v-else-if="
        inboxList.length === 0 &&
        taskList.length === 0 &&
        completeNum > 0 &&
        targetType === 'self' &&
        navKey === 'today'
      "
    >
      <div class="board-img dp-center-center">
        <div class="board-title">恭喜，今天任务全部完成！</div>
      </div>
    </div>
    <div
      class="board-empty dp-center-center"
      v-else-if="
        (navKey === 'today' && targetType === 'self') ||
        (navKey === 'next' && taskList.length === 0) ||
        (navKey === 'future' && taskList.length === 0)
      "
    >
      <div class="board-img dp-center-center">
        <div class="board-title">您还没有任务哦~</div>
      </div>
    </div>
  </div>
  <div class="footer p-3 dp--center">
    <div
      class="icon-point dp--center"
      @click="
        getTaskList('', 1);
        completedVisible = true;
      "
    >
      <img :src="bottlePng" alt="" /> {{ $t(`Today`) }}
      {{ $t(`Completed`) }} ({{ completeNum }})
    </div>
  </div>
  <el-drawer
    v-model="completedVisible"
    direction="rtl"
    title="Completed"
    :size="350"
    custom-class="p10-drawer"
  >
    <div class="completed-box">
      <div
        v-for="(item, index) in completedList"
        :key="'taskItem' + index"
        class="task"
      >
        <div class="task-title">
          # {{ item.boardInfo.title }} From
          {{ item.creatorInfo.userName }}
        </div>
        <div
          v-for="(taskItem, taskIndex) in item.cards"
          :key="'taskItem' + index"
          @mouseenter="overKey = taskItem._key"
        >
          <task-item
            :item="taskItem"
            :overKey="overKey"
            :type="'completed'"
            :role="item.boardInfo.role"
            @delTask="delTask"
          />
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<style scoped lang="scss">
.board-header-contact {
  max-width: 350px;
  min-width: 250px;
  background-color: var(--talk-item-color);

  .board-contact-top {
    height: 45px;
  }
  .board-contact-bottom {
    width: 100%;
    max-height: calc(100vh - 200px);
    overflow-x: hidden;
    overflow-y: auto;
    .board-contact-item {
      font-size: 16px;
      font-weight: 600;
    }
  }
}
.board {
  width: 100%;
  height: calc(100vh - 105px);
  .board-nav {
    width: 100%;
    height: 60px;
    .board-nav-item {
      width: 30%;
      height: 100%;
      border-radius: 16px;
      flex-wrap: wrap;
      align-content: center;
      cursor: pointer;
      & > div {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
    .board-choose {
      background: var(--talk-font-color);
      color: var(--talk-opposite-color);
    }
  }
  .inbox {
    padding-top: 10px;
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 15px;
    .inbox-title {
      padding: 0px 10px;
      box-sizing: border-box;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
    }
  }
  .board-box,
  .board-empty,
  .board-full {
    width: 100%;
    height: calc(100% - 80px);
    margin-top: 18px;
  }
  .board-box {
    overflow-x: hidden;
    overflow-y: auto;
  }
  .board-empty,
  .board-full {
    .board-img {
      width: 250px;
      height: 350px;
      background-size: 70%;
      background-repeat: no-repeat;
      background-position: center center;
      align-content: flex-end;
      flex-wrap: wrap;
      padding-bottom: 30px;
      .board-title {
        width: 100%;
        height: 30px;
        font-size: 13px;
        text-align: center;
        color: var(--talk-font-color-1);
        line-height: 37px;
      }
    }
  }
  .board-empty .board-img {
    background-image: url("@/assets/img/emptyBean.png");
  }
  .board-full .board-img {
    background-image: url("@/assets/img/fullBean.png");
  }
}
.completed-box {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<style></style>
