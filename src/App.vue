<script setup lang="ts">
import api from "@/services/api";
import { getSearchParamValue } from "@/services/util";
import request from "@/services/api";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import setTheme from "@/hooks/theme";
import setDark from "@/hooks/dark";

const socket: any = inject("socket");
const router = useRouter();
const { token, user } = storeToRefs(appStore.authStore);
const { setToken, getUserInfo, getMateList } = appStore.authStore;
const { getBoardList } = appStore.boardStore;
const { setDeviceType } = appStore.commonStore;

// onBeforeMount(() => {

// });
onMounted(() => {
  window.addEventListener("message", handle, false);
  let url = window.location.href;
  //自动切换为https
  if (url.indexOf("http://localhost") === -1 && url.indexOf("https") < 0) {
    url = url.replace("http:", "https:");
    window.location.replace(url);
  }
  const search = window.location.search
    ? window.location.search.split("?")[1]
    : window.location.hash.split("?")[1];
  const token =
    (getSearchParamValue(search, "token") as string) ||
    localStorage.getItem("token");
  const deviceType = getSearchParamValue(search, "deviceType") as string;
  if (token) {
    request.setToken(token);
    setToken(token);
  }
  if (deviceType) {
    setDeviceType(deviceType);
  }
  setTheme("#46a03c");
  setDark(false);
});
onUnmounted(() => {
  window.removeEventListener("message", handle, false);
});
const handle = (e: any) => {
  if (
    e.origin === "https://account.qingtime.cn" &&
    e.data.eventName === "redirect"
  ) {
    const token = getSearchParamValue(
      e.data.data.split("?")[1],
      "token"
    ) as string;
    request.setToken(token);
    setToken(token);
    router.push("/home");
  }
};
//初始化
watch(
  token,
  (newVal) => {
    if (newVal) {
      getUserInfo();
      getMateList();
      getBoardList("accessTime", "desc");
    } else {
      router.push("/");
    }
  },
  { immediate: true }
);
watch(user, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    socket.on("connect", () => {
      socket.emit("login", token.value);
    });
  }
});
</script>

<template>
  <router-view></router-view>
  <audio
    ref="musicRef"
    src=""
    :style="{ position: 'fixed', zIndex: -5, opacity: 0 }"
  >
    您的浏览器不支持 audio 标签。
  </audio>
</template>

<style lang="scss">
#app {
  background: var(--talk-bg-color);
}
*::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

*::-webkit-scrollbar-thumb {
  background: var(--el-color-success);
  border-radius: 100px;
}
.common-color {
  color: var(--el-color-success) !important;
}
.container {
  padding: 10px;
  box-sizing: border-box;
  .left {
    // cursor: pointer;
    .img {
      width: 30px;
      height: 30px;
    }
    .name {
      margin-left: 15px;
      font-size: 16px;
      font-weight: 400;
    }
  }
  .right {
    cursor: pointer;
    // display: none;
  }
  &:hover {
    background-color: var(--talk-hover-color);
    // .right {
    //   display: block;
    // }
  }
}
.board-container {
  width: 100%;
  height: calc(100vh - 55px);
}
</style>
