import { createRouter, createWebHistory } from 'vue-router'
import NaiveUiTestView from '../views/NaiveUiTestView.vue'
import DraggableListView from '../views/DraggableListView.vue'
import NSpinResearchView from '../views/NSpinResearchView.vue'
import NDataTableResearchView from '../views/NDataTableResearchView.vue'

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
    {
      path: '/draggable-list',
      name: 'draggable-list',
      component: DraggableListView,
    },
    {
      path: '/n-spin-research',
      name: 'n-spin-research',
      component: NSpinResearchView,
    },
    {
      path: '/n-data-table-research',
      name: 'n-data-table-research',
      component: NDataTableResearchView,
    },
    {
      path: '/full-screen-demo',
      name: 'full-screen-demo',
      component: () => import('@/views/full-screen-demo/FullScreenDemoHome.vue'),
    },
    {
      path: '/full-screen-demo/scale',
      name: 'full-screen-demo-scale',
      component: () => import('@/views/full-screen-demo/ScaleDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/rem',
      name: 'full-screen-demo-rem',
      component: () => import('@/views/full-screen-demo/RemDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/vwvh',
      name: 'full-screen-demo-vwvh',
      component: () => import('@/views/full-screen-demo/VwvhDemoView.vue'),
      meta: { hideAppHeader: true },
    },
    {
      path: '/full-screen-demo/hybrid',
      name: 'full-screen-demo-hybrid',
      component: () => import('@/views/full-screen-demo/HybridDemoView.vue'),
      meta: { hideAppHeader: true },
    },
  ],
})

export default router
