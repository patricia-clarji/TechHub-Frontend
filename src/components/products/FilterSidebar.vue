<script setup>
import { computed } from 'vue';
import { useProductsStore } from '@/stores/shop/products';
import { useBrandsStore } from '@/stores/catalog/brands';

const productsStore = useProductsStore();
const brandsStore = useBrandsStore();

// Use brandFilterOptions from products store (which includes counts and active state)
const brandOptions = computed(() => {
    return productsStore.brandFilterOptions || [];
});

// Check if brands are loading
const isLoadingBrands = computed(() => brandsStore.loading);
</script>

<template>
    <aside class="space-y-10 py-2 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 custom-scrollbar">
        <!-- Search -->
        <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Search products
            </h4>
            <div class="relative">
                <label for="catalog-search" class="sr-only">Search products</label>
                <input id="catalog-search" v-model="productsStore.searchQueries" type="search" placeholder="Search by name, brand, or category"
                    class="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[var(--accent)]" />
                <i
                    class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]"></i>
            </div>
        </div>

        <!-- Search/Sort Context (Mobile Optimization) -->
        <div class="lg:hidden mb-8">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">Sort
                By</label>
            <select v-model="productsStore.sortBy"
                class="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)]">
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
            </select>
        </div>

        <!-- Categories -->
        <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Product
                categories</h4>
            <div class="space-y-2">
                <button v-for="cat in productsStore.categories" :key="cat" @click="productsStore.filters.category = cat"
                    :class="productsStore.filters.category === cat ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-muted)] text-[var(--text-muted)]'"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                    {{ cat }}
                </button>
            </div>
        </div>

        <!-- Price Range -->
        <div>
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Price range
                </h4>
                <span class="text-[10px] font-bold text-[var(--accent)]">${{ productsStore.filters.maxPrice }}</span>
            </div>
            <div class="px-2">
                <label class="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest block mb-2">Max
                    price</label>
                <input type="range" v-model.number="productsStore.filters.maxPrice" min="50" max="2500" step="50"
                    class="w-full accent-[var(--accent)]" />
                <div
                    class="flex justify-between mt-2 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    <span>$0</span>
                    <span>$2500+</span>
                </div>
            </div>
        </div>

        <!-- Brands -->
        <div>
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Brands</h4>
                <span v-if="isLoadingBrands" class="text-[9px] text-[var(--text-muted)]">Loading...</span>
                <span v-else class="text-[9px] text-[var(--text-muted)]">{{ brandOptions.length }} brands</span>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingBrands" class="space-y-3">
                <div v-for="n in 5" :key="n" class="h-8 bg-[var(--bg-muted)] rounded-xl animate-pulse"></div>
            </div>

            <!-- Brand List -->
            <div v-else class="space-y-3">
                <label v-for="brand in brandOptions" :key="brand.name"
                    class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                        <input type="checkbox" :value="brand.name" v-model="productsStore.filters.brands"
                            class="peer hidden" />
                        <div
                            class="w-5 h-5 border-2 border-[var(--border)] rounded-lg peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all">
                        </div>
                        <i
                            class="fa-solid fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                    </div>
                    <span
                        class="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{{
                        brand.name }}</span>
                    <span class="text-[9px] text-[var(--text-muted)] ml-auto">({{ brand.count }})</span>
                </label>
            </div>

            <!-- Empty State -->
            <div v-if="!isLoadingBrands && brandOptions.length === 0" class="text-center py-4">
                <p class="text-xs text-[var(--text-muted)]">No brands available</p>
            </div>
        </div>

        <!-- Availability -->
        <div class="pt-6 border-t border-[var(--border)]/40">
            <label class="flex items-center justify-between cursor-pointer">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Immediate
                    In stock only</span>
                <div class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="productsStore.filters.onlyInStock" class="sr-only peer">
                    <div
                        class="w-11 h-6 bg-[var(--bg-muted)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]">
                    </div>
                </div>
            </label>
        </div>

        <!-- Reset -->
        <button @click="productsStore.resetFilters"
            class="w-full border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
            Clear all filters
        </button>
    </aside>
</template>

<style scoped>
/* Custom scrollbar for the sidebar to match the premium aesthetic */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
}

input[type=range] {
    -webkit-appearance: none;
    background: transparent;
}

input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: var(--bg-muted);
    border-radius: 2px;
    border: 1px solid var(--border);
}
</style>
