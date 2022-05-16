<script setup lang="ts">
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import appStore from "@/store";

const emits = defineEmits(["close"]);
const { boardList, boardKey, sortIndex } = storeToRefs(appStore.boardStore);
const { setBoardKey, setSortIndex } = appStore.boardStore;
const sortArr = ["Access time", "Aplhabet", "Master"];
watch(boardList, (newVal, oldVal) => {
  if (!oldVal && newVal) {
  }
});
</script>
<template>
  <div class="contact" v-if="boardList">
    <div class="contact-top">
      <div
        class="container dp-space-center p-5"
        v-for="(item, index) in boardList"
        :key="'add-member' + index"
        @click="
          setBoardKey(item._key);
          emits('close');
        "
      >
        <!-- <div class="left dp--center"> -->
        {{ item.title }} ( {{ item.executorInfo?.userName }} )
        <!-- </div> -->
        <!-- <div class="right">
          <img
            :src="boardKey === item._key ? chooseSvg : unchooseSvg"
            alt=""
            style="width: 20px; height: 20px; margin-right: 10px"
          />
        </div> -->
      </div>
    </div>
    <div class="contact-bottom dp-space-center p-5">
      <el-dropdown>
        <div class="dp--center icon-point">
          <icon-font name="sort" :size="22" style="margin-right: 10px" /> Access
          time
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in sortArr"
              :key="'sort' + index"
              @click="setSortIndex(index)"
              class="icon-point"
            >
              {{ item }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <tbutton
        style="height: 40px; padding: 0px 30px"
        @click="$router.push('/home/manage/create')"
        round
      >
        New Board
      </tbutton>
    </div>
  </div>
</template>
<style scoped lang="scss">
.contact {
  width: 100%;
  height: 100%;
  background-color: #fff;
  .contact-top {
    width: 100%;
    height: calc(100% - 55px);
    overflow-x: hidden;
    overflow-y: auto;
  }
  .contact-bottom {
    height: 55px;
    background: #f2f2f2;
  }
}
</style>
<style></style>
