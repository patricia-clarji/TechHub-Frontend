import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { authSession } from '@/services/authSession';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(authSession.getToken() ? authSession.getUser() : null);
  const loading = ref(false);
  const error = ref('');
  const errorCode = ref('');
  const isAuthenticated = computed(() => Boolean(currentUser.value && authSession.getToken()));

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
  const resendVerification = (email) => run(() => authService.resendCustomerVerificationCode(email));
  const updateProfile = (data) => {
    if (!currentUser.value) return { success: false };
    const nextUser = { ...currentUser.value, ...data };
    currentUser.value = nextUser;
    authSession.updateUser(nextUser);
    return { success: true, user: nextUser };
  };
  const updatePreferences = (preferences) => updateProfile({
    preferences: {
      ...(currentUser.value?.preferences || {}),
      ...preferences,
    },
  });
  const logout = () => {
    authService.logout();
    currentUser.value = null;
  };

  return { currentUser, loading, error, errorCode, isAuthenticated, login, loginWithGoogle, register, verifyCustomer, forgotPassword, resendVerification, updateProfile, updatePreferences, logout };
});
