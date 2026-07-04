import { createRouter, createWebHashHistory } from 'vue-router'
import { startProgress, doneProgress } from '@/utils/progress'
import routes from './root'

const baseUrl = import.meta.env.VITE_BASE_URL

const router = createRouter({
  history: createWebHashHistory(baseUrl),
  routes,
})

router.beforeEach((to, _from, next) => {
  startProgress()
  const title = to?.meta?.title
  if (title) {
    document.title = title as string
  }
  next()
})

router.afterEach(() => {
  doneProgress()
})

export default router
