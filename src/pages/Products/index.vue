<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import { useUIStore } from '@/stores/ui';
import FilterSidebar from '@/stores/FilterSidebar.vue';
import ProductCard from '@/components/cards/ProductCard.vue';
import NewsletterSection from '@/components/layout/NewsletterSection.vue';

const route = useRoute();
const productsStore = useProductsStore();
const uiStore = useUIStore();

const isLoading = ref(false);

// Simulate loading state for filters
watch([() => productsStore.filters, () => productsStore.searchQueries], () => {
    isLoading.value = true;
    setTimeout(() => isLoading.value = false, 400);
}, { deep: true });

// Sync category/brand from URL query if present (e.g. from Home page Finder / Trusted Brands)
onMounted(() => {
    document.title = 'System Catalog | TechHub - High-End Hardware Provisions';
    if (route.query.category) {
        productsStore.filters.category = route.query.category;
    }
    if (route.query.brand) {
        productsStore.filters.brands = [route.query.brand];
    }
});

// Active filter logic for tags
const activeFilterTags = computed(() => {
    const tags = [];
    if (productsStore.filters.category !== 'All') tags.push({ type: 'category', label: productsStore.filters.category });
    if (productsStore.filters.maxPrice < 2500) tags.push({ type: 'price', label: `Under $${productsStore.filters.maxPrice}` });
    productsStore.filters.brands.forEach(b => tags.push({ type: 'brand', label: b, value: b }));
    return tags;
});

const removeTag = (tag) => {
    if (tag.type === 'category') productsStore.filters.category = 'All';
    if (tag.type === 'price') productsStore.filters.maxPrice = 2500;
    if (tag.type === 'brand') productsStore.filters.brands = productsStore.filters.brands.filter(b => b !== tag.value);
};

watch(() => route.query.category, (newCat) => {
    if (newCat) productsStore.filters.category = newCat;
    else productsStore.filters.category = 'All';
});

watch(() => route.query.brand, (newBrand) => {
    if (newBrand) {
        productsStore.filters.brands = [newBrand];
    } else {
        productsStore.filters.brands = [];
    }
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

                <!-- Active Filter Tags -->
                <div v-if="activeFilterTags.length > 0" class="flex flex-wrap gap-2 mb-8 animate-in">
                    <span class="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] self-center mr-2">Active Parameters:</span>
                    <button v-for="tag in activeFilterTags" :key="tag.label" 
                        @click="removeTag(tag)"
                        class="group flex items-center gap-2 bg-[var(--bg-muted)] border border-[var(--border)] px-4 py-1.5 rounded-full text-[10px] font-bold transition-all hover:border-[var(--accent)] hover:bg-white">
                        {{ tag.label }}
                        <i class="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
                    </button>
                    <button @click="productsStore.resetFilters" class="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest ml-2 hover:underline">Clear All</button>
                </div>

                <!-- Results -->
                <div v-if="productsStore.filteredProducts.length > 0">
                    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div v-for="n in 6" :key="n" class="h-[450px] bg-[var(--bg-muted)]/40 rounded-[2rem] animate-pulse"></div>
                    </div>
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        <TransitionGroup name="list">
                            <ProductCard 
                                v-for="product in productsStore.filteredProducts" 
                                :key="product.id" 
                                :product="product" 
                            />
                        </TransitionGroup>
                    </div>
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

        <!-- Continuous Integrated Feed -->
        <div class="mt-24 pt-24 border-t border-[var(--border)]">
            <NewsletterSection />
        </div>
    </main>
</template>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(30px); }
</style>