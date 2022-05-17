<script setup lang="ts">
import TaskItem from "@/components/taskItem.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import toTopSvg from "../assets/svg/toTop.svg";
import appStore from "@/store";
import { ElMessage } from "element-plus";
import Contact from "./contact.vue";
const router = useRouter();
const { taskList } = storeToRefs(appStore.taskStore);
const { boardList, boardIndex, boardKey, boardRole } = storeToRefs(
  appStore.boardStore
);

const { getBoardList, setBoardRole } = appStore.boardStore;

const boardRef = ref(null);
const topVisible = ref<boolean>(false);
const contactVisible = ref<boolean>(false);
const overKey = ref<string>("");
const taskTitle = ref<string>("");
const multipleCheck = ref<boolean>(false);
const taskObj = ref<any>(null);

onMounted(() => {
  getBoardList("accessTime", "desc");
});
const getBoardTask = async (boardKey: string) => {
  const taskRes: any = (await api.request.get("card/board", {
    boardKey: boardKey,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskObj.value = taskRes.data.list;
    setBoardRole(taskRes.data.role);
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
    taskRes.data.forEach((item) => {
      if (!taskObj.value[item.creatorInfo._key]) {
        taskObj.value[item.creatorInfo._key] = {
          userAvatar: item.creatorInfo.userAvatar,
          userName: item.creatorInfo.userName,
          cards: [],
        };
      }
      console.log(item.creatorInfo._key);
      console.log(taskObj.value[item.creatorInfo._key]);
      taskObj.value[item.creatorInfo._key].cards.unshift(...taskRes.data);
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
</script>
<template>
  <theader isMenu>
    <template v-slot:left>
      <div
        class="dp--center icon-point"
        @click="contactVisible = !contactVisible"
      >
        {{ boardList && boardList[boardIndex].title }}
        <el-icon style="margin-left: 10px"
          ><arrow-up v-if="contactVisible" /><arrow-down v-else
        /></el-icon>
      </div>
    </template>
    <template v-slot:right>
      <icon-font name="set" @click="$router.push(`/manage/` + boardKey)" />
    </template>
  </theader>
  <div class="board p-5 dp-center-center" ref="boardRef">
    <div class="board-container">
      <div class="board-edit">
        <div class="editor">
          <el-input
            v-model="taskTitle"
            :autosize="{ minRows: 8 }"
            type="textarea"
            placeholder="Please Enter Task"
            autofocus
          />
        </div>
        <div class="bottom dp-space-center">
          <el-checkbox
            v-model="multipleCheck"
            label="Split into multiple"
            size="large"
          />
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
      <div v-for="(value, key) in taskObj" :key="'task' + key" class="task">
        <div class="task-title">From {{ value.userName }}</div>
        <template
          v-for="(item, index) in value.cards"
          :key="'taskItem' + index"
          @mouseenter="overKey = item._key"
        >
          <task-item :item="item" :overKey="overKey" type="board" />
        </template>
      </div>
      <div class="toTop icon-point" v-if="topVisible" @click="toTop">
        <img :src="toTopSvg" alt="" style="width: 50px; height: 50px" />
      </div>
    </div>
    <div class="contact-box" v-if="contactVisible">
      <contact @close="contactVisible = false" />
    </div>
  </div>

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
.board {
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--talk-bg-color);
  position: relative;
  z-index: 1;
  .board-container {
    width: 100%;
    height: calc(100vh - 55px);
    max-width: 960px;
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
</style>
<style></style>
