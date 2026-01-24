// Topbar Component
import { getCurrentUserProfile as getCurrentProfile } from '../core/auth-appwrite.js';
import { toggleTheme, getTheme } from '../core/theme-engine.js';
import { notificationsAPI } from '../core/api-appwrite.js';

class Topbar {
    constructor() {
        this.element = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.element = document.querySelector('.topbar');
        if (!this.element) return;

        // Setup theme toggle
        this.setupThemeToggle();

        // Setup notifications
        this.setupNotifications();

        // Setup user menu
        this.setupUserMenu();

        // Setup search
        this.setupSearch();

        // Update user info
        this.updateUserInfo();
    }

    setupThemeToggle() {
        const themeToggle = this.element.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            // Update icon based on current theme
            this.updateThemeIcon(themeToggle);

            // Subscribe to theme changes
            import('../core/theme-engine.js').then(({ onThemeChange }) => {
                onThemeChange(() => {
                    this.updateThemeIcon(themeToggle);
                });
            });
        }
    }

    updateThemeIcon(button) {
        const theme = getTheme();
        const icon = button.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    async setupNotifications() {
        const notifBtn = this.element.querySelector('[data-notifications-toggle]');
        const notifDropdown = this.element.querySelector('[data-notifications-dropdown]');

        if (!notifBtn || !notifDropdown) return;

        // Load notifications
        await this.loadNotifications();

        // Toggle dropdown
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.remove('open');
            }
        });
    }

    async loadNotifications() {
        const profile = getCurrentProfile();
        if (!profile) return;

        const result = await notificationsAPI.getByUser(profile.id);

        if (result.success) {
            this.notifications = result.data;
            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.renderNotifications();
            this.updateNotificationBadge();
        }
    }

    renderNotifications() {
        const container = this.element.querySelector('[data-notifications-list]');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
        <div class="empty-state" style="padding: var(--space-6);">
          <p class="text-secondary">No notifications</p>
        </div>
      `;
            return;
        }

        container.innerHTML = this.notifications.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" data-notification-id="${notif.id}">
        <div class="notification-content">
          <p class="notification-title">${notif.title}</p>
          <p class="notification-message">${notif.message}</p>
          <span class="notification-time">${this.formatTime(notif.created_at)}</span>
        </div>
        ${!notif.read ? '<span class="notification-dot"></span>' : ''}
      </div>
    `).join('');

        // Add click handlers
        container.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.notificationId;
                this.markAsRead(id);
            });
        });
    }

    async markAsRead(id) {
        await notificationsAPI.markAsRead(id);
        await this.loadNotifications();
    }

    updateNotificationBadge() {
        const badge = this.element.querySelector('[data-notification-badge]');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    }

    setupUserMenu() {
        const userBtn = this.element.querySelector('[data-user-menu-toggle]');
        const userDropdown = this.element.querySelector('[data-user-menu-dropdown]');

        if (!userBtn || !userDropdown) return;

        // Toggle dropdown
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
                userDropdown.classList.remove('open');
            }
        });
    }

    setupSearch() {
        const searchInput = this.element.querySelector('[data-search-input]');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);

            const query = e.target.value.trim();

            if (query.length < 2) return;

            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });
    }

    async performSearch(query) {
        // Implement search logic here
        console.log('Searching for:', query);
        // This would typically call a search API
    }

    updateUserInfo() {
        const profile = getCurrentProfile();
        if (!profile) return;

        const userName = this.element.querySelector('[data-user-name]');
        const userAvatar = this.element.querySelector('[data-user-avatar]');
        const userRole = this.element.querySelector('[data-user-role]');

        if (userName) userName.textContent = profile.full_name;
        if (userRole) userRole.textContent = profile.role;
        if (userAvatar) {
            if (profile.avatar_url) {
                userAvatar.src = profile.avatar_url;
            } else {
                // Show initials
                const initials = profile.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                userAvatar.textContent = initials;
            }
        }
    }
}

// Inject topbar styles
const injectStyles = () => {
    if (document.getElementById('topbar-styles')) return;

    const style = document.createElement('style');
    style.id = 'topbar-styles';
    style.textContent = `
    .notification-item {
      padding: var(--space-4);
      border-bottom: 1px solid var(--border-light);
      cursor: pointer;
      transition: background var(--transition-fast);
      position: relative;
    }
    
    .notification-item:hover {
      background: var(--bg-tertiary);
    }
    
    .notification-item.unread {
      background: var(--primary-50);
    }
    
    [data-theme="dark"] .notification-item.unread {
      background: rgba(100, 150, 255, 0.05);
    }
    
    .notification-title {
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }
    
    .notification-message {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: var(--space-1);
    }
    
    .notification-time {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }
    
    .notification-dot {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      width: 8px;
      height: 8px;
      background: var(--primary-500);
      border-radius: var(--radius-full);
    }
    
    [data-notification-badge] {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 20px;
      height: 20px;
      padding: 0 var(--space-1);
      background: var(--error);
      color: var(--text-inverse);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

    document.head.appendChild(style);
};

// Initialize
let topbarInstance = null;

export const initTopbar = () => {
    if (!topbarInstance) {
        injectStyles();
        topbarInstance = new Topbar();
    }
    return topbarInstance;
};

export const getTopbar = () => topbarInstance;

// Auto-initialize if topbar exists
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector('.topbar')) {
                initTopbar();
            }
        });
    } else {
        if (document.querySelector('.topbar')) {
            initTopbar();
        }
    }
}

export default Topbar;
