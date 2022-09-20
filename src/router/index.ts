import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
const routess = [{
  path: '/',
  name: 'home',
  component: HomeView
}, {
  path: '/about',
  name: 'about',
  component: () => import('../views/AboutView.vue'),
  children: [{
    path: 'profile',
    component: () => import('../views/AboutView2.vue'),
    children: [{
      path: 'p3',
      component: () => import('../views/AboutView3.vue')
    }]
  }]
}];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routess
});
export default router;