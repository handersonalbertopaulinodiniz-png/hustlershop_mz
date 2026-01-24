// Mobile Menu Handler
class MobileMenu {
    constructor() {
        this.sidebar = null;
        this.menuBtn = null;
        this.overlay = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMenu());
        } else {
            this.setupMenu();
        }
    }
    
    setupMenu() {
        // Find existing elements or create them
        this.sidebar = document.querySelector('.sidebar');
        this.createMenuButton();
        this.createOverlay();
        
        if (this.sidebar && this.menuBtn && this.overlay) {
            this.attachEventListeners();
            this.updateForScreenSize();
            
            // Listen for resize events
            window.addEventListener('resize', () => this.updateForScreenSize());
        }
    }
    
    createMenuButton() {
        // Check if button already exists
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!this.menuBtn) {
            // Find the topbar
            const topbar = document.querySelector('.topbar');
            if (topbar) {
                const topbarLeft = topbar.querySelector('.topbar-left');
                if (topbarLeft) {
                    // Create menu button
                    this.menuBtn = document.createElement('button');
                    this.menuBtn.className = 'mobile-menu-btn';
                    this.menuBtn.setAttribute('aria-label', 'Toggle navigation menu');
                    this.menuBtn.innerHTML = '<span></span>';
                    
                    // Insert at the beginning of topbar-left
                    topbarLeft.insertBefore(this.menuBtn, topbarLeft.firstChild);
                }
            }
        }
    }
    
    createOverlay() {
        // Check if overlay already exists
        this.overlay = document.querySelector('.mobile-overlay');
        
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'mobile-overlay';
            document.body.appendChild(this.overlay);
        }
    }
    
    attachEventListeners() {
        // Menu button click
        this.menuBtn.addEventListener('click', () => this.toggleMenu());
        
        // Overlay click
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Close menu when clicking on navigation links
        const navLinks = this.sidebar.querySelectorAll('a[href]');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    this.closeMenu();
                }
            });
        });
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.sidebar.classList.add('active');
        this.menuBtn.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        this.isOpen = true;
        
        // Focus management
        this.menuBtn.setAttribute('aria-expanded', 'true');
        
        // Add animation classes
        requestAnimationFrame(() => {
            this.sidebar.style.transform = 'translateX(0)';
        });
    }
    
    closeMenu() {
        this.sidebar.classList.remove('active');
        this.menuBtn.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        this.isOpen = false;
        
        // Focus management
        this.menuBtn.setAttribute('aria-expanded', 'false');
    }
    
    updateForScreenSize() {
        const isMobile = window.innerWidth < 768;
        
        if (!isMobile && this.isOpen) {
            // Close menu on desktop
            this.closeMenu();
        }
        
        // Show/hide menu button based on screen size
        if (this.menuBtn) {
            this.menuBtn.style.display = isMobile ? 'flex' : 'none';
        }
        
        // Update sidebar positioning
        if (this.sidebar) {
            if (isMobile) {
                this.sidebar.style.position = 'fixed';
                this.sidebar.style.left = '-100%';
                this.sidebar.style.transform = 'translateX(0)';
            } else {
                this.sidebar.style.position = 'fixed';
                this.sidebar.style.left = '0';
                this.sidebar.style.transform = 'none';
                this.sidebar.classList.remove('active');
            }
        }
    }
    
    // Public methods
    isOpened() {
        return this.isOpen;
    }
    
    forceClose() {
        this.closeMenu();
    }
}

// Initialize mobile menu
const mobileMenu = new MobileMenu();

// Export for use in other modules
export default mobileMenu;

// Also make available globally for easy debugging
window.mobileMenu = mobileMenu;
