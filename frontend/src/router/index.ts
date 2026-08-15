import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    // 前台路由统一挂载到 DefaultLayout，header/footer 常驻不随页面切换重建
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/pages/index.vue') },
      { path: 'blog', name: 'blog', component: () => import('@/pages/blog/index.vue') },
      { path: 'blog/:slug', name: 'blog-detail', component: () => import('@/pages/blog/[slug].vue') },
      { path: 'animes', name: 'animes', component: () => import('@/pages/animes/index.vue') },
      { path: 'projects', name: 'projects', component: () => import('@/pages/projects/index.vue') },
      { path: 'about', name: 'about', component: () => import('@/pages/about.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/index.vue') },
      { path: 'posts', name: 'admin-posts', component: () => import('@/pages/admin/posts/index.vue') },
      {
        path: 'posts/create',
        name: 'admin-posts-create',
        component: () => import('@/pages/admin/posts/create.vue'),
      },
      {
        path: 'posts/:id',
        name: 'admin-posts-edit',
        component: () => import('@/pages/admin/posts/[id].vue'),
      },
      {
        path: 'animes',
        name: 'admin-animes',
        component: () => import('@/pages/admin/animes/index.vue'),
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: () => import('@/pages/admin/projects/index.vue'),
      },
    ],
  },
  // 复刻 redirect-login：/login 重定向到 /
  { path: '/login', redirect: '/' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// 全局守卫：后台路由若未登录，交由 AdminLayout 弹登录框（不强制跳转，复刻现有体验）
router.beforeEach(async (to) => {
  if (to.path.startsWith('/admin')) {
    const auth = useAuthStore();
    // 若有 token 但未取过用户信息，尝试恢复
    if (auth.token && !auth.user) {
      await auth.fetchMe();
    }
  }
  return true;
});

export default router;
