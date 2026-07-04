/**
 * 轻量级路由进度条
 * 替代 @bprogress/core，零依赖，仅 ~30 行代码
 */

let progressEl: HTMLDivElement | null = null
let timer: ReturnType<typeof setInterval> | null = null
let opacityTimer: ReturnType<typeof setTimeout> | null = null

function ensureEl(): HTMLDivElement {
  if (!progressEl) {
    progressEl = document.createElement('div')
    progressEl.id = 'route-progress-bar'
    progressEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0;
      background: #2f3137;
      z-index: 9999;
      opacity: 0;
      transition: width 0.2s ease, opacity 0.3s ease;
      pointer-events: none;
      box-shadow: 0 0 4px rgba(47, 49, 55, 0.4);
    `
    document.body.appendChild(progressEl)

    // 注入 CSS（确保只注入一次）
    if (!document.getElementById('route-progress-style')) {
      const style = document.createElement('style')
      style.id = 'route-progress-style'
      document.head.appendChild(style)
    }
  }
  return progressEl
}

export function startProgress() {
  const el = ensureEl()

  // 清除之前的定时器
  if (timer) { clearInterval(timer); timer = null }
  if (opacityTimer) { clearTimeout(opacityTimer); opacityTimer = null }

  el.style.opacity = '1'
  el.style.width = '0%'

  // 模拟进度递增（快速到 80% 后放缓）
  let width = 0
  timer = setInterval(() => {
    if (width < 80) {
      width += Math.random() * 15
      if (width > 80) width = 80
      el.style.width = `${width}%`
    }
  }, 200)
}

export function doneProgress() {
  const el = ensureEl()

  if (timer) { clearInterval(timer); timer = null }

  el.style.width = '100%'

  // 延迟淡出
  opacityTimer = setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => { if (progressEl) progressEl.style.width = '0%' }, 300)
  }, 150)
}
