<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ThemePicker from '@/components/ThemePicker.vue'

const route = useRoute()
const themeStore = useThemeStore()
const showThemePicker = ref(false)

const tabs = [
  { path: '/home', icon: 'icon-[tabler--home]', label: '首页' },
  { path: '/num-chose', icon: 'icon-[tabler--apps]', label: '选号' },
  { path: '/filter-center', icon: 'icon-[tabler--list]', label: '筛选' },
  { path: '/filter-numbers', icon: 'icon-[tabler--chart-line]', label: '分析' },
]

function isActive(path: string) {
  return route.path === path
}

onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <div class="flex flex-col min-h-screen" :style="{ backgroundColor: themeStore.currentTheme.pageBg }">
    <!-- 右上角设置按钮 -->
    <button
      class="fixed top-2.5 right-2.5 z-[100] w-7 h-7 rounded-full bg-base-100 border border-base-300 shadow-sm flex items-center justify-center transition-transform active:scale-90"
      @click="showThemePicker = true"
      aria-label="主题设置"
    >
      <span class="icon-[tabler--palette] size-4 text-base-content"></span>
    </button>

    <main class="flex-1 w-full max-w-[768px] mx-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <RouterView />
    </main>

    <!-- 自定义底部 Tabbar -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 rounded-t-2xl shadow-[0_-6px_14px_rgba(0,0,0,0.3)]"
         style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="flex items-center justify-around h-16 max-w-[768px] mx-auto">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          replace
          class="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors focus:outline-none"
          :class="isActive(tab.path) ? 'text-primary' : 'text-secondary'"
        >
          <span
            class="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            :class="isActive(tab.path) ? 'bg-primary text-primary-content' : 'bg-transparent'"
          >
            <span :class="[tab.icon, 'size-5']"></span>
          </span>
          <span class="text-[10px] leading-none" :class="isActive(tab.path) ? 'font-semibold' : ''">{{ tab.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <!-- 主题选择 Modal -->
    <ThemePicker :open="showThemePicker" @close="showThemePicker = false" />
  </div>
</template>
