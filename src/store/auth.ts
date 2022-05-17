import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

// 使用setup模式定义
export const authStore = defineStore("authStore", () => {
  const token = ref<string>(localStorage.getItem("token") ?? "");
  const user = ref<User | null>(null);
  const mateList = ref<User[]>([]);
  const memberList = ref<User[]>([]);
  const setToken = (newToken: string) => {
    token.value = newToken;
  };
  const setUserInfo = (newUserInfo: User) => {
    user.value = newUserInfo;
  };
  const getUserInfo = async () => {
    const userInfoRes = (await api.request.get("user")) as ResultProps;
    if (userInfoRes.msg === "OK") {
      user.value = {
        _key: userInfoRes.data._key,
        userAvatar: userInfoRes.data.userAvatar,
        userName: userInfoRes.data.userName,
      };
    }
  };
  const getMateList = async () => {
    const mateRes: any = (await api.request.get("partner")) as ResultProps;
    if (mateRes.msg === "OK") {
      mateList.value = [...mateRes.data];
    }
  };
  const addMateList = async (mateItem: User) => {
    mateList.value = [...mateList.value, mateItem];
  };
  const delMateList = async (mateKey: string) => {
    mateList.value = mateList.value.filter((item) => item._key !== mateKey);
  };

  const getMemberList = async () => {
    const memberRes: any = (await api.request.get(
      "board/member"
    )) as ResultProps;
    if (memberRes.msg === "OK") {
      memberList.value = [...memberRes.data];
    }
  };
  const addMemberList = async (memberItem: User) => {
    memberList.value = [...memberList.value, memberItem];
  };
  return {
    token,
    user,
    setToken,
    setUserInfo,
    getUserInfo,
    mateList,
    getMateList,
    addMateList,
    delMateList,
    memberList,
    getMemberList,
    addMemberList,
  };
});
