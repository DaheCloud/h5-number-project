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
    id: 'midnight-graphite',
    name: '午夜石墨风',
    description: '极深石墨黑底 + 冷青色高亮，高对比度夜间专注模式',
    pageBg: '#0f0f10',
    vars: {
      '--color-base-100': '#1a1a1c',          /* 卡片/容器深底 */
      '--color-base-200': '#262626',          /* 次背景/炭灰 */
      '--color-base-300': '#333335',          /* 常规描边 */
      '--color-base-content': '#ffffff',      /* 正文（纯白高对比） */
      '--color-primary': '#4dd0e1',           /* 主色：冷青色（导航/按钮点亮） */
      '--color-primary-content': '#0f0f10',   /* 冷青上配深字 */
      '--color-accent': '#4dd0e1',            /* 强调色：冷青 */
      '--color-accent-content': '#0f0f10',
      '--color-secondary': '#808080',         /* 次要色：低亮灰（未选中导航） */
      '--color-secondary-content': '#ffffff',
      '--color-neutral': '#262626',           /* 中性色：炭灰（按钮底） */
      '--color-neutral-content': '#4dd0e1',   /* 炭灰上配冷青文字 */
      /* 波色：红波=深红宝石 / 绿波=深青绿 / 蓝波=深海蓝（三色独立可辨） */
      '--color-success': '#00897b',           /* 绿波：深青绿 */
      '--color-success-content': '#ffffff',
      '--color-info': '#1565c0',              /* 蓝波：深海蓝 */
      '--color-info-content': '#ffffff',
      '--color-warning': '#ffa726',
      '--color-warning-content': '#0f0f10',
      '--color-error': '#b71c1c',             /* 红波：深红宝石 */
      '--color-error-content': '#ffffff',
    },
  },
  {
    id: 'linear-zinc',
    name: '极简墨黑风',
    description: 'Zinc 锌灰炭黑渐进层级，Linear 暗黑模式，克制聚焦',
    pageBg: '#09090b',
    vars: {
      '--color-base-100': '#18181b',          /* Zinc-900 卡片/数字球面板底 */
      '--color-base-200': '#27272a',          /* Zinc-800 导航选中/过滤器按钮底 */
      '--color-base-300': '#3f3f46',          /* Zinc-700 常规描边 */
      '--color-base-content': '#fafafa',      /* Zinc-50 正文（纯白高亮） */
      '--color-primary': '#fafafa',           /* 主色：Zinc-50 纯白反色（选中态色块） */
      '--color-primary-content': '#09090b',   /* 纯白上配黑字 */
      '--color-accent': '#fafafa',            /* 强调色：纯白 */
      '--color-accent-content': '#09090b',
      '--color-secondary': '#71717a',         /* Zinc-500 烟灰（未选导航/辅助文本） */
      '--color-secondary-content': '#fafafa',
      '--color-neutral': '#27272a',           /* Zinc-800 暗色按钮底 */
      '--color-neutral-content': '#fafafa',
      /* 波色：高质感单色线条（暗灰底上穿透力强） */
      '--color-success': '#10b981',           /* Emerald-500 翡翠绿 */
      '--color-success-content': '#ffffff',
      '--color-info': '#0ea5e9',              /* Sky-500 晴空蓝 */
      '--color-info-content': '#ffffff',
      '--color-warning': '#f59e0b',
      '--color-warning-content': '#09090b',
      '--color-error': '#f43f5e',             /* Rose-500 玫瑰深红 */
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
  {
    id: 'vercel-slate',
    name: '科技板岩灰风',
    description: '冷调蓝灰底 + 冰蓝高亮，Vercel 风格冷峻科技感',
    pageBg: '#0b0f19',
    vars: {
      '--color-base-100': '#1e293b',          /* Slate-800 卡片/容器底 */
      '--color-base-200': '#334155',          /* Slate-700 导航选中底 */
      '--color-base-300': '#475569',          /* Slate-600 常规描边 */
      '--color-base-content': '#e0f2fe',      /* Sky-100 正文（亮天蓝） */
      '--color-primary': '#38bdf8',           /* Sky-400 主色：冰蓝（选中态色块） */
      '--color-primary-content': '#0b0f19',   /* 冰蓝上配深字 */
      '--color-accent': '#38bdf8',            /* 强调色：冰蓝 */
      '--color-accent-content': '#0b0f19',
      '--color-secondary': '#64748b',         /* Slate-500 雾霾蓝灰（未选导航/辅助文本） */
      '--color-secondary-content': '#e0f2fe',
      '--color-neutral': '#334155',           /* Slate-700 暗色按钮底 */
      '--color-neutral-content': '#e0f2fe',
      /* 波色：低饱和度处理，避免夜间光晕振动 */
      '--color-success': '#059669',           /* Emerald-600 薄荷绿 */
      '--color-success-content': '#ffffff',
      '--color-info': '#2563eb',              /* Blue-600 深海蓝 */
      '--color-info-content': '#ffffff',
      '--color-warning': '#d97706',
      '--color-warning-content': '#ffffff',
      '--color-error': '#e11d48',             /* Rose-600 珊瑚红 */
      '--color-error-content': '#ffffff',
    },
  },
]
