<script setup lang="ts">
import UserCenter from "@/views/userCenter.vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const router = useRouter();
const props = defineProps<{
  isMenu?: boolean;
  clickState?: boolean;
}>();
const emits = defineEmits(["iconClick", "clickBack"]);
const { deviceType } = storeToRefs(appStore.commonStore);
const themeVisible = ref<boolean>(false);
const menuVisible = ref<boolean>(true);

const back = () => {
  router.back();
  menuVisible.value = false;
  emits("iconClick");
};
</script>
<template>
  <div class="common-header p-8" :class="'dp-center-center'">
    <template v-if="deviceType !== 'mobile'">
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
          @click="clickState ? emits('clickBack') : back()"
          v-else
        >
          <arrow-left />
        </el-icon>
        <slot name="left"></slot>
      </div>
      <div class="title dp--center"><slot name="title"></slot></div>
    </template>
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
  width: 100vw;
  height: 55px;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  .title {
    width: 100%;
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
    left: 10px;
  }
  .right {
    right: 10px;
  }
}
</style>
<style></style>
