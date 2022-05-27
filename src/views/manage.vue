<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ArrowRight, ArrowDown, Plus } from "@element-plus/icons-vue";
import { Member, User } from "@/interface/User";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";

import chooseSvg from "@/assets/svg/choose.svg";
import unchooseSvg from "@/assets/svg/unchoose.svg";
import addPersonSvg from "@/assets/svg/addPerson.svg";
import { Board } from "@/interface/Board";

const { user, mateList, friend } = storeToRefs(appStore.authStore);
const { boardRole } = storeToRefs(appStore.boardStore);

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
const roleArray = ["Owner", "Admin", "Editer", "Author", "Follower"];
const delItem = ref<{ item: Member; index: number } | null>(null);
const delVisible = ref<boolean>(false);
const executorInfo = ref<User | null>(null);
const excutorVisible = ref<boolean>(false);
const excutorList = ref<Member[] | User[]>([]);
const relativeVisible = ref<boolean>(false);
const relativeList = ref<any>([]);
const relativeChangeVisible = ref<boolean>(false);
onMounted(() => {
  boardKey.value = route.params.id as string;
  if (boardKey.value !== "create") {
    getInfo();
    getRelative();
  } else {
    excutorList.value = mateList.value;
    executorInfo.value = friend.value;
    if (executorInfo.value?._key !== user.value?._key) {
      //@ts-ignore
      memberList.value = [executorInfo.value, user.value];
    } else {
      //@ts-ignore
      memberList.value = [user.value];
    }
  }
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
const createBoard = async () => {
  if (memberList.value.length === 0) {
    ElMessage({
      message: "please choose a member",
      type: "error",
      duration: 1000,
    });
    return;
  }
  const groupRes = (await api.request.post("board", {
    title: boardName.value,
    avatar: "",
    memberKeyArr: memberKeyList.value,
  })) as ResultProps;
  if (groupRes.msg === "OK") {
    ElMessage({
      message: "Board created successfully",
      type: "success",
      duration: 1000,
    });
    addBoardList(groupRes.data);
    router.back();
  }
};
const updateBoard = async (type: string) => {
  let config: any = {};
  switch (type) {
    case "name":
      if (!boardName.value) {
        ElMessage({
          message: "Please Enter Board Name",
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
      message: "Error Role",
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
    addMemberArr.value.push(item);
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
      message: "Delete Member Successful",
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
      message: "add Mate succeeded",
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
        message: "Save Relative Successful",
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
      message: "Clone Board Successful",
      type: "success",
      duration: 1000,
    });
    setBoardKey(cloneRes.data._key);
    router.push("/home/board");
    addBoardList(cloneRes.data);
  }
};
const TransferOwner = async (key: string, index: number) => {
  let cloneRes = (await api.request.patch("board/transfer", {
    boardKey: boardKey.value,
    memberKey: key,
  })) as ResultProps;
  if (cloneRes.msg === "OK") {
    ElMessage({
      message: "Transfer Owner Successful",
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
watch(
  user,
  (newVal) => {
    if (newVal && boardKey.value === "create") {
      executorInfo.value = {
        userAvatar: newVal.userAvatar,
        userName: newVal.userName,
        _key: newVal._key,
      };
    }
  },
  { immediate: true }
);
watch(
  mateList,
  (newVal) => {
    if (newVal && boardKey.value === "create") {
      excutorList.value = newVal;
    }
  },
  { immediate: true }
);
</script>
<template>
  <theader>
    <template #left> Board Config </template>
    <template #right v-if="boardKey === 'create'">
      <tbutton @click="createBoard">Create</tbutton>
    </template>
  </theader>
  <div class="board-container config p-5">
    <div class="manage-text dp-space-center">
      <span>Board Name</span>
      <el-input
        v-model="boardName"
        placeholder="请输入小组名"
        style="width: calc(100% - 150px)"
        @change="boardKey !== 'create' ? updateBoard('name') : null"
        :disabled="boardKey !== 'create' && boardRole > 1"
      />
    </div>
    <div
      class="manage-text dp-space-center"
      :class="{ 'icon-point': boardKey !== 'create' }"
      @click="
        (boardKey !== 'create' && boardRole === 0) || boardKey === 'create'
          ? (excutorVisible = true)
          : false
      "
    >
      <span>Execativor</span>
      <div class="dp--center">
        <el-avatar fit="cover" :size="40" :src="executorInfo?.userAvatar" />
        <span style="margin-right: 8px">{{ executorInfo?.userName }}</span>
        <el-icon
          v-if="
            (boardKey !== 'create' && boardRole === 0) || boardKey === 'create'
          "
          ><arrow-right
        /></el-icon>
      </div>
    </div>
    <div
      class="manage-text dp-space-center"
      @click="boardKey !== 'create' ? (roleVisible = true) : null"
    >
      <span>Members ( {{ memberList.length }} )</span>
      <el-icon v-if="boardKey !== 'create'"><arrow-right /></el-icon>
    </div>
    <el-row :gutter="20">
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
      <el-col
        :xs="8"
        :sm="6"
        :md="4"
        :lg="3"
        :xl="1"
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
      v-if="boardKey !== 'create'"
    >
      <span>关联看板 ( {{ relativeKeyArr.length }} )</span>
      <div class="dp--center">
        <el-icon v-if="boardRole < 2">
          <plus />
        </el-icon>
        <el-icon v-else><arrow-right /></el-icon>
      </div>
    </div>
  </div>
  <div class="board-footer dp-center-center" v-if="boardKey !== 'create'">
    <div class="dp-center-center">
      <tbutton @click="cloneBoard" round class="dp-center-center">
        Board Clone
      </tbutton>
    </div>
    <div class="dp-center-center">Clone name and members</div>
  </div>
  <el-drawer
    v-model="excutorVisible"
    direction="rtl"
    :size="350"
    custom-class="p0-drawer"
    title="Execativor"
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
      boardKey !== 'create'
        ? (done) => {
            updateBoard('member');
            done();
          }
        : null
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
              boardKey === 'create'?memberKeyList.indexOf(item._key as string) !== -1 ? chooseSvg : unchooseSvg:addMemberKeyArr.indexOf(item._key as string) !== -1 ? chooseSvg : unchooseSvg
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
          <!-- <div class="dp--center">
            <span style="margin-right: 10px">{{
              $t(`text['${roleArray[item.role]}']`)
            }}</span>
            <el-icon v-if="groupRole < 2 && item._key !== user?._key">
              <arrow-down />
            </el-icon>
          </div> -->

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
                    (boardRole > item.role || boardRole === 0) &&
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
  <el-dialog v-model="delVisible" title="Delete prompt" width="350px">
    <span>Delete Board Member</span>
    <template #footer>
      <span class="dialog-footer dp-space-center">
        <tbutton @click="delVisible = false" bgColor="#d1dbe5">
          Cancel
        </tbutton>
        <tbutton
          @click="delItem ? delMember(delItem.item, delItem.index) : null"
          >OK</tbutton
        >
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
  flex-wrap: wrap;
  > div {
    width: 100%;
  }
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
