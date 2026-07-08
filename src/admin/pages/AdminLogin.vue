<template>
  <main class="admin-login">
    <section class="admin-login-panel">
      <RouterLink to="/" class="storefront-link compact"><i class="fa-solid fa-arrow-left"></i> Storefront</RouterLink>
      <p class="admin-eyebrow">TechHub admin</p>
      <h1>Sign in</h1>
      <p>Use your Osimart customer credentials to open the protected workspace.</p>

      <form class="admin-login-form" novalidate @submit.prevent="submit">
        <div v-if="formError" class="admin-notice warning login-alert" role="alert">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div><strong>Sign in failed</strong><p>{{ formError }}</p></div>
        </div>

        <label class="admin-field" for="admin-email">
          <span>Email</span>
          <input
            id="admin-email"
            v-model.trim="email"
            autocomplete="email"
            :disabled="userStore.loading"
            inputmode="email"
            type="email"
          >
        </label>

        <label class="admin-field" for="admin-password">
          <span>Password</span>
          <input
            id="admin-password"
            v-model="password"
            autocomplete="current-password"
            :disabled="userStore.loading"
            type="password"
          >
        </label>

        <button class="admin-btn" type="submit" :disabled="submitDisabled">
          <i v-if="userStore.loading" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-lock-open"></i>
          {{ userStore.loading ? 'Signing in' : 'Sign in' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/auth/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const password = ref('');
const formError = ref('');

const submitDisabled = computed(() => userStore.loading || !email.value.trim() || !password.value);

const submit = async () => {
  formError.value = '';
  if (!email.value.trim() || !password.value) {
    formError.value = 'Email and password are required.';
    return;
  }

  try {
    await userStore.login(email.value, password.value);
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin/')
      ? route.query.redirect
      : '/admin/overview';
    router.replace(redirect);
  } catch (error) {
    formError.value = error.message || 'Unable to sign in.';
  }
};
</script>
