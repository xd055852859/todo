<script setup lang="ts">
import { ElMessage } from "element-plus";

const props = defineProps<{
  avatar?: string;
  name?: string;
  type: string;
  index: number;
  size?: number;
  avatarStyle?: any;
  onlineState?: boolean;
  showOnline?: boolean;
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
    <div
      class="online"
      v-if="showOnline"
      :style="{
        backgroundColor: onlineState
          ? 'var(--el-color-success)'
          : 'var(--talk-font-color-3)',
      }"
    ></div>
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
    width: 18px;
    height: 18px;
    border-radius: 50%;
    position: absolute;
    bottom: 1%;
    right: 1%;
    z-index: 2;
  }
}
</style>
<style></style>
