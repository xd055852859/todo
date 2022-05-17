import { User } from "@/interface/User";

export interface Task {
  _key: string;
  title: string;
  mark: string;
  executorInfo: User;
  creatorInfo?: User;
  hasRead: number;
  createTime: number;
  boardInfo?: {
    _key: string;
    title: string;
  };
  finishTime?: null | number;
  hasFinished?: number;
  scoreIcon?:number
}
