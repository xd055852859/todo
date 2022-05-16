<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { Mate } from "@/interface/User";
import { ElMessage } from "element-plus";
const route = useRoute();
const mateKey = ref<string>("");
const mateInfo = ref<Mate | null>(null);
onMounted(() => {
  mateKey.value = route.params.id as string;
  console.log(mateKey.value);
  getMateInfo();
});
const getMateInfo = async () => {
  const targetRes = (await api.request.get("user/target", {
    targetUser: mateKey.value,
  })) as ResultProps;
  if (targetRes.msg === "OK") {
    mateInfo.value = targetRes.data;
  }
};
</script>
<template>
  <theader>
    <template #right> </template>
  </theader>
  <div class="mate" v-if="mateInfo">
    <div class="mate-avatar">
      <div class="mate-avatar-img dp-center-center">
        <img :src="mateInfo.userAvatar" alt="" />
      </div>
    </div>
    <div class="mate-name">{{ mateInfo.userName }}</div>
    <div class="mate-bean">{{ mateInfo.beans }}</div>
    <div class="mate-info">
      <div>{{ mateInfo.boardNum }}</div>
      <div>{{ mateInfo.partnerNum }}</div>
    </div>
    <div class="mate-box">
      <div class="mate-bottle"></div>
      <div class="mate-box-title">Beans Today</div>
      <div>
        <div>
          <div>{{ mateInfo.shareBeans }}</div>
        </div>
        <div>
          <div>{{ mateInfo.totalBeans }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mate {
  width: 100%;
  height: calc(100vh - 55px);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<style></style>
