<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { Task } from "@/interface/Task";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import TaskItem from "@/components/taskItem.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

const { user, mateList } = storeToRefs(appStore.authStore);
const { taskList, inboxList, targetKey } = storeToRefs(appStore.taskStore);
const { getTaskList, delTaskList, clearInboxList, delInboxList, setTargetKey } =
  appStore.taskStore;

const listMateList = computed(() => [user.value, ...mateList.value]);

const navKey = ref<string>("today");
const overKey = ref<string>("");
const completeNum = ref<number>(0);
const completeList = ref<Task[]>([]);
const listIndex = ref<number>(0);
const targetType = ref<string>("self");
const taskNum = reactive({
  today: 0,
  next: 0,
  future: 0,
  unRead: 0,
});
onMounted(() => {
  getTaskList("today");
  getTaskNum();
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
const changeNum = (
  type: string,
  fatherIndex: number,
  index: number,
  listType: string
) => {
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
  taskNum[navKey.value]--;
  if (listType === "task") {
    delTaskList(fatherIndex, index);
  } else {
    delInboxList(fatherIndex, index);
  }
};
const clearInbox = async () => {
  const clearRes = (await api.request.patch("message/read")) as ResultProps;
  if (clearRes.msg === "OK") {
    ElMessage({
      message: "Clear Inbox Successful",
      type: "success",
      duration: 1000,
    });
    clearInboxList();
    getTaskList("today");
  }
};
watch(targetKey, (newVal) => {
  getTaskList("today");
  getTaskNum();
});
</script>
<template>
  <theader isMenu>
    <template #left
      ><el-dropdown>
        <div class="dp--center icon-point">
          <el-avatar
            fit="cover"
            :size="30"
            :src="listMateList[listIndex]?.userAvatar"
          />
          {{ listMateList[listIndex]?.userName }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in listMateList"
              :key="'listItem' + index"
              @click="getTargetTask(item, index)"
            >
              <div class="dp--center icon-point">
                <el-avatar fit="cover" :size="30" :src="item?.userAvatar" />{{
                  item?.userName
                }}
              </div></el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown></template
    >
    <template #right>
      <div class="dp--center">
        <icon-font
          name="addBoard"
          class="icon-point"
          @click="$router.push('/manage/create')"
        />
      </div>
    </template>
  </theader>
  <div class="board">
    <div class="board-nav dp-space-center p-5">
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
            :color="navKey === 'today' ? '#fff' : '#333'"
          />
          Today
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
            :color="navKey === 'next' ? '#fff' : '#333'"
          />
          Nextday
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
            :color="navKey === 'future' ? '#fff' : '#333'"
          />
          Future
        </div>
      </div>
    </div>
    <div
      class="board-box p-5"
      v-if="inboxList.length > 0 || taskList.length > 0"
    >
      <div class="inbox" v-if="navKey === 'today' && inboxList.length > 0">
        <div class="inbox-title dp-space-center">
          Inbox
          <tbutton style="height: 40px; padding: 0px 30px" @click="clearInbox" round>
            Sent Read ( {{ taskNum.unRead }} ) 
          </tbutton>
        </div>
        <div
          v-for="(item, index) in inboxList"
          :key="'taskItem' + index"
          class="task"
        >
          <div class="task-title">
            # {{ item.boardInfo.title }} Form
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
              :fatherIndex="index"
              :index="taskIndex"
              :type="targetType === 'self' ? 'inbox' : 'other'"
              @changeNum="changeNum"
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
          # {{ item.boardInfo.title }} Form
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
            :fatherIndex="index"
            :index="taskIndex"
            :type="targetType === 'self' ? 'task' : 'other'"
            @changeNum="changeNum"
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
        targetType === 'self'
      "
    >
      <div class="board-img dp-center-center">
        <div class="board-title">恭喜，今天任务全部完成！</div>
      </div>
    </div>
    <div class="board-empty dp-center-center" v-else-if="targetType === 'self'">
      <div class="board-img dp-center-center">
        <div class="board-title">您还没有任务哦~</div>
        <div class="board-title common-color">立即创建</div>
      </div>
    </div>
  </div>
  <div class="footer p-5 dp--center">
    Completed ({{ completeNum }})
    <div></div>
  </div>
</template>
<style scoped lang="scss">
.board {
  width: 100%;
  height: calc(100vh - 95px);
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
      background: #3a3a3a;
      color: #fff;
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

</style>
<style></style>
