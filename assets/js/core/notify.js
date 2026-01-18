// Notification System
import { showToast } from '../components/toast.js';

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Show notification
export const notify = (message, type = NOTIFICATION_TYPES.INFO, duration = 3000) => {
    showToast(message, type, duration);
};

// Success notification
export const notifySuccess = (message, duration) => {
    notify(message, NOTIFICATION_TYPES.SUCCESS, duration);
};

// Error notification
export const notifyError = (message, duration) => {
    notify(message, NOTIFICATION_TYPES.ERROR, duration);
};

// Warning notification
export const notifyWarning = (message, duration) => {
    notify(message, NOTIFICATION_TYPES.WARNING, duration);
};

// Info notification
export const notifyInfo = (message, duration) => {
    notify(message, NOTIFICATION_TYPES.INFO, duration);
};

// Confirm dialog
export const confirm = (message, title = 'Confirm') => {
    return new Promise((resolve) => {
        const result = window.confirm(`${title}\n\n${message}`);
        resolve(result);
    });
};

// Alert dialog
export const alert = (message, title = 'Alert') => {
    return new Promise((resolve) => {
        window.alert(`${title}\n\n${message}`);
        resolve();
    });
};

// Prompt dialog
export const prompt = (message, defaultValue = '', title = 'Input') => {
    return new Promise((resolve) => {
        const result = window.prompt(`${title}\n\n${message}`, defaultValue);
        resolve(result);
    });
};

// Loading notification
let loadingToast = null;

export const showLoading = (message = 'Loading...') => {
    loadingToast = showToast(message, 'info', 0); // 0 duration = persistent
    return loadingToast;
};

export const hideLoading = () => {
    if (loadingToast) {
        loadingToast.remove();
        loadingToast = null;
    }
};

// Progress notification
export const showProgress = (message, progress = 0) => {
    // This would need a custom toast component with progress bar
    showToast(`${message} (${progress}%)`, 'info', 0);
};

// Browser notifications (requires permission)
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showBrowserNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
        return new Notification(title, {
            icon: '/assets/images/logo.png',
            badge: '/assets/images/logo.png',
            ...options
        });
    }
    return null;
};

// Sound notifications
export const playNotificationSound = (type = 'default') => {
    const audio = new Audio(`/assets/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(err => {
        console.warn('Could not play notification sound:', err);
    });
};

// Vibration (mobile)
export const vibrate = (pattern = [200]) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

// Copy to clipboard with notification
export const copyToClipboard = async (text, successMessage = 'Copied to clipboard!') => {
    try {
        await navigator.clipboard.writeText(text);
        notifySuccess(successMessage);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        notifyError('Failed to copy to clipboard');
        return false;
    }
};

// Download file with notification
export const downloadFile = (url, filename, successMessage = 'Download started') => {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notifySuccess(successMessage);
        return true;
    } catch (error) {
        console.error('Failed to download file:', error);
        notifyError('Failed to download file');
        return false;
    }
};

// Share with Web Share API
export const share = async (data) => {
    if (navigator.share) {
        try {
            await navigator.share(data);
            notifySuccess('Shared successfully');
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Failed to share:', error);
                notifyError('Failed to share');
            }
            return false;
        }
    } else {
        notifyWarning('Sharing is not supported on this browser');
        return false;
    }
};

export default {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    confirm,
    alert,
    prompt,
    showLoading,
    hideLoading,
    showProgress,
    requestNotificationPermission,
    showBrowserNotification,
    playNotificationSound,
    vibrate,
    copyToClipboard,
    downloadFile,
    share
};
