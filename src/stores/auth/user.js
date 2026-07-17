import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { authSession } from '@/services/authSession';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useNotificationStore } from '@/stores/ui/notifications';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(authSession.getToken() ? authSession.getUser() : null);
  const loading = ref(false);
  const isInitializing = ref(false);
  const hasInitialized = ref(false);
  const error = ref('');
  const errorCode = ref('');
  const isAuthenticated = computed(() => Boolean(currentUser.value && authSession.getToken()));
  let restorePromise = null;

  const run = async (action) => {
    loading.value = true;
    error.value = '';
    errorCode.value = '';
    try {
      return await action();
    } catch (err) {
      error.value = err.message;
      errorCode.value = err.code || '';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = (email, password) => run(async () => {
    currentUser.value = await authService.loginCustomer(email, password);
    return currentUser.value;
  });

  const register = (details) => run(async () => {
    const result = await authService.registerCustomer(details);
    currentUser.value = result.requiresLogin ? null : result.user;
    if (result.loginError) error.value = result.loginError;
    return result;
  });
  const verifyCustomer = (details) => run(async () => {
    const result = await authService.verifyCustomer(details);
    currentUser.value = result.requiresLogin ? null : result.user;
    return result;
  });
  const loginWithGoogle = (credential) => run(async () => {
    currentUser.value = await authService.loginWithGoogle(credential);
    return currentUser.value;
  });

  const forgotPassword = (email) => run(() => authService.forgotPassword(email));
  const resetPassword = ({ email, code, password, confirmPassword }) => run(() => {
    if (password !== confirmPassword) throw new Error('Passwords do not match.');
    return authService.resetPassword({ email, code, password });
  });
  const changePassword = ({ oldPassword, newPassword, confirmPassword }) => run(() => {
    if (newPassword !== confirmPassword) throw new Error('Passwords do not match.');
    return authService.changePassword({ oldPassword, newPassword });
  });
  const resendVerification = (email) => run(() => authService.resendCustomerVerificationCode(email));
  const restoreSession = async () => {
    if (hasInitialized.value && !isInitializing.value) return currentUser.value;
    if (restorePromise) return restorePromise;
    isInitializing.value = true;
    restorePromise = (async () => {
      try {
        if (authSession.getToken()) {
          currentUser.value = authSession.getUser();
          return currentUser.value;
        }
        if (!authService.hasRecoverableSession()) {
          currentUser.value = null;
          return null;
        }
        currentUser.value = await authService.refreshSession();
        return currentUser.value;
      } catch {
        currentUser.value = null;
        return null;
      } finally {
        hasInitialized.value = true;
        isInitializing.value = false;
        restorePromise = null;
      }
    })();
    return restorePromise;
  };
  const logout = () => {
    authService.logout();
    currentUser.value = null;
    useCartStore().clearCart();
    useWishlistStore().clearWishlist();
    useNotificationStore().clearAll();
  };

  return {
    currentUser,
    loading,
    isInitializing,
    hasInitialized,
    error,
    errorCode,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    verifyCustomer,
    forgotPassword,
    resetPassword,
    changePassword,
    resendVerification,
    restoreSession,
    logout,
  };
});
