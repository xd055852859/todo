<script setup lang="ts">
import { ElMessage } from "element-plus";
import { uploadImage } from "@/services/util";
import api from "@/services/api";
import useCurrentInstance from "@/hooks/useCurrentInstance";
import { storeToRefs } from "pinia";
import setDark from "@/hooks/dark";
import appStore from "@/store";
import logoSvg from "../assets/svg/logo.svg";
import i18n from "@/language/i18n";
import { ResultProps } from "@/interface/Common";
const { proxy } = useCurrentInstance();

const socket: any = inject("socket");
const router = useRouter();
const { user, token } = storeToRefs(appStore.authStore);
const { dark, locale, noticeNum } = storeToRefs(appStore.commonStore);
const { setUserInfo } = appStore.authStore;
const { setDeviceType, setCommonDark, setCommonLocale } = appStore.commonStore;
const emits = defineEmits(["close"]);

const userVisible = ref<boolean>(false);
const avatar = ref<string>("");
const userName = ref<string>("");
const email = ref<string>("");
const setVisible = ref<boolean>(false);
const localeValue = ref<string>("");
const darkValue = ref<string>("");

const changeLanguage = (value: string) => {
  switch (value) {
    case "中文":
      value = "zh";
      darkValue.value = dark.value ? "黑暗模式" : "明亮模式";
      break;
    case "English":
      value = "en";
      darkValue.value = dark.value ? "Dark mode" : "Bright mode";
      break;
    case "日本語":
      value = "jp";
      darkValue.value = dark.value ? "ダークモード" : "ブライトモード";
      break;
    case "繁体":
      value = "tc";
      darkValue.value = dark.value ? "黑暗模式" : "明亮模式";
      break;
  }
  proxy.$i18n.locale = value;
  setCommonLocale(value);
  localStorage.setItem("LANGUAGE", value);
};
const changeDark = (value: string | boolean) => {
  value = value === i18n.global.t(`text['Dark mode']`);
  setDark(value);
  setCommonDark(value);
};
const changeConfig = async () => {
  let config = {
    userAvatar: avatar.value,
    userName: userName.value,
  };
  const configRes = (await api.request.patch("user/config", {
    ...config,
  })) as ResultProps;
  if (configRes.msg === "OK") {
    ElMessage({
      message: "Edit Successful",
      type: "success",
      duration: 1000,
    });
    userVisible.value = false;
    //@ts-ignore
    setUserInfo({ ...user.value, ...config });
  }
};
const logout = () => {
  socket.emit("logout", token.value);
  router.push("/");
  localStorage.clear();
  ElMessage({
    message: "LogOut successfully",
    type: "success",
    duration: 1000,
  });
};

watch(
  user,
  (newVal) => {
    if (newVal) {
      avatar.value = newVal.userAvatar ? newVal.userAvatar : "";
      userName.value = newVal.userName ? newVal.userName : "";
      switch (locale.value) {
        case "zh":
          localeValue.value = "中文";
          break;
        case "en":
          localeValue.value = "English";
          break;
        case "jp":
          localeValue.value = "日本語";
          break;
        case "tc":
          localeValue.value = "繁体";
          break;
      }
      darkValue.value = dark.value
        ? i18n.global.t(`text['Dark mode']`)
        : i18n.global.t(`text['Bright mode']`);
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="user-center">
    <div style="width: 100%">
      <div class="userCenter-user dp-space-center">
        <el-avatar
          fit="cover"
          :src="user?.userAvatar"
          :size="40"
          @click="userVisible = true"
          class="icon-point"
        />
        <div class="right">
          <div class="center">{{ user?.userName }}</div>
          <div class="bottom">
            <div
              class="dp--center common-color icon-point"
              @click="
                $router.push('/home/history/create');
                emits('close');
              "
            >
              <img
                :src="logoSvg"
                alt=""
                style="width: 20px; height: 20px; margin-right: 5px"
              />{{ user?.beans }}
            </div>
          </div>
        </div>
        <div class="dp-center-center">
          <icon-font
            name="notice"
            :size="22"
            class="icon-point"
            @click="
              $router.push('/home/notice');
              emits('close');
            "
          />
          <el-badge
            :value="noticeNum"
            style="margin-bottom: 10px"
            v-if="noticeNum"
          ></el-badge>
        </div>
      </div>
      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/list');
          emits('close');
        "
      >
        <icon-font name="list" :size="22" style="margin-right: 18px" />
        <span> Todo </span>
      </div>
      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/board');
          emits('close');
        "
      >
        <icon-font name="boards" :size="22" style="margin-right: 18px" />
        <span> Boards </span>
      </div>
      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/partner');
          emits('close');
        "
      >
        <icon-font name="mates" :size="24" style="margin-right: 15px" />
        <span> Mates </span>
      </div>
      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/send');
          emits('close');
        "
      >
        <icon-font name="send" :size="24" style="margin-right: 15px" />
        <span> Created </span>
      </div>
      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/history/create');
          emits('close');
        "
      >
        <icon-font name="history" :size="24" style="margin-right: 15px" />
        <span> History </span>
      </div>

      <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/rank');
          emits('close');
        "
      >
        <icon-font name="beans" :size="24" style="margin-right: 15px" />
        <span> Ranking </span>
      </div>
      <!-- <div
        class="userCenter-item dp--center"
        @click="
          $router.push('/home/trash');
          emits('close');
        "
      >
        <icon-font name="trash" :size="24" style="margin-right: 15px" />
        <span> Trash </span>
      </div> -->
    </div>
    <div class="user-set">
      <div class="userCenter-item dp--center" @click="setVisible = true">
        <icon-font name="set" :size="18" style="margin-right: 15px" />
        <span>
          {{ $t(`text.Setting`) }}
        </span>
      </div>
      <div class="userCenter-item dp--center">
        <icon-font name="help" :size="18" style="margin-right: 15px" />
        <span>
          {{ $t(`text.Help`) }}
        </span>
      </div>
      <div class="userCenter-item dp--center">
        <icon-font name="community" :size="18" style="margin-right: 15px" />
        <span>
          {{ $t(`text.Communication`) }}
        </span>
      </div>
      <div class="userCenter-item dp--center" @click="logout">
        <icon-font name="quit" :size="18" style="margin-right: 15px" />
        <span>
          {{ $t(`text['Sign out']`) }}
        </span>
      </div>
    </div>
  </div>
  <el-dialog v-model="userVisible" :title="'User'" :width="400">
    <div class="user-edit dp-center-center">
      <div class="avatar">
        <el-avatar fit="cover" :src="avatar" :size="150" />
        <input type="file" accept="image/*" class="upload-img" />˝
      </div>

      <el-input
        class="input"
        v-model="userName"
        placeholder="enter userName"
        style="width: 100%; margin-top: 20px"
      />
    </div>

    <template #footer>
      <span class="dialog-footer dp-center-center">
        <tbutton @click="changeConfig()">Save</tbutton>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="setVisible" :title="$t(`text.Setting`)" :width="400">
    <div class="user-edit dp-center-center">
      <div class="text dp-space-center">
        {{ $t(`text.Language`) }} :
        <el-select
          v-model="localeValue"
          :placeholder="'choose language'"
          size="large"
          @change="changeLanguage"
        >
          <el-option value="中文">中文</el-option>
          <el-option value="English">English</el-option>
          <el-option value="日本語">日本語</el-option>
          <el-option value="繁体">繁体</el-option>
        </el-select>
      </div>
      <div class="text dp-space-center">
        {{ $t(`text['Dark mode']`) }} :
        <el-select
          v-model="darkValue"
          :placeholder="'choose mode'"
          size="large"
          @change="changeDark"
        >
          <el-option :value="$t(`text['Dark mode']`)">{{
            $t(`text['Dark mode']`)
          }}</el-option>
          <el-option :value="$t(`text['Bright mode']`)"
            >{{ $t(`text['Bright mode']`) }}
          </el-option>
        </el-select>
      </div>
    </div>
  </el-dialog>
</template>
<style scoped lang="scss">
.user-center {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: space-between;
  flex-wrap: wrap;
  .userCenter-user {
    width: 100%;
    height: 45px;
    margin-bottom: 35px;
    position: relative;
    z-index: 1;
    span {
      margin-right: 0px;
    }
    .userCenter-user-edit {
      position: absolute;
      top: 25px;
      left: 25px;
      z-index: 2;
    }
    .right {
      width: calc(100% - 120px);
      text-align: left;
      margin-left: 15px;
      .center {
        width: 100%;
        height: 20px;
        font-size: 16px;
        margin: 10px 0px;
        line-height: 20px;
      }
      .bottom {
        width: 100%;
        height: 20px;
        font-size: 14px;
        color: #999999;
        line-height: 20px;
      }
    }
  }
  .user-set {
    width: 100%;
    font-size: 12px;
    .userCenter-item {
      height: 20px;
      margin-bottom: 10px;
      padding: 8px 0px;
      img {
        width: 18px;
        height: 18px;
        margin-right: 18px;
      }
      span {
        font-size: 14px;
      }
    }
  }
  .userCenter-item {
    width: 100%;
    height: 25px;
    margin-bottom: 5px;
    padding: 10px 0px;
    cursor: pointer;
    img {
      width: 25px;
      height: 25px;
      margin-right: 15px;
    }
    span {
      font-size: 18px;
      font-weight: 400;
    }
    &:hover {
      background-color: var(--talk-hover-color);
    }
  }
}
.user-edit {
  display: flex;
  flex-direction: column;
  justify-content: center;
  .avatar {
    position: relative;
    z-index: 1;
    cursor: pointer;
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
  .text {
    width: 100%;
    margin: 10px 0px;
    .input {
      width: calc(100% - 100px);
    }
  }
}
</style>
<style></style>
