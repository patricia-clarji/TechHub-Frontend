<script setup>
import { computed } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useProductsStore } from '@/stores/shop/products';
import { useUIStore } from '@/stores/ui/ui';

const props = defineProps({
    product: { type: Object, required: true }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const productsStore = useProductsStore();
const uiStore = useUIStore();

const isInWishlist = computed(() => wishlistStore.productIds.includes(props.product.id));
const isComparing = computed(() => productsStore.compareIds.includes(props.product.id));
const isLowStock = computed(() => props.product.stock > 0 && props.product.stock < 5);
</script>

<template>
    <div class="product-card group relative flex flex-col h-full bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
        <!-- Badge Logic -->
        <div class="absolute top-4 left-4 z-10">
            <span class="bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
                {{ product.category }}
            </span>
        </div>

        <!-- Wishlist Toggle -->
        <button @click.stop="wishlistStore.toggleWishlist(product.id)" type="button"
            :aria-label="isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
            class="absolute top-4 right-4 z-10 w-10 h-10 glass-panel-wishlist text-[var(--text)] rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110">
            <i :class="isInWishlist ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
        </button>

        <!-- Comparison Toggle -->
        <button @click.stop="productsStore.toggleCompare(product.id)" type="button"
            :aria-label="isComparing ? `Remove ${product.name} from comparison` : `Compare ${product.name}`"
            class="absolute top-16 right-4 z-10 w-10 h-10 glass-panel-wishlist text-[var(--text)] rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
            :class="{'bg-[var(--accent)]! text-white!': isComparing}">
            <i class="fa-solid fa-layer-group text-xs"></i>
        </button>

        <figure class="relative overflow-hidden aspect-square bg-[var(--bg-muted)]">
            <img :src="product.img" :alt="product.name" loading="lazy" decoding="async"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <!-- Quick View Overlay -->
            <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <button @click="uiStore.openQuickView(product.id)" 
                    class="bg-white/95 dark:bg-[var(--bg-card)]/95 text-[var(--text)] px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
                    Quick View
                </button>
            </div>
        </figure>

        <div class="p-6 flex flex-col flex-grow">
            <div class="flex items-center mb-2">
                <span class="text-[9px] text-[var(--accent)] font-bold uppercase tracking-[0.2em]">{{ product.brand || 'Featured product' }}</span>
                <!-- Low Stock Pulse -->
                <span v-if="isLowStock" class="ml-auto flex items-center gap-1.5 text-[8px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Only {{ product.stock }} left
                </span>
            </div>
            <router-link :to="{ name: 'ProductDetail', params: { identifier: product.slug || product.id } }"
                class="font-[Playfair_Display] text-xl font-bold leading-tight text-[var(--text)] hover:text-[var(--accent)] mb-3 line-clamp-1 transition-colors">
                {{ product.name }}
            </router-link>
            <p class="text-xs text-[var(--text-muted)] line-clamp-2 mb-6 leading-relaxed flex-grow">
                {{ product.desc }}
            </p>
            <!-- Star Rating Display -->
            <div class="flex items-center gap-1 mb-4">
                <i v-for="n in 5" :key="n" 
                   :class="n <= product.averageRating ? 'fa-solid text-[var(--accent)]' : 'fa-regular text-[var(--text-muted)]'" 
                   class="fa-star text-xs"></i>
                <span class="text-xs text-[var(--text-muted)] ml-2">({{ product.reviews.length }} reviews)</span>
            </div>

            <div class="pt-4 border-t border-[var(--border)]/60 flex items-center justify-between">
                <div class="flex flex-col">
                    <span class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Price</span>
                    <span class="text-lg font-black text-[var(--accent)]">$ {{ Number(product.price).toFixed(2) }}</span>
                </div>
                <button @click="cartStore.addToCart(product)" type="button"
                    :disabled="!product.inStock || cartStore.loading"
                    :aria-label="product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`"
                    class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white p-3.5 rounded-2xl transition-all premium-btn shadow-lg disabled:opacity-40 disabled:cursor-not-allowed">
                    <i :class="cartStore.loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-cart-plus'"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}
.product-card:hover {
    border-color: var(--accent);
}
.glass-panel-wishlist {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
html.dark .glass-panel-wishlist {
    background: rgba(0, 0, 0, 0.3);
}
</style>
