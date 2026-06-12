<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useUserStore } from '../../stores/user';
import { useProductsStore } from '../../stores/products';
import { useWishlistStore } from '../../stores/wishlist';
import { useUIStore } from '../../stores/ui';

const cartStore = useCartStore();
const userStore = useUserStore();
const productsStore = useProductsStore();
const wishlistStore = useWishlistStore();
const uiStore = useUIStore();

const isScrolled = ref(false);
const isDark = ref(false);
const isMobileMenuOpen = ref(false);

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
            <router-link to="/categories" class="nav-link text-[10px] font-bold uppercase">Categories</router-link>
            <router-link to="/deals" class="nav-link text-[10px] font-bold uppercase">Deals</router-link>
            <router-link to="/about" class="nav-link text-[10px] font-bold uppercase">About</router-link>
        </div>

        <!-- Action Terminal -->
        <div class="flex items-center gap-3">
            <button @click="productsStore.searchModalOpen = true" class="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors hidden sm:block">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
            </button>

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
            <button @click="userStore.currentUser ? $router.push('/account') : uiStore.toggleAuth()" 
                class="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-all">
                <i class="fa-solid fa-circle-user text-sm"></i>
                <span class="text-[10px] font-bold uppercase hidden sm:inline">{{ userStore.currentUser ? 'Terminal' : 'Access' }}</span>
            </button>

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
                <button @click="isMobileMenuOpen = false" class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-muted)]">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
                <div class="mb-12">
                    <p class="text-[9px] uppercase tracking-[0.3em] font-bold text-[var(--text-muted)]">Terminal Menu</p>
                </div>
                <div class="flex flex-col gap-8">
                    <router-link v-for="link in ['Home', 'Products', 'Categories', 'Deals', 'About']" 
                        :key="link" :to="link === 'Home' ? '/' : `/${link.toLowerCase()}`" 
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