<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useUserStore } from '@/stores/auth/user';
import { useProductsStore } from '@/stores/shop/products';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useNotificationStore } from '@/stores/ui/notifications';
import { useUIStore } from '@/stores/ui/ui';

const cartStore = useCartStore();
const userStore = useUserStore();
const productsStore = useProductsStore();
const wishlistStore = useWishlistStore();
const uiStore = useUIStore();
const notificationStore = useNotificationStore();

const isScrolled = ref(false);
const isDark = ref(false);
const isMobileMenuOpen = ref(false);
const isAccountDropdownOpen = ref(false);
const isNotificationsDropdownOpen = ref(false);

onMounted(() => {
    window.addEventListener('scroll', () => {
        isScrolled.value = window.scrollY > 20;
    });
});

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('dark');
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

        <!-- Action Terminal -->
        <div class="flex items-center gap-3">
            <button @click="uiStore.toggleSearch()" class="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:block">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </button>

            <!-- Search Results Mini-Overlay -->
            <Transition name="fade">
                <div v-if="uiStore.searchBarOpen" class="fixed inset-0 top-[72px] bg-black/20 backdrop-blur-md z-[45] flex justify-center p-6">
                    <div class="w-full max-w-2xl bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] shadow-2xl h-fit max-h-[70vh] overflow-hidden flex flex-col">
                        <div class="p-6 border-b border-[var(--border)]">
                            <input v-model="productsStore.searchQueries" type="text" placeholder="Search for hardware IDs..." autofocus
                                class="w-full bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--accent)]" />
                        </div>
                        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <p class="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 px-2">System Matches</p>
                            <router-link v-for="p in productsStore.filteredProducts.slice(0, 5)" :key="p.id" :to="`/products/${p.id}`" @click="uiStore.toggleSearch()"
                                class="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-muted)] transition-all group">
                                <img :src="p.img" class="w-12 h-12 rounded-xl object-cover" />
                                <div class="flex-1"><h4 class="text-xs font-bold">{{ p.name }}</h4><p class="text-[10px] text-[var(--text-muted)]">{{ p.category }}</p></div>
                                <span class="text-xs font-black text-[var(--accent)]">$ {{ p.price }}</span>
                            </router-link>
                        </div>
                    </div>
                </div>
            </Transition>

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
                        @click.away="isNotificationsDropdownOpen = false"
                        class="absolute right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]">
                        <div class="px-4 py-3 border-b border-[var(--border)]/40 mb-2 flex justify-between items-center">
                            <p class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">System Alerts</p>
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
                        <div v-else class="text-center py-4 text-[var(--text-muted)] text-xs">No new system alerts.</div>
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

            <!-- Account -->
            <div class="relative">
                <button @click="userStore.currentUser ? isAccountDropdownOpen = !isAccountDropdownOpen : uiStore.toggleAuth()"
                    class="group flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-all">
                    <i class="fa-solid fa-circle-user text-sm"></i>
                    <span class="text-[10px] font-bold uppercase hidden sm:inline">
                        {{ userStore.currentUser ? userStore.currentUser.name : 'Login' }}
                    </span>
                    <i v-if="userStore.currentUser" class="fa-solid fa-chevron-down text-[8px] transition-transform" :class="{'rotate-180': isAccountDropdownOpen}"></i>
                    <i v-else class="fa-solid fa-arrow-right text-[8px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></i>
                </button>

                <!-- Account Dropdown Menu -->
                <div v-if="isAccountDropdownOpen && userStore.currentUser" 
                    class="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden py-2 z-[60] animate-[settleIn_0.3s_ease]">
                    <div class="px-4 py-3 border-b border-[var(--border)]/40 mb-2">
                        <p class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Session</p>
                        <p class="text-xs font-bold truncate">{{ userStore.currentUser.email }}</p>
                    </div>
                    <router-link to="/account" @click="isAccountDropdownOpen = false" class="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-colors">
                        <i class="fa-solid fa-gauge-high text-[var(--accent)]"></i> Dashboard
                    </router-link>
                    <router-link to="/settings" @click="isAccountDropdownOpen = false" class="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--bg-muted)] transition-colors">
                        <i class="fa-solid fa-gear text-[var(--accent)]"></i> System Settings
                    </router-link>
                    <div class="h-px bg-[var(--border)]/40 my-2"></div>
                    <button @click="userStore.logout(); isAccountDropdownOpen = false" class="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                        <i class="fa-solid fa-power-off"></i> Terminate Session
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
                    <p class="text-[9px] uppercase tracking-[0.3em] font-bold text-[var(--text-muted)]">Terminal Menu</p>
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
                    <router-link to="/products" class="w-full bg-[var(--accent)] text-white py-4 rounded-full text-center font-bold block premium-btn">Shop Now</router-link>
                    <div class="flex justify-center gap-4">
                        <a v-for="icon in ['facebook', 'twitter', 'instagram']" :key="icon" href="#" class="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent)] hover:text-white transition-all">
                            <i :class="`fa-brands fa-${icon}`"></i>
                        </a>
                    </div>
                </div>
            </div>
        </Transition>
    
</template>

<style scoped>
.nav-link.router-link-active {
    color: var(--accent);
}
</style>