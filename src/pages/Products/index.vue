<script setup>
import { onMounted, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/shop/products';
import { useBrandsStore } from '@/stores/catalog/brands';
import { useOsimartCategoriesStore } from '@/stores/catalog/osimartCategories';
import FilterSidebar from '@/components/products/FilterSidebar.vue';
import ProductCard from '@/components/cards/ProductCard.vue';
import NewsletterSection from '@/components/layout/NewsletterSection.vue';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const brandsStore = useBrandsStore();
const categoriesStore = useOsimartCategoriesStore();
let applyingRoute = false;

const firstQueryValue = (value) => Array.isArray(value) ? value[0] : value;
const numberQuery = (value, fallback) => {
    const parsed = Number(firstQueryValue(value));
    return Number.isFinite(parsed) ? parsed : fallback;
};
const brandsFromQuery = (value) => String(firstQueryValue(value) || '')
    .split(',')
    .map((brand) => brand.trim())
    .filter(Boolean);

const applyRouteQuery = async (query) => {
    applyingRoute = true;
    productsStore.filters.category = firstQueryValue(query.category) || 'All';
    productsStore.filters.brands = brandsFromQuery(query.brand);
    productsStore.filters.minPrice = Math.max(0, numberQuery(query.minPrice, 0));
    productsStore.filters.maxPrice = Math.max(productsStore.filters.minPrice, numberQuery(query.maxPrice, 2500));
    productsStore.filters.onlyInStock = firstQueryValue(query.stock) === 'in';
    productsStore.searchQueries = String(firstQueryValue(query.search) || '').slice(0, 100);
    productsStore.sortBy = ['featured', 'newest', 'rating', 'price-low', 'price-high'].includes(firstQueryValue(query.sort))
        ? firstQueryValue(query.sort)
        : 'featured';
    await nextTick();
    applyingRoute = false;
};

const buildQuery = () => {
    const query = {};
    if (productsStore.filters.category !== 'All') query.category = productsStore.filters.category;
    if (productsStore.filters.brands.length) query.brand = productsStore.filters.brands.join(',');
    if (productsStore.searchQueries.trim()) query.search = productsStore.searchQueries.trim();
    if (productsStore.sortBy !== 'featured') query.sort = productsStore.sortBy;
    if (productsStore.filters.minPrice > 0) query.minPrice = String(productsStore.filters.minPrice);
    if (productsStore.filters.maxPrice < 2500) query.maxPrice = String(productsStore.filters.maxPrice);
    if (productsStore.filters.onlyInStock) query.stock = 'in';
    return query;
};

const stableQuery = (query) => new URLSearchParams(
    Object.entries(query).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, String(value)])
).toString();

watch(() => route.query, (query) => applyRouteQuery(query), { immediate: true });

watch([
    () => productsStore.filters.category,
    () => [...productsStore.filters.brands],
    () => productsStore.filters.minPrice,
    () => productsStore.filters.maxPrice,
    () => productsStore.filters.onlyInStock,
    () => productsStore.searchQueries,
    () => productsStore.sortBy,
], () => {
    if (applyingRoute) return;
    const nextQuery = buildQuery();
    if (stableQuery(nextQuery) !== stableQuery(route.query)) {
        router.replace({ name: 'Products', query: nextQuery });
    }
});

onMounted(async () => {
    await Promise.all([
        productsStore.fetchProducts(),
        brandsStore.fetchBrands(),
        categoriesStore.fetchCategories(),
    ]);
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

</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div class="flex flex-col lg:flex-row gap-12">
            <div class="w-full lg:w-64 flex-none">
                <div class="sticky top-32">
                    <FilterSidebar />
                </div>
            </div>

            <div class="flex-1">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 class="font-[Playfair_Display] text-4xl font-bold">Products</h1>
                        <p class="text-xs text-[var(--text-muted)] mt-2 font-bold uppercase tracking-widest">
                            {{ productsStore.filteredProducts.length }} Products Found
                        </p>
                        <p v-if="productsStore.loading" class="text-xs text-[var(--text-muted)] mt-1">
                            Loading products…
                        </p>
                        <p v-if="productsStore.error" class="text-xs text-red-500 mt-1">
                            {{ productsStore.error }}
                        </p>
                    </div>

                    <div class="hidden lg:flex items-center gap-4">
                        <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Sort
                            by:</label>
                        <select v-model="productsStore.sortBy"
                            class="bg-transparent border-b border-[var(--border)] py-1 text-xs font-bold focus:outline-none focus:border-[var(--accent)] cursor-pointer">
                            <option value="featured">Featured</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="rating">Top Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div v-if="activeFilterTags.length > 0" class="flex flex-wrap gap-2 mb-8 animate-in">
                    <span
                        class="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] self-center mr-2">Active
                        filters:</span>
                    <button v-for="tag in activeFilterTags" :key="tag.label" @click="removeTag(tag)"
                        class="group flex items-center gap-2 bg-[var(--bg-muted)] border border-[var(--border)] px-4 py-1.5 rounded-full text-[10px] font-bold transition-all hover:border-[var(--accent)] hover:bg-white">
                        {{ tag.label }}
                        <i class="fa-solid fa-xmark text-[8px] opacity-40 group-hover:opacity-100"></i>
                    </button>
                    <button @click="productsStore.resetFilters"
                        class="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest ml-2 hover:underline">Clear
                        All</button>
                </div>

                <div v-if="productsStore.loading || productsStore.filteredProducts.length > 0">
                    <div v-if="productsStore.loading"
                        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div v-for="n in 6" :key="n"
                            class="h-[450px] bg-[var(--bg-muted)]/40 rounded-[2rem] animate-pulse"></div>
                    </div>
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        <TransitionGroup name="list">
                            <ProductCard v-for="product in productsStore.filteredProducts" :key="product.id"
                                :product="product" />
                        </TransitionGroup>
                    </div>
                </div>

                <div v-else
                    class="py-32 text-center bg-[var(--bg-muted)]/30 rounded-[3rem] border border-dashed border-[var(--border)]">
                    <i class="fa-solid fa-microchip text-4xl text-[var(--border)] mb-6"></i>
                    <h3 class="font-bold text-xl">{{ productsStore.error ? 'Products could not be loaded' : 'No matching products' }}</h3>
                    <p class="text-[var(--text-muted)] text-sm mt-2">{{ productsStore.error ? 'Check your connection and try again.' : 'Try adjusting your search or filters.' }}</p>
                    <button @click="productsStore.error ? productsStore.fetchProducts({}, { force: true }) : productsStore.resetFilters()"
                        class="mt-8 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest border border-[var(--accent)] px-6 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all">
                        {{ productsStore.error ? 'Try again' : 'Clear filters' }}
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-24 pt-24 border-t border-[var(--border)]">
            <NewsletterSection />
        </div>
    </main>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.animate-in {
    animation: settleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
</style>
