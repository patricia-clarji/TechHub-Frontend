<script setup>
import { computed, onMounted } from 'vue';
import { useProductsStore } from '@/stores/shop/products';
import ProductCard from '@/components/cards/ProductCard.vue';

const productsStore = useProductsStore();
const discountedProducts = computed(() => productsStore.sampleProducts.filter(
  (product) => Number(product.oldPrice) > Number(product.price),
));
onMounted(() => productsStore.fetchProducts());
</script>

<template>
  <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
    <span class="section-badge">Current offers</span>
    <h1 class="font-[Playfair_Display] text-5xl font-bold mt-5">Deals</h1>
    <p class="text-[var(--text-muted)] mt-3 mb-12">Offers shown here come directly from current Osimart pricing.</p>

    <div v-if="productsStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="n in 6" :key="n" class="h-[450px] bg-[var(--bg-muted)] rounded-[2rem] animate-pulse"></div>
    </div>
    <div v-else-if="discountedProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <ProductCard v-for="product in discountedProducts" :key="product.id" :product="product" />
    </div>
    <section v-else class="text-center py-24 border border-dashed border-[var(--border)] rounded-[2rem]">
      <h2 class="font-bold text-xl">No active deals right now</h2>
      <p class="text-[var(--text-muted)] mt-2">Browse the full catalog for current products and prices.</p>
      <router-link to="/products" class="inline-block mt-6 bg-[var(--accent)] text-white px-7 py-3 rounded-full font-bold">Browse Products</router-link>
    </section>
  </main>
</template>
