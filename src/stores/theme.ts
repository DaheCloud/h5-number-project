import { defineStore } from 'pinia'
import { ref } from 'vue'
import { themePresets, type ThemePreset } from '@/config/themes'

const STORAGE_KEY = 'app-theme'

const DEFAULT_PRESET = themePresets[0] as ThemePreset

export const useThemeStore = defineStore('theme', () => {
  /** 当前主题 ID */
  const currentThemeId = ref<string>(DEFAULT_PRESET.id)

  /** 当前主题预设 */
  const currentTheme = ref<ThemePreset>(DEFAULT_PRESET)

  /** 所有可用预设 */
  const presets = themePresets

  /** 应用主题到 DOM */
  function applyTheme(preset: ThemePreset) {
    const root = document.documentElement
    // 设置 data-theme 属性（FlyonUI 需要）
    root.setAttribute('data-theme', 'light')
    // 覆盖 CSS 变量
    for (const [key, value] of Object.entries(preset.vars)) {
      root.style.setProperty(key, value)
    }
    // 页面底色
    root.style.setProperty('--page-bg', preset.pageBg)
    document.body.style.backgroundColor = preset.pageBg
  }

  /** 切换主题 */
  function setTheme(themeId: string) {
    const preset = themePresets.find(p => p.id === themeId)
    if (!preset) return
    currentThemeId.value = themeId
    currentTheme.value = preset
    applyTheme(preset)
    localStorage.setItem(STORAGE_KEY, themeId)
  }

  /** 从 localStorage 恢复 */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setTheme(saved)
    } else {
      applyTheme(DEFAULT_PRESET)
    }
  }

  return {
    currentThemeId,
    currentTheme,
    presets,
    setTheme,
    initTheme,
  }
})
