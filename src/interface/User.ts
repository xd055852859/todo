export interface Person {
  userAvatar: string;
  userName: string;
  _key: string;
}
export interface User extends Person {
  email?: string;
  mobile?: string;
  beans?: number;
  online?: boolean;
  added?: boolean;
  unReadNum?: number;
  createScore?: number;
  finishScore?: number;
  defaultBoard?: string;
}
export interface Member extends Person {
  role: number;
  added?: boolean;
  online?: boolean;
}
export interface Mate extends Person {
  added: true;
  boardNum: number;
  todoNum: number;
  partnerNum: number;
  shareBeans: number;
  totalBeans: number;
  viewNum: number;
  historyShareBeans: number;
  historyTotalBeans: number;
  yShareBeans: number;
  yTotalBeans: number;
  beans: number;
  online?: boolean;
  todayCreate:number;
  todayClose:number;
}
