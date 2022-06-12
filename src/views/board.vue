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
import i18n from "@/language/i18n";
const router = useRouter();
const socket: any = inject("socket");

const { user } = storeToRefs(appStore.authStore);
const { taskList } = storeToRefs(appStore.taskStore);
const { deviceType } = storeToRefs(appStore.commonStore);
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
const markArr = ref<any>([]);
onMounted(() => {
  getBoardList("accessTime", "desc");
  markArr.value = [
    { title: i18n.global.t(`All Todo`), value: "" },
    { title: i18n.global.t(`Today`), value: "today" },
    { title: i18n.global.t(`Nextday`), value: "next" },
    { title: i18n.global.t(`Future`), value: "future" },
  ];
  socket.on("create", (data) => {
    if (
      data.boardInfo._key === boardKey.value &&
      data.creatorInfo._key !== user.value?._key
    ) {
      if (taskObj.value[data.creatorInfo._key + data.creatorInfo.userName]) {
        taskObj.value[
          data.creatorInfo._key + data.creatorInfo.userName
        ].cards.unshift(data);
      } else {
        taskObj.value[data.creatorInfo._key + data.creatorInfo.userName] = {
          cards: [data],
          userAvatar: data.creatorInfo.userAvatar,
          userName: data.creatorInfo.userName,
        };
      }
    }
    //创建者是自己直接在已读列表里 taskList
  });
  socket.on("update", (data) => {
    console.log("update", data);
    if (data.boardInfo._key === boardKey.value) {
      updateCard(data);
    }
  });
  socket.on("finish", (data) => {
    if (
      data.operator !== user.value?._key &&
      data.boardInfo._key === boardKey.value
    ) {
      finishTask(data);
    }
  });
  socket.on("delete", (data) => {
    if (
      data.operator !== user.value?._key &&
      data.boardInfo._key === boardKey.value
    ) {
      delTask(data);
    }
  });
  socket.on("cancelFinish", (data) => {
    if (
      data.operator !== user.value?._key &&
      data.boardInfo._key === boardKey.value
    ) {
      delTask(data, "cancel");
    }
    // if (data.mark === markArr[markIndex.value].value || markIndex.value === 0) {

    // }
  });
});
const getBoardTask = async (boardKey: string, type?: string, mark?: string) => {
  let obj: any = { boardKey: boardKey };
  let obj1: any = {};
  let obj2: any = {};
  let finishobj1: any = {};
  let finishobj2: any = {};
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
      item.cards = item.cards.map((taskItem) => {
        taskItem.creatorInfo = {
          userAvatar: item.userAvatar,
          userName: item.userName,
          _key: key,
        };
        return taskItem;
      });
      if (type) {
        if (key === user.value?._key) {
          finishobj1[key + item.userName] = item;
        } else {
          finishobj2[key + item.userName] = item;
        }
      } else {
        if (key === user.value?._key) {
          obj1[key + item.userName] = item;
        } else {
          obj2[key + item.userName] = item;
        }
      }
    }
    if (type) {
      taskFinishObj.value = { ...finishobj1, ...finishobj2 };
    } else if (!type) {
      taskObj.value = { ...obj1, ...obj2 };
      console.log(obj1, obj2);
      console.log(taskObj.value);
      completeNum.value = taskRes.data.completeNum;
      setBoardRole(taskRes.data.role);
    }
  }
};
const addCard = async () => {
  if (!taskTitle.value.trim()) {
    ElMessage({
      message: i18n.global.t(`Please Enter Task`),
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
      message: i18n.global.t(`Add task successfully`),
      type: "success",
      duration: 1000,
    });
    taskTitle.value = "";
    splitVisible.value = false;
    taskRes.data.forEach((item) => {
      if (user.value) {
        if (!taskObj.value[user.value._key + user.value.userName]) {
          taskObj.value[user.value._key + user.value.userName] = {
            userAvatar: user.value.userAvatar,
            userName: user.value.userName,
            cards: [],
          };
        }
        item = { ...item, hasRead: 0, hasImage: 0, hasDetail: 0 };
        taskObj.value[user.value._key + user.value.userName].cards.unshift(
          item
        );
      }
    });
  }
};
const updateCard = async (data) => {
  let index = taskObj.value[
    data.creatorInfo._key + data.creatorInfo.userName
  ].cards.findIndex((item: Task) => data._key === item._key);
  if (index !== -1) {
    taskObj.value[data.creatorInfo._key + data.creatorInfo.userName].cards[
      index
    ] = {
      ...taskObj.value[data.creatorInfo._key + data.creatorInfo.userName].cards[
        index
      ],
      ...data,
    };
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
  if (taskObj.value[data.creatorInfo._key + data.creatorInfo.userName]) {
    let index = taskObj.value[
      data.creatorInfo._key + data.creatorInfo.userName
    ].cards.findIndex((item: Task) => data._key === item._key);
    if (index !== -1) {
      taskObj.value[
        data.creatorInfo._key + data.creatorInfo.userName
      ].cards.splice(index, 1);
      if (
        taskObj.value[data.creatorInfo._key + data.creatorInfo.userName].cards
          .length === 0
      ) {
        delete taskObj.value[data.creatorInfo._key + data.creatorInfo.userName];
      }
      completeNum.value++;
    }
  }
};
const delTask = (data, type?: string) => {
  if (data.hasFinished || type === "cancel") {
    if (
      taskFinishObj.value &&
      taskFinishObj.value[data.creatorInfo._key + data.creatorInfo.userName]
    ) {
      let index = taskFinishObj.value[
        data.creatorInfo._key + data.creatorInfo.userName
      ].cards.findIndex((item: Task) => data._key === item._key);
      if (index !== -1) {
        taskFinishObj.value[
          data.creatorInfo._key + data.creatorInfo.userName
        ].cards.splice(index, 1);
        if (
          taskFinishObj.value[data.creatorInfo._key + data.creatorInfo.userName]
            .cards.length === 0
        ) {
          delete taskFinishObj.value[
            data.creatorInfo._key + data.creatorInfo.userName
          ];
        }
        completeNum.value--;
      }
    }
    if (type === "cancel") {
      if (taskObj.value[data.creatorInfo._key + data.creatorInfo.userName]) {
        taskObj.value[
          data.creatorInfo._key + data.creatorInfo.userName
        ].cards.unshift(data);
      } else {
        taskObj.value[data.creatorInfo._key + data.creatorInfo.userName] = {
          cards: [data],
          userAvatar: data.creatorInfo.userAvatar,
          userName: data.creatorInfo.userName,
        };
      }
    }
  } else {
    if (taskObj.value[data.creatorInfo._key + data.creatorInfo.userName]) {
      let index = taskObj.value[
        data.creatorInfo._key + data.creatorInfo.userName
      ].cards.findIndex((item: Task) => data._key === item._key);
      if (index !== -1) {
        taskObj.value[
          data.creatorInfo._key + data.creatorInfo.userName
        ].cards.splice(index, 1);
        if (
          taskObj.value[data.creatorInfo._key + data.creatorInfo.userName].cards
            .length === 0
        ) {
          delete taskObj.value[
            data.creatorInfo._key + data.creatorInfo.userName
          ];
        }
      }
    }
  }
};

// const cancelTask = (data) => {
//   if (taskFinishObj.value[data.creatorInfo._key]) {
//     let index = taskFinishObj.value[data.creatorInfo._key].cards.findIndex(
//       (item: Task) => data._key === item._key
//     );
//     console.log(index)
//     if (index !== -1) {
//       taskFinishObj.value[data.creatorInfo._key].cards.splice(index, 1);
//       if (taskFinishObj.value[data.creatorInfo._key].cards.length === 0) {
//         delete taskFinishObj.value[data.creatorInfo._key];
//       }
//       completeNum.value--;
//     }
//   }
// };
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
        />
        <icon-font
          name="addBoard"
          class="icon-point"
          style="margin-right: 8px"
          @click="$router.push(`/home/createBoard`)"
        />
      </div>
    </template>
  </theader>
  <div
    class="board dp-center-center"
    ref="boardRef"
    :class="{
      'dp-center-center': deviceType === 'phone',
      'dp-space-center': deviceType !== 'phone',
    }"
  >
    <!-- <div class="board-box dp-center"> -->
    <div class="talk-left" v-if="deviceType !== 'phone'"></div>
    <div class="talk-menu" v-if="deviceType !== 'phone'">
      <contact type="menu"/>
    </div>
    <div class="board-container p-3" :style="{
        width: deviceType === 'phone' ? '100%' : 'calc(100% - 300px)',
      }">
      <div class="board-header dp-space-center p-3" v-if="boardList.length > 0">
        <div
          class="dp--center"
          @click="
            $router.push(
              '/home/mate/' + boardList[boardIndex].executorInfo._key
            )
          "
        >
          <avatar
            :name="boardList[boardIndex].executorInfo.userName"
            :avatar="boardList[boardIndex].executorInfo.userAvatar"
            type="person"
            :index="0"
            :size="30"
            :avatarStyle="{ fontSize: '16px', marginRight: '8px' }"
            :class="{
              'icon-point':
                boardList[boardIndex].executorInfo?._key !== user?._key,
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
              markArr[markIndex]?.title
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
                if (!splitVisible) {
                  splitVisible = true;
                  multipleCheck = true;
                }
              "
            />
          </div>
          <div class="bottom dp-space-center">
            <div>
              <el-checkbox
                v-model="multipleCheck"
                :label="$t(`Split into multiple`)"
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
            @updateCard="updateCard"
            :role="boardRole"
          />
        </div>
      </div>

      <div class="toTop icon-point" v-if="topVisible" @click="toTop">
        <img :src="toTopSvg" alt="" style="width: 50px; height: 50px" />
      </div>
    </div>
    <!-- </div> -->
    <div class="footer p-3 dp--center">
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
    <div class="completed-box" v-if="taskFinishObj">
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
</template>
<style scoped lang="scss">
.board-header-title {
  width: 100%;
  height: 100%;
  font-size: 18px;
  font-weight: 600;
  color: var(--talk-font-color);
}

.board {
  width: 100%;
  background: var(--talk-bg-color);
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  box-sizing: border-box;

  // .board-box {
  //   width: 100%;
  //   height: calc(100vh - 135px);
  //   overflow-x: hidden;
  //   overflow-y: auto;
  .talk-menu {
    width: 280px;
    height: calc(100vh - 105px);
    top: 55px;
    left: 0px;
    position: fixed;
    z-index: 10;
  }
  .board-container {
    // width: 100%;
    // max-width: 960px;
    width: 100%;
    height: calc(100vh - 105px);
    overflow-x: hidden;
    overflow-y: auto;
    .board-header {
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      // max-width: 960px;
    }
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
<style>
.board-container .board-edit .el-textarea__inner {
  font-size: 20px !important;
  font-weight: 600;
  color: var(--talk-font-color);
  padding: 0px;
  background-color: transparent;
}
</style>
