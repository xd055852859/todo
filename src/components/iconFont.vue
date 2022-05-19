<script setup lang="ts">
// import { useStore } from "@/store";
interface iconProps {
  name: string;
  size?: number;
  color?: string;
  hover?: boolean;
}
const props = withDefaults(defineProps<iconProps>(), {
  name: "",
  size: 20,
});
</script>
<template>
  <!-- :class="
      !hover
        ? {}
        : {
            'icon-hover-black': dark ? true : false,
            'icon-hover': dark ? false : true,
          }
    "
    :style="
      !hover
        ? { width: props.size + 'px', height: props.size + 'px' }
        : {
            width: props.size + 15 + 'px',
            height: props.size + 15 + 'px',
            // opacity: dark ? 0.52 : 0.27,
          }
    " -->
  <!-- <div class="icon dp-center-center"> -->
    <i
      class="iconfont"
      :class="`icon-${name}`"
      :style="{
        fontSize: size + 'px',
        color: color ? color : 'var(--talk-font-color)',
      }"
    ></i>
  <!-- </div> -->
</template>
<style scoped lang="scss">
.icon-hover {
  &:hover {
    background-color: rgba(113, 113, 113, 0.27);
  }
}
.icon-hover-black {
  &:hover {
    background-color: rgba(113, 113, 113, 0.52);
  }
}
</style>
<style></style>
