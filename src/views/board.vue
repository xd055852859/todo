<script setup lang="ts">
import TaskItem from "@/components/taskItem.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { ArrowDown, MoreFilled } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import toTopSvg from "../assets/svg/toTop.svg";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import Contact from "./contact.vue";
import Avatar from "@/components/avatar.vue";
import { Task } from "@/interface/Task";

import bottlePng from "@/assets/img/bottle.png";
import chooseSvg from "@/assets/svg/choose.svg";
const router = useRouter();
const socket: any = inject("socket");

const { user } = storeToRefs(appStore.authStore);
const { taskList } = storeToRefs(appStore.taskStore);
const { boardList, boardIndex, boardKey, boardRole } = storeToRefs(
  appStore.boardStore
);
const { setFriendInfo } = appStore.authStore;
const { getBoardList, setBoardRole, addBoardList, setBoardKey } =
  appStore.boardStore;

const boardRef = ref(null);
const topVisible = ref<boolean>(false);
const contactVisible = ref<boolean>(false);
const overKey = ref<string>("");
const taskTitle = ref<string>("");
const mark = ref<string>("");
const multipleCheck = ref<boolean>(false);
const taskObj = ref<any>(null);
const taskFinishObj = ref<any>(null);
const splitVisible = ref<boolean>(false);
const completeNum = ref<number>(0);
const completedVisible = ref<boolean>(false);
const markIndex = ref<number>(0);
const markArr = [
  { title: "All Todo", value: "" },
  { title: "Today", value: "today" },
  { title: "Next Day", value: "next" },
  { title: "Future", value: "future" },
];
onMounted(() => {
  getBoardList("accessTime", "desc");
  socket.on("create", (data) => {
    if (
      data.boardInfo._key === boardKey.value &&
      data.creatorInfo._key !== user.value?._key
    ) {
      if (taskObj.value[data.creatorInfo._key]) {
        taskObj.value[data.creatorInfo._key].cards.unshift(data);
      } else {
        taskObj.value[data.creatorInfo._key] = {
          cards: [data],
          userAvatar: data.creatorInfo.userAvatar,
          userName: data.creatorInfo.userName,
        };
      }
    }
    //创建者是自己直接在已读列表里 taskList
  });
  socket.on("update", (data) => {
    if (data.boardInfo._key === boardKey.value) {
      if (taskObj.value[data.creatorInfo._key]) {
        let index = taskObj.value[data.creatorInfo._key].cards.findIndex(
          (item: Task) => data._key === item._key
        );
        if (index !== -1) {
          taskObj.value[data.creatorInfo._key].cards[index] = {
            ...taskObj.value[data.creatorInfo._key].cards[index],
            ...data,
          };
        }
      }
    }
  });
  socket.on("finish", (data) => {
    if (data.boardInfo._key === boardKey.value) {
      finishTask(data);
    }
  });
  socket.on("delete", (data) => {
    if (data.boardInfo._key === boardKey.value) {
      delTask(data);
    }
  });
  socket.on("cancelFinish", (data) => {
    cancelTask(data);
    // if (data.mark === markArr[markIndex.value].value || markIndex.value === 0) {
    if (data.boardInfo._key === boardKey.value) {
      if (taskObj.value[data.creatorInfo._key]) {
        taskObj.value[data.creatorInfo._key].cards.unshift(data);
      } else {
        taskObj.value[data.creatorInfo._key] = {
          cards: [data],
          userAvatar: data.creatorInfo.userAvatar,
          userName: data.creatorInfo.userName,
        };
      }
    }
    // }
  });
});
const getBoardTask = async (boardKey: string, type?: string, mark?: string) => {
  let obj: any = { boardKey: boardKey };
  type ? (obj.hasFinished = 1) : null;
  mark ? (obj.mark = mark) : null;
  const taskRes: any = (await api.request.get("card/board", {
    ...obj,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    if (type) {
      taskFinishObj.value = {};
    } else {
      taskObj.value = {};
    }
    for (let key in taskRes.data.list) {
      let item = taskRes.data.list[key];
      console.log(item);
      item.cards = item.cards.map((taskItem) => {
        taskItem.creatorInfo = {
          userAvatar: item.userAvatar,
          userName: item.userName,
          _key: key,
        };
        return taskItem;
      });
      if (type) {
        taskFinishObj.value[key] = item;
      } else {
        taskObj.value[key] = item;
      }
    }
    if (!type) {
      completeNum.value = taskRes.data.completeNum;
      setBoardRole(taskRes.data.role);
    }
  }
};
const addCard = async () => {
  if (!taskTitle.value.trim()) {
    ElMessage({
      message: "Please Enter Task",
      type: "error",
      duration: 1000,
    });
    taskTitle.value = "";
    return;
  }
  const taskRes: any = (await api.request.post("card", {
    boardKey: boardKey.value,
    title: taskTitle.value,
    detail: "",
    splitIntoMultiple: multipleCheck.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    ElMessage({
      message: "Add Task Successful",
      type: "success",
      duration: 1000,
    });
    taskTitle.value = "";
    splitVisible.value = false;
    taskRes.data.forEach((item) => {
      if (user.value) {
        if (!taskObj.value[user.value._key]) {
          taskObj.value[user.value._key] = {
            userAvatar: user.value.userAvatar,
            userName: user.value.userName,
            cards: [],
          };
        }
        item = { ...item, hasRead: 0, hasImage: 0, hasDetail: 0 };
        taskObj.value[user.value._key].cards.unshift(item);
      }
    });
  }
};
const toTop = () => {
  topVisible.value = false;
  let timer = setInterval(function () {
    //@ts-ignore
    boardRef.value.scrollTop -= 80; // 使高度每次减少20px
    //@ts-ignore
    if (boardRef.value.scrollTop <= 0) {
      clearInterval(timer); // 关闭定时器
    }
  }, 30);
};
const toTargetList = () => {
  //@ts-ignore
  setFriendInfo(boardList.value[boardIndex.value].executorInfo);
  router.push("/home/list");
};
const finishTask = (data) => {
  if (taskObj.value[data.creatorInfo._key]) {
    let index = taskObj.value[data.creatorInfo._key].cards.findIndex(
      (item: Task) => data._key === item._key
    );
    if (index !== -1) {
      taskObj.value[data.creatorInfo._key].cards.splice(index, 1);
      if (taskObj.value[data.creatorInfo._key].cards.length === 0) {
        delete taskObj.value[data.creatorInfo._key];
      }
      completeNum.value++;
    }
  }
};
const delTask = (data) => {
  console.log(data);
  if (data.hasFinished) {
    if (taskFinishObj.value[data.creatorInfo._key]) {
      let index = taskFinishObj.value[data.creatorInfo._key].cards.findIndex(
        (item: Task) => data._key === item._key
      );
      if (index !== -1) {
        taskFinishObj.value[data.creatorInfo._key].cards.splice(index, 1);
        if (taskFinishObj.value[data.creatorInfo._key].cards.length === 0) {
          delete taskFinishObj.value[data.creatorInfo._key];
        }
        completeNum.value--;
      }
    }
  } else {
    if (taskObj.value[data.creatorInfo._key]) {
      let index = taskObj.value[data.creatorInfo._key].cards.findIndex(
        (item: Task) => data._key === item._key
      );
      if (index !== -1) {
        taskObj.value[data.creatorInfo._key].cards.splice(index, 1);
        if (taskObj.value[data.creatorInfo._key].cards.length === 0) {
          delete taskObj.value[data.creatorInfo._key];
        }
      }
    }
  }
};
const cancelTask = (data) => {
  if (taskFinishObj.value[data.creatorInfo._key]) {
    let index = taskFinishObj.value[data.creatorInfo._key].cards.findIndex(
      (item: Task) => data._key === item._key
    );
    if (index !== -1) {
      taskFinishObj.value[data.creatorInfo._key].cards.splice(index, 1);
      if (taskFinishObj.value[data.creatorInfo._key].cards.length === 0) {
        delete taskFinishObj.value[data.creatorInfo._key];
      }
      completeNum.value--;
    }
  }
};
const cloneBoard = async () => {
  let cloneRes = (await api.request.post("board/clone", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (cloneRes.msg === "OK") {
    ElMessage({
      message: "Clone Board Successful",
      type: "success",
      duration: 1000,
    });
    addBoardList(cloneRes.data);
    setBoardKey(cloneRes.data._key);
  }
};
// const moveAvatar = (e) => {
//   //@ts-ignore
//   avatarRef.value.scrollLeft += e.deltaY;
// };
watch(
  boardKey,
  (newVal) => {
    if (newVal) {
      getBoardTask(newVal);
    }
  },
  { immediate: true }
);
watch(mark, (newVal) => {
  getBoardTask(boardKey.value, "", newVal);
});
</script>
<template>
  <theader isMenu>
    <template #title>
      <el-dropdown trigger="click" v-if="boardList.length > 0">
        <div class="board-header-title dp--center icon-point">
          {{ boardList && boardList[boardIndex].title }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </div>
        <template #dropdown>
          <contact />
        </template>
      </el-dropdown>
    </template>
    <template v-slot:right>
      <div class="dp--center">
        <icon-font
          style="margin-right: 15px"
          name="set"
          class="icon-point"
          @click="$router.push(`/manage/` + boardKey)"
          v-if="boardRole < 2"
        />
        <el-dropdown>
          <el-icon>
            <MoreFilled />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="cloneBoard">
                <icon-font
                  name="clone"
                  class="icon-point"
                  style="margin-right: 5px"
                />
                Clone Board
              </el-dropdown-item>
              <el-dropdown-item
                @click="
                  //@ts-ignore
                  setFriendInfo(boardList[boardIndex].executorInfo);
                  $router.push('/manage/create');
                "
              >
                <icon-font
                  name="addBoard"
                  class="icon-point"
                  style="margin-right: 8px"
                />
                New Board
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
  </theader>
  <div class="board-header dp-space-center p-5" v-if="boardList.length > 0">
    <div class="dp--center">
      <avatar
        :name="boardList[boardIndex].executorInfo.userName"
        :avatar="boardList[boardIndex].executorInfo.userAvatar"
        type="person"
        :index="0"
        :size="30"
        :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
        :class="{
          'icon-point': boardList[boardIndex].executorInfo?._key !== user?._key,
        }"
        @click="
          boardList[boardIndex].executorInfo?._key !== user?._key
            ? $router.push(
                '/home/mate/' + boardList[boardIndex].executorInfo?._key
              )
            : null
        "
      />
      {{ boardList[boardIndex].executorInfo.userName }}
    </div>
    <div class="dp--center">
      <el-dropdown>
        <span style="font-size: 16px" class="icon-point">{{
          markArr[markIndex].title
        }}</span>
        <template #dropdown>
          <el-dropdown-menu
            v-for="(item, index) in markArr"
            :key="'mark' + index"
          >
            <el-dropdown-item
              @click="
                markIndex = index;
                mark = item.value;
              "
              ><div
                class="dp-space-center"
                style="width: 130px; font-size: 16px"
              >
                <div>{{ item.title }}</div>
                <div class="dp--center">
                  <img
                    :src="chooseSvg"
                    alt=""
                    style="width: 20px; height: 20px; margin-right: 10px"
                    v-if="markIndex === index"
                  />
                </div>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <div class="board dp-center-center" ref="boardRef">
    <!-- <div class="board-box dp-center"> -->
    <div class="board-container p-5">
      <template v-if="boardRole < 4">
        <div class="board-edit">
          <div class="editor">
            <el-input
              v-model="taskTitle"
              :autosize="{ minRows: 8 }"
              type="textarea"
              placeholder="Please Enter Task"
              autofocus
              @keydown.enter="
                splitVisible = true;
                multipleCheck = true;
              "
            />
          </div>
          <div class="bottom dp-space-center">
            <div>
              <el-checkbox
                v-model="multipleCheck"
                label="Split into multiple"
                size="large"
                v-if="splitVisible"
              />
            </div>

            <tbutton
              @click="addCard"
              :disabled="!taskTitle"
              :bgColor="taskTitle ? '' : '#d1dbe5'"
            >
              Post
            </tbutton>
          </div>
        </div>
        <el-divider border-style="dashed" />
      </template>
      <div v-for="(value, key) in taskObj" :key="'task' + key" class="task">
        <div class="task-title">From {{ value.userName }}</div>
        <div
          v-for="(item, index) in value.cards"
          :key="'taskItem' + index"
          @mouseenter="overKey = item._key"
        >
          <task-item
            :item="item"
            :overKey="overKey"
            type="board"
            amimateType
            @finishTask="finishTask"
            @delTask="delTask"
            :role="boardRole"
          />
        </div>
      </div>

      <div class="toTop icon-point" v-if="topVisible" @click="toTop">
        <img :src="toTopSvg" alt="" style="width: 50px; height: 50px" />
      </div>
    </div>
    <!-- </div> -->
    <div class="footer p-5 dp--center">
      <div
        class="icon-point dp--center"
        @click="
          completedVisible = true;
          getBoardTask(boardKey, 'completed');
        "
      >
        <img :src="bottlePng" alt="" /> Completed ({{ completeNum }})
      </div>
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
        v-for="(value, key) in taskFinishObj"
        :key="'task' + key"
        class="task"
      >
        <div class="task-title">From {{ value.userName }}</div>
        <div
          v-for="(item, index) in value.cards"
          :key="'taskItem' + index"
          @mouseenter="overKey = item._key"
        >
          <task-item
            :item="item"
            :overKey="overKey"
            type="completed"
            @delTask="delTask"
            :role="boardRole"
          />
        </div>
      </div>
    </div>
  </el-drawer>
  <!-- <el-drawer
    v-model="talkVisible"
    direction="ltr"
    :with-header="false"
    :size="'80%'"
    custom-class="p0-drawer"
    destroy-on-close
  >
   
  </el-drawer> -->
</template>
<style scoped lang="scss">
.board-header-title {
  width: 100%;
  height: 100%;
  font-size: 18px;
  font-weight: 600;
  color: var(--talk-font-color);
}
.board-header {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  // max-width: 960px;
}
.board {
  width: 100%;
  background: var(--talk-bg-color);
  position: relative;
  z-index: 1;
  flex-wrap: wrap;

  // .board-box {
  //   width: 100%;
  //   height: calc(100vh - 135px);
  //   overflow-x: hidden;
  //   overflow-y: auto;

  .board-container {
    // width: 100%;
    // max-width: 960px;
    width: 100%;
    height: calc(100vh - 145px);
    overflow-x: hidden;
    overflow-y: auto;
    .board-edit {
      width: 100%;
      min-height: 200px;
      background-color: var(--talk-item-color);
      border: 2px solid rgba(30, 30, 30, 1);
      border-radius: 8px;
      padding: 10px 22px;
      box-sizing: border-box;
      .editor {
        width: 100%;
        min-height: 185px;
        overflow: auto;
        position: relative;
        z-index: 1;
        padding: 0px 5px;
        box-sizing: border-box;
      }
      .bottom {
        height: 30px;
        .button {
          img {
            width: 20px;
            height: 20px;
            margin-right: 15px;
          }
        }
      }
    }

    .toTop {
      position: fixed;
      z-index: 5;
      right: 20px;
      bottom: 40px;
    }
    // }
  }

  .contact-box {
    width: 100%;
    height: calc(100vh - 55px);
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 2;
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
