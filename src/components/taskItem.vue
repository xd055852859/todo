<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
import { Plus } from "@element-plus/icons-vue";
import { uploadImage } from "@/services/util";
import api from "@/services/api";
import { ElMessage, Props } from "element-plus";
import { OnClickOutside } from "@vueuse/components";
import addBeanSvg from "@/assets/svg/addBean.svg";
import finishBeanSvg from "@/assets/svg/finishBean.svg";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { iteratee } from "lodash";
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults";
const { uploadToken } = storeToRefs(appStore.authStore);
const { taskKey } = storeToRefs(appStore.taskStore);
const { getUploadToken } = appStore.authStore;
const { setTaskKey } = appStore.taskStore;

const props = defineProps<{
  item: Task;
  type?: string;
  overKey?: string;
  fatherIndex?: number;
  index?: number;
}>();
const title = ref<string>("");
const detail = ref<string>("");
const role = ref<number>(5);
const imageList = ref<any>([]);
const imageVisible = ref<boolean>(false);
const imageSrc = ref<string>();
const emits = defineEmits<{
  (
    e: "changeNum",
    type: string,
    fatherIndex: number,
    index: number,
    listType: string
  ): void;
  (e: "finishTask"): void;
}>();
onMounted(() => {
  title.value = props.item.title;
});
const getTaskInfo = async () => {
  getUploadToken();
  const infoRes: any = (await api.request.get("card/detail", {
    cardKey: props.item._key,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    setTaskKey(props.item._key);
    if (infoRes.data.detail) {
      detail.value = infoRes.data.detail;
    }
    if (infoRes.data.imageList && infoRes.data.imageList.length > 0) {
      imageList.value = infoRes.data.imageList;
    }
    role.value = infoRes.data.role;
  }
};
const changeMark = async (type: string) => {
  const markRes: any = (await api.request.patch("card/mark", {
    mark: type,
    cardKey: props.item._key,
  })) as ResultProps;
  if (markRes.msg === "OK") {
    ElMessage({
      message: "Change Mark Successful",
      type: "success",
      duration: 1000,
    });
    //@ts-ignore
    emits("changeNum", type, props.fatherIndex, props.index, props.type);
  }
};
const upDateTask = async () => {
  if (props.item._key === taskKey.value && role.value < 3) {
    const taskRes: any = (await api.request.patch("card", {
      cardKey: props.item._key,
      title: title.value,
      detail: detail.value,
      imageList: imageList.value,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
    }
  }
};
const finishTask = async () => {
  const taskRes: any = (await api.request.patch("card/finish", {
    cardKey: props.item._key,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    //Todo
    emits("finishTask");
  }
};
const viewImg = (uploadFile) => {
  imageSrc.value = uploadFile.url;
  imageVisible.value = true;
};

const updateImg = (e) => {
  let mimeType = ["image/png", "image/jpeg", "image/svg+xml"];
  uploadImage(e.target.files[0], uploadToken.value, mimeType, (url: string) => {
    imageList.value.push(url);
    // editorInfo.value?.chain().focus().deleteRange(range).setImage({ src: url });
  });
};
const delImg = () => {};
</script>
<template>
  <OnClickOutside @trigger="upDateTask" style="width: 100%">
    <div
      class="task"
      @click="item._key !== taskKey ? getTaskInfo() : null"
      :style="
        item._key === taskKey
          ? { boxShadow: '0px 4px 9px 0px var(--talk-hover-shadow)' }
          : {}
      "
    >
      <div class="task-top">
        <div class="task-left dp-center-center">
          <icon-font
            name="unfinish"
            :size="22"
            style="margin-right: 18px"
            color="#46a03c"
            class="icon-point"
            @click.stop="finishTask"
          />
        </div>
        <div class="task-right">
          <el-input
            v-model="title"
            :autosize="{ minRows: 1 }"
            type="textarea"
            :placeholder="role > 2 ? '' : 'Please Enter Title'"
            :disabled="role > 2"
          />
          <div
            class="task-detail"
            v-if="taskKey === item._key && (role < 3 || (detail && role > 2))"
          >
            <el-input
              v-model="detail"
              :autosize="{ minRows: 1 }"
              type="textarea"
              :placeholder="role > 2 ? '' : 'Please Enter Detail'"
              :disabled="role > 2"
            />
          </div>
          <div
            class="task-upload dp--center"
            v-if="
              taskKey === item._key &&
              (role < 3 || (imageList.length > 0 && role > 2))
            "
          >
            <el-image
              style="width: 60px; height: 60px"
              v-for="(item, index) in imageList"
              :src="item"
              :preview-src-list="imageList"
              :initial-index="index"
              fit="cover"
              class="task-upload-img"
            />
            <div
              class="task-upload-button dp-center-center icon-point"
              v-if="role < 3"
            >
              <el-icon><Plus /></el-icon>
              <input
                type="file"
                accept="image/*"
                @change="updateImg($event)"
                class="upload-img"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        class="task-bottom dp-space-center"
        v-if="type !== 'other' && type !== 'report'"
      >
        <div>
          <span v-if="type === 'send'"># {{ item.boardInfo?.title }}</span>
        </div>
        <div class="dp--center">
          <template
            v-if="
              (type === 'task' || type === 'inbox') && overKey === item._key
            "
          >
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'today' }"
              @click="changeMark('today')"
              >Today
            </span>
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'next' }"
              @click="changeMark('next')"
              >Next</span
            >
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'future' }"
              @click="changeMark('future')"
              >Future</span
            >
          </template>
          <template
            v-else-if="
              (type === 'board' || type === 'send') && overKey === item._key
            "
          >
            {{ item.hasRead ? item.mark : "Unread" }}
            <icon-font
              class="icon-point del-button"
              name="image"
              :size="20"
              style="margin-left: 10px"
          /></template>
        </div>
      </div>
      <div class="task-bottom dp-space-center" v-if="type === 'report'">
        <div>
          <span
            >{{ item.creatorInfo?.userName }} >
            {{ item.executorInfo.userName }}</span
          >
        </div>
        <div class="dp--center">
          <!-- scoreIcon: 1 创建任务 2 完成任务 3 创建和完成-->
          <img
            :src="addBeanSvg"
            alt=""
            v-if="item.scoreIcon === 1 || item.scoreIcon === 3"
            :style="item.scoreIcon === 3 ? { marginRight: '6px' } : {}"
            class="task-bean"
          />
          <img
            :src="finishBeanSvg"
            alt=""
            v-if="item.scoreIcon === 2 || item.scoreIcon === 3"
            class="task-bean"
          />
        </div>
      </div>
    </div>
  </OnClickOutside>
  <el-dialog v-model="imageVisible">
    <img w-full :src="imageSrc" alt="Preview Image" />
  </el-dialog>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  &:hover {
    box-shadow: 0px 4px 9px 0px var(--talk-hover-shadow);
  }
  .task-top {
    width: 100%;
    min-height: 30px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-bottom: 5px;
    .task-left {
      width: 40px;
      height: 100%;
    }
    .task-right {
      width: calc(100% - 48px);
      height: 100%;

      white-space: normal;
      word-break: break-all;
      word-wrap: break-word;
      .task-detail {
        margin: 15px 0px;
      }
      .task-upload {
        flex-wrap: wrap;
        .task-upload-img {
          margin-right: 10px;
          margin-bottom:10px;
        }
        .task-upload-button {
          width: 60px;
          height: 60px;
          position: relative;
          z-index: 1;
          background-color: #fafafa;
          border: 1px dashed #cdd0d6;
          border-radius: 6px;
          box-sizing: border-box;
          margin-bottom:10px;
          .upload-img {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0px;
            left: 0px;
            z-index: 5;
            overflow: hidden;
            opacity: 0;
            cursor: pointer;
          }
        }
      }
    }
  }
  .task-bottom {
    height: 25px;
    color: var(--talk-font-color-1);
    font-size: 12px;
    padding: 0px 10px;
    box-sizing: border-box;
  }
  .task-bean {
    width: 30px;
    height: 30px;
  }
}
</style>
<style>
.task .task-right .el-textarea__inner {
  font-size: 17px;
  font-weight: 600;
  color: var(--talk-font-color);
  padding: 0px;
  background-color: transparent;
}
.task .task-right .task-detail .el-textarea__inner {
  font-size: 14px;
  color: var(--talk-font-color-2);
  padding: 0px;
  background-color: transparent;
  margin-bottom: 10px;
}
.task .task-right .el-textarea.is-disabled .el-textarea__inner {
  cursor: default;
}
</style>
