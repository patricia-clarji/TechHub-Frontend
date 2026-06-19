<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useToastStore } from '@/stores/toast';
import { useUIStore } from '@/stores/ui';

const userStore = useUserStore();
const toastStore = useToastStore();
const uiStore = useUIStore();
const router = useRouter();

const activeTab = ref('profile');
const isProcessingProfile = ref(false);
const isProcessingPreferences = ref(false);

const tabs = [
    { id: 'profile', label: 'Identity', icon: 'fa-user-gear' },
    { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
    { id: 'preferences', label: 'Preferences', icon: 'fa-sliders' },
    { id: 'billing', label: 'Billing', icon: 'fa-credit-card' }
];

const profileForm = ref({
    name: userStore.currentUser?.name || '',
    email: userStore.currentUser?.email || '',
    phone: userStore.currentUser?.phone || ''
});

// Sync form data reactively (crucial for refresh/login state)
watch(() => userStore.currentUser, (newVal) => {
    if (newVal) {
        profileForm.value.name = newVal.name || '';
        profileForm.value.email = newVal.email || '';
        profileForm.value.phone = newVal.phone || '';
    }
}, { immediate: true });

const handleSaveProfile = () => {
    isProcessingProfile.value = true;
    setTimeout(() => {
        userStore.updateProfile(profileForm.value);
        toastStore.showToast('Profile credentials updated successfully.', 'fa-check-circle');
        isProcessingProfile.value = false;
    }, 800);
};

const handleSavePreferences = (prefs) => {
    isProcessingPreferences.value = true;
    setTimeout(() => {
        userStore.updatePreferences(prefs);
        toastStore.showToast('System preferences synchronized.', 'fa-sliders');
        isProcessingPreferences.value = false;
    }, 800);
};

const handleDeleteAccount = () => {
    if (confirm('Initiate Protocol Termination: Are you certain you wish to purge your user profile? This action is irreversible.')) {
        userStore.logout();
        toastStore.showToast('User profile purged. Protocol terminated.', 'fa-skull-crossbones');
        router.push('/');
    }
};

// Scroll Reveal Logic (Fixes the "Empty Page" issue)
let observer = null;
const initObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    nextTick(() => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    });
};

onMounted(initObserver);
onUnmounted(() => { if (observer) observer.disconnect(); });

// Re-initialize if the view switches from "Auth Required" to "Settings"
watch(() => userStore.currentUser, async () => {
    await nextTick();
    initObserver();
});
</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div v-if="userStore.currentUser" class="reveal">
            <div class="mb-12">
                <span class="section-badge">Control Center</span>
                <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6">System Configuration</h1>
                <p class="text-[var(--text-muted)] mt-4 max-w-md leading-relaxed">Refine your architectural identity and
                    system behavior within the TechHub network.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <!-- Sidebar Navigation -->
                <aside class="lg:col-span-3 space-y-2">
                    <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                        :class="activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg translate-x-2' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]'"
                        class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300">
                        <i :class="['fa-solid', tab.icon]" class="text-sm"></i>
                        <span>{{ tab.label }}</span>
                    </button>
                </aside>

                <!-- Content Area -->
                <div class="lg:col-span-9">
                    <div
                        class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 lg:p-12 shadow-xl min-h-[500px]">

                        <!-- Profile Identity Section -->
                        <div v-if="activeTab === 'profile'" class="space-y-10 animate-in">
                            <div class="flex items-center gap-8 pb-10 border-b border-[var(--border)]">
                                <div class="relative group">
                                    <img :src="userStore.currentUser.avatar"
                                        class="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--accent)] ring-offset-4 ring-offset-[var(--bg-card)]"
                                        alt="Avatar">
                                    <button
                                        class="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i class="fa-solid fa-camera"></i>
                                    </button>
                                </div>
                                <div>
                                    <h3 class="font-[Playfair_Display] text-2xl font-bold text-[var(--text)]">{{
                                        userStore.currentUser.name }}</h3>
                                    <p class="text-[var(--text-muted)] text-sm">{{ userStore.currentUser.email }}</p>
                                </div>
                            </div>

                            <form @submit.prevent="handleSaveProfile" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-2">
                                    <label
                                        class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Full
                                        Name</label>
                                    <input v-model="profileForm.name" type="text" class="newsletter-input"
                                        placeholder="e.g. John Doe">
                                </div>
                                <div class="space-y-2">
                                    <label
                                        class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Email
                                        Address</label>
                                    <input v-model="profileForm.email" type="email" class="newsletter-input"
                                        placeholder="e.g. john@techhub.com">
                                </div>
                                <div class="space-y-2">
                                    <label
                                        class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Phone
                                        Protocol</label>
                                    <input v-model="profileForm.phone" type="text" class="newsletter-input"
                                        placeholder="+1 (000) 000-0000">
                                </div>
                                <div class="md:col-span-2 pt-6">
                                    <button type="submit" :disabled="isProcessingProfile"
                                        class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg disabled:opacity-50">
                                        {{ isProcessingProfile ? 'Committing...' : 'Commit Changes' }}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Preferences Section -->
                        <div v-if="activeTab === 'preferences'" class="space-y-10 animate-in">
                            <div>
                                <h3 class="font-[Playfair_Display] text-2xl font-bold mb-2">System Preferences</h3>
                                <p class="text-[var(--text-muted)] text-sm">Tailor the user interface and localization
                                    parameters.</p>
                            </div>

                            <div class="space-y-8">
                                <div
                                    class="flex items-center justify-between p-6 bg-[var(--bg-muted)]/50 rounded-3xl border border-[var(--border)]">
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
                                            <i class="fa-solid fa-globe"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-sm">Interface Language</p>
                                            <p class="text-xs text-[var(--text-muted)]">Set your primary linguistic
                                                module.</p>
                                        </div>
                                    </div>
                                    <select v-model="userStore.currentUser.preferences.language"
                                        class="bg-transparent font-bold text-xs uppercase tracking-widest outline-none border-b border-[var(--accent)] py-1">
                                        <option>English</option>
                                        <option>French</option>
                                        <option>German</option>
                                        <option>Japanese</option>
                                    </select>
                                </div>

                                <div
                                    class="flex items-center justify-between p-6 bg-[var(--bg-muted)]/50 rounded-3xl border border-[var(--border)]">
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="w-10 h-10 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)]">
                                            <i class="fa-solid fa-coins"></i>
                                        </div>
                                        <div>
                                            <p class="font-bold text-sm">Currency Matrix</p>
                                            <p class="text-xs text-[var(--text-muted)]">Financial display configuration.
                                            </p>
                                        </div>
                                    </div>
                                    <select v-model="userStore.currentUser.preferences.currency"
                                        class="bg-transparent font-bold text-xs uppercase tracking-widest outline-none border-b border-[var(--accent)] py-1">
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>JPY</option>
                                    </select>
                                </div>

                                <div class="pt-6">
                                    <button @click="handleSavePreferences(userStore.currentUser.preferences)"
                                        :disabled="isProcessingPreferences"
                                        class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg disabled:opacity-50">
                                        {{ isProcessingPreferences ? 'Synchronizing...' : 'Synchronize Preferences' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Placeholder for Billing/Security -->
                        <div v-if="['billing', 'security'].includes(activeTab)"
                            class="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 py-20 animate-in">
                            <i :class="['fa-solid', tabs.find(t => t.id === activeTab).icon]"
                                class="text-6xl text-[var(--accent)] opacity-40"></i>
                            <div>
                                <h3 class="font-[Playfair_Display] text-2xl font-bold">Module Under Maintenance</h3>
                                <p class="text-sm mt-2 leading-relaxed">The requested configuration interface is
                                    currently being optimized for architectural integrity.</p>
                            </div>

                            <!-- Security specific action -->
                            <div v-if="activeTab === 'security'" class="pt-10 space-y-4">
                                <p class="text-[var(--text-muted)] text-sm">Should you require full system
                                    disengagement, the protocol can be initiated below.</p>
                                <button @click="handleDeleteAccount"
                                    class="border border-red-500 text-red-500 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                    Initiate Protocol Termination
                                </button>
                            </div>
                            <div v-if="activeTab === 'billing'" class="pt-10 space-y-4">
                                <button
                                    class="border border-[var(--accent)] text-[var(--accent)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                                    Access Billing Terminal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Not Logged In State -->
        <div v-else
            class="text-center py-48 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)] shadow-xl reveal">
            <i class="fa-solid fa-user-lock text-6xl text-[var(--accent)] mb-8 opacity-20"></i>
            <h2 class="font-[Playfair_Display] text-4xl font-bold">Authentication Required</h2>
            <p class="text-[var(--text-muted)] mt-4 mb-10 max-w-sm mx-auto">Accessing the System Configuration requires
                valid user credentials within the TechHub network.</p>
            <button @click="uiStore.toggleAuth()"
                class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                Access Terminal
            </button>
        </div>
    </main>
</template>

<style scoped>
.animate-in {
    animation: settleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
</style>