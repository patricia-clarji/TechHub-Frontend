<script setup>
import { ref, watch } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const uiStore = useUIStore();
const userStore = useUserStore();
const isLogin = ref(true);

const email = ref('');
const password = ref('');
const name = ref('');
const confirmPassword = ref('');
const wasSubmitted = ref(false);

const touched = ref({
    email: false,
    name: false,
    password: false,
    confirmPassword: false
});

const errors = ref({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
});

watch(email, (val) => {
    if (!val) errors.value.email = 'Enter your email or mobile phone number';
    else if (val.includes('@') && !/^\S+@\S+\.\S+$/.test(val)) errors.value.email = 'Enter a valid email address';
    else errors.value.email = '';
});

watch(name, (val) => {
    if (!isLogin.value && !val) errors.value.name = 'Enter your name';
    else errors.value.name = '';
});

watch(password, (val) => {
    if (val.length < 6) errors.value.password = 'Minimum 6 characters required';
    else errors.value.password = '';

    if (!isLogin.value && confirmPassword.value && val !== confirmPassword.value) {
        errors.value.confirmPassword = 'Passwords must match';
    } else if (!isLogin.value && confirmPassword.value === val) {
        errors.value.confirmPassword = '';
    }
});

watch(confirmPassword, (val) => {
    if (!isLogin.value && val !== password.value) errors.value.confirmPassword = 'Passwords must match';
    else errors.value.confirmPassword = '';
});

const handleSubmit = () => {
    // Final validation check before submission
    wasSubmitted.value = true;
    if (!email.value) errors.value.email = 'Email is required';
    if (!password.value) errors.value.password = 'Password is required';
    if (!isLogin.value) {
        if (!name.value) errors.value.name = 'Name is required';
        if (password.value !== confirmPassword.value) errors.value.confirmPassword = 'Passwords must match';
    }

    const hasErrors = Object.values(errors.value).some(err => err !== '');
    if (hasErrors) {
        return;
    }

    if (isLogin.value) {
        userStore.login(email.value, password.value);
    } else {
        userStore.signup(name.value, email.value, password.value);
    }
    
    uiStore.authModalOpen = false;
};
</script>

<template>
    <div v-if="uiStore.authModalOpen"
        class="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
        <div @click="uiStore.authModalOpen = false" class="absolute inset-0"></div>
        <div class="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-10 shadow-2xl overflow-hidden">
            <!-- Decorative Header -->
            <div class="mb-8">
                <h2 class="font-[Playfair_Display] text-3xl font-bold text-[var(--text)]">{{ isLogin ? 'Sign in' : 'Create account' }}</h2>
            </div>

            <!-- Social Login Options -->
            <div class="space-y-3 mb-6">
                <button type="button" class="w-full flex items-center justify-center gap-3 py-3 border border-[var(--border)] rounded-2xl hover:bg-[var(--bg-muted)]/50 transition-all group">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5 group-hover:scale-110 transition-transform">
                    <span class="text-xs font-bold uppercase tracking-widest text-[var(--text)]">Continue with Google</span>
                </button>
                <button type="button" class="w-full flex items-center justify-center gap-3 py-3 border border-[var(--border)] rounded-2xl hover:bg-[var(--bg-muted)]/50 transition-all group">
                    <i class="fa-brands fa-apple text-xl group-hover:scale-110 transition-transform text-[var(--text)]"></i>
                    <span class="text-xs font-bold uppercase tracking-widest text-[var(--text)]">Continue with Apple</span>
                </button>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-4 mb-6">
                <div class="h-px flex-1 bg-[var(--border)]/60"></div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">or</span>
                <div class="h-px flex-1 bg-[var(--border)]/60"></div>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- Email / Mobile -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-[var(--text)] ml-1">Enter mobile number or email</label>
                    <input v-model="email" type="text"
                        @blur="touched.email = true"
                        class="w-full bg-[var(--bg-muted)]/50 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all"
                        :class="(errors.email && (touched.email || wasSubmitted)) ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'"
                        placeholder="" />
                    <p v-if="errors.email && (touched.email || wasSubmitted)" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.email }}</p>
                </div>

                <!-- Name (Signup Only) -->
                <div v-if="!isLogin" class="space-y-1">
                    <label class="text-xs font-bold text-[var(--text)] ml-1">Your name</label>
                    <input v-model="name" type="text"
                        @blur="touched.name = true"
                        class="w-full bg-[var(--bg-muted)]/50 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all"
                        :class="(errors.name && (touched.name || wasSubmitted)) ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'"
                        placeholder="First and last name" />
                    <p v-if="errors.name && (touched.name || wasSubmitted)" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.name }}</p>
                </div>

                <!-- Password -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-[var(--text)] ml-1">Password (at least 6 characters)</label>
                    <input v-model="password" type="password"
                        @blur="touched.password = true"
                        class="w-full bg-[var(--bg-muted)]/50 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all"
                        :class="(errors.password && (touched.password || wasSubmitted)) ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'"
                        placeholder="At least 6 characters" />
                    
                    <div v-if="!(errors.password && (touched.password || wasSubmitted))" class="flex items-center gap-2 mt-1 ml-1 text-[var(--text-muted)]">
                        <i class="fa-solid fa-info text-[10px] w-4 h-4 rounded-full border border-[var(--border)] flex items-center justify-center"></i>
                        <p class="text-[10px]">Passwords must be at least 6 characters.</p>
                    </div>
                    <p v-if="errors.password && (touched.password || wasSubmitted)" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.password }}</p>
                </div>

                <!-- Re-enter Password (Signup Only) -->
                <div v-if="!isLogin" class="space-y-1">
                    <label class="text-xs font-bold text-[var(--text)] ml-1">Re-enter password</label>
                    <input v-model="confirmPassword" type="password"
                        @blur="touched.confirmPassword = true"
                        class="w-full bg-[var(--bg-muted)]/50 border rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all"
                        :class="(errors.confirmPassword && (touched.confirmPassword || wasSubmitted)) ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'"
                        placeholder="" />
                    <p v-if="errors.confirmPassword && (touched.confirmPassword || wasSubmitted)" class="text-red-500 text-[10px] mt-1 ml-1">{{ errors.confirmPassword }}</p>
                </div>

                <button type="submit"
                    class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                    {{ isLogin ? 'Sign in' : 'Verify email' }}
                </button>
            </form>

            <!-- Toggle Link -->
            <div class="mt-8 pt-6 border-t border-[var(--border)]">
                <p v-if="!isLogin" class="text-sm font-bold text-[var(--text)]">Already a customer?</p>
                <button @click="isLogin = !isLogin"
                    class="text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-dk)] hover:underline transition-all mt-1">
                    {{ isLogin ? "Create your TechHub account" : "Sign in instead" }}
                </button>
            </div>

            <!-- Legal Footer -->
            <div v-if="!isLogin" class="text-center text-[var(--text-muted)] text-[9px] mt-6 leading-relaxed">
                By creating an account, you agree to TechHub's <br>
                <a href="#" class="text-[var(--accent)] hover:underline">Conditions of Use</a> and 
                <a href="#" class="text-[var(--accent)] hover:underline">Privacy Notice</a>.
            </div>
            <div v-else class="text-center text-[var(--text-muted)] text-[9px] mt-6 leading-relaxed">
                By signing in, you agree to TechHub's <a href="#" class="text-[var(--accent)] hover:underline">Conditions of Use</a>.
            </div>
        </div>
    </div>
</template>