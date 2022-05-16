export interface Person {
  userAvatar: string;
  userName: string;
}
export interface User extends Person {
  _key: string;
  email?: string;
  mobile?: string;
}
export interface Member extends Person {
  _key: string;
  role: number;
  added?: boolean;
}
export interface Mate extends Person {
  added: true;
  boardNum: number;
  partnerNum: number;
  shareBeans: number;
  totalBeans: number;
  viewNum: number;
  yShareBeans: number;
  yTotalBeans: number;
  beans: number;
}
