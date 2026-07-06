<script setup>
import { reactive, ref, computed, watch, nextTick } from 'vue';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';
import { useToastStore } from '@/stores/ui/toast';
import config from '@/config';
import { renderGoogleButton } from '@/services/googleIdentity';

const userStore = useUserStore();
const uiStore = useUIStore();
const toastStore = useToastStore();
const mode = ref('login');
const showPassword = ref(false);
const submitted = ref(false);
const googleButton = ref(null);
const googleError = ref('');
const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });

const errors = computed(() => ({
  firstName: mode.value === 'register' && form.firstName.trim().length < 2 ? 'Enter your first name.' : '',
  lastName: mode.value === 'register' && form.lastName.trim().length < 2 ? 'Enter your last name.' : '',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter a valid email.',
  phone: mode.value === 'register' && !/^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim()) ? 'Enter a valid phone number.' : '',
  password: mode.value === 'login' && !form.password
    ? 'Enter your password.'
    : mode.value === 'register' && form.password.length < 8
      ? 'Use at least 8 characters.'
      : '',
  confirmPassword: mode.value === 'register' && form.confirmPassword !== form.password ? 'Passwords do not match.' : '',
}));

const reset = () => {
  submitted.value = false;
  form.password = '';
  userStore.error = '';
};

const handleGoogleCredential = async (response) => {
  googleError.value = '';
  try {
    await userStore.loginWithGoogle(response?.credential);
    toastStore.showToast('Signed in with Google.', 'fa-circle-check');
    uiStore.authModalOpen = false;
  } catch {
    googleError.value = userStore.error || 'Google sign-in could not be completed.';
  }
};

const mountGoogleButton = async () => {
  if (!uiStore.authModalOpen || mode.value === 'forgot' || !config.API.GOOGLE_CLIENT_ID) return;
  await nextTick();
  try {
    await renderGoogleButton({
      clientId: config.API.GOOGLE_CLIENT_ID,
      element: googleButton.value,
      callback: handleGoogleCredential,
      theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
    });
  } catch (error) {
    googleError.value = error.message;
  }
};

watch(mode, () => {
  reset();
  mountGoogleButton();
});
watch(() => uiStore.authModalOpen, (open) => {
  if (!open) reset();
  else mountGoogleButton();
}, { immediate: true });

const submit = async () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  try {
    if (mode.value === 'login') {
      await userStore.login(form.email, form.password);
      toastStore.showToast('Welcome back.', 'fa-circle-check');
      uiStore.authModalOpen = false;
    } else if (mode.value === 'register') {
      const result = await userStore.register(form);
      toastStore.showToast(result.requiresLogin ? 'Account created. Please sign in.' : 'Account created.', 'fa-circle-check');
      if (result.requiresLogin) mode.value = 'login';
      else uiStore.authModalOpen = false;
    } else {
      await userStore.forgotPassword(form.email);
      toastStore.showToast('If that account exists, reset instructions have been sent.', 'fa-envelope');
      mode.value = 'login';
    }
  } catch {
    // The store exposes a customer-safe message.
  }
};
</script>

<template>
  <div v-if="uiStore.authModalOpen" class="fixed inset-0 z-[130] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <button class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close sign in" @click="uiStore.authModalOpen = false"></button>
    <section class="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8 shadow-2xl">
      <button type="button" aria-label="Close" class="absolute top-5 right-5 w-10 h-10 rounded-full hover:bg-[var(--bg-muted)]" @click="uiStore.authModalOpen = false">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <h2 id="auth-title" class="font-[Playfair_Display] text-3xl font-bold">
        {{ mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password' }}
      </h2>
      <p class="text-sm text-[var(--text-muted)] mt-2 mb-7">Securely connected to your Osimart customer account.</p>

      <div v-if="mode !== 'forgot'" class="mb-6">
        <div v-if="config.API.GOOGLE_CLIENT_ID" ref="googleButton" class="min-h-11 flex justify-center"></div>
        <p v-else class="text-center text-xs text-[var(--text-muted)] border border-[var(--border)] rounded-xl p-3">
          Google sign-in becomes available after configuring the public Google Client ID.
        </p>
        <p v-if="googleError" role="alert" class="text-red-500 text-xs text-center mt-2">{{ googleError }}</p>
        <div class="flex items-center gap-3 my-5 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          <span class="h-px flex-1 bg-[var(--border)]"></span><span>or continue with email</span><span class="h-px flex-1 bg-[var(--border)]"></span>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="submit" novalidate>
        <div v-if="mode === 'register'" class="grid grid-cols-2 gap-3">
          <div v-for="field in [{ key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' }]" :key="field.key">
            <label :for="field.key" class="block text-xs font-bold mb-2">{{ field.label }}</label>
            <input :id="field.key" v-model="form[field.key]" autocomplete="name" class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3" />
            <p v-if="submitted && errors[field.key]" class="text-red-500 text-xs mt-1">{{ errors[field.key] }}</p>
          </div>
        </div>
        <div>
          <label for="auth-email" class="block text-xs font-bold mb-2">Email</label>
          <input id="auth-email" v-model="form.email" type="email" autocomplete="email" class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3" />
          <p v-if="submitted && errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
        <div v-if="mode === 'register'">
          <label for="auth-phone" class="block text-xs font-bold mb-2">Phone</label>
          <input id="auth-phone" v-model="form.phone" type="tel" autocomplete="tel" class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3" />
          <p v-if="submitted && errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
        </div>
        <div v-if="mode !== 'forgot'">
          <label for="auth-password" class="block text-xs font-bold mb-2">Password</label>
          <div class="relative">
            <input id="auth-password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3 pr-12" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i>
            </button>
          </div>
          <p v-if="submitted && errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>
        <div v-if="mode === 'register'">
          <label for="auth-confirm-password" class="block text-xs font-bold mb-2">Confirm password</label>
          <input id="auth-confirm-password" v-model="form.confirmPassword" type="password" autocomplete="new-password"
            class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3" />
          <p v-if="submitted && errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
        </div>
        <p v-if="userStore.error" role="alert" class="text-red-500 text-sm">{{ userStore.error }}</p>
        <button type="submit" :disabled="userStore.loading" class="w-full bg-[var(--accent)] text-white rounded-full py-4 font-bold disabled:opacity-50">
          {{ userStore.loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm space-y-3">
        <button v-if="mode === 'login'" type="button" class="text-[var(--accent)] hover:underline" @click="mode = 'forgot'">Forgot password?</button>
        <button v-if="mode !== 'register'" type="button" class="block mx-auto hover:underline" @click="mode = 'register'">New customer? Create an account</button>
        <button v-if="mode !== 'login'" type="button" class="block mx-auto hover:underline" @click="mode = 'login'">Back to sign in</button>
      </div>
    </section>
  </div>
</template>
