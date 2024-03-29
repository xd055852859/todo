import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "welcome",
    component: () => import("@/views/welcome.vue"),
    children: [],
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/home.vue"),
    redirect: "/home/list",
    children: [
      {
        path: "list",
        name: "list",
        component: () => import("@/views/list.vue"),
        children: [],
      },
      {
        path: "board",
        name: "board",
        component: () => import("@/views/board.vue"),
        children: [],
      },
      {
        path: "createBoard",
        name: "createBoard",
        component: () => import("@/views/createBoard.vue"),
        children: [],
      },

      {
        path: "send",
        name: "send",
        component: () => import("@/views/send.vue"),
        children: [],
      },

      {
        path: "mate/:id",
        name: "mate",
        component: () => import("@/views/mate.vue"),
        children: [],
      },
      {
        path: "partner",
        name: "partner",
        component: () => import("@/views/partner.vue"),
        children: [],
      },
      {
        path: "matesMate/:id",
        name: "matesMate",
        component: () => import("@/views/matesMate.vue"),
        props: true,
        children: [],
      },
      {
        path: "matesBoard/:id",
        name: "matesBoard",
        component: () => import("@/views/matesBoard.vue"),
        props: true,
        children: [],
      },
      {
        path: "invite",
        name: "invite",
        component: () => import("@/views/invite.vue"),
        children: [],
      },
      {
        path: "inviteOut",
        name: "inviteOut",
        component: () => import("@/views/inviteOut.vue"),
        children: [],
      },
      {
        path: "notice",
        name: "notice",
        component: () => import("@/views/notice.vue"),
        children: [],
      },
    ],
  },
  {
    path: "/manage/:id",
    name: "manage",
    component: () => import("@/views/manage.vue"),
    children: [],
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/views/test.vue"),
    children: [],
  },
  {
    path: "/history/:id",
    name: "history",
    component: () => import("@/views/history.vue"),
    props: true,
    children: [],
  },
  {
    path: "/rank",
    name: "rank",
    component: () => import("@/views/rank.vue"),
    children: [],
  },
  // {
  //   path: "/chart",
  //   name: "chart",
  //   component: () => import("@/views/chart.vue"),
  //   children: [],
  // },
];
const routerHistory = createWebHashHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});
//全局前置守卫
// router.beforeEach((to, from, next) => {
//   const { user, token } = store.state;
//   const { redirectAlreadyLogin, requiredLogin } = to.meta;
//   if (!user.isLogin) {
//     if (token) {
//       next("/");
//     } else {
//         next("login");
//     }
//     // } else if (redirectAlreadyLogin) {
//     //   next("/");
//   } else {
//     next();
//   }
// });
// 全局导航守卫
export default router;
