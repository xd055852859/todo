import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";

// 使用setup模式定义
export const commonStore = defineStore("commonStore", () => {
  const deviceType = ref<string>("");

  const chartType = ref<string>("");
  const locale = ref<string>("");
  const dark = ref<boolean>(!!localStorage.getItem("DARK"));
  const noticeNum = ref<number>(0);
  const setDeviceType = (newDeviceType: string) => {
    deviceType.value = newDeviceType;
  };
  const setChartType = (newChartType: string) => {
    chartType.value = newChartType;
  };

  const setCommonDark = (newDark: boolean) => {
    dark.value = newDark;
  };
  const setCommonLocale = (newLocale: string) => {
    locale.value = newLocale;
  };
  const setNoticeNum = (newNoticeNum: number) => {
    noticeNum.value = newNoticeNum;
  };
  return {
    deviceType,
    setDeviceType,
    dark,
    setCommonDark,
    locale,
    setCommonLocale,
    noticeNum,
    setNoticeNum,
    chartType,
    setChartType,
  };
});
