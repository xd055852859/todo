<script setup lang="ts">
</script>
<template>
  <div class="home dp-center-center">
    <router-view></router-view>
  </div>
</template>
<style scoped lang="scss">
.home {
  width: 100%;
  height: 100vh;
  background: var(--talk-bg-color);
  flex-wrap: wrap;
  align-content: flex-start;
}
.nav {
  width: 100%;
  height: 40px;
  padding: 0px 2.5%;
  box-sizing: border-box;
  .title {
    width: 100%;
    height: 100%;
    line-height: 40px;
    font-size: 18px;
    font-weight: 400;
    color: #16ab78;
  }
}
.nav-container {
  width: 300px;
}
</style>
<style></style>
