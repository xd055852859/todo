<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowRight, ArrowDown, Plus } from "@element-plus/icons-vue";
import { Member, User } from "@/interface/User";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import appStore from "@/store";
import { Notice, ResultProps } from "@/interface/Common";

import chooseSvg from "@/assets/svg/choose.svg";
import unchooseSvg from "@/assets/svg/unchoose.svg";
import addPersonSvg from "@/assets/svg/addPerson.svg";
import { Board } from "@/interface/Board";
import NoticeItem from "@/components/noticeItem.vue";
import i18n from "@/language/i18n";

const { user, mateList, friend } = storeToRefs(appStore.authStore);
const { boardList, boardRole } = storeToRefs(appStore.boardStore);

const { addMateList } = appStore.authStore;
const { setBoardRole, setBoardKey, addBoardList } = appStore.boardStore;
const router = useRouter();
const route = useRoute();

//看板成员key
const memberKeyList = computed(() =>
  memberList.value.map((item) => {
    return item._key;
  })
);
//添加成员key
const addMemberKeyArr = computed(() =>
  addMemberArr.value.map((item) => {
    return item._key;
  })
);
//添加成员key
const memberArr = computed(() =>
  mateList.value.filter((item) => {
    return memberKeyList.value.indexOf(item._key) === -1;
  })
);
const relativeKeyArr = computed(() => {
  let arr: string[] = [];
  relativeList.value.forEach((item: Board) => {
    if (item.added) {
      arr.push(item._key);
    }
  });
  return arr;
});
const boardKey = ref<string>("");
const boardName = ref<string>("");
const memberList = ref<Member[]>([]);
const addMemberArr = ref<Member[] | User[]>([]);
const memberVisible = ref<boolean>(false);
const roleVisible = ref<boolean>(false);
const roleArray = ref<string[]>([]);
const delItem = ref<{ item: Member; index: number } | null>(null);
const delVisible = ref<boolean>(false);
const executorInfo = ref<User | null>(null);
const excutorVisible = ref<boolean>(false);
const excutorList = ref<Member[] | User[]>([]);
const relativeVisible = ref<boolean>(false);
const relativeList = ref<any>([]);
const relativeChangeVisible = ref<boolean>(false);
const exitVisible = ref<boolean>(false);
const disbandVisible = ref<boolean>(false);
const cloneVisible = ref<boolean>(false);
const applyList = ref<Notice[]>([]);
onMounted(() => {
  boardKey.value = route.params.id as string;
  roleArray.value = [
    i18n.global.t(`Owner`),
    i18n.global.t(`Admin`),
    i18n.global.t(`Editer`),
    i18n.global.t(`Author`),
    i18n.global.t(`Follower`),
  ];
  getInfo();
  getRelative();
  getNotice();
});
const getInfo = async () => {
  let infoRes = (await api.request.get("board/info", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (infoRes.msg === "OK") {
    boardName.value = infoRes.data.title;
    executorInfo.value = infoRes.data.executorInfo;
    memberList.value = infoRes.data.memberList;
    excutorList.value = infoRes.data.memberList;
    setBoardRole(infoRes.data.role);
  }
};
const getNotice = async () => {
  const noticeRes: any = (await api.request.get("message/list", {
    page: 1,
    limit: 50,
    type: "join",
    boardKey: boardKey.value,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    applyList.value = noticeRes.data;
  }
};
const updateBoard = async (type: string) => {
  let config: any = {};
  switch (type) {
    case "name":
      if (!boardName.value) {
        ElMessage({
          message: i18n.global.t(`InPut Board Name`),
          type: "error",
          duration: 1000,
        });
        return;
      }
      config.title = boardName.value;
      break;
    case "member":
      if (addMemberArr.value.length === 0) {
        return;
      }
      config.memberKeyArr = addMemberKeyArr.value;
      break;
    case "executor":
      config.executor = executorInfo.value?._key;
      break;
  }
  const groupRes = (await api.request.patch("board", {
    boardKey: boardKey.value,
    ...config,
  })) as ResultProps;
  if (groupRes.msg === "OK") {
    if (type === "member") {
      memberList.value = [
        ...memberList.value,
        ...(addMemberArr.value as Member[]),
      ];
    }
  }
};
const changeRole = async (item: Member, index: number, role: number) => {
  if (item.role < boardRole.value) {
    ElMessage({
      message: i18n.global.t(`Wrong permission`),
      type: "error",
      duration: 1000,
    });
    return;
  }
  let roleRes = (await api.request.patch("board/member/role", {
    boardKey: boardKey.value,
    memberKey: item._key,
    role: role,
  })) as ResultProps;
  if (roleRes.msg === "OK") {
    memberList.value[index].role = role;
  }
};
const chooseExcutor = (item: User | Member) => {
  executorInfo.value = item;
  excutorVisible.value = false;
  if (boardKey.value !== "create") {
    updateBoard("executor");
  }
};
const chooseMember = (item: User) => {
  let index = memberKeyList.value.indexOf(item._key as string);
  if (index === -1) {
    memberList.value.push({ ...item, role: 3 });
  } else {
    memberList.value.splice(index, 1);
  }
};

const upDateMember = (item) => {
  let index = addMemberKeyArr.value.indexOf(item._key as string);
  if (index === -1) {
    addMemberArr.value.push({ ...item, role: 3 });
  } else {
    addMemberArr.value.splice(index, 1);
  }
};

const delMember = async (item: Member, index: number) => {
  const delRes = (await api.request.delete("board/member", {
    boardKey: boardKey.value,
    memberKey: item._key,
  })) as ResultProps;
  if (delRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Delete board members successfully`),
      type: "success",
      duration: 1000,
    });
    memberList.value.splice(index, 1);
    delVisible.value = false;
    delItem.value = null;
  }
};
const saveMate = async (key, index) => {
  const saveRes = (await api.request.post("partner", {
    friendKey: key,
  })) as ResultProps;
  if (saveRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Adding friends successful`),
      type: "success",
      duration: 1000,
    });
    memberList.value[index].added = true;
    addMateList(saveRes.data);
    // store.dispatch("auth/getGroupList");
    // router.push("/home");
  }
};
const getRelative = async () => {
  let relativeRes = (await api.request.get("board/relative", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (relativeRes.msg === "OK") {
    relativeList.value = relativeRes.data;
  }
};
const chooseRelative = (index: number) => {
  relativeChangeVisible.value = true;
  relativeList.value[index].added = !relativeList.value[index].added;
};
const saveRelative = async () => {
  if (relativeChangeVisible.value) {
    let relativeRes = (await api.request.patch("board/relative", {
      boardKey: boardKey.value,
      relativeArr: relativeKeyArr.value,
    })) as ResultProps;
    if (relativeRes.msg === "OK") {
      ElMessage({
        message: i18n.global.t(`Save associated board successfully`),
        type: "success",
        duration: 1000,
      });
      relativeChangeVisible.value = false;
    }
  }
};
const cloneBoard = async () => {
  let cloneRes = (await api.request.post("board/clone", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (cloneRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Clone associated Kanban board successfully`),
      type: "success",
      duration: 1000,
    });
    setBoardKey(cloneRes.data._key);
    router.push("/home/board");
    addBoardList(cloneRes.data);
  }
};
const disbandBoard = async () => {
  let disbandRes = (await api.request.delete("board", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (disbandRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Dissolve Kanban board successfully`),
      type: "success",
      duration: 1000,
    });
    if (boardKey.value !== boardList.value[0]._key) {
      setBoardKey(boardList.value[0]._key);
    } else {
      setBoardKey(boardList.value[1]._key);
    }
    router.push("/home/board");
  }
};
const exitBoard = async () => {
  const quitRes: any = (await api.request.delete("board/exit", {
    boardKey: boardKey.value,
  })) as ResultProps;
  if (quitRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Exit kanban board successfully`),
      type: "success",
      duration: 1000,
    });
    if (boardKey.value !== boardList.value[0]._key) {
      setBoardKey(boardList.value[0]._key);
    } else {
      setBoardKey(boardList.value[1]._key);
    }
    router.push("/home/board");
  }
};
const TransferOwner = async (key: string, index: number) => {
  let cloneRes = (await api.request.patch("board/transfer", {
    boardKey: boardKey.value,
    memberKey: key,
  })) as ResultProps;
  if (cloneRes.msg === "OK") {
    ElMessage({
      message: i18n.global.t(`Transferring owner successful`),
      type: "success",
      duration: 1000,
    });
    let adminIndex = memberList.value.findIndex(
      (item) => item._key === user.value?._key
    );
    if (adminIndex !== -1) {
      memberList.value[adminIndex].role = 1;
    }
    setBoardRole(1);
    memberList.value[index].role = 0;
  }
};
const applyMessage = (index: number, item) => {
  applyList.value.splice(index, 1);
  memberList.value.push({
    added: false,
    role: 4,
    userAvatar: item.userAvatar,
    userName: item.userName,
    _key: item._key,
  });
};
</script>
<template>
  <theader
    @clickBack="
      setBoardKey(boardKey);
      router.push('/home/board');
    "
    clickState
  >
    <template #left> {{ $t(`Board Config`) }} </template>
  </theader>
  <div class="board-container config p-3">
    <div v-if="boardRole < 2 && applyList.length > 0">
      <div v-for="(item, index) in applyList" :key="'noticeItem' + index">
        <template v-if="item.status === 1">
          <notice-item
            :item="item"
            @applyMessage="applyMessage"
            :index="index"
          />
        </template>
      </div>
    </div>
    <div class="manage-text dp-space-center">
      <span>{{ $t(`Board Name`) }}</span>
      <el-input
        v-model="boardName"
        :placeholder="$t(`InPut Board Name`)"
        style="width: calc(100% - 150px)"
        @change="updateBoard('name')"
        :disabled="boardRole !== 0"
      />
    </div>
    <div
      class="manage-text dp-space-center"
      :class="{ 'icon-point': boardKey !== 'create' }"
      @click="boardRole === 0 ? (excutorVisible = true) : false"
    >
      <span>{{ $t(`Executor`) }}</span>
      <div class="dp--center">
        <el-avatar fit="cover" :size="40" :src="executorInfo?.userAvatar" />
        <span style="margin-right: 8px">{{ executorInfo?.userName }}</span>
        <el-icon v-if="boardRole === 0"><arrow-right /></el-icon>
      </div>
    </div>
    <div class="manage-text dp-space-center" @click="roleVisible = true">
      <span>{{ $t(`Members`) }} ( {{ memberList.length }} )</span>
      <el-icon><arrow-right /></el-icon>
    </div>

    <el-row :gutter="20">
      <template v-if="memberList.length > 0">
        <el-col
          v-for="(item, index) in memberList"
          :key="'contact' + index"
          :xs="6"
          :sm="4"
          :md="3"
          :lg="2"
          :xl="2"
          style="cursor: pointer"
        >
          <div class="manage-item">
            <div class="manage-item-img">
              <img :src="item.userAvatar" alt="" />
            </div>
          </div>
        </el-col>
      </template>
      <el-col
        :xs="6"
        :sm="4"
        :md="3"
        :lg="2"
        :xl="2"
        style="cursor: pointer"
        v-if="boardRole < 2"
      >
        <div class="manage-item" @click="memberVisible = true">
          <img :src="addPersonSvg" alt="" />
        </div>
      </el-col>
    </el-row>
    <div
      class="manage-text dp-space-center icon-point"
      @click="relativeVisible = true"
    >
      <span>{{ $t(`Relative Board`) }} ( {{ relativeKeyArr.length }} )</span>
      <div class="dp--center">
        <el-icon v-if="boardRole < 2">
          <plus />
        </el-icon>
        <el-icon v-else><arrow-right /></el-icon>
      </div>
    </div>
    <el-divider border-style="dashed" />
    <div
      class="manage-text dp-space-center icon-point"
      @click="cloneVisible = true"
    >
      <span style="font-weight: 600">{{ $t(`Clone`) }}</span>
    </div>
    <el-divider border-style="dashed" />
    <div
      class="manage-text dp-space-center icon-point"
      @click="disbandVisible = true"
      v-if="boardRole === 0"
    >
      <span style="font-weight: 600">{{ $t(`Dismiss`) }}</span>
    </div>
    <div
      class="manage-text dp-space-center icon-point"
      @click="exitVisible = true"
      v-else
    >
      <span style="font-weight: 600">{{ $t(`Exit`) }}</span>
    </div>
  </div>
  <el-drawer
    v-model="excutorVisible"
    direction="rtl"
    :size="350"
    custom-class="p0-drawer"
    :title="$t(`Executor`)"
  >
    <div class="add-member">
      <div
        class="container dp-space-center"
        v-for="(item, index) in excutorList"
        :key="'add-member' + index"
        @click="chooseExcutor(item)"
      >
        <div class="left dp--center">
          <el-avatar fit="cover" :size="40" :src="item.userAvatar" />
          <div class="name">{{ item.userName }}</div>
        </div>
      </div>
    </div>
  </el-drawer>

  <el-drawer
    v-model="memberVisible"
    direction="rtl"
    :size="350"
    custom-class="p0-drawer"
    title="Choose Member"
    :before-close="
      (done) => {
        updateBoard('member');
        done();
      }
    "
  >
    <div class="add-member">
      <div
        class="container dp-space-center"
        v-for="(item, index) in memberArr"
        :key="'add-member' + index"
        @click="boardKey === 'create' ? chooseMember(item) : upDateMember(item)"
      >
        <div class="left dp--center">
          <div class="name">{{ item.userName }}</div>
        </div>
        <div class="right">
          <img
            :src="
              addMemberKeyArr.indexOf(item._key as string) !== -1 ? chooseSvg : unchooseSvg
            "
            alt=""
            style="width: 20px; height: 20px; margin-right: 10px"
          />
        </div>
      </div>
    </div>
  </el-drawer>
  <el-drawer
    v-model="relativeVisible"
    direction="rtl"
    :size="350"
    custom-class="p0-drawer"
    title="Choose Relative"
    :before-close="
      (done) => {
        saveRelative();
        done();
      }
    "
  >
    <div class="add-member">
      <div
        class="container dp-space-center"
        v-for="(item, index) in relativeList"
        :key="'board' + index"
        @click="chooseRelative(index)"
      >
        <div class="left dp--center">
          <div class="name">{{ item.title }}</div>
        </div>
        <!--  addRelativeKeyArr.indexOf(item._key as string) !== -1 -->
        <div class="right">
          <img
            :src="item.added ? chooseSvg : unchooseSvg"
            alt=""
            style="width: 20px; height: 20px; margin-right: 10px"
          />
        </div>
      </div>
    </div>
  </el-drawer>
  <el-drawer
    v-model="roleVisible"
    direction="rtl"
    :size="350"
    custom-class="p0-drawer"
  >
    <div class="add-member">
      <div
        class="container dp-space-center manage-item"
        v-for="(item, index) in memberList"
        :key="'manage' + index"
      >
        <div class="left dp--center">
          <el-avatar fit="cover" :size="40" :src="item.userAvatar" />
          <div class="name">{{ item.userName }}</div>
        </div>
        <div class="right dp--center">
          <el-popover
            :width="50"
            ref="popoverRef"
            trigger="click"
            :disabled="boardRole > item.role || item._key === user?._key"
          >
            <template #reference>
              <div class="manage-role dp--center">
                <span style="margin-right: 10px">
                  {{ roleArray[item.role] }}
                </span>
                <el-icon
                  v-if="
                    (boardRole < item.role || boardRole === 0) &&
                    item._key !== user?._key
                  "
                >
                  <arrow-down />
                </el-icon>
              </div>
            </template>
            <div class="role-container">
              <el-popconfirm
                title="Are you sure to transfer Owner?"
                @confirm="TransferOwner(item._key, index)"
              >
                <template #reference>
                  <div class="role-item" v-if="boardRole === 0">Owner</div>
                </template>
              </el-popconfirm>

              <div
                class="role-item"
                v-if="boardRole === 0"
                @click="changeRole(item, index, 1)"
              >
                Admin
              </div>
              <div class="role-item" @click="changeRole(item, index, 2)">
                Editor
              </div>
              <div class="role-item" @click="changeRole(item, index, 3)">
                Author
              </div>
              <div class="role-item" @click="changeRole(item, index, 4)">
                Follower
              </div>
              <el-divider />
              <div
                class="role-item"
                @click="
                  delItem = {
                    item: item,
                    index: index,
                  };
                  delVisible = true;
                "
              >
                Delete
              </div>
            </div>
          </el-popover>
          <div style="width: 20px; height: 20px; margin-left: 10px">
            <el-tooltip
              content="Add Mate"
              placement="top"
              v-if="!item.added && item._key !== user?._key"
            >
              <icon-font
                class="icon-point del-button"
                name="addmate"
                :size="20"
                @click="saveMate(item._key, index)"
              />
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
  <el-dialog v-model="delVisible" title="Delete Prompt" width="350px">
    <span>Delete Board Member</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="delVisible = false" bgColor="#d1dbe5">
          {{ $t(`Cancel`) }}
        </tbutton>
        <tbutton
          @click="delItem ? delMember(delItem.item, delItem.index) : null"
          >OK</tbutton
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="cloneVisible" title="Clone Prompt" width="350px">
    <span>Clone Board</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="cloneVisible = false" bgColor="#d1dbe5">
          {{ $t(`Cancel`) }}
        </tbutton>
        <tbutton @click="cloneBoard">{{ $t(`Confirm`) }}</tbutton>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="exitVisible" title="Exit Prompt" width="350px">
    <span>Exit Board</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="exitVisible = false" bgColor="#d1dbe5">
          {{ $t(`Cancel`) }}
        </tbutton>
        <tbutton @click="exitBoard">{{ $t(`Confirm`) }}</tbutton>
      </span>
    </template>
  </el-dialog>
  <el-dialog v-model="disbandVisible" title="Disband Prompt" width="350px">
    <span>Disband Board</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="disbandVisible = false" bgColor="#d1dbe5">
          {{ $t(`Cancel`) }}
        </tbutton>
        <tbutton @click="disbandBoard">{{ $t(`Confirm`) }}</tbutton>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
.config {
  width: 100%;
  height: calc(100vh - 140px);
  padding-top: 15px;
  padding-bottom: 15px;

  .manage-text {
    height: 50px;
    margin-bottom: 15px;
  }
  .manage-item {
    margin-bottom: 10px;
    .manage-item-img {
      width: 80px;
      height: 80px;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0px 0px 12px 10px rgba(0, 0, 0, 0.05);
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    & > img {
      width: 80px;
      height: 80px;
    }
  }
}
.board-footer {
  width: 100%;
  height: 80px;
}
.role-container {
  .role-item {
    height: 35px;
    line-height: 35px;
    cursor: pointer;
    &:hover {
      background-color: var(--talk-hover-color);
    }
  }
}
</style>
<style></style>
