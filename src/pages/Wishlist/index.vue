<script setup>
import { computed } from 'vue';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useProductsStore } from '@/stores/shop/products';
import ProductCard from '@/components/cards/ProductCard.vue';

const wishlistStore = useWishlistStore();
const productsStore = useProductsStore();

const wishlistedProducts = computed(() => {
  return productsStore.sampleProducts.filter(p => wishlistStore.productIds.includes(p.id));
});
</script>

<template>
  <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
    <div class="mb-12">
      <span class="section-badge">Curated Collection</span>
      <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6">Your Wishlist</h1>
    </div>

    <div v-if="wishlistedProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <ProductCard v-for="product in wishlistedProducts" :key="product.id" :product="product" />
    </div>
    <div v-else class="text-center py-32 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)]">
      <p class="text-[var(--text-muted)]">Your wishlist is empty.</p>
    </div>
  </main>
</template>
