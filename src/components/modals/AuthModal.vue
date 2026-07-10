<script setup>
import { reactive, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/auth/user';
import { useUIStore } from '@/stores/ui/ui';
import { useToastStore } from '@/stores/ui/toast';
import config from '@/config';
import { renderGoogleButton } from '@/services/googleIdentity';
import {
  getLebanonCountryCode,
  normalizeLebanonMobileNumber,
  validateLebanonMobileNumber,
  validatePassword,
} from '@/services/authValidation';

const userStore = useUserStore();
const uiStore = useUIStore();
const toastStore = useToastStore();
const mode = ref('login');
const showPassword = ref(false);
const submitted = ref(false);
const googleButton = ref(null);
const googleError = ref('');
const verificationNotice = ref('');
const codeInputs = ref([]);
const codeDigits = ref(['', '', '', '']);
const resendCooldown = ref(0);
let resendTimer = null;
const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', code: '' });
const countryCode = getLebanonCountryCode();
const verificationCode = computed(() => codeDigits.value.join(''));
const verificationReady = computed(() => verificationCode.value.length === 4);

const errors = computed(() => ({
  firstName: mode.value === 'register' && form.firstName.trim().length < 2 ? 'Enter at least 2 characters for your first name.' : '',
  lastName: mode.value === 'register' && form.lastName.trim().length < 2 ? 'Enter at least 2 characters for your last name.' : '',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter a valid email.',
  phone: mode.value === 'register' ? validateLebanonMobileNumber(form.phone) : '',
  password: mode.value === 'login' && !form.password
    ? 'Enter your password.'
    : mode.value === 'register'
      ? validatePassword(form.password)
      : '',
  confirmPassword: mode.value === 'register' && form.confirmPassword !== form.password ? 'Passwords do not match.' : '',
  code: mode.value === 'verify' && !verificationReady.value ? 'Enter the 4-digit verification code.' : '',
}));

const reset = () => {
  submitted.value = false;
  form.password = '';
  form.code = '';
  codeDigits.value = ['', '', '', ''];
  userStore.error = '';
  verificationNotice.value = '';
};

const focusCodeInput = async (index) => {
  await nextTick();
  codeInputs.value[index]?.focus();
};

const setVerificationCode = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4).split('');
  codeDigits.value = Array.from({ length: 4 }, (_, index) => digits[index] || '');
  form.code = codeDigits.value.join('');
};

const onCodeInput = (event, index) => {
  const digit = event.target.value.replace(/\D/g, '').slice(-1);
  codeDigits.value[index] = digit;
  form.code = codeDigits.value.join('');
  if (digit && index < 3) focusCodeInput(index + 1);
};

const onCodeKeydown = (event, index) => {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    focusCodeInput(index - 1);
  }
};

const onCodePaste = (event) => {
  const pasted = event.clipboardData?.getData('text') || '';
  const digits = pasted.replace(/\D/g, '').slice(0, 4);
  if (digits.length) {
    event.preventDefault();
    setVerificationCode(digits);
    focusCodeInput(Math.min(digits.length, 4) - 1);
  }
};

const startResendCooldown = () => {
  resendCooldown.value = 30;
  if (resendTimer) clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer);
      resendTimer = null;
    }
  }, 1000);
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
  if (!uiStore.authModalOpen || !['login', 'register'].includes(mode.value) || !config.API.GOOGLE_CLIENT_ID) return;
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

onBeforeUnmount(() => {
  if (resendTimer) clearInterval(resendTimer);
});

const submit = async () => {
  submitted.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  try {
    if (mode.value === 'login') {
      try {
        await userStore.login(form.email, form.password);
        toastStore.showToast('Welcome back.', 'fa-circle-check');
        uiStore.authModalOpen = false;
      } catch (error) {
        if (error.code === 'ACCOUNT_UNVERIFIED') {
          mode.value = 'verify';
          await nextTick();
          verificationNotice.value = 'Your account is not verified. Enter the verification code sent to your email/phone.';
          userStore.error = '';
          form.password = '';
        }
      }
    } else if (mode.value === 'register') {
      const result = await userStore.register({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: normalizeLebanonMobileNumber(form.phone, countryCode),
        password: form.password.trim(),
      });
      if (result.requiresLogin) {
        mode.value = 'verify';
        await nextTick();
        verificationNotice.value = result.message || 'Account created. Please enter the verification code to activate your account.';
        userStore.error = '';
        toastStore.showToast(verificationNotice.value, 'fa-circle-check');
        try {
          const resendResult = await userStore.resendVerification(form.email);
          verificationNotice.value = resendResult.message || 'Verification code sent. Check your email or phone.';
          toastStore.showToast(verificationNotice.value, 'fa-envelope');
          startResendCooldown();
        } catch {
          userStore.error = '';
          verificationNotice.value = 'Account created. Use Resend Code if the verification code does not arrive.';
        }
      } else {
        toastStore.showToast('Account created.', 'fa-circle-check');
        uiStore.authModalOpen = false;
      }
    } else if (mode.value === 'verify') {
      const result = await userStore.verifyCustomer({ email: form.email, code: verificationCode.value });
      if (result.requiresLogin) {
        verificationNotice.value = result.message || 'Account verified. Please sign in.';
        userStore.error = '';
        toastStore.showToast(verificationNotice.value, 'fa-circle-check');
        mode.value = 'login';
      } else {
        toastStore.showToast('Account verified.', 'fa-circle-check');
        uiStore.authModalOpen = false;
      }
    } else {
      await userStore.forgotPassword(form.email);
      toastStore.showToast('If that account exists, reset instructions have been sent.', 'fa-envelope');
      mode.value = 'login';
    }
  } catch {
    // The store exposes a customer-safe message.
  }
};

const resendVerification = async () => {
  if (resendCooldown.value > 0) return;
  try {
    const result = await userStore.resendVerification(form.email);
    verificationNotice.value = result.message || 'Verification code sent. Check your email or phone.';
    userStore.error = '';
    toastStore.showToast(verificationNotice.value, 'fa-envelope');
    startResendCooldown();
  } catch {
    verificationNotice.value = '';
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
        {{ mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'verify' ? 'Verify Account' : 'Reset Password' }}
      </h2>
      <p class="text-sm text-[var(--text-muted)] mt-2 mb-7">Securely connected to your Osimart customer account.</p>
      <p v-if="mode === 'verify' && verificationNotice" class="text-center text-xs font-semibold text-[var(--accent)] -mt-3 mb-5">{{ verificationNotice }}</p>

      <div v-if="mode === 'login' || mode === 'register'" class="mb-6">
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
          <label for="auth-phone" class="block text-xs font-bold mb-2">Mobile number</label>
          <input id="auth-phone" v-model="form.phone" type="tel" autocomplete="tel" placeholder="70 123 456" class="w-full border border-[var(--border)] bg-[var(--bg)] rounded-xl p-3" />
          <p v-if="submitted && errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
        </div>
        <div v-if="mode === 'login' || mode === 'register'">
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
        <div v-if="mode === 'verify'">
          <p class="text-center text-sm font-semibold text-[var(--text)] mb-4">Please enter the 4-digit code below</p>
          <div class="flex justify-center gap-3" @paste="onCodePaste">
            <input
              v-for="(_, index) in codeDigits"
              :key="index"
              ref="codeInputs"
              :value="codeDigits[index]"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="1"
              class="h-14 w-14 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-center text-2xl font-bold tracking-normal shadow-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/15"
              :aria-label="`Verification code digit ${index + 1}`"
              @input="onCodeInput($event, index)"
              @keydown="onCodeKeydown($event, index)"
            />
          </div>
          <p v-if="submitted && errors.code" class="text-red-500 text-xs text-center mt-3">{{ errors.code }}</p>
        </div>
        <p v-if="userStore.error" role="alert" class="text-red-500 text-sm">{{ userStore.error }}</p>
        <button type="submit" :disabled="userStore.loading || (mode === 'verify' && !verificationReady)" class="w-full bg-[var(--accent)] text-white rounded-full py-4 font-bold disabled:opacity-50">
          {{ userStore.loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'verify' ? 'Verify Account' : 'Send Reset Link' }}
        </button>
        <button
          v-if="mode === 'verify' && form.email.trim()"
          type="button"
          class="block mx-auto text-xs font-bold text-[var(--accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="userStore.loading || resendCooldown > 0"
          @click="resendVerification"
        >
          {{ resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm space-y-3">
        <button v-if="mode === 'login'" type="button" class="text-[var(--accent)] hover:underline" @click="mode = 'forgot'">Forgot password?</button>
        <button v-if="mode === 'login' || mode === 'forgot'" type="button" class="block mx-auto hover:underline" @click="mode = 'register'">New customer? Create an account</button>
        <button v-if="mode !== 'login'" type="button" class="block mx-auto hover:underline" @click="mode = 'login'">Back to sign in</button>
      </div>
    </section>
  </div>
</template>
