import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { authSession } from '@/services/authSession';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(authSession.getToken() ? authSession.getUser() : null);
  const loading = ref(false);
  const error = ref('');
  const isAuthenticated = computed(() => Boolean(currentUser.value && authSession.getToken()));

  const run = async (action) => {
    loading.value = true;
    error.value = '';
    try {
      return await action();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = (email, password) => run(async () => {
    currentUser.value = await authService.login(email, password);
    return currentUser.value;
  });

  const register = (details) => run(async () => {
    const result = await authService.register(details);
    currentUser.value = result.user;
    return result;
  });
  const loginWithGoogle = (credential) => run(async () => {
    currentUser.value = await authService.loginWithGoogle(credential);
    return currentUser.value;
  });

  const forgotPassword = (email) => run(() => authService.forgotPassword(email));
  const logout = () => {
    authService.logout();
    currentUser.value = null;
  };

  return { currentUser, loading, error, isAuthenticated, login, loginWithGoogle, register, forgotPassword, logout };
});
