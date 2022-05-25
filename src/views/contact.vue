<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Sort } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";

import chooseSvg from "@/assets/svg/choose.svg";
const emits = defineEmits(["close"]);
const { boardList, order, sortIndex } = storeToRefs(appStore.boardStore);
const { setBoardKey, setSortIndex, setOrder } = appStore.boardStore;

const searchList = computed(() =>
  boardList.value.filter((item) => {
    return item.title.indexOf(searchInput.value) !== -1;
  })
);
const sortArr = ["Access time", "Aplhabet", "Master"];
const searchInput = ref<string>("");
watch(boardList, (newVal, oldVal) => {
  if (!oldVal && newVal) {
  }
});
</script>
<template>
  <div class="contact" v-if="boardList">
    <div class="contact-top dp-space-center p-5">
      <el-input
        v-model="searchInput"
        placeholder="Search Board"
        style="width: 200px; height: 35px"
      />

      <icon-font
        :name="order === 'asc' ? 'asc' : 'desc'"
        :size="22"
        color="#46a03c"
        class="icon-point"
        @click="setOrder(order === 'asc' ? 'desc' : 'asc')"
      />
      <el-popover
        placement="bottom"
        :width="200"
        trigger="hover"
        :teleported="false"
      >
        <template #reference>
          <div class="dp--center icon-point">
            <el-icon style="margin-right: 10px" class="icon-point" :size="20">
              <Sort />
            </el-icon>
          </div>
        </template>
        <div>
          <div
            v-for="(item, index) in sortArr"
            :key="'sort' + index"
            @click="setSortIndex(index)"
            class="icon-point container dp-space-center"
          >
            <div>{{ item }}</div>
            <div class="right">
              <img
                :src="chooseSvg"
                alt=""
                style="width: 20px; height: 20px"
                v-if="index === sortIndex"
              />
            </div>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="contact-bottom">
      <div
        class="contact-item container dp-space-center p-5 icon-point"
        v-for="(item, index) in searchList"
        :key="'add-member' + index"
        @click="
          setBoardKey(item._key);
          emits('close');
        "
      >
        <!-- <div class="left dp--center"> -->
        <div>
          <span style="margin-right: 5px; font-weight: 600">{{
            item.title
          }}</span>
          <span>( {{ item.executorInfo?.userName }} )</span>
        </div>
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
  </div>
</template>
<style scoped lang="scss">
.contact {
  width: 300px;
  background-color: var(--talk-item-color);
  .contact-top {
    height: 45px;
    position: relative;
    z-index: 1;
  }
  .contact-bottom {
    width: 100%;
    max-height: calc(100vh - 180px);
    overflow-x: hidden;
    overflow-y: auto;
    .contact-item {
      font-size: 14px;
      font-weight: 400;
    }
  }
}
</style>
<style></style>
