<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/auth/user';

const userStore = useUserStore();
const router = useRouter();
const signOut = () => {
  userStore.logout();
  router.replace('/');
};
</script>

<template>
  <main class="pt-32 pb-24 max-w-4xl mx-auto px-6">
    <section class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-2xl font-bold">
          {{ userStore.currentUser?.name?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="flex-1">
          <p class="text-xs uppercase tracking-widest text-[var(--text-muted)]">Customer account</p>
          <h1 class="font-[Playfair_Display] text-3xl font-bold">{{ userStore.currentUser?.name }}</h1>
          <p class="text-[var(--text-muted)]">{{ userStore.currentUser?.email }}</p>
        </div>
        <button type="button" class="border border-[var(--border)] rounded-full px-6 py-3 font-bold hover:bg-[var(--bg-muted)]" @click="signOut">Sign Out</button>
      </div>
      <div class="mt-10 border-t border-[var(--border)] pt-8">
        <h2 class="font-bold text-xl">Account status</h2>
        <p class="text-[var(--text-muted)] mt-2">For security, your session is held only in memory and ends on refresh or sign out. Order history and profile editing require corresponding Osimart customer endpoints and are not simulated.</p>
      </div>
    </section>
  </main>
</template>
