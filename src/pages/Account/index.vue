<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/auth/user';

const userStore = useUserStore();
const router = useRouter();

const profile = computed(() => userStore.currentUser || {});
const displayName = computed(() => profile.value.displayName || profile.value.name || 'TechHub Customer');
const displayEmail = computed(() => userStore.currentUser?.email || '');
const initial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U');
const detailRows = computed(() => [
  ['Customer ID', profile.value.id],
  ['First name', profile.value.firstName],
  ['Last name', profile.value.lastName],
  ['Email', profile.value.email],
  ['Mobile', profile.value.phone],
  ['Store', profile.value.storeId],
].filter(([, value]) => String(value || '').trim()));
const defaultAddress = computed(() => profile.value.defaultAddress || null);

const handleLogout = () => {
  userStore.logout();
  router.push('/');
};
</script>

<template>
  <main class="pt-32 max-w-4xl mx-auto px-6 space-y-12">
    <div class="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full overflow-hidden bg-[var(--accent)] flex items-center justify-center">
          <img
            v-if="profile.avatarUrl || profile.avatar"
            :src="profile.avatarUrl || profile.avatar"
            alt="Profile"
            class="w-full h-full object-cover"
          >
          <span v-else class="text-white text-2xl font-bold">
            {{ initial }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ displayName }}</h1>
          <p class="text-sm text-[var(--text-muted)]">{{ displayEmail }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="handleLogout"
        class="bg-[var(--bg-muted)] text-[var(--text)] px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold"
      >
        Log out
      </button>
    </div>

    <section class="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem]">
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <span class="section-badge">Customer Profile</span>
          <h2 class="text-xl font-bold mt-3">Account Details</h2>
        </div>
        <button
          type="button"
          class="bg-[var(--bg-muted)] text-[var(--text)] px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold disabled:opacity-50"
          :disabled="userStore.loading"
          @click="userStore.loadCustomerProfile()"
        >
          Refresh
        </button>
      </div>
      <dl v-if="detailRows.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="[label, value] in detailRows" :key="label" class="rounded-2xl bg-[var(--bg-muted)] p-4">
          <dt class="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] font-bold">{{ label }}</dt>
          <dd class="mt-2 font-semibold break-words">{{ value }}</dd>
        </div>
      </dl>
      <p v-else class="text-sm text-[var(--text-muted)]">No customer profile fields are available from the current session.</p>

      <div v-if="defaultAddress" class="mt-6 rounded-2xl border border-[var(--border)] p-4">
        <p class="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] font-bold">Default Address</p>
        <p class="mt-2 font-semibold">{{ defaultAddress.address || 'Address unavailable' }}</p>
        <p class="text-sm text-[var(--text-muted)]">
          {{ [defaultAddress.city, defaultAddress.region, defaultAddress.postalCode, defaultAddress.country].filter(Boolean).join(', ') }}
        </p>
      </div>
      <p v-else class="mt-6 text-sm text-[var(--text-muted)]">No saved address is available from the current profile API response.</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
        <i class="fa-solid fa-box text-[var(--accent)] text-xl"></i>
        <h3 class="font-bold text-sm">Order Requests</h3>
        <p class="text-xs text-[var(--text-muted)]">Order history and tracking require a confirmed Osimart customer orders API.</p>
      </div>
      <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
        <i class="fa-solid fa-credit-card text-[var(--accent)] text-xl"></i>
        <h3 class="font-bold text-sm">Payment Methods</h3>
        <p class="text-xs text-[var(--text-muted)]">Saved payment methods are disabled until a PCI-compliant provider is connected.</p>
      </div>
      <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
        <i class="fa-solid fa-shield-halved text-[var(--accent)] text-xl"></i>
        <h3 class="font-bold text-sm">Security</h3>
        <p class="text-xs text-[var(--text-muted)]">Password changes, MFA, and active session controls need backend account APIs.</p>
      </div>
      <router-link to="/settings" class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2 hover:border-[var(--accent)] transition-all group">
        <i class="fa-solid fa-gear text-[var(--accent)] text-xl group-hover:rotate-90 transition-transform duration-500"></i>
        <h3 class="font-bold text-sm">Settings</h3>
        <p class="text-xs text-[var(--text-muted)]">Review account details and unavailable profile-management contracts.</p>
      </router-link>
    </div>
  </main>
</template>
