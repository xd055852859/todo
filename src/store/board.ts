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
  const sortIndex = ref<number>(
    //@ts-ignore
    localStorage.getItem("sortIndex") ? +localStorage.getItem("sortIndex") : 0
  );
  const order = ref<string>(localStorage.getItem("order") ?? "desc");
  const boardKey = ref<string>("");
  const boardList = ref<Board[]>([]);
  const boardRole = ref<number>(5);

  const setBoardKey = (key: string) => {
    boardKey.value = key;
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
  const addBoardList = async (boardItem: Board) => {
    boardList.value.unshift(boardItem);
  };
  const setSortIndex = (index: number) => {
    sortIndex.value = index;
    localStorage.setItem("sortIndex", index + "");
  };
  const setOrder = (newOrder: string) => {
    order.value = newOrder;
    localStorage.setItem("order", newOrder);
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
    addBoardList,
    boardIndex,
    sortIndex,
    setSortIndex,
    order,
    setOrder,
    boardRole,
    setBoardRole,
  };
});
