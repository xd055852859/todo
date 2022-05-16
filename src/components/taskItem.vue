<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
import api from "@/services/api";
import { ElMessage } from "element-plus";
const props = defineProps<{
  item: Task;
  type?: string;
  overKey?: string;
  fatherIndex?: number;
  index?: number;
}>();
const emits = defineEmits<{
  (
    e: "changeNum",
    type: string,
    fatherIndex: number,
    index: number,
    listType: string
  ): void;
}>();
const changeMark = async (type: string) => {
  const markRes: any = (await api.request.patch("card/mark", {
    mark: type,
    cardKey: props.item._key,
  })) as ResultProps;
  if (markRes.msg === "OK") {
    ElMessage({
      message: "Change Mark Successful",
      type: "success",
      duration: 1000,
    });
    //@ts-ignore
    emits("changeNum", type, props.fatherIndex, props.index, props.type);
  }
};
</script>
<template>
  <div class="task">
    <div class="task-top">
      <div class="task-left dp-center-center">
        <icon-font
          name="unfinish"
          :size="22"
          style="margin-right: 18px"
          color="#46a03c"
        />
      </div>
      <div class="task-right">{{ item.title }}</div>
    </div>
    <div class="task-bottom dp-space-center" v-if="type !== 'other'">
      <div></div>
      <div class="dp--center">
        <template
          v-if="(type === 'task' || type === 'inbox') && overKey === item._key"
        >
          <span
            class="icon-point"
            :class="{ 'common-color': item.mark === 'today' }"
            @click="changeMark('today')"
            >Today
          </span>
          <el-divider direction="vertical" />
          <span
            class="icon-point"
            :class="{ 'common-color': item.mark === 'next' }"
            @click="changeMark('next')"
            >Next</span
          >
          <el-divider direction="vertical" />
          <span
            class="icon-point"
            :class="{ 'common-color': item.mark === 'future' }"
            @click="changeMark('future')"
            >Future</span
          >
        </template>
        <template v-else-if="type === 'board'">
          {{ item.hasRead ? "Read" : "Unread" }}
          <icon-font
            class="icon-point del-button"
            name="image"
            :size="20"
            style="margin-left: 10px"
        /></template>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  &:hover {
    box-shadow: 0px 4px 9px 0px var(--talk-hover-shadow);
  }
  .task-top {
    width: 100%;
    min-height: 30px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-bottom: 5px;
    .task-left {
      width: 40px;
      height: 100%;
    }
    .task-right {
      width: calc(100% - 48px);
      height: 100%;
      font-size: 17px;
      font-weight: 600;
      color: var(--talk-font-color);
      white-space: normal;
      word-break: break-all;
      word-wrap: break-word;
    }
  }
  .task-bottom {
    height: 25px;
    color: var(--talk-font-color-1);
    font-size: 12px;
  }
}
</style>
<style></style>
