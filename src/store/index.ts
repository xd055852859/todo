import { authStore } from "@/store/auth";
import { boardStore } from "@/store/board";
import { taskStore } from "@/store/task";
export interface IAppStore {
  authStore: ReturnType<typeof authStore>;
  boardStore: ReturnType<typeof boardStore>;
  taskStore: ReturnType<typeof taskStore>;
}

const appStore: IAppStore = {} as IAppStore;
/**
 * 注册app状态库
 */
export const registerStore = () => {
  appStore.authStore = authStore();
  appStore.boardStore = boardStore();
  appStore.taskStore = taskStore();
};

export default appStore;
