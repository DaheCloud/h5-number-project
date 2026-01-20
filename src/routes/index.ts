import { createRouter, createWebHashHistory } from 'vue-router';
import { BProgress } from '@bprogress/core';
import routes from './root';

const baseUrl = import.meta.env.VITE_BASE_URL;

const router = createRouter({
  history: createWebHashHistory(baseUrl),
  routes,
})

router.beforeEach((to, from, next) => {
  BProgress.start();
  void from;
  const title = to?.meta?.title
  if (title) {
    document.title = title as string
  }
  next()
})
router.afterEach((to) => {
  void to;
  BProgress.done();
})
export default router;