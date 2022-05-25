<script setup lang="ts">
import { ElMessage } from "element-plus";
import { uploadImage } from "@/services/util";
import api from "@/services/api";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import logoSvg from "../assets/svg/logo.svg";
const socket: any = inject("socket");
const router = useRouter();
const { user, token } = storeToRefs(appStore.authStore);

const emits = defineEmits(["close"]);

const userVisible = ref<boolean>(false);
const avatar = ref<string>("");
const userName = ref<string>("");
const email = ref<string>("");
const setVisible = ref<boolean>(false);
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
</script>
<template>
  <div class="user-center">
    <div style="width: 100%">
      <div class="userCenter-user dp-space-center">
        <el-avatar fit="cover" :src="user?.userAvatar" :size="50" />
        <div class="right dp-space-center">
          <div class="center">
            {{ user?.userName }}
          </div>
          <div
            class="dp--center common-color icon-point"
            @click="
              $router.push('/home/history');
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
          $router.push('/home/history');
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
        <span>Setting</span>
      </div>
      <div class="userCenter-item dp--center">
        <icon-font name="help" :size="18" style="margin-right: 15px" />
        <span>Help</span>
      </div>
      <div class="userCenter-item dp--center">
        <icon-font name="community" :size="18" style="margin-right: 15px" />
        <span>Community</span>
      </div>
      <div class="userCenter-item dp--center" @click="logout">
        <icon-font name="quit" :size="18" style="margin-right: 15px" />
        <span>Quit</span>
      </div>
    </div>
  </div>
  <el-dialog v-model="userVisible" :title="'User'" :width="400">
    <div class="user-edit dp-center-center">
      <div class="avatar">
        <el-avatar fit="cover" :src="avatar" :size="150" />
        <input type="file" accept="image/*" class="upload-img" />˝
      </div>

      <div class="text dp-space-center">
        <el-input
          class="input"
          v-model="userName"
          placeholder="enter userName"
        />
      </div>
      <div class="text dp-space-center">
        <el-input class="input" v-model="email" placeholder="enter email" />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer dp-center-center">
        <tbutton>Save</tbutton>
      </span>
    </template>
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
    .right {
      width: calc(100% - 60px);
      text-align: left;
      margin-left: 20px;
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
    .userCenter-user-edit {
      position: absolute;
      top: -5px;
      right: -20px;
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
