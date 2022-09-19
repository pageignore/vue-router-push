import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
const routes = [{
  path: '/',
  name: 'home',
  component: HomeView
}, {
  path: '/about',
  name: 'about',
  // route level code-splitting
  // this generates a separate chunk (About.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  component: () => import('../views/AboutView.vue'),
  children: [{
    // 当 /user/:id/profile 匹配成功
    // UserProfile 将被渲染到 User 的 <router-view> 内部
    path: 'profile',
    component: () => import('../views/AboutView2.vue'),
    children: [{
      // 当 /user/:id/profile 匹配成功
      // UserProfile 将被渲染到 User 的 <router-view> 内部
      path: 'p3',
      component: () => import('../views/AboutView3.vue')
    }]
  }]
}];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});
export default router;