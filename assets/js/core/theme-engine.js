// Theme Engine - Dark/Light Mode Management
class ThemeEngine {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.listeners = [];
    }

    // Get stored theme from localStorage
    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    // Get system theme preference
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Get current theme
    getTheme() {
        return this.currentTheme;
    }

    // Set theme
    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
        this.notifyListeners(theme);
    }

    // Toggle theme
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    }

    // Apply theme to document
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content',
                theme === 'dark' ? '#0f172a' : '#ffffff'
            );
        }
    }

    // Initialize theme
    init() {
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.setTheme(newTheme);
                }
            });
        }

        // Add theme toggle listeners
        this.setupToggleListeners();
    }

    // Setup theme toggle button listeners
    setupToggleListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                this.toggleTheme();
            }
        });
    }

    // Add theme change listener
    onChange(callback) {
        this.listeners.push(callback);
    }

    // Remove theme change listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // Notify all listeners
    notifyListeners(theme) {
        this.listeners.forEach(callback => callback(theme));
    }

    // Check if dark mode
    isDark() {
        return this.currentTheme === 'dark';
    }

    // Check if light mode
    isLight() {
        return this.currentTheme === 'light';
    }
}

// Create singleton instance
export const themeEngine = new ThemeEngine();

// Helper functions
export const getTheme = () => themeEngine.getTheme();
export const setTheme = (theme) => themeEngine.setTheme(theme);
export const toggleTheme = () => themeEngine.toggleTheme();
export const isDarkMode = () => themeEngine.isDark();
export const isLightMode = () => themeEngine.isLight();
export const onThemeChange = (callback) => themeEngine.onChange(callback);

// Initialize theme on module load
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            themeEngine.init();
        });
    } else {
        themeEngine.init();
    }
}

export default themeEngine;
