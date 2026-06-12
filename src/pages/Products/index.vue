<script setup>
import { ref, computed } from 'vue';
import { useProductsStore } from '@/stores/products';
import ProductCard from '@/components/cards/ProductCard.vue';

const productsStore = useProductsStore();
const activeCat = ref('All');
const sortBy = ref('default');

const filteredProducts = computed(() => {
    let list = [...productsStore.sampleProducts];
    if (activeCat.value !== 'All') {
        list = list.filter(p => p.category === activeCat.value);
    }
    if (sortBy.value === 'low-high') {
        list.sort((a, b) => a.price - b.price);
    } else if (sortBy.value === 'high-low') {
        list.sort((a, b) => b.price - a.price);
    }
    return list;
});
</script>

<template>
    <main class="pt-32 max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[var(--border)]">
            <div>
                <h1 class="font-[Playfair_Display] text-4xl font-bold mb-2">Provisions Catalog</h1>
                <p class="text-sm text-[var(--text-muted)]">Browse technical hardware models engineered for professional
                    execution.</p>
            </div>

            <div class="flex flex-wrap gap-3 items-center">
                <label class="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Sort
                    Parameters</label>
                <select v-model="sortBy"
                    class="bg-[var(--bg-card)] border border-[var(--border)] px-4 py-2 rounded-full text-xs focus:outline-none">
                    <option value="default">Standard Placement</option>
                    <option value="low-high">Price: Ascending</option>
                    <option value="high-low">Price: Descending</option>
                </select>
            </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button v-for="cat in productsStore.categories" :key="cat" @click="activeCat = cat"
                :class="activeCat === cat ? 'active' : ''" class="category-pill whitespace-nowrap">
                {{ cat }}
            </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
        </div>
    </main>
</template>