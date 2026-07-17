<script setup>
import { computed, reactive, ref } from 'vue';
import { useUserStore } from '@/stores/auth/user';
import { validatePassword } from '@/services/authValidation';

const userStore = useUserStore();
const activeTab = ref('profile');
const passwordSubmitted = ref(false);
const passwordSuccess = ref('');
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const customer = computed(() => userStore.currentUser || {});
const displayName = computed(() => customer.value.name || 'TechHub Customer');
const displayEmail = computed(() => customer.value.email || '');
const displayPhone = computed(() => customer.value.phone || 'Not provided');
const initial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U');

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
  { key: 'billing', label: 'Billing' },
  { key: 'notifications', label: 'Notifications' },
];

const passwordErrors = computed(() => ({
  oldPassword: !passwordForm.oldPassword ? 'Enter your current password.' : '',
  newPassword: validatePassword(passwordForm.newPassword) ||
    (passwordForm.oldPassword && passwordForm.oldPassword === passwordForm.newPassword ? 'New password must be different from your current password.' : ''),
  confirmPassword: passwordForm.confirmPassword !== passwordForm.newPassword ? 'Passwords do not match.' : '',
}));

const clearPasswordForm = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};

const submitPasswordChange = async () => {
  passwordSubmitted.value = true;
  passwordSuccess.value = '';
  userStore.error = '';
  if (Object.values(passwordErrors.value).some(Boolean)) return;
  try {
    const result = await userStore.changePassword({ ...passwordForm });
    passwordSuccess.value = result.message || 'Password changed successfully.';
    clearPasswordForm();
    passwordSubmitted.value = false;
  } catch {
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  }
};
</script>

<template>
  <main class="pt-32 pb-20 max-w-7xl mx-auto px-6">
    <div class="text-center mb-12">
      <span class="section-badge">ACCOUNT CENTER</span>
      <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-4">Settings</h1>
      <p class="text-sm text-[var(--text-muted)] mt-4 max-w-xl mx-auto">
        View account details and see which secure account-management APIs are still required.
      </p>
    </div>

    <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8 mb-8">
      <div class="flex items-center gap-6">
        <div class="w-32 h-32 rounded-full overflow-hidden bg-[var(--accent)] flex items-center justify-center">
          <img v-if="customer.avatar" :src="customer.avatar" alt="Profile" class="w-full h-full object-cover">
          <span v-else class="text-white text-5xl font-bold uppercase">{{ initial }}</span>
        </div>

        <div>
          <h2 class="text-2xl font-bold">{{ displayName }}</h2>
          <p class="text-[var(--text-muted)]">{{ displayEmail }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <aside class="lg:w-72 shrink-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6">
        <h3 class="font-bold mb-6">Settings</h3>
        <div class="space-y-3">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            class="cursor-pointer w-full text-left px-4 py-3 rounded-xl transition"
            :class="activeTab === tab.key ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-muted)]'"
          >
            {{ tab.label }}
          </button>
        </div>
      </aside>

      <section class="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8">
        <div v-if="activeTab === 'profile'" class="space-y-8">
          <div>
            <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">Profile</h2>
            <p class="text-[var(--text-muted)]">Profile editing is disabled until Osimart exposes a customer profile update API.</p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            <label class="block">
              <span class="block mb-2 font-medium">Full Name</span>
              <input :value="displayName" disabled type="text" class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg-muted)]">
            </label>
            <label class="block">
              <span class="block mb-2 font-medium">Email Address</span>
              <input :value="displayEmail" disabled type="email" class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg-muted)]">
            </label>
            <label class="block md:col-span-2">
              <span class="block mb-2 font-medium">Phone Number</span>
              <input :value="displayPhone" disabled type="text" class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg-muted)]">
            </label>
          </div>
        </div>

        <div v-if="activeTab === 'security'" class="space-y-6">
          <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">Security</h2>
          <p class="text-sm text-[var(--text-muted)]">Update your customer password using the secure Osimart account API.</p>

          <form class="space-y-5 max-w-xl" @submit.prevent="submitPasswordChange" novalidate>
            <label class="block" for="settings-old-password">
              <span class="block mb-2 font-medium">Current password</span>
              <input
                id="settings-old-password"
                v-model="passwordForm.oldPassword"
                type="password"
                autocomplete="current-password"
                class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg)]"
                :aria-invalid="passwordSubmitted && Boolean(passwordErrors.oldPassword)"
                aria-describedby="settings-old-password-error"
              >
              <span v-if="passwordSubmitted && passwordErrors.oldPassword" id="settings-old-password-error" class="block text-red-500 text-xs mt-1">{{ passwordErrors.oldPassword }}</span>
            </label>

            <label class="block" for="settings-new-password">
              <span class="block mb-2 font-medium">New password</span>
              <input
                id="settings-new-password"
                v-model="passwordForm.newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg)]"
                :aria-invalid="passwordSubmitted && Boolean(passwordErrors.newPassword)"
                aria-describedby="settings-new-password-error settings-new-password-help"
              >
              <span id="settings-new-password-help" class="block text-[var(--text-muted)] text-xs mt-1">Use more than 8 characters and avoid common passwords.</span>
              <span v-if="passwordSubmitted && passwordErrors.newPassword" id="settings-new-password-error" class="block text-red-500 text-xs mt-1">{{ passwordErrors.newPassword }}</span>
            </label>

            <label class="block" for="settings-confirm-password">
              <span class="block mb-2 font-medium">Confirm new password</span>
              <input
                id="settings-confirm-password"
                v-model="passwordForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--bg)]"
                :aria-invalid="passwordSubmitted && Boolean(passwordErrors.confirmPassword)"
                aria-describedby="settings-confirm-password-error"
              >
              <span v-if="passwordSubmitted && passwordErrors.confirmPassword" id="settings-confirm-password-error" class="block text-red-500 text-xs mt-1">{{ passwordErrors.confirmPassword }}</span>
            </label>

            <p v-if="userStore.error" role="alert" class="text-red-500 text-sm">{{ userStore.error }}</p>
            <p v-if="passwordSuccess" role="status" class="text-emerald-600 text-sm font-semibold">{{ passwordSuccess }}</p>

            <button type="submit" :disabled="userStore.loading" class="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">
              {{ userStore.loading ? 'Updating…' : 'Change password' }}
            </button>
          </form>
        </div>

        <div v-if="activeTab === 'billing'" class="space-y-6">
          <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">Billing</h2>
          <div class="rounded-2xl border border-red-500/25 bg-red-500/10 p-5 text-sm">
            Saved cards are disabled. TechHub must use a PCI-compliant payment provider before collecting or storing payment methods.
          </div>
          <button type="button" disabled class="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-medium opacity-50">
            Payment provider required
          </button>
        </div>

        <div v-if="activeTab === 'notifications'" class="space-y-6">
          <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">Notifications</h2>
          <div class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
            Persistent notification preferences require a customer preferences API. Current storefront notifications are local UI messages only.
          </div>
          <button type="button" disabled class="bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-medium opacity-50">
            Preferences API required
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
