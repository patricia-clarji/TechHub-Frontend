<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductsStore } from '@/stores/products';
import ProductCard from '@/components/cards/ProductCard.vue';

const productsStore = useProductsStore();
const selectedCategory = ref('All');
const sortBy = ref('default');

const filteredProducts = computed(() => {
    let list = [...productsStore.sampleProducts];
    if (selectedCategory.value !== 'All') {
        list = list.filter(p => p.category === selectedCategory.value);
    }
    if (sortBy.value === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sortBy.value === 'price-high') list.sort((a, b) => b.price - a.price);
    return list;
});

onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div class="mb-12 reveal">
            <span class="section-badge">Asset Catalog</span>
            <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6">Premium Provisions</h1>
        </div>

        <!-- Filters & Sort -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] reveal">
            <div class="flex flex-wrap gap-2">
                <button v-for="cat in productsStore.categories" :key="cat" 
                    @click="selectedCategory = cat"
                    :class="['category-pill', selectedCategory === cat ? 'active' : '']">
                    {{ cat }}
                </button>
            </div>
            <select v-model="sortBy" class="bg-[var(--bg)] border border-[var(--border)] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest outline-none">
                <option value="default">Default Sequence</option>
                <option value="price-low">Value: Low to High</option>
                <option value="price-high">Value: High to Low</option>
            </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" class="reveal" />
        </div>
    </main>
</template>