<script setup>
import { useUserStore } from '../../stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
    userStore.logout();
    router.push('/');
};
</script>

<template>
    <main class="pt-32 max-w-4xl mx-auto px-6 space-y-12">
        <div
            class="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div class="flex items-center gap-4">
                <div
                    class="w-16 h-16 bg-[var(--accent)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {{ userStore.currentUser?.name?.charAt(0) || 'U' }}
                </div>
                <div>
                    <h1 class="text-2xl font-bold">{{ userStore.currentUser?.name || 'Enterprise User Terminal' }}</h1>
                    <p class="text-sm text-[var(--text-muted)]">{{ userStore.currentUser?.email ||
                        'unauthenticated_session@techhub.com' }}</p>
                </div>
            </div>
            <button @click="handleLogout"
                class="bg-[var(--bg-muted)] text-[var(--text)] px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold">Disconnect
                Token</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
                <i class="fa-solid fa-box text-[var(--accent)] text-xl"></i>
                <h3 class="font-bold text-sm">Deployment Logs</h3>
                <p class="text-xs text-[var(--text-muted)]">Track outbound physical packages and tracking telemetry
                    parameters.</p>
            </div>
            <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
                <i class="fa-solid fa-credit-card text-[var(--accent)] text-xl"></i>
                <h3 class="font-bold text-sm">Clearing Profiles</h3>
                <p class="text-xs text-[var(--text-muted)]">Maintain encryption tokens for commercial processing
                    hardware profiles.</p>
            </div>
            <div class="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl space-y-2">
                <i class="fa-solid fa-shield-halved text-[var(--accent)] text-xl"></i>
                <h3 class="font-bold text-sm">Access Parameters</h3>
                <p class="text-xs text-[var(--text-muted)]">Refine network credential authentication profiles security
                    factors.</p>
            </div>
        </div>
    </main>
</template>