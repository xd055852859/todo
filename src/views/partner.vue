<script setup lang="ts">
import api from "@/services/api";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useDebounceFn } from "@vueuse/core";
import { User } from "@/interface/User";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";

import appStore from "@/store";
import Avatar from "@/components/avatar.vue";
const router = useRouter();
const socket: any = inject("socket");
const { mateList } = storeToRefs(appStore.authStore);
const { updateMateList } = appStore.authStore;
onMounted(() => {
  socket.on("onlineStatus", (data) => {
    updateMateList(data);
  });
});
const searchVisible = ref<boolean>(false);
const searchInput = ref<string>("");
const searchList = ref<User[]>([]);
const searchMoreList = ref<User[]>([]);
const moreVisible = ref<boolean>(false);
const searchPartner = () => {
  if (searchInput.value) {
    searchList.value = mateList.value.filter((item) => {
      return item.userName.indexOf(searchInput.value) !== -1;
    });
    if (moreVisible.value) {
      showMore();
    }
  } else {
    searchList.value = [...mateList.value];
    searchMoreList.value = [];
  }
};
const choosePartner = () => {
  // if (item.receiverType === "group") {
  //   router.push(`/manage/${item._key}`);
  // } else {
  //   router.push(`/member/${item.toUserKey}`);
  // }
};
const showMore = useDebounceFn(async () => {
  if (searchInput.value) {
    let searchRes = (await api.request.get("user/search", {
      keyWord: searchInput.value,
      inPlatform: 1,
      filterFriend: true,
    })) as ResultProps;
    if (searchRes.msg === "OK") {
      // ElMessage.success("Update Config Success");
      searchMoreList.value = [...searchRes.data];
    }
  } else {
    searchMoreList.value = [];
  }
}, 1000);

watchEffect(() => {
  searchPartner();
});
</script>
<template>
  <theader isMenu>
    <template #left>Mates</template>
    <template #right>
      <el-input
        v-model="searchInput"
        size="large"
        placeholder="请输入好友名"
        v-if="searchVisible"
        style="width: calc(100vw - 280px); margin-right: 15px"
      />
      <el-icon
        style="margin-right: 15px"
        class="icon-point"
        @click="searchVisible = !searchVisible"
      >
        <Search />
      </el-icon>
      <tbutton
        style="height: 40px; padding: 0px 30px"
        @click="router.push('/home/invite')"
      >
        Invite
      </tbutton>
    </template>
  </theader>
  <div class="partner p-5">
    <el-row :gutter="20">
      <el-col
        v-for="(item, index) in searchList"
        :key="'contact' + index"
        :xs="8"
        :sm="6"
        :md="4"
        :lg="3"
        :xl="2"
        @click="choosePartner()"
        style="cursor: pointer"
      >
        <div
          class="dp-center-center partner-item"
          @click="$router.push('/home/mate/' + item._key)"
        >
          <!-- <div class="partner-item-img">
            <img :src="item.userAvatar" alt="" />
          </div> -->
          <avatar
            :name="item.userName"
            :avatar="item.userAvatar"
            type="person"
            :index="index"
            :size="90"
            showOnline
            :online-state="item.online"
          />
          <div class="name single-to-long">
            {{ item.userName }}
          </div>
        </div>
      </el-col>
    </el-row>
    <el-empty :description="'No Content'" v-if="searchList.length === 0" />
    <el-divider border-style="dashed" />
    <div
      @click="moreVisible = true"
      class="more-button icon-point"
      :class="{ 'common-color': !moreVisible ? true : false }"
    >
      More
    </div>
    <template v-if="searchMoreList.length > 0">
      <el-row :gutter="20">
        <el-col
          v-for="(item, index) in searchMoreList"
          :key="'contact' + index"
          :xs="8"
          :sm="6"
          :md="4"
          :lg="3"
          :xl="1"
          @click="choosePartner()"
          style="cursor: pointer"
        >
          <div
            class="dp-center-center partner-item"
            @click="$router.push('/home/mate/' + item._key)"
          >
            <avatar
              :name="item.userName"
              :avatar="item.userAvatar"
              type="person"
              :index="index"
              :size="90"
              :avatarStyle="{ fontSize: '28px' }"
            />
            <div class="name single-to-long">
              {{ item.userName }}
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
    <el-empty
      :description="'No More'"
      v-else-if="
        moreVisible === true && searchMoreList.length === 0 && searchInput
      "
    />
  </div>
</template>
<style scoped lang="scss">
.partner {
  width: 100vw;
  height: calc(100vh - 55px);
  background: var(--talk-bg-color);
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 15px;
  padding-bottom: 15px;
  .more-button {
    width: 100%;
    text-align: right;
  }
  .partner-item {
    width: 130px;
    height: 130px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    .el-avatar {
      margin-right: 0px;
    }
    .name {
      width: 100%;
      margin-top: 5px;
      text-align: center;
    }
  }
  .footer {
    width: 100%;
    height: 30px;
    color: var(--talk-font-color-2);
    font-size: 14px;
  }
}
</style>
<style></style>
