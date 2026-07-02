<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { path: '/home', icon: 'icon-[tabler--home]', label: '首页' },
  { path: '/num-chose', icon: 'icon-[tabler--apps]', label: '选号' },
  { path: '/filter-center', icon: 'icon-[tabler--filter]', label: '筛选' },
  { path: '/filter-numbers', icon: 'icon-[tabler--search]', label: '分析' },
]

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#f7f8fa]">
    <main class="flex-1 pb-20">
      <RouterView />
    </main>

    <!-- 自定义底部 Tabbar -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-6px_14px_rgba(15,23,42,0.08)]"
         style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="flex items-center justify-around h-16">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          replace
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
          :class="isActive(tab.path) ? 'text-[#1f2533]' : 'text-[#8a90a0]'"
        >
          <span :class="[tab.icon, 'size-5']"></span>
          <span class="text-[10px] leading-none" :class="isActive(tab.path) ? 'font-semibold' : ''">{{ tab.label }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
