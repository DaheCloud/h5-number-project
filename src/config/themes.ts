/**
 * 主题预设配置
 * 每个预设包含完整的 FlyonUI 语义色变量
 */

export interface ThemePreset {
  id: string
  name: string
  description: string
  /** 页面底色（独立于 base-100） */
  pageBg: string
  /** FlyonUI 主题变量 */
  vars: Record<string, string>
}

export const themePresets: ThemePreset[] = [
  {
    id: 'soft-natural',
    name: '柔和自然风',
    description: '温暖深灰褐底 + 莫兰迪色系，低对比度，护眼舒适',
    pageBg: '#2d2a26',
    vars: {
      '--color-base-100': '#38332e',
      '--color-base-200': '#443e38',
      '--color-base-300': '#5a534b',
      '--color-base-content': '#eee5d8',
      '--color-primary': '#788a94',
      '--color-primary-content': '#ffffff',
      '--color-accent': '#788a94',
      '--color-accent-content': '#ffffff',
      '--color-secondary': '#d9d3c7',
      '--color-secondary-content': '#2d2a26',
      '--color-neutral': '#a99f92',
      '--color-neutral-content': '#2d2a26',
      '--color-success': '#8a947a',
      '--color-success-content': '#ffffff',
      '--color-info': '#708899',
      '--color-info-content': '#ffffff',
      '--color-warning': '#c8a86a',
      '--color-warning-content': '#ffffff',
      '--color-error': '#c88a81',
      '--color-error-content': '#ffffff',
    },
  },
  {
    id: 'cyber-neon',
    name: '赛博霓虹风',
    description: '极深蓝灰底 + 高饱和度霓虹色，充满活力和未来感',
    pageBg: '#101214',
    vars: {
      '--color-base-100': '#1a1d21',
      '--color-base-200': '#252830',
      '--color-base-300': '#3a3d44',
      '--color-base-content': '#ffffff',
      '--color-primary': '#9f7aea',
      '--color-primary-content': '#ffffff',
      '--color-accent': '#9f7aea',
      '--color-accent-content': '#ffffff',
      '--color-secondary': '#a0a0a0',
      '--color-secondary-content': '#ffffff',
      '--color-neutral': '#505050',
      '--color-neutral-content': '#ffffff',
      '--color-success': '#6bff6b',
      '--color-success-content': '#101214',
      '--color-info': '#6bffff',
      '--color-info-content': '#101214',
      '--color-warning': '#f59e0b',
      '--color-warning-content': '#ffffff',
      '--color-error': '#ff6b6b',
      '--color-error-content': '#ffffff',
    },
  },
  {
    id: 'emerald-light',
    name: '翠绿浅色风',
    description: '浅色背景 + 翠绿主色，清爽简洁',
    pageBg: '#f3f4f6',
    vars: {
      '--color-base-100': '#ffffff',
      '--color-base-200': '#f8fafc',
      '--color-base-300': '#e5e7eb',
      '--color-base-content': '#1f2937',
      '--color-primary': '#10b981',
      '--color-primary-content': '#ffffff',
      '--color-accent': '#10b981',
      '--color-accent-content': '#ffffff',
      '--color-secondary': '#6b7280',
      '--color-secondary-content': '#ffffff',
      '--color-neutral': '#1f2937',
      '--color-neutral-content': '#ffffff',
      '--color-success': '#10b981',
      '--color-success-content': '#ffffff',
      '--color-info': '#3b82f6',
      '--color-info-content': '#ffffff',
      '--color-warning': '#f59e0b',
      '--color-warning-content': '#ffffff',
      '--color-error': '#ef4444',
      '--color-error-content': '#ffffff',
    },
  },
]
