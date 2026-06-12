<script setup>
import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useProductsStore } from '@/stores/products';

const props = defineProps({
    product: {
        type: Object,
        required: true
    }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const productsStore = useProductsStore();

const isInWishlist = computed(() => wishlistStore.productIds.includes(props.product.id));

const toggleWishlist = () => {
    wishlistStore.toggleWishlist(props.product.id);
};

const addToCart = () => {
    cartStore.addToCart(props.product.id);
};

const openQuickView = () => {
    productsStore.quickViewProductId = props.product.id;
};
</script>

<template>
    <div class="product-card group relative flex flex-col h-full bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--glow)]">
        <!-- Image Container & Hover Actions -->
        <div class="relative overflow-hidden aspect-[4/3] bg-[var(--bg-muted)]">
            <img :src="product.img" :alt="product.name" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <!-- Quick View Overlay -->
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <button @click="openQuickView" 
                    class="bg-white/95 dark:bg-[var(--bg-card)]/95 text-[var(--text)] px-5 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-105 shadow-2xl flex items-center gap-2">
                    <i class="fa-solid fa-expand"></i>
                    <span>QUICK VIEW</span>
                </button>
            </div>

            <!-- Category Label -->
            <div class="absolute top-4 left-4">
                <span class="bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
                    {{ product.category }}
                </span>
            </div>

            <!-- Wishlist Toggle -->
            <button @click="toggleWishlist" 
                class="absolute top-4 right-4 w-9 h-9 rounded-full glass-panel flex items-center justify-center transition-all hover:scale-110"
                :class="{ 'text-red-500 bg-white/20': isInWishlist, 'text-white': !isInWishlist }">
                <i :class="isInWishlist ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            </button>
        </div>

        <!-- Product Metadata -->
        <div class="p-6 flex flex-col flex-grow space-y-4">
            <div class="flex-grow">
                <h3 class="font-[Playfair_Display] text-xl font-bold leading-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-300">
                    {{ product.name }}
                </h3>
                <p class="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                    {{ product.desc }}
                </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-[var(--border)]/50">
                <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Deployment MSRP</span>
                    <span class="text-lg font-black text-[var(--accent)]">$ {{ product.price }}</span>
                </div>
                
                <button @click="addToCart" 
                    class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white p-3.5 rounded-2xl transition-all premium-btn shadow-lg hover:shadow-[var(--glow)]">
                    <i class="fa-solid fa-cart-plus text-sm"></i>
                </button>
            </div>
        </div>
    </div>
</template>