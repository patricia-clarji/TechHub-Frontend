<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import FilterSidebar from '@/stores/FilterSidebar.vue';
import ProductCard from '@/components/cards/ProductCard.vue';

const route = useRoute();
const productsStore = useProductsStore();

// Sync category from URL query if present (e.g. from Home page Finder)
onMounted(() => {
    document.title = 'System Catalog | TechHub - High-End Hardware Provisions';
    if (route.query.category) {
        productsStore.filters.category = route.query.category;
    }
});

watch(() => route.query.category, (newCat) => {
    if (newCat) productsStore.filters.category = newCat;
});
</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div class="flex flex-col lg:flex-row gap-12">
            <!-- Sidebar -->
            <div class="w-full lg:w-64 flex-none">
                <div class="sticky top-32">
                    <FilterSidebar />
                </div>
            </div>

            <!-- Product Grid -->
            <div class="flex-1">
                <!-- Header & Sort -->
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 class="font-[Playfair_Display] text-4xl font-bold">System Catalog</h1>
                        <p class="text-xs text-[var(--text-muted)] mt-2 font-bold uppercase tracking-widest">
                            {{ productsStore.filteredProducts.length }} Active Modules Found
                        </p>
                    </div>

                    <div class="hidden lg:flex items-center gap-4">
                        <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Sort Parameters:</label>
                        <select v-model="productsStore.sortBy" class="bg-transparent border-b border-[var(--border)] py-1 text-xs font-bold focus:outline-none focus:border-[var(--accent)] cursor-pointer">
                            <option value="featured">Featured Default</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="rating">Top Rated Elite</option>
                            <option value="price-low">Price: Ascending</option>
                            <option value="price-high">Price: Descending</option>
                        </select>
                    </div>
                </div>

                <!-- Results -->
                <div v-if="productsStore.filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    <TransitionGroup name="list">
                        <ProductCard 
                            v-for="product in productsStore.filteredProducts" 
                            :key="product.id" 
                            :product="product" 
                        />
                    </TransitionGroup>
                </div>

                <!-- Empty State -->
                <div v-else class="py-32 text-center bg-[var(--bg-muted)]/30 rounded-[3rem] border border-dashed border-[var(--border)]">
                    <i class="fa-solid fa-microchip text-4xl text-[var(--border)] mb-6"></i>
                    <h3 class="font-bold text-xl">No matching configurations found</h3>
                    <p class="text-[var(--text-muted)] text-sm mt-2">Adjust your filtering parameters to expand the search matrix.</p>
                    <button @click="productsStore.resetFilters" class="mt-8 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest border border-[var(--accent)] px-6 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all">
                        Reset All Parameters
                    </button>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }
</style>