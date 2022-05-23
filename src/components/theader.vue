<script setup lang="ts">
import UserCenter from "@/views/userCenter.vue";
import { ArrowLeft } from "@element-plus/icons-vue";
const router = useRouter();
const props = defineProps<{
  isMenu?: boolean;
}>();
const emits = defineEmits(["iconClick"]);

const themeVisible = ref<boolean>(false);
const menuVisible = ref<boolean>(true);

const back = () => {
  router.back();
  menuVisible.value = false;
  emits("iconClick");
};
</script>
<template>
  <div class="common-header" :class="'dp-center-center'">
    <div class="left dp-space-center">
      <icon-font
        name="menu"
        @mouseenter="themeVisible = true"
        style="margin-right: 10px"
        :size="16"
        v-if="isMenu"
        class="icon-point"
      />
      <el-icon
        style="margin-right: 10px; cursor: pointer"
        size="20px"
        @click="back()"
        v-else
      >
        <arrow-left />
      </el-icon>
      <slot name="left"></slot>
    </div>
    <div class="title"><slot name="title"></slot></div>
    <div class="right dp--center">
      <slot name="right"></slot>
      <!-- <icon-font
        :name="'close'"
        @click="back()"
        style="cursor: pointer; margin-left: 10px"
        v-if="noIcon"
      /> -->
    </div>
  </div>
  <el-drawer
    v-model="themeVisible"
    direction="ltr"
    :with-header="false"
    :size="280"
  >
    <user-center @close="themeVisible = false" />
  </el-drawer>
</template>
<style scoped lang="scss">
.common-header {
  width: 100%;
  height: 55px;
  text-align: center;
  padding: 0px 20px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  .title {
    width: calc(100% - 200px);
    font-size: 18px;
    font-weight: 600;
  }
  .left,
  .right {
    height: 100%;
    position: absolute;
    top: 0px;
    z-index: 5;
  }
  .left {
    left: 20px;
  }
  .right {
    right: 20px;
  }
}
</style>
<style></style>
