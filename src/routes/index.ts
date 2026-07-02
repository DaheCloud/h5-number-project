import { createRouter, createWebHashHistory } from 'vue-router';
import { BProgress } from '@bprogress/core';
import routes from './root';

const baseUrl = import.meta.env.VITE_BASE_URL;

const router = createRouter({
  history: createWebHashHistory(baseUrl),
  routes,
})

router.beforeEach((to, _from, next) => {
  BProgress.start();
  const title = to?.meta?.title
  if (title) {
    document.title = title as string
  }
  next()
})
router.afterEach((_to) => {
  BProgress.done();
})
export default router;