<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useNotificationStore } from '@/stores/ui/notifications';
import { useUIStore } from '@/stores/ui/ui';
import { useUserStore } from '@/stores/auth/user';
import { readJson, writeJson } from '@/utils/storage';

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const uiStore = useUIStore();
const notificationStore = useNotificationStore();
const userStore = useUserStore();

const isScrolled = ref(false);
const isDark = ref(false);
const isMobileMenuOpen = ref(false);
const isNotificationsDropdownOpen = ref(false);
const isAccountDropdownOpen = ref(false);

const handleScroll = () => { isScrolled.value = window.scrollY > 20; };

onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    const savedTheme = readJson(localStorage, 'techhub_theme', null);
    isDark.value = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark.value);
});

onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('dark', isDark.value);
    writeJson(localStorage, 'techhub_theme', isDark.value ? 'dark' : 'light');
};
</script>

<template>
    <nav :class="[
        'fixed top-0 inset-x-0 z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between',
        isScrolled ? 'glass-panel py-3 shadow-lg' : 'bg-transparent'
    ]">
        <!-- Brand -->
        <button @click="isMobileMenuOpen = true" class="lg:hidden flex flex-col gap-1.5 p-1 group">
            <span class="w-5 h-0.5 bg-[var(--text)] rounded-full transition-all group-hover:w-6"></span>
            <span class="w-6 h-0.5 bg-[var(--text)] rounded-full transition-all"></span>
            <span class="w-4 h-0.5 bg-[var(--text)] rounded-full transition-all group-hover:w-6"></span>
        </button>

        <router-link to="/" class="text-2xl font-black tracking-tighter flex items-center gap-2 group">
            <div class="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                <i class="fa-solid fa-bolt-lightning text-sm"></i>
            </div>
            <span class="text-[var(--text)]">TECH<span class="text-[var(--accent)]">HUB</span></span>
        </router-link>

        <!-- Navigation Links -->
        <div class="hidden lg:flex items-center gap-10">
            <router-link to="/" class="nav-link text-[10px] font-bold uppercase">Home</router-link>
            <router-link to="/products" class="nav-link text-[10px] font-bold uppercase">Products</router-link>
            <router-link to="/contact" class="nav-link text-[10px] font-bold uppercase">Contact Us</router-link>
            <router-link to="/deals" class="nav-link text-[10px] font-bold uppercase">Deals</router-link>
            <router-link to="/about" class="nav-link text-[10px] font-bold uppercase">About</router-link>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
            <button @click="uiStore.toggleSearch()" class="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:block">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </button>

            <!-- Notifications Trigger -->
            <div class="relative">
                <button @click="isNotificationsDropdownOpen = !isNotificationsDropdownOpen"
                    class="relative text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                    <i class="fa-regular fa-bell text-sm"></i>
                    <span v-if="notificationStore.unreadCount > 0"
                        class="absolute -top-2 -right-2.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {{ notificationStore.unreadCount }}
                    </span>
                </button>

                <!-- Notifications Dropdown -->
                <Transition name="fade-pop">
                    <div v-if="isNotificationsDropdownOpen"
                        class="absolute right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]">
                        <div class="px-4 py-3 border-b border-[var(--border)]/40 mb-2 flex justify-between items-center">
                            <p class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Notifications</p>
                            <button v-if="notificationStore.unreadCount > 0" @click="notificationStore.markAllAsRead()" class="text-[9px] text-[var(--accent)] hover:underline">Mark all as read</button>
                        </div>
                        <div v-if="notificationStore.notifications.length > 0" class="max-h-60 overflow-y-auto custom-scrollbar">
                            <div v-for="notif in notificationStore.notifications" :key="notif.id"
                                @click="notificationStore.markAsRead(notif.id)"
                                class="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                                :class="{'bg-[var(--bg-muted)]/50': !notif.read}">
                                <i :class="{
                                    'fa-solid fa-circle-info text-blue-500': notif.type === 'system',
                                    'fa-solid fa-tag text-green-500': notif.type === 'promo',
                                    'fa-solid fa-truck-fast text-orange-500': notif.type === 'order',
                                    'fa-solid fa-heart text-red-500': notif.type === 'wishlist'
                                }" class="text-xs mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-xs" :class="{'font-bold': !notif.read}">{{ notif.message }}</p>
                                    <p class="text-[9px] text-[var(--text-muted)] mt-1">{{ notif.date }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-4 text-[var(--text-muted)] text-xs">No new notifications.</div>
                    </div>
                </Transition>
            </div>

            <!-- Wishlist Trigger -->
            <router-link to="/wishlist" class="relative text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors hidden sm:block">
                <i class="fa-regular fa-heart text-sm"></i>
                <span v-if="wishlistStore.productIds.length > 0" class="absolute -top-2 -right-2.5 bg-[var(--accent)] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{{ wishlistStore.productIds.length }}</span>
            </router-link>

            <!-- Theme Toggle -->
            <button @click="toggleDarkMode" class="theme-switch">
                <div class="w-14 h-7 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] relative flex items-center px-1">
                    <div :class="['w-5 h-5 bg-[var(--accent)] rounded-full transition-all duration-300 shadow-md', isDark ? 'translate-x-7' : 'translate-x-0']"></div>
                    <i :class="['absolute text-[8px] transition-opacity', isDark ? 'left-2 opacity-100' : 'left-2 opacity-0', 'fa-solid fa-moon', isDark ? 'text-white' : 'text-black']"></i>
                    <i :class="['absolute text-[8px] transition-opacity', isDark ? 'right-2 opacity-0' : 'right-2 opacity-100', 'fa-solid fa-sun', isDark ? 'text-white' : 'text-black']"></i>
                </div>
            </button>

            <!-- Customer account -->
            <div class="relative">
                <button type="button" @click="userStore.isAuthenticated ? isAccountDropdownOpen = !isAccountDropdownOpen : uiStore.toggleAuth()"
                    :aria-expanded="isAccountDropdownOpen"
                    class="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-all">
                    <i class="fa-solid fa-circle-user" aria-hidden="true"></i>
                    <span class="text-[10px] font-bold uppercase hidden sm:inline">{{ userStore.isAuthenticated ? userStore.currentUser.name : 'Sign In' }}</span>
                    <i v-if="userStore.isAuthenticated" class="fa-solid fa-chevron-down text-[8px] transition-transform" :class="{'rotate-180': isAccountDropdownOpen}"></i>
                </button>
                <div v-if="isAccountDropdownOpen && userStore.isAuthenticated"
                    class="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]">
                    <div class="px-4 py-3 border-b border-[var(--border)]/40 mb-2">
                        <p class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Session</p>
                        <p class="text-xs font-bold truncate">{{ userStore.currentUser.email }}</p>
                    </div>
                    <router-link to="/account" class="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-colors" @click="isAccountDropdownOpen = false">
                        <i class="fa-solid fa-gauge-high text-[var(--accent)]"></i> Profile
                    </router-link>
                    <router-link to="/settings" class="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-colors" @click="isAccountDropdownOpen = false">
                        <i class="fa-solid fa-gear text-[var(--accent)]"></i> Settings
                    </router-link>
                    <div class="h-px bg-[var(--border)]/40 my-2"></div>
                    <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors" @click="userStore.logout(); isAccountDropdownOpen = false">
                        <i class="fa-solid fa-power-off"></i> Logout
                    </button>
                </div>
            </div>

            <!-- Cart Trigger -->
            <button @click="uiStore.toggleCart()" class="relative group z-10">
                <div class="bg-[var(--accent)] text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                    <i class="fa-solid fa-cart-shopping text-sm"></i>
                </div>
                <span v-if="cartStore.itemCount > 0" 
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--bg)] animate-pulse">
                    {{ cartStore.itemCount }}
                </span>
            </button>

            <!-- Shop Now Call to Action -->
            <router-link to="/products" class="hidden sm:inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all premium-btn ml-2">
                <span>Shop Now</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </router-link>
        </div>
        </nav>

        <!-- Mobile Menu Overlay -->
        <Transition name="fade">
            <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"></div>
        </Transition>
        <Transition name="slide-rtl">
            <div v-if="isMobileMenuOpen" class="fixed top-0 left-0 w-[80vw] max-w-[340px] h-full bg-[var(--bg)] border-r border-[var(--border)] z-[70] p-8 flex flex-col">
                <button @click="isMobileMenuOpen = false" class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-muted)] transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
                <div class="mb-12">
                    <p class="text-[9px] uppercase tracking-[0.3em] font-bold text-[var(--text-muted)]">Menu</p>
                </div>
                <div class="flex flex-col gap-8">
                    <router-link v-for="link in ['Home', 'Products', 'Contact Us', 'Deals', 'About']" 
                        :key="link" :to="link === 'Home' ? '/' : (link === 'Contact Us' ? '/contact' : `/${link.replace(/\s+/g, '').toLowerCase()}`)" 
                        @click="isMobileMenuOpen = false"
                        class="font-[Playfair_Display] text-4xl font-bold flex items-center gap-4 hover:text-[var(--accent)] transition-colors">
                        <span class="text-[var(--accent)] text-xl">✦</span> {{ link }}
                    </router-link>
                </div>
                <div class="mt-auto space-y-6">
                    <button v-if="!userStore.isAuthenticated" type="button" class="w-full border border-[var(--border)] py-4 rounded-full text-center font-bold" @click="isMobileMenuOpen = false; uiStore.toggleAuth()">Sign In / Register</button>
                    <template v-else>
                        <router-link to="/account" class="w-full border border-[var(--border)] py-4 rounded-full text-center font-bold block" @click="isMobileMenuOpen = false">Profile</router-link>
                        <router-link to="/settings" class="w-full border border-[var(--border)] py-4 rounded-full text-center font-bold block" @click="isMobileMenuOpen = false">Settings</router-link>
                        <button type="button" class="w-full border border-[var(--border)] py-4 rounded-full text-center font-bold text-red-500" @click="userStore.logout(); isMobileMenuOpen = false">Logout</button>
                    </template>
                    <router-link to="/products" class="w-full bg-[var(--accent)] text-white py-4 rounded-full text-center font-bold block premium-btn">Shop Now</router-link>
                </div>
            </div>
        </Transition>
    
</template>

<style scoped>
.nav-link.router-link-active {
    color: var(--accent);
}
</style>
