/**
 * 轻量级 Toast / Dialog 工具
 * 基于 FlyonUI Alert 样式自建，不依赖第三方 UI 库
 */

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let toastContainer: HTMLDivElement | null = null;

function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const typeStyles: Record<string, string> = {
  success: 'alert-soft-success',
  error: 'alert-soft-error',
  warning: 'alert-soft-warning',
  info: 'alert-soft-info',
};

export function toast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const container = getToastContainer();

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  // 清除旧 toast
  const existingEls = container.querySelectorAll('.toast-item');
  if (existingEls.length > 2) {
    existingEls[0].remove();
  }

  const el = document.createElement('div');
  el.className = `toast-item alert ${typeStyles[type] || 'alert-soft-info'} pointer-events-auto shadow-lg transition-all duration-300 translate-y-0 opacity-100 max-w-xs`;
  el.style.cssText = 'animation: toast-in 0.3s ease-out forwards;';
  el.innerHTML = `<span class="text-sm">${msg}</span>`;
  container.appendChild(el);

  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
    setTimeout(() => el.remove(), 300);
    toastTimer = null;
  }, 2500);

  // 注入动画
  if (!document.getElementById('toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'toast-keyframes';
    style.textContent = '@keyframes toast-in { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }';
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
