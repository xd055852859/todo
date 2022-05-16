import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
export const taskStore = defineStore("taskStore", () => {
  const taskList = ref<any>([]);
  const inboxList = ref<any>([]);
  const getTaskList = async (
    mark: string,
    hasFinished?: number,
    friendKey?: string
  ) => {
    let obj: any = { mark };
    hasFinished ? (obj.hasFinished = hasFinished) : null;
    friendKey ? (obj.friendKey = friendKey) : null;
    if (mark === "today") {
      friendKey ? getInboxList(friendKey) : getInboxList();
    }
    const taskRes: any = (await api.request.get("card/user", {
      ...obj,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      taskList.value = taskRes.data;
    }
  };
  const setTaskList = () => {};
  const delTaskList = (index: number, taskIndex: number) => {
    taskList.value[index].cards.splice(taskIndex, 1);
  };
  const getInboxList = async (friendKey?: string) => {
    let obj: any = {};
    friendKey ? (obj.friendKey = friendKey) : null;
    const inboxRes: any = (await api.request.get("card/inbox", {
      ...obj,
    })) as ResultProps;
    if (inboxRes.msg === "OK") {
      inboxList.value = inboxRes.data;
    }
  };

  const delInboxList = (index: number, taskIndex: number) => {
    inboxList.value[index].cards.splice(taskIndex, 1);
  };
  const clearInboxList = () => {
    inboxList.value = [];
  };
  return {
    taskList,
    inboxList,
    getTaskList,
    setTaskList,
    delTaskList,
    getInboxList,
    delInboxList,
    clearInboxList,
  };
});
