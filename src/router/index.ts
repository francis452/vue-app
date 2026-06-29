import { createRouter, createWebHistory } from 'vue-router'
import NaiveUiTestView from '../views/NaiveUiTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/naive-ui-test',
    },
    {
      path: '/naive-ui-test',
      name: 'naive-ui-test',
      component: NaiveUiTestView,
    },
  ],
})

export default router
