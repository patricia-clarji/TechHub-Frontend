<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();
const activeTab = ref('login');

const loginEmail = ref('');
const loginPass = ref('');

const signupName = ref('');
const signupEmail = ref('');
const signupPass = ref('');

const errorMessage = ref('');

const handleLogin = () => {
    const res = userStore.login(loginEmail.value, loginPass.value);
    if (res.success) {
        userStore.authModalOpen = false;
    } else {
        errorMessage.value = res.message;
    }
};

const handleSignup = () => {
    const res = userStore.signup(signupName.value, signupEmail.value, signupPass.value);
    if (res.success) {
        userStore.authModalOpen = false;
    } else {
        errorMessage.value = res.message;
    }
};
</script>

<template>
    <div v-if="userStore.authModalOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div @click="userStore.authModalOpen = false" class="absolute inset-0"></div>
        <div
            class="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] max-w-md w-full p-8 relative z-10 shadow-2xl flex flex-col">
            <div class="flex justify-around mb-6 border-b border-[var(--border)] pb-2">
                <button @click="activeTab = 'login'; errorMessage = ''"
                    :class="activeTab === 'login' ? 'text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)]'"
                    class="pb-2 text-sm tracking-widest uppercase">Sign In</button>
                <button @click="activeTab = 'signup'; errorMessage = ''"
                    :class="activeTab === 'signup' ? 'text-[var(--accent)] font-bold border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)]'"
                    class="pb-2 text-sm tracking-widest uppercase">Register</button>
            </div>

            <p v-if="errorMessage" class="text-xs text-red-500 bg-red-500/10 p-3 rounded-xl mb-4">{{ errorMessage }}</p>

            <div v-if="activeTab === 'login'" class="space-y-4">
                <div>
                    <label
                        class="block text-xs uppercase tracking-wider mb-1 font-medium text-[var(--text-muted)]">Email
                        Address</label>
                    <input v-model="loginEmail" type="email"
                        class="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label
                        class="block text-xs uppercase tracking-wider mb-1 font-medium text-[var(--text-muted)]">Password</label>
                    <input v-model="loginPass" type="password"
                        class="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none" />
                </div>
                <button @click="handleLogin"
                    class="w-full bg-[var(--accent)] text-white py-3 rounded-full mt-4 premium-btn font-semibold">Sign
                    In</button>
            </div>

            <div v-else class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-1 font-medium text-[var(--text-muted)]">Full
                        Name</label>
                    <input v-model="signupName" type="text"
                        class="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label
                        class="block text-xs uppercase tracking-wider mb-1 font-medium text-[var(--text-muted)]">Email
                        Address</label>
                    <input v-model="signupEmail" type="email"
                        class="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none" />
                </div>
                <div>
                    <label
                        class="block text-xs uppercase tracking-wider mb-1 font-medium text-[var(--text-muted)]">Password
                        (6+ chars)</label>
                    <input v-model="signupPass" type="password"
                        class="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none" />
                </div>
                <button @click="handleSignup"
                    class="w-full bg-[var(--accent)] text-white py-3 rounded-full mt-4 premium-btn font-semibold">Create
                    Account</button>
            </div>
        </div>
    </div>
</template>