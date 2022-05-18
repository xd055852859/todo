<script setup lang="ts">
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import useClipboard from "vue-clipboard3";
import QrcodeVue from "qrcode.vue";
const { user } = storeToRefs(appStore.authStore);
const { toClipboard } = useClipboard();
const router = useRouter();
const url = computed(
  () =>
    `${window.location.protocol}//${window.location.host}/?inviteKey=${user.value?._key}`
);
</script>
<template>
  <div class="invite-out p-5">
    <theader @clickBack="router.push('/invite')">
      <template v-slot:title> Invite Partner </template>
      <template v-slot:right><div></div> </template>
    </theader>
    <div class="invite-item dp-center-center">
      <div class="title">Way2</div>
      <div class="title">
        你的好友
        <span class="common-color">{{ user?.userName }}</span>
        邀请您加入Todo
      </div>
      <div class="title">
        {{ url }}
      </div>
      <tbutton
        @click="
          toClipboard(url);
          ElMessage({
            message: 'Copy Success',
            type: 'success',
            duration: 1000,
          });
        "
        style="height: 30px"
        >Copy</tbutton
      >
    </div>
    <el-divider />
    <div class="invite-item dp-center-center" v-if="url">
      <div class="title">Way3</div>
      <div
        class="invite-item dp-center-center"
        style="width: 100%; height: 200px"
      >
        <qrcode-vue :value="url" :size="150" level="H" />
      </div>
      <tbutton
        @click="
          toClipboard(url);
          ElMessage({
            message: 'Copy Success',
            type: 'success',
            duration: 1000,
          });
        "
        style="height: 30px"
        >Download</tbutton
      >
    </div>
  </div>
</template>
<style scoped lang="scss">
.invite-out {
  width: 100vw;
  height: 100vh;
  background: var(--talk-bg-color);
  .header {
    width: 100%;
    height: 55px;
  }
  .invite-item {
    width: 100%;
    height: calc(50vh - 80px);
    flex-wrap: wrap;
    align-content: center;
    .title {
      width: 100%;
      height: 50px;
      line-height: 50px;
      font-size: 18px;
      text-align: center;
      margin-bottom: 10px;
    }
  }
}
</style>
<style></style>
