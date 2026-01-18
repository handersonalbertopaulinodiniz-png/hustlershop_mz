// Toast Notification Component

class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.element = null;
        this.timeoutId = null;
        this.create();
    }

    create() {
        // Create toast element
        this.element = document.createElement('div');
        this.element.className = `toast toast-${this.type} toast-enter`;

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const icon = icons[this.type] || icons.info;

        // Build toast HTML
        this.element.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${this.message}</div>
      <button class="toast-close" aria-label="Close">✕</button>
    `;

        // Add close button listener
        const closeBtn = this.element.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove());

        // Add to container
        this.show();
    }

    show() {
        // Get or create toast container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Add toast to container
        container.appendChild(this.element);

        // Trigger animation
        setTimeout(() => {
            this.element.classList.remove('toast-enter');
        }, 10);

        // Auto remove after duration
        if (this.duration > 0) {
            this.timeoutId = setTimeout(() => {
                this.remove();
            }, this.duration);
        }
    }

    remove() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.element.classList.add('toast-exit');

        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            // Remove container if empty
            const container = document.getElementById('toast-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 200);
    }
}

// Show toast function
export const showToast = (message, type = 'info', duration = 3000) => {
    return new Toast(message, type, duration);
};

// Inject toast styles
const injectStyles = () => {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
    .toast-container {
      position: fixed;
      top: var(--space-6);
      right: var(--space-6);
      z-index: var(--z-tooltip);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 400px;
      pointer-events: none;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      border-left: 4px solid;
      pointer-events: auto;
      min-width: 300px;
    }
    
    .toast-success {
      border-left-color: var(--success);
    }
    
    .toast-error {
      border-left-color: var(--error);
    }
    
    .toast-warning {
      border-left-color: var(--warning);
    }
    
    .toast-info {
      border-left-color: var(--info);
    }
    
    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
      font-size: var(--text-lg);
    }
    
    .toast-success .toast-icon {
      color: var(--success);
    }
    
    .toast-error .toast-icon {
      color: var(--error);
    }
    
    .toast-warning .toast-icon {
      color: var(--warning);
    }
    
    .toast-info .toast-icon {
      color: var(--info);
    }
    
    .toast-message {
      flex: 1;
      font-size: var(--text-sm);
      color: var(--text-primary);
      line-height: var(--line-normal);
    }
    
    .toast-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      font-size: var(--text-lg);
      padding: 0;
    }
    
    .toast-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
      .toast-container {
        top: var(--space-4);
        right: var(--space-4);
        left: var(--space-4);
        max-width: none;
      }
      
      .toast {
        min-width: auto;
      }
    }
  `;

    document.head.appendChild(style);
};

// Initialize styles
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }
}

export default showToast;
