<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
import { Plus, MoreFilled, Delete } from "@element-plus/icons-vue";
import { uploadImage } from "@/services/util";
import api from "@/services/api";
import { ElMessage, Props } from "element-plus";
import { OnClickOutside } from "@vueuse/components";
import addBeanSvg from "@/assets/svg/addBean.svg";
import finishBeanSvg from "@/assets/svg/finishBean.svg";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Avatar from "./avatar.vue";
import i18n from "@/language/i18n";
const dayjs: any = inject("dayjs");
const { uploadToken, user } = storeToRefs(appStore.authStore);
const { taskKey } = storeToRefs(appStore.taskStore);

const { getUploadToken } = appStore.authStore;
const { setTaskKey } = appStore.taskStore;

const props = defineProps<{
  item: Task;
  type?: string;
  overKey?: string;
  amimateType?: boolean;
  role: number;
}>();
const emits = defineEmits<{
  (e: "changeNum", type: string, item: Task, listType: string): void;
  (e: "finishTask", taskItem: Task): void;
  (e: "updateCard", taskItem: Task): void;

  (e: "delTask", taskItem: Task, type?: string): void;
}>();

const title = ref<string>("");
const detail = ref<string>("");
const originTitle = ref<string>("");
const originDetail = ref<string>("");
const imageList = ref<any>([]);
const imageVisible = ref<boolean>(false);
const imageSrc = ref<string>();
const hasFinished = ref<number>(0);
const taskTime = ref<string>("");
onMounted(() => {
  title.value = props.item.title;
  originTitle.value = props.item.title;
  hasFinished.value = props.item.hasFinished ? props.item.hasFinished : 0;
  let todayStartTime = dayjs().startOf("day").valueOf();
  let todayEndTime = dayjs().endOf("day").valueOf();
  let yesterStartTime = dayjs().subtract(1, "day").startOf("day").valueOf();
  let yesterEndTime = dayjs().subtract(1, "day").endOf("day").valueOf();
  let beYesterStartTime = dayjs().subtract(2, "day").startOf("day").valueOf();
  let beYesterEndTime = dayjs().subtract(2, "day").endOf("day").valueOf();
  let yearStartTime = dayjs().startOf("year").startOf("day").valueOf();
  let yearEndTime = dayjs().endOf("year").endOf("day").valueOf();
  if (props.item.createTime) {
    if (
      todayStartTime <= props.item.createTime &&
      todayEndTime >= props.item.createTime
    ) {
      taskTime.value = dayjs(props.item.createTime).format("HH:mm");
    } else if (
      yesterStartTime <= props.item.createTime &&
      yesterEndTime >= props.item.createTime
    ) {
      taskTime.value = i18n.global.t(`yesterday`);
    } else if (
      beYesterStartTime <= props.item.createTime &&
      beYesterEndTime >= props.item.createTime
    ) {
      taskTime.value = i18n.global.t(`The day before`);
    } else if (beYesterStartTime > props.item.createTime) {
      if (
        props.item.createTime >= yearStartTime &&
        props.item.createTime <= yearEndTime
      ) {
        taskTime.value = dayjs(props.item.createTime).format("M.D");
      } else if (props.item.createTime < yearStartTime) {
        taskTime.value = dayjs(props.item.createTime).format("YYYY.MM.DD");
      }
    }
  }
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
      originDetail.value = infoRes.data.detail;
    }
    if (infoRes.data.imageList && infoRes.data.imageList.length > 0) {
      imageList.value = infoRes.data.imageList;
    }
  }
};
const changeMark = async (type: string) => {
  const markRes: any = (await api.request.patch("card/mark", {
    mark: type,
    cardKey: props.item._key,
  })) as ResultProps;
  if (markRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Change Mark Successful`),
      type: "success",
      duration: 1000,
    });
    //@ts-ignore
    emits("changeNum", type, props.item, props.type);
    emits("updateCard", { ...props.item, mark: type });
  }
};
const upDateTask = async () => {
  if (props.item._key === taskKey.value && props.role < 3) {
    if (
      title.value === originTitle.value &&
      detail.value === originDetail.value
    ) {
      setTaskKey("");
      return;
    }
    const taskRes: any = (await api.request.patch("card", {
      cardKey: props.item._key,
      title: title.value,
      detail: detail.value,
      imageList: imageList.value,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      setTaskKey("");
    }
  }
};
const finishTask = async (e) => {
  const taskRes: any = (await api.request.patch("card/finish", {
    cardKey: props.item._key,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    hasFinished.value = props.item.hasFinished ? 0 : 1;
    let newItem = { ...props.item, hasFinished: hasFinished.value };
    if (hasFinished.value) {
      if (props.amimateType) {
        addBall(e);
      }
      emits("finishTask", newItem);
    } else {
      emits("delTask", newItem, "cancel");
    }
    //Todo
  }
};
const delCard = async (e) => {
  const taskRes: any = (await api.request.delete("card", {
    cardKey: props.item._key,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Delete task successfully`),
      type: "success",
      duration: 1000,
    });
    //Todo
    emits("delTask", props.item);
  }
};
const addBall = (e) => {
  let left = e.pageX - e.target.offsetWidth / 2;
  let top = e.pageY - e.target.offsetWidth / 2;
  let width = document.documentElement.offsetWidth;
  let height = document.documentElement.offsetHeight;
  console.log(width, height);
  let bar = document.createElement("div");
  let img = document.createElement("img");
  img.src = finishBeanSvg;
  bar.appendChild(img);
  bar.className = "bean-ball";
  bar.style.left = left + "px";
  bar.style.top = top + "px";
  bar.style.transition = "left 1s linear, top 1s cubic-bezier(0.5, -0.5, 1, 1)";
  document.body.appendChild(bar);
  // 添加动画属性
  let timer = setTimeout(() => {
    bar.style.left = width * 0.08 + "px";
    bar.style.top = height - 40 + "px";
  }, 0);

  // /**
  //  * 动画结束后，删除自己
  //  */
  bar.ontransitionend = function () {
    // this.remove();
    if (document.body.contains(bar)) {
      document.body.removeChild(bar);
    }
    clearTimeout(timer);
  };
};

const updateImg = (file) => {
  let mimeType = ["image/png", "image/jpeg", "image/svg+xml"];
  if (file) {
    uploadImage(file, uploadToken.value, mimeType, (url: string) => {
      imageList.value.push(url);
      // editorInfo.value?.chain().focus().deleteRange(range).setImage({ src: url });
    });
  }
};
const pasteImg = (event) => {
  console.log(event);
  var isChrome = false;
  if (event.clipboardData || event.originalEvent) {
    //not for ie11  某些chrome版本使用的是event.originalEvent
    var clipboardData =
      event.clipboardData || event.originalEvent.clipboardData;
    console.log(clipboardData);
    if (clipboardData.items) {
      // for chrome
      var items = clipboardData.items,
        len = items.length,
        blob = null;
      isChrome = true;
      //items.length比较有意思，初步判断是根据mime类型来的，即有几种mime类型，长度就是几（待验证）
      //如果粘贴纯文本，那么len=1，如果粘贴网页图片，len=2, items[0].type = 'text/plain', items[1].type = 'image/*'
      //如果使用截图工具粘贴图片，len=1, items[0].type = 'image/png'
      //如果粘贴纯文本+HTML，len=2, items[0].type = 'text/plain', items[1].type = 'text/html'
      // console.log('len:' + len);
      // console.log(items[0]);
      // console.log(items[1]);
      // console.log( 'items[0] kind:', items[0].kind );
      // console.log( 'items[0] MIME type:', items[0].type );
      // console.log( 'items[1] kind:', items[1].kind );
      // console.log( 'items[1] MIME type:', items[1].type );

      //阻止默认行为即不让剪贴板内容在div中显示出来
      event.preventDefault();
      console.log(items);
      //在items里找粘贴的image,据上面分析,需要循环
      for (var i = 0; i < len; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          // console.log(items[i]);
          // console.log( typeof (items[i]));

          //getAsFile() 此方法只是living standard firefox ie11 并不支持
          // blob = items[i].getAsFile();
          // console.log(items[i].getAsFile());
          updateImg(items[i].getAsFile());
        }
      }
    }
  }
};
const delImg = (index) => {
  imageList.value.splice(index, 1);
};
watch(
  () => props.item,
  (newVal) => {
    if (newVal) {
      title.value = newVal.title;
      originTitle.value = newVal.title;
      hasFinished.value = newVal.hasFinished ? 1 : 0;
    }
  },
  { deep: true }
);
</script>
<template>
  <OnClickOutside @trigger="upDateTask" style="width: 100%">
    <div
      class="task"
      @click="item._key !== taskKey ? getTaskInfo() : null"
      :style="
        item._key === taskKey
          ? {
              boxShadow: '0px 4px 9px 0px var(--talk-hover-shadow)',
              backgroundColor: 'var(--talk-item-color)',
            }
          : {}
      "
      @paste="pasteImg"
    >
      <div class="task-top">
        <div class="task-left dp-center-center">
          <icon-font
            :name="hasFinished ? 'finish' : 'unfinish'"
            :size="22"
            style="margin-right: 18px"
            color="#46a03c"
            class="icon-point"
            @click.stop="
              item.executorInfo?._key === user?._key ||
              item.creatorInfo?._key === user?._key ||
              role < 3
                ? finishTask($event)
                : null
            "
          />
        </div>
        <div class="task-right">
          <el-input
            v-model="title"
            :autosize="{ minRows: 1 }"
            type="textarea"
            :placeholder="
              role > 2 && item.creatorInfo?._key !== user?._key
                ? ''
                : i18n.global.t('Please Enter Task')
            "
            :disabled="role > 2 && item.creatorInfo?._key !== user?._key"
          />
          <div
            class="task-detail"
            v-if="taskKey === item._key && (role < 3 || (detail && role > 2))"
          >
            <el-input
              v-model="detail"
              :autosize="{ minRows: 1 }"
              type="textarea"
              :placeholder="
                role > 2 && item.creatorInfo?._key !== user?._key
                  ? ''
                  : i18n.global.t('Please Enter Detial')
              "
              :disabled="role > 2 && item.creatorInfo?._key !== user?._key"
            />
          </div>
          <div class="task-upload dp--center" v-if="taskKey === item._key">
            <div
              class="task-upload-img"
              v-for="(item, index) in imageList"
              :key="'img' + index"
            >
              <el-image
                style="width: 60px; height: 60px"
                :src="item"
                :preview-src-list="imageList"
                :initial-index="index"
                fit="cover"
                :hide-on-click-modal="true"
                :preview-teleported="true"
              />
              <div
                class="task-upload-delete"
                v-if="role < 3 || item.creatorInfo?._key === user?._key"
              >
                <icon-font
                  name="close"
                  :size="22"
                  class="icon-point"
                  @click.stop="delImg(index)"
                />
              </div>
            </div>
            <div
              class="task-upload-button dp-center-center icon-point"
              v-if="
                (role < 3 || item.creatorInfo?._key === user?._key) &&
                imageList.length < 10
              "
            >
              <el-icon><Plus /></el-icon>
              <input
                type="file"
                accept="image/*"
                @change="
                  //@ts-ignore
                  updateImg($event.target.files[0])
                "
                class="upload-img"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="task-bottom dp-space-center" v-if="type !== 'report'">
        <div style="padding-left: 35px; box-sizing: border-box">
          <div v-if="type === 'send'" class="dp--center">
            # {{ item.boardInfo?.title }}
            <avatar
              :name="item.creatorInfo?.userName"
              :avatar="item.creatorInfo?.userAvatar"
              type="person"
              :index="0"
              :size="20"
              style="margin-left: 8px; margin-right: 8px"
            />
            ⇀
            <avatar
              :name="item.executorInfo.userName"
              :avatar="item.executorInfo.userAvatar"
              type="person"
              :index="0"
              :size="20"
              style="margin-left: 8px"
            />
          </div>
        </div>
        <div class="dp--center">
          <div
            v-if="
              type !== 'other' &&
              type !== 'completed' &&
              (type === 'inbox' ||
                (item.executorInfo._key === user?._key && type !== 'inbox')) &&
              overKey === item._key
            "
            style="margin-right: 10px"
          >
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'today' }"
              @click.stop="changeMark('today')"
              >{{ $t(`Today`) }}
            </span>
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'next' }"
              @click.stop="changeMark('next')"
              >{{ $t(`Nextday`) }}</span
            >
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'future' }"
              @click.stop="changeMark('future')"
              >{{ $t(`Future`) }}</span
            >
          </div>
          <span
            style="margin-right: 10px"
            v-if="
              type !== 'inbox' &&
              type !== 'task' &&
              type !== 'completed' &&
              overKey !== item._key
            "
          >
            {{
              item.hasRead ||
              (item.executorInfo?._key === user?._key &&
                item.creatorInfo?._key === user?._key)
                ? item.mark === "today"
                  ? $t("Today")
                  : item.mark === "next"
                  ? $t("Nextday")
                  : $t("Future")
                : $t("Unread")
            }}
          </span>
          <icon-font
            name="detail"
            :size="10"
            style="margin-right: 10px"
            v-if="item.hasDetail"
          />
          <icon-font
            name="image"
            :size="10"
            style="margin-right: 10px"
            v-if="item.hasImage"
          />
          <div style="margin: 0px 8px">{{ taskTime }}</div>
          <el-dropdown v-if="overKey === item._key">
            <el-icon>
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click.stop="delCard"
                  v-if="
                    item.executorInfo?._key === user?._key ||
                    item.creatorInfo?._key === user?._key ||
                    role < 3
                  "
                >
                  <el-icon style="margin-right: 8px"><Delete /></el-icon>
                  {{ $t(`delete`) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="task-bottom dp-space-center" v-if="type === 'report'">
        <div>
          <span
            >{{ item.creatorInfo?.userName }} ⇀
            {{ item.executorInfo.userName }}</span
          >
        </div>
        <div class="dp--center">
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
  <!-- <teleport to="#todoBody">
    <el-dialog v-model="imageVisible">
      <img w-full :src="imageSrc" alt="Preview Image" />
    </el-dialog>
  </teleport> -->
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  margin-top: 10px;
  padding: 10px 10px 0px 10px;
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
          width: 60px;
          height: 60px;
          margin-right: 10px;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
          .task-upload-delete {
            width: 20px;
            height: 20px;
            position: absolute;
            z-index: 2;
            top: -8px;
            right: -8px;
            display: none;
          }
          &:hover .task-upload-delete {
            display: flex;
            justify-content: center;
            align-items: center;
          }
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
          margin-bottom: 10px;
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
.bean-ball {
  width: 25px;
  height: 25px;
  position: fixed;
  z-index: 10;
}
.bean-ball img {
  width: 100%;
  height: 100%;
}
</style>
