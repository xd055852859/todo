import { User } from "@/interface/User";

export interface Task {
  _key: string;
  title: string;
  detail?: string;
  imageList?: string[];
  mark: string;
  executorInfo: User;
  creatorInfo?: User;
  hasRead: number;
  hasImage?: boolean;
  hasDetail?: boolean;
  createTime: number;
  boardInfo?: {
    _key: string;
    title: string;
  };
  finishTime?: null | number;
  hasFinished?: number;
  scoreIcon?: number;
  sortTime?: number;
  role: number;
}
