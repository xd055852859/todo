import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { Task } from "@/interface/Task";
export const taskStore = defineStore("taskStore", () => {
  const taskList = ref<any>([]);
  const inboxList = ref<any>([]);
  const completedList = ref<any>([]);
  const targetKey = ref<string>("");
  const taskKey = ref<string>("");
  const { friend } = storeToRefs(appStore.authStore);
  const getTaskList = async (mark: string, hasFinished?: number) => {
    let obj: any = {};
    hasFinished ? (obj.hasFinished = hasFinished) : null;
    mark ? (obj.mark = mark) : null;
    targetKey.value ? (obj.friendKey = targetKey.value) : null;
    if (mark === "today") {
      getInboxList();
    }
    const taskRes: any = (await api.request.get("card/user", {
      ...obj,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      if (hasFinished) {
        completedList.value = taskRes.data.map((item) => {
          item.cards = item.cards.map((taskItem) => {
            taskItem.boardInfo = item.boardInfo;
            taskItem.creatorInfo = item.creatorInfo;
            taskItem.executorInfo = friend.value;
            return taskItem;
          });
          return item;
        });
      } else {
        taskList.value = taskRes.data.map((item) => {
          item.cards = item.cards.map((taskItem) => {
            taskItem.boardInfo = item.boardInfo;
            taskItem.creatorInfo = item.creatorInfo;
            taskItem.executorInfo = friend.value;
            return taskItem;
          });
          return item;
        });
      }
    }
  };

  const addList = (arr: any, item: Task) => {
    let taskIndex = arr.findIndex(
      (taskItem) =>
        item.creatorInfo?._key === taskItem.creatorInfo?._key &&
        item.boardInfo?._key === taskItem.boardInfo?._key
    );

    if (taskIndex !== -1) {
      let newIndex = arr[taskIndex].cards.findIndex(
        (newItem) => item._key === newItem._key
      );
      if (newIndex === -1) {
        arr[taskIndex].cards.unshift(item);
      }
    } else {
      arr.unshift({
        boardInfo: item.boardInfo,
        cards: [item],
        creatorInfo: item.creatorInfo,
      });
    }
  };

  const updateList = (arr: any, item: Task) => {
    console.log(arr);
    let index = arr.findIndex(
      (arrItem) =>
        item.creatorInfo?._key === arrItem.creatorInfo?._key &&
        item.boardInfo?._key === arrItem.boardInfo?._key
    );
    console.log(index);
    if (index !== -1) {
      let taskIndex = arr[index].cards.findIndex(
        (taskItem: Task) => item._key === taskItem._key
      );
      console.log(taskIndex);
      if (taskIndex !== -1) {
        arr[index].cards[taskIndex] = {
          ...arr[index].cards[taskIndex],
          ...item,
        };
        console.log(item);
        console.log(arr[index].cards[taskIndex]);
      }
    }
  };

  const delList = (arr: any, item: Task) => {
    console.log(item);
    console.log(arr);
    let index = arr.findIndex(
      (arrItem) =>
        item.creatorInfo?._key === arrItem.creatorInfo?._key &&
        item.boardInfo?._key === arrItem.boardInfo?._key
    );
    console.log(index);
    if (index !== -1) {
      let taskIndex = arr[index].cards.findIndex(
        (taskItem: Task) => item._key === taskItem._key
      );
      console.log(taskIndex);
      if (taskIndex !== -1) {
        arr[index].cards.splice(taskIndex, 1);
        if (arr[index].cards.length === 0) {
          arr.splice(index, 1);
        }
      }
    }
  };
  const getInboxList = async () => {
    let obj: any = {};
    targetKey.value ? (obj.friendKey = targetKey.value) : null;
    const inboxRes: any = (await api.request.get("card/inbox", {
      ...obj,
    })) as ResultProps;
    if (inboxRes.msg === "OK") {
      inboxList.value = inboxRes.data.map((item) => {
        item.cards = item.cards.map((taskItem) => {
          taskItem.boardInfo = item.boardInfo;
          taskItem.creatorInfo = item.creatorInfo;
          taskItem.executorInfo = friend.value;
          return taskItem;
        });
        return item;
      });
    }
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
  taskKey;
  return {
    addList,
    updateList,
    delList,
    taskList,
    getTaskList,
    inboxList,
    getInboxList,
    clearInboxList,
    completedList,
    targetKey,
    setTargetKey,
    taskKey,
    setTaskKey,
  };
});
