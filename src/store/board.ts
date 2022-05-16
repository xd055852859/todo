import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Board } from "@/interface/Board";

// 使用setup模式定义
export const boardStore = defineStore("boardStore", () => {
  const boardIndex = computed(() => {
    if (boardList.value) {
      return boardList.value.findIndex((item) => item._key === boardKey.value);
    }
    return 0;
  });
  const sortArr = ["accessTime", "boardTitle", "master"];
  const sortIndex = ref<number>(0);
  const order = ref<string>("asc");
  const boardKey = ref<string>(localStorage.getItem("boardKey") ?? "");
  const boardList = ref<Board[] | null>(null);
  const boardRole = ref<number>(5);

  const setBoardKey = (key: string) => {
    boardKey.value = key;
    localStorage.setItem("boardKey", boardKey.value);
  };
  const getBoardList = async (sortBy: string, order: string) => {
    const boardRes: any = (await api.request.get("board", {
      sortBy: sortArr[sortIndex.value],
      order: order,
    })) as ResultProps;
    if (boardRes.msg === "OK") {
      boardList.value = [...boardRes.data];
      if (!boardKey.value) {
        boardKey.value = boardList.value[0]._key;
      }
    }
  };
  const setSortIndex = (index: number) => {
    sortIndex.value = index;
  };
  const setBoardRole = (role: number) => {
    boardRole.value = role;
  };
  watch([sortIndex, order], ([newSortVal, newOrderVal]) => {
    getBoardList(sortArr[newSortVal], newOrderVal);
  });
  return {
    boardKey,
    setBoardKey,
    boardList,
    getBoardList,
    boardIndex,
    sortIndex,
    setSortIndex,
    boardRole,
    setBoardRole,
  };
});
