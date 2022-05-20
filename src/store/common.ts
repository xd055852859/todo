import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

// 使用setup模式定义
export const commonStore = defineStore("commonStore", () => {
  const deviceType = ref<string>("");
  const setDeviceType = (newDeviceType: string) => {
    deviceType.value = newDeviceType;
  };

  return {
    deviceType,
    setDeviceType,
  };
});
