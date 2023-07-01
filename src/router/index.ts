import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/blackhole',
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    children: [
      {
        path: 'blackhole',
        name: 'blackhole',
        meta: { title: '首页' },
        component: () => import('@/blackhole/Index.vue'),
      },
    ],
  },
  // {
  //   path: '/blackhole',
  //   name: 'blackhole',
  //   meta: { title: '首页' },
  //   component: () => import('@/blackhole/Index.vue'),
  // },
  {
    path: '/spacetime',
    name: 'spacetime',
    component: () => import('@/views/spacetime.vue'),
  },

  {
    path: '/loading',
    name: 'loading',
    component: () => import('@/components/common/Loading.vue'),
  },
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

router.afterEach(() => {
  // console.log('路由切花');
});
export default router;
