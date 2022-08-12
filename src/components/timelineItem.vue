<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
import api from "@/services/api";
import { ElMessage } from "element-plus";

import addBeanSvg from "@/assets/svg/addBean.svg";
import finishBeanSvg from "@/assets/svg/finishBean.svg";
const dayjs: any = inject("dayjs");
const props = defineProps<{
  item: Task;
  overKey?: string;
}>();
</script>
<template>
  <div class="timeline dp-space-center">
    <div class="timeline-left">
      <div class="dp--center">
        <img
          :src="addBeanSvg"
          alt=""
          v-if="item.scoreIcon === 1 || item.scoreIcon === 3"
          :style="item.scoreIcon === 3 ? { marginRight: '6px' } : {}"
          class="timeline-bean"
        />
        <img
          :src="finishBeanSvg"
          alt=""
          v-if="item.scoreIcon === 2 || item.scoreIcon === 3"
          class="timeline-bean"
        />
      </div>
      <div class="timeline-time">
        {{ dayjs(item.sortTime).format("HH:mm") }}
      </div>
    </div>
    <div class="timeline-right">
      <div class="timeline-right-top dp--center">
        <icon-font
          :name="item.hasFinished ? 'finish' : 'unfinish'"
          :size="22"
          style="margin-right: 8px"
          color="#07BE51"
        />
        <div
          class="single-to-long"
          style="max-width: calc(50% - 25px); margin-right: 8px"
        >
          # {{ item.boardInfo?.title }}
        </div>
        <div class="single-to-long" style="max-width: calc(50% - 25px)">
          {{ item.creatorInfo?.userName }} > {{ item.executorInfo.userName }}
        </div>
      </div>
      <div class="timeline-right-bottom">
        {{ item.title }}
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.timeline {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 12px;
  &:hover {
    box-shadow: 0px 4px 9px 0px var(--talk-hover-shadow);
  }
  .timeline-left {
    width: 50px;
    height: 100%;
    .timeline-bean {
      width: 22px;
      height: 22px;
    }
    .timeline-time {
      width: 100%;
      color: var(--talk-font-color-2);
      font-size: 14px;
      margin-top: 10px;
    }
  }
  .timeline-right {
    width: calc(100% - 60px);
    .timeline-right-top {
      width: 100%;
      height: 30px;
      color: var(--talk-font-color-3);
      font-size: 12px;
    }
    .timeline-right-bottom {
      margin-top: 10px;
    }
  }
}
</style>
<style></style>
