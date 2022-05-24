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
  (e: "delTask", taskItem: Task): void;
}>();

const title = ref<string>("");
const detail = ref<string>("");
const imageList = ref<any>([]);
const imageVisible = ref<boolean>(false);
const imageSrc = ref<string>();
const hasFinished = ref<number>(0);

onMounted(() => {
  title.value = props.item.title;
  hasFinished.value = props.item.hasFinished ? props.item.hasFinished : 0;
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
    emits("changeNum", type, props.item, props.type);
  }
};
const upDateTask = async () => {
  if (props.item._key === taskKey.value && props.role < 3) {
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
    hasFinished.value = 1;
    console.log(props.amimateType);
    if (props.amimateType) {
      addBall(e);
    }
    //Todo
    emits("finishTask", props.item);
  }
};
const delCard = async (e) => {
  const taskRes: any = (await api.request.delete("card", {
    cardKey: props.item._key,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    ElMessage({
      message: "Deleted Task Successful",
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
    bar.style.left = width * 0.05 + "px";
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

const updateImg = (e) => {
  let mimeType = ["image/png", "image/jpeg", "image/svg+xml"];
  uploadImage(e.target.files[0], uploadToken.value, mimeType, (url: string) => {
    imageList.value.push(url);
    // editorInfo.value?.chain().focus().deleteRange(range).setImage({ src: url });
  });
};
// const pasteImg = (event) => {
//   console.log(event);
//   var isChrome = false;
//   if (event.clipboardData || event.originalEvent) {
//     //not for ie11  某些chrome版本使用的是event.originalEvent
//     var clipboardData =
//       event.clipboardData || event.originalEvent.clipboardData;
//     if (clipboardData.items) {
//       // for chrome
//       var items = clipboardData.items,
//         len = items.length,
//         blob = null;
//       isChrome = true;
//       //阻止默认行为即不让剪贴板内容在div中显示出来
//       event.preventDefault();

//       //在items里找粘贴的image,据上面分析,需要循环
//       for (var i = 0; i < len; i++) {
//         if (items[i].type.indexOf("image") !== -1) {
//           //getAsFile() 此方法只是living standard firefox ie11 并不支持
//           blob = items[i].getAsFile();
//         }
//       }
//       if (blob !== null) {
//         var reader = new FileReader();
//         reader.onload = function (event) {
//           // event.target.result 即为图片的Base64编码字符串
//           //@ts-ignore
//           var base64_str = event.target.result;
//           //可以在这里写上传逻辑 直接将base64编码的字符串上传（可以尝试传入blob对象，看看后台程序能否解析）
//           // uploadImgFromPaste(base64_str, 'paste', isChrome);
//           console.log(base64_str);
//         };
//         reader.readAsDataURL(blob);
//       }
//     } else {
//       //for firefox
//       setTimeout(function () {
//         //设置setTimeout的原因是为了保证图片先插入到div里，然后去获取值
//         var imgList: any = document.querySelectorAll("#tar_box img"),
//           len = imgList.length,
//           src_str = "",
//           i;
//         for (i = 0; i < len; i++) {
//           if (imgList[i].className !== "my_img") {
//             //如果是截图那么src_str就是base64 如果是复制的其他网页图片那么src_str就是此图片在别人服务器的地址
//             src_str = imgList[i].src;
//           }
//         }
//         console.log(src_str);
//         // uploadImgFromPaste(src_str, 'paste', isChrome);
//       }, 1);
//     }
//   } else {
//     //for ie11
//     setTimeout(function () {
//       var imgList: any = document.querySelectorAll("#tar_box img"),
//         len = imgList.length,
//         src_str = "",
//         i;
//       for (i = 0; i < len; i++) {
//         if (imgList[i].className !== "my_img") {
//           src_str = imgList[i].src;
//         }
//       }
//       console.log(src_str);
//       // uploadImgFromPaste(src_str, 'paste', isChrome);
//     }, 1);
//   }

//   // let mimeType = ["image/png", "image/jpeg", "image/svg+xml"];
//   // uploadImage(e.target.files[0], uploadToken.value, mimeType, (url: string) => {
//   //   imageList.value.push(url);
//   //   // editorInfo.value?.chain().focus().deleteRange(range).setImage({ src: url });
//   // });
// };
const delImg = () => {};
watch(
  () => props.item,
  (newVal) => {
    title.value = newVal.title;
    hasFinished.value = newVal.hasFinished ? newVal.hasFinished : 0;
  }
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
            <!--    @paste="pasteImg" -->
            <div
              class="task-upload-button dp-center-center icon-point"
              v-if="role < 3 && imageList.length < 10"
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
      <div class="task-bottom dp-space-center" v-if="type !== 'report'">
        <div>
          <span v-if="type === 'send'"># {{ item.boardInfo?.title }}</span>
        </div>
        <div class="dp--center">
          <div
            v-if="
              item.executorInfo._key === user?._key &&
              overKey === item._key &&
              type !== 'completed'
            "
            style="margin-right: 10px"
          >
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'today' }"
              @click.stop="changeMark('today')"
              >Today
            </span>
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'next' }"
              @click.stop="changeMark('next')"
              >Next</span
            >
            <el-divider direction="vertical" />
            <span
              class="icon-point"
              :class="{ 'common-color': item.mark === 'future' }"
              @click.stop="changeMark('future')"
              >Future</span
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
            {{ item.hasRead ? item.mark : "Unread" }}
          </span>
          <icon-font
            class="icon-point del-button"
            name="image"
            :size="10"
            style="margin-right: 10px"
            v-if="item.hasDetail"
          />
          <icon-font
            class="icon-point del-button"
            name="image"
            :size="10"
            style="margin-right: 10px"
            v-if="item.hasImage"
          />
          <!--  item.executorInfo?._key === user?._key ||
              item.creatorInfo?._key === user?._key ||
              role < 3 -->
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
                  delete
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
          margin-bottom: 10px;
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
