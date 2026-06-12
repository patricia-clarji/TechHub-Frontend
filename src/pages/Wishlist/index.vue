<script setup>
import { computed } from 'vue';
import { useWishlistStore } from '@/stores/wishlist';
import { useProductsStore } from '@/stores/products';
import ProductCard from '@/components/cards/ProductCard.vue';

const wishlistStore = useWishlistStore();
const productsStore = useProductsStore();

const wishlistProducts = computed(() => {
    return productsStore.sampleProducts.filter(p => wishlistStore.productIds.includes(p.id));
});
</script>

<template>
    <main class="pt-32 max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
        <div>
            <h1 class="font-[Playfair_Display] text-4xl font-bold mb-2">Saved Wishlist</h1>
            <p class="text-sm text-[var(--text-muted)]">Your personalized collection of curated premium electronic
                choices.</p>
        </div>

        <div v-if="wishlistProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard v-for="p in wishlistProducts" :key="p.id" :product="p" />
        </div>

        <div v-else
            class="text-center py-24 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] max-w-2xl mx-auto px-6">
            <i class="fa-regular fa-heart text-4xl text-[var(--border)] mb-4 block"></i>
            <h3 class="font-[Playfair_Display] text-xl font-bold mb-2">Wishlist is Blank</h3>
            <p class="text-sm text-[var(--text-muted)] mb-6">Explore the provisions catalog to assign models to this
                dashboard placement.</p>
            <router-link to="/products"
                class="bg-[var(--accent)] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full premium-btn">Browse
                Catalog</router-link>
        </div>
    </main>
</template>