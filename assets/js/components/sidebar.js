// Sidebar Component
import { getCurrentUserProfile as getCurrentProfile, signOut } from '../core/auth-appwrite.js';
import { router } from '../core/router.js';

class Sidebar {
    constructor() {
        this.element = null;
        this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.init();
    }

    init() {
        this.element = document.querySelector('.sidebar');
        if (!this.element) return;

        // Apply collapsed state
        if (this.isCollapsed) {
            this.element.classList.add('collapsed');
        }

        // Setup toggle button
        this.setupToggle();

        // Setup navigation
        this.setupNavigation();

        // Setup mobile overlay
        this.setupMobileOverlay();

        // Highlight active link
        this.highlightActiveLink();
    }

    setupToggle() {
        const toggleBtn = document.querySelector('[data-sidebar-toggle]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;
        this.element.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    }

    collapse() {
        this.isCollapsed = true;
        this.element.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
    }

    expand() {
        this.isCollapsed = false;
        this.element.classList.remove('collapsed');
        localStorage.setItem('sidebarCollapsed', 'false');
    }

    setupNavigation() {
        const navLinks = this.element.querySelectorAll('.sidebar-nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Handle logout
                if (link.hasAttribute('data-logout')) {
                    e.preventDefault();
                    this.handleLogout();
                    return;
                }

                // Handle regular navigation
                if (href && !href.startsWith('#')) {
                    e.preventDefault();
                    router.navigate(href);
                    this.highlightActiveLink();

                    // Close sidebar on mobile
                    if (window.innerWidth < 1024) {
                        this.closeMobile();
                    }
                }
            });
        });
    }

    async handleLogout() {
        const confirmed = confirm('Are you sure you want to sign out?');
        if (confirmed) {
            await signOut();
        }
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = this.element.querySelectorAll('.sidebar-nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    setupMobileOverlay() {
        // Create overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        // Close sidebar when overlay is clicked
        overlay.addEventListener('click', () => this.closeMobile());

        // Mobile menu button
        const mobileMenuBtn = document.querySelector('[data-mobile-menu]');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.openMobile());
        }
    }

    openMobile() {
        this.element.classList.add('open');
        document.querySelector('.sidebar-overlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobile() {
        this.element.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateUserInfo() {
        const profile = getCurrentProfile();
        if (!profile) return;

        const userNameEl = this.element.querySelector('[data-user-name]');
        const userEmailEl = this.element.querySelector('[data-user-email]');
        const userAvatarEl = this.element.querySelector('[data-user-avatar]');

        if (userNameEl) userNameEl.textContent = profile.full_name;
        if (userEmailEl) userEmailEl.textContent = profile.email;
        if (userAvatarEl && profile.avatar_url) {
            userAvatarEl.src = profile.avatar_url;
        }
    }
}

// Inject sidebar overlay styles
const injectStyles = () => {
    if (document.getElementById('sidebar-styles')) return;

    const style = document.createElement('style');
    style.id = 'sidebar-styles';
    style.textContent = `
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: var(--overlay);
      z-index: calc(var(--z-fixed) - 1);
      opacity: 0;
      transition: opacity var(--transition-base);
    }
    
    .sidebar-overlay.active {
      display: block;
      opacity: 1;
    }
    
    .sidebar-nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      cursor: pointer;
      text-decoration: none;
      margin-bottom: var(--space-2);
    }
    
    .sidebar-nav-link:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .sidebar-nav-link.active {
      background: var(--primary-100);
      color: var(--primary-700);
      font-weight: var(--font-medium);
    }
    
    [data-theme="dark"] .sidebar-nav-link.active {
      background: rgba(100, 150, 255, 0.15);
      color: var(--primary-400);
    }
    
    .sidebar-nav-link-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    
    .sidebar-nav-link-text {
      flex: 1;
    }
    
    .sidebar.collapsed .sidebar-nav-link-text {
      display: none;
    }
    
    .sidebar.collapsed .sidebar-nav-link {
      justify-content: center;
    }
    
    @media (max-width: 1024px) {
      .sidebar.collapsed .sidebar-nav-link-text {
        display: block;
      }
      
      .sidebar.collapsed .sidebar-nav-link {
        justify-content: flex-start;
      }
    }
  `;

    document.head.appendChild(style);
};

// Initialize
let sidebarInstance = null;

export const initSidebar = () => {
    if (!sidebarInstance) {
        injectStyles();
        sidebarInstance = new Sidebar();
    }
    return sidebarInstance;
};

export const getSidebar = () => sidebarInstance;

// Auto-initialize if sidebar exists
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.querySelector('.sidebar')) {
                initSidebar();
            }
        });
    } else {
        if (document.querySelector('.sidebar')) {
            initSidebar();
        }
    }
}

export default Sidebar;
