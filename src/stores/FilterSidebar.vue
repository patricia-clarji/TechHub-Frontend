<script setup>
import { useProductsStore } from '@/stores/products';

const productsStore = useProductsStore();
</script>

<template>
    <aside class="space-y-10 py-2 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 custom-scrollbar">
        <!-- Search Terminal -->
        <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Search Catalog</h4>
            <div class="relative">
                <input 
                    v-model="productsStore.searchQueries"
                    type="text" 
                    placeholder="Keyword lookup..." 
                    class="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[var(--accent)]"
                />
                <i class="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]"></i>
            </div>
        </div>

        <!-- Search/Sort Context (Mobile Optimization) -->
        <div class="lg:hidden mb-8">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 block">Sort By</label>
            <select v-model="productsStore.sortBy" class="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)]">
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
            </select>
        </div>

        <!-- Categories -->
        <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Product Classification</h4>
            <div class="space-y-2">
                <button 
                    v-for="cat in productsStore.categories" 
                    :key="cat"
                    @click="productsStore.filters.category = cat"
                    :class="productsStore.filters.category === cat ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-muted)] text-[var(--text-muted)]'"
                    class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                    {{ cat }}
                </button>
            </div>
        </div>

        <!-- Price Range -->
        <div>
            <div class="flex justify-between items-center mb-6">
                <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Price Parameters</h4>
                <span class="text-[10px] font-bold text-[var(--accent)]">${{ productsStore.filters.maxPrice }}</span>
            </div>
            <div class="px-2">
                <label class="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest block mb-2">Max Price Threshold</label>
                <input 
                    type="range" 
                    v-model.number="productsStore.filters.maxPrice" 
                    min="50" 
                    max="2500" 
                    step="50"
                    class="w-full accent-[var(--accent)]"
                />
                <div class="flex justify-between mt-2 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    <span>$0</span>
                    <span>$2500+</span>
                </div>
            </div>
        </div>

        <!-- Brands -->
        <div>
            <h4 class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Brand Nodes</h4>
            <div class="space-y-3">
                <label v-for="brand in productsStore.brands" :key="brand" class="flex items-center gap-3 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            :value="brand" 
                            v-model="productsStore.filters.brands"
                            class="peer hidden"
                        />
                        <div class="w-5 h-5 border-2 border-[var(--border)] rounded-lg peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-all"></div>
                        <i class="fa-solid fa-check text-[10px] text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                    </div>
                    <span class="text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{{ brand }}</span>
                </label>
            </div>
        </div>

        <!-- Availability -->
        <div class="pt-6 border-t border-[var(--border)]/40">
            <label class="flex items-center justify-between cursor-pointer">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Immediate Availability</span>
                <div class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="productsStore.filters.onlyInStock" class="sr-only peer">
                    <div class="w-11 h-6 bg-[var(--bg-muted)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </div>
            </label>
        </div>

        <!-- Reset -->
        <button 
            @click="productsStore.resetFilters"
            class="w-full border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
        >
            Reset All Parameters
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