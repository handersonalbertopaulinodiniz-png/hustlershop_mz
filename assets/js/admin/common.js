import { initAuth, requireRole, signOut } from '../core/auth.js';
import { initTopbar } from '../components/topbar.js';
import { usersAPI } from '../core/api.js';

export const initAdminPage = async () => {
    // Strict Admin Check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '../admin.html';
        return;
    }

    // Initialize Topbar
    initTopbar();

    // Update Profile Info
    updateAdminProfile();

    // Update Badge
    updateApprovalsBadge();

    // Setup Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
        });
    }

    // Mobile Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Create overlay if not present
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

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
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                z-index: 900;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .sidebar-overlay.active {
                opacity: 1;
                visibility: visible;
            }
        `;
        document.head.appendChild(style);
    }

    const toggleSidebar = () => {
        const isActive = sidebar.classList.toggle('active');
        overlay.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    };

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        overlay.addEventListener('click', closeSidebar);

        // Close sidebar on window resize if screen becomes large
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeSidebar();
            }
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
    return new Date(dateString).toLocaleDateString('pt-MZ', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

async function updateAdminProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const nameEl = document.querySelector('.user-name');
    const avatarImg = document.querySelector('.user-avatar img');

    if (nameEl) nameEl.textContent = user.full_name || 'Administrador';
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'Admin')}&background=000&color=fff`;
    }
}

async function updateApprovalsBadge() {
    try {
        const { count, error } = await usersAPI.count({
            filters: { approval_status: 'pending' }
        });

        if (error) throw error;

        const badge = document.getElementById('approvals-badge');
        if (badge) {
            badge.textContent = count || 0;
            badge.classList.toggle('hidden', count === 0);
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}
