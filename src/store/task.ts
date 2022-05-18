import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
export const taskStore = defineStore("taskStore", () => {
  const taskList = ref<any>([]);
  const inboxList = ref<any>([]);
  const targetKey = ref<string>("");
  const taskKey = ref<string>("");
  const getTaskList = async (mark: string, hasFinished?: number) => {
    let obj: any = { mark };
    hasFinished ? (obj.hasFinished = hasFinished) : null;
    targetKey.value ? (obj.friendKey = targetKey.value) : null;
    if (mark === "today") {
      getInboxList();
    }
    const taskRes: any = (await api.request.get("card/user", {
      ...obj,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      taskList.value = taskRes.data;
    }
  };
  const delTaskList = (index: number, taskIndex: number) => {
    taskList.value[index].cards.splice(taskIndex, 1);
  };
  const getInboxList = async () => {
    let obj: any = {};
    targetKey.value ? (obj.friendKey = targetKey.value) : null;
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

  const setTargetKey = (key) => {
    targetKey.value = key;
  };
  const setTaskKey = (key) => {
    taskKey.value = key;
  };
  taskKey
  return {
    taskList,
    inboxList,
    getTaskList,
    delTaskList,
    getInboxList,
    delInboxList,
    clearInboxList,
    targetKey,
    setTargetKey,
    taskKey,
    setTaskKey
  };
});
