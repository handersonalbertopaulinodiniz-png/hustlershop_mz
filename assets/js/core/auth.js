// Authentication Module
import { supabase, TABLES, ROLES, APPROVAL_STATUS } from './supabase.js';
import { showToast } from '../components/toast.js';
import { router } from './router.js';

// Current User State
let currentUser = null;
let currentProfile = null;

// Get Current User
export const getCurrentUser = () => currentUser;
export const getCurrentProfile = () => currentProfile;

// Check if user is authenticated
export const isAuthenticated = () => {
    return currentUser !== null;
};

// Check user role
export const hasRole = (role) => {
    return currentProfile?.role === role;
};

// Initialize Auth
export const initAuth = async () => {
    try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
            currentUser = session.user;
            await loadUserProfile();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_IN') {
                currentUser = session.user;
                await loadUserProfile();
                handleAuthRedirect();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                currentProfile = null;
                router.navigate('/auth/login.html');
            }
        });

        return true;
    } catch (error) {
        console.error('Auth initialization error:', error);
        return false;
    }
};

// Load User Profile
const loadUserProfile = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLES.USERS)
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        currentProfile = data;

        // Store in localStorage for quick access
        localStorage.setItem('userProfile', JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
};

// Sign Up
export const signUp = async (email, password, userData) => {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    role: userData.role || ROLES.CUSTOMER
                }
            }
        });

        if (authError) throw authError;

        // Create user profile
        const { error: profileError } = await supabase
            .from(TABLES.USERS)
            .insert({
                id: authData.user.id,
                email: email,
                full_name: userData.fullName,
                phone: userData.phone,
                role: userData.role || ROLES.CUSTOMER,
                approval_status: userData.role === ROLES.CUSTOMER ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING,
                created_at: new Date().toISOString()
            });

        if (profileError) throw profileError;

        showToast('Account created successfully! Please check your email for verification.', 'success');

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Sign up error:', error);
        showToast(error.message || 'Failed to create account', 'error');
        return { success: false, error };
    }
};

// Sign In
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;
        await loadUserProfile();

        // Check approval status
        if (currentProfile.approval_status === APPROVAL_STATUS.PENDING) {
            showToast('Your account is pending approval', 'warning');
            router.navigate('/auth/pending-approval.html');
            return { success: true, pending: true };
        }

        if (currentProfile.approval_status === APPROVAL_STATUS.REJECTED) {
            await signOut();
            showToast('Your account has been rejected', 'error');
            return { success: false, rejected: true };
        }

        showToast(`Welcome back, ${currentProfile.full_name}!`, 'success');
        handleAuthRedirect();

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Sign in error:', error);
        showToast(error.message || 'Failed to sign in', 'error');
        return { success: false, error };
    }
};

// Sign Out
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        currentUser = null;
        currentProfile = null;
        localStorage.removeItem('userProfile');

        showToast('Signed out successfully', 'success');
        router.navigate('/auth/login.html');

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        showToast('Failed to sign out', 'error');
        return { success: false, error };
    }
};

// Reset Password
export const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password.html`
        });

        if (error) throw error;

        showToast('Password reset email sent! Check your inbox.', 'success');
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(error.message || 'Failed to send reset email', 'error');
        return { success: false, error };
    }
};

// Update Password
export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showToast('Password updated successfully', 'success');
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        showToast(error.message || 'Failed to update password', 'error');
        return { success: false, error };
    }
};

// Update Profile
export const updateProfile = async (updates) => {
    try {
        const { error } = await supabase
            .from(TABLES.USERS)
            .update(updates)
            .eq('id', currentUser.id);

        if (error) throw error;

        await loadUserProfile();
        showToast('Profile updated successfully', 'success');

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Failed to update profile', 'error');
        return { success: false, error };
    }
};

// Handle Auth Redirect
const handleAuthRedirect = () => {
    const role = currentProfile?.role;

    switch (role) {
        case ROLES.ADMIN:
            router.navigate('/admin/dashboard.html');
            break;
        case ROLES.DELIVERY:
            router.navigate('/delivery/dashboard.html');
            break;
        case ROLES.CUSTOMER:
        default:
            router.navigate('/customer/dashboard.html');
            break;
    }
};

// Require Auth Middleware
export const requireAuth = async () => {
    if (!isAuthenticated()) {
        router.navigate('/auth/login.html');
        return false;
    }
    return true;
};

// Require Role Middleware
export const requireRole = async (role) => {
    if (!isAuthenticated()) {
        router.navigate('/auth/login.html');
        return false;
    }

    if (!hasRole(role)) {
        router.navigate('/pages/error/403.html');
        return false;
    }

    return true;
};

// Check Approval Status
export const checkApprovalStatus = async () => {
    if (!currentProfile) {
        await loadUserProfile();
    }

    return currentProfile?.approval_status;
};

export default {
    initAuth,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getCurrentUser,
    getCurrentProfile,
    isAuthenticated,
    hasRole,
    requireAuth,
    requireRole,
    checkApprovalStatus
};
