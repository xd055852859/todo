import { User } from "@/interface/User";

export interface Task {
  _key: string;
  title: string;
  mark: string;
  executorInfo: User;
  hasRead: number;
  createTime: number;
}
