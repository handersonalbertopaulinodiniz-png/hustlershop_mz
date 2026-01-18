// Simple Client-Side Router
class Router {
    constructor() {
        this.routes = new Map();
        this.currentPath = window.location.pathname;
        this.beforeEachHooks = [];
        this.afterEachHooks = [];
    }

    // Register a route
    register(path, handler) {
        this.routes.set(path, handler);
    }

    // Navigate to a path
    navigate(path, replace = false) {
        if (replace) {
            window.history.replaceState({}, '', path);
        } else {
            window.history.pushState({}, '', path);
        }

        this.currentPath = path;
        this.handleRoute(path);
    }

    // Go back
    back() {
        window.history.back();
    }

    // Go forward
    forward() {
        window.history.forward();
    }

    // Handle route
    async handleRoute(path) {
        // Run before hooks
        for (const hook of this.beforeEachHooks) {
            const result = await hook(path, this.currentPath);
            if (result === false) {
                return; // Navigation cancelled
            }
        }

        // Execute route handler
        const handler = this.routes.get(path);
        if (handler) {
            await handler();
        }

        // Run after hooks
        for (const hook of this.afterEachHooks) {
            await hook(path, this.currentPath);
        }
    }

    // Add before navigation hook
    beforeEach(hook) {
        this.beforeEachHooks.push(hook);
    }

    // Add after navigation hook
    afterEach(hook) {
        this.afterEachHooks.push(hook);
    }

    // Get current path
    getCurrentPath() {
        return this.currentPath;
    }

    // Get query parameters
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    // Get hash
    getHash() {
        return window.location.hash.slice(1);
    }

    // Initialize router
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.currentPath = window.location.pathname;
            this.handleRoute(this.currentPath);
        });

        // Handle initial route
        this.handleRoute(this.currentPath);

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }
}

// Create singleton instance
export const router = new Router();

// Helper function to check if path matches pattern
export const matchPath = (pattern, path) => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
        return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].slice(1);
            params[paramName] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }

    return params;
};

// Helper to build URL with query params
export const buildUrl = (path, params = {}) => {
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    return url.toString();
};

// Helper to redirect
export const redirect = (path, delay = 0) => {
    if (delay > 0) {
        setTimeout(() => {
            router.navigate(path);
        }, delay);
    } else {
        router.navigate(path);
    }
};

// Helper to reload page
export const reload = () => {
    window.location.reload();
};

// Helper to check if current path matches
export const isCurrentPath = (path) => {
    return router.getCurrentPath() === path;
};

// Helper to check if path starts with
export const pathStartsWith = (prefix) => {
    return router.getCurrentPath().startsWith(prefix);
};

export default router;
