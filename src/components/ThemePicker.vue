<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function selectTheme(themeId: string) {
  themeStore.setTheme(themeId)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="theme-modal">
      <div v-if="open" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="handleClose">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <!-- Modal -->
        <div class="relative bg-base-100 border border-base-300 rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-base-200">
            <h3 class="text-base font-bold text-base-content">主题设置</h3>
            <button class="btn btn-text btn-circle btn-sm" @click="handleClose" aria-label="关闭">
              <span class="icon-[tabler--x] size-5"></span>
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-3">
            <div
              v-for="preset in themeStore.presets"
              :key="preset.id"
              class="theme-card group cursor-pointer rounded-xl border-2 p-4 transition-all"
              :class="themeStore.currentThemeId === preset.id
                ? 'border-primary bg-primary/5'
                : 'border-base-300 hover:border-base-300'"
              @click="selectTheme(preset.id)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-semibold text-base-content">{{ preset.name }}</h4>
                    <span v-if="themeStore.currentThemeId === preset.id" class="badge badge-primary badge-sm">当前</span>
                  </div>
                  <p class="text-xs text-secondary mt-1 leading-relaxed">{{ preset.description }}</p>
                </div>
                <!-- 色板预览 -->
                <div class="flex gap-1.5 ml-3 shrink-0">
                  <span class="w-6 h-6 rounded-full border border-base-300" :style="{ backgroundColor: preset.vars['--color-primary'] }" title="主色" />
                  <span class="w-6 h-6 rounded-full border border-base-300" :style="{ backgroundColor: preset.vars['--color-error'] }" title="红波" />
                  <span class="w-6 h-6 rounded-full border border-base-300" :style="{ backgroundColor: preset.vars['--color-success'] }" title="绿波" />
                  <span class="w-6 h-6 rounded-full border border-base-300" :style="{ backgroundColor: preset.vars['--color-info'] }" title="蓝波" />
                </div>
              </div>
              <!-- 背景色预览条 -->
              <div class="mt-3 h-8 rounded-lg border border-base-300 flex items-center px-3 gap-2" :style="{ backgroundColor: preset.pageBg }">
                <span class="text-[10px] font-medium" :style="{ color: preset.vars['--color-base-content'] }">Aa</span>
                <span class="text-[10px]" :style="{ color: preset.vars['--color-secondary'] }">次要文字</span>
                <span class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium" :style="{ backgroundColor: preset.vars['--color-primary'], color: preset.vars['--color-primary-content'] }">按钮</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-4 border-t border-base-200">
            <button class="btn btn-primary w-full" @click="handleClose">
              <span class="icon-[tabler--check] size-4"></span>
              完成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.theme-modal-enter-active,
.theme-modal-leave-active {
  transition: opacity 0.2s ease;
}
.theme-modal-enter-from,
.theme-modal-leave-to {
  opacity: 0;
}
</style>
