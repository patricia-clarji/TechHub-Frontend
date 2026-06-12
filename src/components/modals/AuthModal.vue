<script setup>
import { ref } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const uiStore = useUIStore();
const userStore = useUserStore();
const isLogin = ref(true);

const email = ref('');
const password = ref('');
const name = ref('');

const handleSubmit = () => {
    if (isLogin.value) {
        userStore.login(email.value, password.value);
    } else {
        userStore.signup(name.value, email.value, password.value);
    }
    uiStore.authModalOpen = false;
};
</script>

<template>
    <div v-if="uiStore.authModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
        <div @click="uiStore.authModalOpen = false" class="absolute inset-0"></div>
        <div class="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
            <!-- Decorative Header -->
            <div class="mb-10 text-center">
                <span class="section-badge mb-4">Enterprise Access</span>
                <h2 class="font-[Playfair_Display] text-3xl font-bold">{{ isLogin ? 'Terminal Login' : 'Create Profile' }}</h2>
                <p class="text-[var(--text-muted)] text-xs mt-2 uppercase tracking-widest">Architectural Security Enabled</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
                <div v-if="!isLogin" class="space-y-1">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Full Identity</label>
                    <input v-model="name" type="text" class="w-full bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="John Doe" />
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Email Channel</label>
                    <input v-model="email" type="email" class="w-full bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="secure@techhub.com" />
                </div>
                <div class="space-y-1">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-4">Access Token</label>
                    <input v-model="password" type="password" class="w-full bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="••••••••" />
                </div>

                <button type="submit" class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                    {{ isLogin ? 'Authorize Session' : 'Register Terminal' }}
                </button>
            </form>

            <div class="mt-8 text-center">
                <button @click="isLogin = !isLogin" class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {{ isLogin ? "Need a new deployment profile?" : "Already have an active token?" }}
                </button>
            </div>
        </div>
    </div>
</template>