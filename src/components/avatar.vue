<script setup lang="ts">
import appStore from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
const { user } = storeToRefs(appStore.authStore);
const props = defineProps<{
  avatarKey?: string;
  avatar?: string;
  name?: string;
  type: string;
  index: number;
  size?: number;
  avatarStyle?: any;
  onlineState?: boolean;
  showOnline?: boolean;
  chooseOnline?: boolean;
}>();
const bgColor = computed(() => BgColorArray[props.index % 5]);

const BgColorArray = [
  "#1890ff",
  "rgb(0,170,255)",
  "rgb(143,126,230)",
  "rgb(179,152,152)",
  "rgb(242,237,166)",
];
</script>
<template>
  <div class="avatar">
    <div
      :style="{
        width: size + 'px',
        height: size + 'px',
        border: showOnline
          ? onlineState || avatarKey === user?._key
            ? '3px solid var(--el-color-success)'
            : '3px solid #fff'
          : '',
        boxShadow: chooseOnline ? '0px 4px 9px 0px rgba(0,0,0,0.05);' : '',
        ...avatarStyle,
      }"
      class="avatar-content"
    >
      <template v-if="avatar">
        <img
          :alt="name"
          :src="
            avatar.indexOf('imageMogr2') !== -1 && avatar.indexOf('.svg') !== -1
              ? avatar + '?imageMogr2/auto-orient/thumbnail/80x'
              : avatar
          "
          class="avatar-img"
          v-if="
            avatar.indexOf('https:') !== -1 ||
            avatar.indexOf('http:') !== -1 ||
            avatar.indexOf('data:') !== -1 ||
            avatar.indexOf('.svg') !== -1
          "
        />
        <div :style="{ fontSize: size ? size : 22 }" v-else>{avatar}</div>
      </template>
      <div class="avatar-img" :style="{ backgroundColor: bgColor }" v-else>
        {{ name ? name.substring(0, 1) : "无" }}
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.avatar {
  position: relative;
  z-index: 1;
  .avatar-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30%;
    box-sizing: border-box;
    .avatar-img {
      width: 100%;
      height: 100%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      object-fit: cover;
    }
  }
  .online {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    position: absolute;
    bottom: 1%;
    right: 1%;
    z-index: 2;
    box-shadow: 0px 2px 4px 0px rgba(122, 122, 122, 0.5);
  }
}
</style>
<style></style>
