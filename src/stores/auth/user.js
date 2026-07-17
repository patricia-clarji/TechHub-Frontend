import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { authSession } from '@/services/authSession';
import { customerProfileService } from '@/services/customerProfileService';
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
  const profileStatus = ref('');
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

  const syncPrivateStores = () => {
    useCartStore().syncOwner();
    useWishlistStore().syncOwner();
    useNotificationStore().syncOwner();
  };

  const syncAfterAuthentication = () => {
    useCartStore().syncOwner({ mergeGuest: true });
    useWishlistStore().syncOwner();
    useNotificationStore().syncOwner();
  };

  const loadCustomerProfile = async () => {
    if (!authSession.getToken()) return currentUser.value;
    try {
      const profile = await customerProfileService.fetchCurrentProfile(currentUser.value);
      currentUser.value = profile;
      authSession.updateUser(profile);
      profileStatus.value = 'loaded';
      syncPrivateStores();
      return profile;
    } catch (err) {
      profileStatus.value = err?.status === 401 || err?.status === 403 ? 'auth-required' : 'unavailable';
      return currentUser.value;
    }
  };

  const login = (email, password) => run(async () => {
    currentUser.value = await authService.loginCustomer(email, password);
    syncAfterAuthentication();
    await loadCustomerProfile();
    return currentUser.value;
  });

  const register = (details) => run(async () => {
    const result = await authService.registerCustomer(details);
    currentUser.value = result.requiresLogin ? null : result.user;
    if (currentUser.value) syncAfterAuthentication();
    if (currentUser.value) await loadCustomerProfile();
    if (result.loginError) error.value = result.loginError;
    return result;
  });
  const verifyCustomer = (details) => run(async () => {
    const result = await authService.verifyCustomer(details);
    currentUser.value = result.requiresLogin ? null : result.user;
    if (currentUser.value) syncAfterAuthentication();
    if (currentUser.value) await loadCustomerProfile();
    return result;
  });
  const loginWithGoogle = (credential) => run(async () => {
    currentUser.value = await authService.loginWithGoogle(credential);
    syncAfterAuthentication();
    await loadCustomerProfile();
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
          syncAfterAuthentication();
          await loadCustomerProfile();
          return currentUser.value;
        }
        if (!authService.hasRecoverableSession()) {
          currentUser.value = null;
          return null;
        }
        currentUser.value = await authService.refreshSession();
        syncAfterAuthentication();
        await loadCustomerProfile();
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
    syncPrivateStores();
  };

  return {
    currentUser,
    loading,
    isInitializing,
    hasInitialized,
    error,
    errorCode,
    profileStatus,
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
    loadCustomerProfile,
    logout,
  };
});
