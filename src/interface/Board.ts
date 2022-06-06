import { User } from "@/interface/User";

export interface Board {
  _key: string;
  title: string;
  avatar: string | null;
  executorInfo: User;
  added?:boolean;
  applyed?:boolean
}
