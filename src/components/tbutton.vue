<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
  loading?: boolean;
  bgColor?: string;
  round?: boolean;
}>();
const emits = defineEmits(["click"]);
</script>
<template>
  <div
    class="common-button dp-center-center"
    @click="!disabled ? emits('click') : null"
    :style="{
      backgroundColor: bgColor ? bgColor : 'var(--el-color-success)',
      borderRadius: round ? '35px' : '4px',
    }"
  >
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
.common-button {
  position: relative;
  padding: 6px 15px;
  border-radius: 4px;
  color: #fff;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.15), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  font-size: 14px;
  outline: 0;
  border: 0;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.25s;
  // &:hover {
  //   background-color: var(--talk-button-hover-color);
  // }
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle, #ccc 10%, transparent 10.1%);
    transform: scale(10);
    opacity: 0;
    transition: all 0.6s;
  }
  &:active::after {
    transform: scale(0);
    opacity: 0.5;
    transition: 0s;
  }
}
</style>
<style></style>
