/**
 * 轻量级 Toast / Dialog 工具
 * 基于 FlyonUI Alert 样式自建，不依赖第三方 UI 库
 */

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let toastContainer: HTMLDivElement | null = null;

function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'mini-toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const typeIcons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

export function toast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const container = getToastContainer();

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  // 清除旧 toast（最多保留1个）
  const existingEls = container.querySelectorAll('.mini-toast-item');
  existingEls.forEach((el) => el.remove());

  const el = document.createElement('div');
  el.className = `mini-toast-item mini-toast mini-toast--${type}`;
  el.innerHTML = `<span class="mini-toast__icon">${typeIcons[type] || typeIcons.info}</span><span class="mini-toast__msg">${msg}</span>`;
  container.appendChild(el);

  toastTimer = setTimeout(() => {
    el.classList.add('mini-toast--leave');
    setTimeout(() => el.remove(), 220);
    toastTimer = null;
  }, 1800);

  // 注入样式（仅一次）
  if (!document.getElementById('mini-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'mini-toast-styles';
    style.textContent = `
      .mini-toast-container {
        position: fixed;
        top: 56px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 6px;
        pointer-events: none;
      }
      .mini-toast {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        background: color-mix(in srgb, var(--color-base-100) 92%, transparent);
        color: var(--color-base-content);
        border: 1px solid var(--color-base-300);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(12px);
        pointer-events: auto;
        animation: mini-toast-in 0.2s ease-out;
        white-space: nowrap;
        max-width: 80vw;
      }
      .mini-toast--leave {
        animation: mini-toast-out 0.2s ease-in forwards;
      }
      .mini-toast__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .mini-toast__msg {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* 类型色 */
      .mini-toast--success { color: var(--color-success-content, #fff); }
      .mini-toast--success .mini-toast__icon { background: var(--color-success); color: var(--color-success-content, #fff); }
      .mini-toast--error { color: var(--color-error-content, #fff); }
      .mini-toast--error .mini-toast__icon { background: var(--color-error); color: var(--color-error-content, #fff); }
      .mini-toast--warning .mini-toast__icon { background: var(--color-warning); color: var(--color-warning-content, #0f0f10); }
      .mini-toast--info .mini-toast__icon { background: var(--color-info); color: var(--color-info-content, #fff); }

      @keyframes mini-toast-in {
        from { opacity: 0; transform: translateY(-6px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes mini-toast-out {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to   { opacity: 0; transform: translateY(-6px) scale(0.96); }
      }
    `;
    document.head.appendChild(style);
  }
}

export function dialog(options: { title?: string; message: string; confirmText?: string; cancelText?: string; showCancel?: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay modal overlay-open:opacity-100';
    overlay.setAttribute('role', 'dialog');
    overlay.tabIndex = -1;

    overlay.innerHTML = `
      <div class="modal-dialog modal-dialog-centered max-w-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${options.title || '提示'}</h3>
          </div>
          <div class="modal-body">
            <p class="text-base-content/80">${options.message}</p>
          </div>
          <div class="modal-footer">
            ${options.showCancel !== false ? `<button type="button" class="btn btn-soft btn-secondary" id="dialog-cancel">${options.cancelText || '取消'}</button>` : ''}
            <button type="button" class="btn btn-primary" id="dialog-confirm">${options.confirmText || '确定'}</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.classList.remove('hidden');

    overlay.querySelector('#dialog-confirm')?.addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
    overlay.querySelector('#dialog-cancel')?.addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        resolve(false);
      }
    });
  });
}

export { dialog as confirmDialog }
