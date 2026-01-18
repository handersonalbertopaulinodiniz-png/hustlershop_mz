import { initAuth, requireRole, signOut } from '../core/auth.js';
import { initTopbar } from '../components/topbar.js';

export const initAdminPage = async () => {
    // Strict Admin Check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '../admin.html';
        return;
    }

    // Initialize Topbar
    initTopbar();

    // Setup Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
        });
    }

    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';

    // Add overlay styles dynamically if not present
    if (!document.getElementById('sidebar-overlay-style')) {
        const style = document.createElement('style');
        style.id = 'sidebar-overlay-style';
        style.textContent = `
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 40;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s;
            }
            .sidebar-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            @media (max-width: 1024px) {
                .sidebar.active {
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MZ', {
        style: 'currency',
        currency: 'MZN'
    }).format(amount);
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
