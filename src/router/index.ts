import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/Index',
  },

  // {
  //   path: '/Hello',
  //   name: 'Hello',
  //   component: () => import('@/components/Hello.vue'),
  // },
  // {
  //   path: '/HelloWorld',
  //   name: 'HelloWorld',
  //   component: () => import('@/components/HelloWorld.vue'),
  // },
  // {
  //     path: '/Index',
  //     name: 'Index',
  //     component: () => import('@/components/other/PointsBillboards.vue')
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.path !== '/favicon.icon') {
    document.title = to.meta.title ? (to.meta.title as string) : '';
    next();
  }
});

export default router;
