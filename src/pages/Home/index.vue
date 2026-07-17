<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/shop/products';
import ProductCard from '../../components/cards/ProductCard.vue';
import { useOsimartCategoriesStore } from '@/stores/catalog/osimartCategories';
import { useOsimartBannersStore } from '@/stores/catalog/osimartBanners';
import { useBrandsStore } from '@/stores/catalog/brands';
import WhyTechHubSection from '@/components/layout/WhyTechHubSection.vue';
import NewsletterSection from '@/components/layout/NewsletterSection.vue';

const router = useRouter();
const productsStore = useProductsStore();
const categoriesStore = useOsimartCategoriesStore();
const bannersStore = useOsimartBannersStore();
const brandsStore = useBrandsStore();

const featured = computed(() => {
    const featuredProducts = productsStore.featuredProducts.length
        ? productsStore.featuredProducts
        : productsStore.sampleProducts;
    return featuredProducts.slice(0, 4);
});

const activeBanner = computed(() =>
    bannersStore.banners.find((banner) => banner.is_active) ||
    bannersStore.banners[0] ||
    null
);
const fallbackHeroTitle = 'Discover the\nLatest Tech\nat Unbeatable\nPrices';
const heroTitleText = computed(() => activeBanner.value?.title || fallbackHeroTitle);
const heroTitleLines = computed(() => {
    const explicitLines = String(heroTitleText.value || fallbackHeroTitle)
        .split(/\r?\n|<br\s*\/?>/i)
        .map((line) => line.trim())
        .filter(Boolean);
    if (explicitLines.length > 1) return explicitLines.slice(0, 4);

    const words = explicitLines[0]?.split(/\s+/).filter(Boolean) || [];
    if (words.length <= 3) return [explicitLines[0] || 'Discover Tech'];
    const chunkSize = Math.ceil(words.length / 4);
    const lines = [];
    for (let index = 0; index < words.length; index += chunkSize) {
        lines.push(words.slice(index, index + chunkSize).join(' '));
    }
    return lines.slice(0, 4);
});
const heroImage = computed(() => activeBanner.value?.image || '/og-image.svg');
const heroImageAlt = computed(() => activeBanner.value?.title || activeBanner.value?.subtitle || 'TechHub premium electronics');

const trustItems = [
    { icon: 'fa-box', title: 'Live Catalog', desc: 'Products loaded from Osimart' },
    { icon: 'fa-shield-halved', title: 'Safe Ordering', desc: 'No card details collected' },
    { icon: 'fa-layer-group', title: 'Product Options', desc: 'Variant and stock visibility' },
    { icon: 'fa-headset', title: 'Order Support', desc: 'Contact our team for assistance' }
];

// Categories from API only - no fallback
const categories = computed(() => {
    // Use API categories only
    const apiCategories = categoriesStore.categories
        .filter((category) => category.is_active)
        .slice(0, 8)
        .map((category) => ({
            name: category.name,
            sub: category.slug || category.name,
            img: category.image || '',
            desc: category.description || `Explore our ${category.name} collection`,
        }));

    if (apiCategories.length > 0) {
        return apiCategories;
    }

    // If API returns empty, return empty array - loading state will handle it
    return [];
});

// Brands from API only - no fallback
const brandNames = computed(() => {
    if (brandsStore.brands.length > 0) {
        return brandsStore.brands
            .filter(b => b.is_active)
            .slice(0, 8)
            .map(b => b.name);
    }
    // Return empty array if no brands from API
    return [];
});

// Finder options
const finderOptions = [
    { label: 'Work', emoji: '💼' },
    { label: 'Study', emoji: '📚' },
    { label: 'Gaming', emoji: '🎮' },
    { label: 'Creative', emoji: '🎨' }
];

// State
const activeFinder = ref(null);
const scrollY = ref(0);
let observer = null;

// Methods
const selectFinder = (label) => activeFinder.value = label;

const generateRecommendation = () => {
    if (!activeFinder.value) return;

    const mapping = {
        'Work': 'Laptops',
        'Study': 'Laptops',
        'Gaming': 'Gaming',
        'Creative': 'Audio'
    };

    router.push({ name: 'Products', query: { category: mapping[activeFinder.value] } });
};

const filterByBrand = (brandName) => {
    productsStore.resetFilters();
    productsStore.filters.brands = [brandName];
    router.push({ name: 'Products', query: { brand: brandName } });
};

const handleScroll = () => {
    scrollY.value = window.scrollY;
};

// Lifecycle
onMounted(async () => {
    try {
        // Fetch all data in parallel
        await Promise.all([
            productsStore.fetchFeaturedProducts(),
            categoriesStore.fetchCategories({}, { force: true }),
            bannersStore.fetchBanners({}, { force: true }),
            brandsStore.fetchBrands({}, { force: true })
        ]);
    } catch (error) {
        import('@/utils/logger').then(({ default: logger }) => logger.error('Error loading home page data:', error));
    }

    window.addEventListener('scroll', handleScroll);

    // Initialize scroll reveal
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

onUnmounted(() => {
    if (observer) observer.disconnect();
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <main class="overflow-hidden">
        <!-- Hero Section -->
        <section id="home"
            class="relative min-h-screen flex items-center max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-20 overflow-hidden">
            <div class="mesh-bg">
                <div class="mesh-blob"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
                <div class="space-y-8 relative z-10 overflow-hidden">
                    <!-- Hardcoded badge text - NOT from API -->
                    <span class="section-badge hero-badge inline-flex">
                        <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-ping mr-3"></span>
                        Premium Electronics
                    </span>
                    <h1
                        class="font-[Playfair_Display] text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.06] hero-title">
                        <template v-for="(line, index) in heroTitleLines" :key="`${line}-${index}`">
                            <em v-if="index === 1" class="not-italic relative">
                                <span class="relative z-10 text-[var(--accent)]">{{ line }}</span>
                                <span
                                    class="absolute bottom-2 left-0 right-0 h-3 bg-[var(--accent)] opacity-10 -z-0 rounded"></span>
                            </em>
                            <span v-else>{{ line }}</span>
                            <br v-if="index < heroTitleLines.length - 1">
                        </template>
                    </h1>
                    <!-- Description comes from API subtitle -->
                    <p class="text-[var(--text-muted)] text-lg leading-relaxed max-w-md hero-body">
                        {{ activeBanner?.subtitle || 'Shop premium electronics, gaming gear, laptops, smartphones, and accessories — all in one place.' }}
                    </p>
                    <div class="flex flex-wrap gap-4 hero-btns">
                        <router-link to="/products"
                            class="group inline-flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                            <span>{{ activeBanner?.button || 'Shop Now' }}</span>
                            <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                        </router-link>
                        <router-link to="/categories"
                            class="flex items-center gap-3 border border-[var(--accent)] text-[var(--accent)] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                            <span>View Categories</span>
                        </router-link>
                    </div>
                </div>
                <div class="hidden lg:block relative hero-img-wrap">
                    <img :src="heroImage"
                        class="h-[580px] w-full object-cover rounded-[2.5rem] shadow-2xl relative z-10 hero-parallax"
                        width="720"
                        height="580"
                        :style="{ transform: `translateY(${scrollY * 0.08}px)` }"
                        :alt="heroImageAlt">
                </div>
            </div>
        </section>

        <!-- Trust Bar Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(t, i) in trustItems" :key="i"
                    class="reveal bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center transition-all hover:-translate-y-2 hover:shadow-xl"
                    :class="`stagger-${i + 1}`">
                    <i :class="['fa-solid', t.icon]" class="text-2xl text-[var(--accent)] mb-4 block"></i>
                    <h3 class="font-bold text-sm text-[var(--text)]">{{ t.title }}</h3>
                    <p class="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{{ t.desc }}</p>
                </div>
            </div>
        </section>

        <!-- Why TechHub Section -->
        <WhyTechHubSection />

        <!-- Categories Section -->
        <section id="categories" class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
            <div class="text-center mb-16 reveal">
                <span class="section-badge">Browse By Category</span>
                <h2 class="font-[Playfair_Display] text-5xl lg:text-6xl font-bold mt-8 mb-4">Shop by Category</h2>
                <p class="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">Explore premium technology collections
                    carefully curated for productivity, entertainment, and modern living.</p>
            </div>

            <!-- Loading State -->
            <div v-if="categoriesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div v-for="n in 4" :key="n"
                    class="h-[420px] lg:h-[500px] bg-[var(--bg-muted)] rounded-[2.5rem] animate-pulse">
                </div>
            </div>

            <!-- Categories Grid -->
            <div v-else-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <router-link v-for="cat in categories" :key="cat.name"
                    :to="{ name: 'Products', query: { category: cat.name } }"
                    class="cat-card h-[420px] lg:h-[500px] reveal group relative overflow-hidden rounded-[2.5rem]">
                    <img v-if="cat.img" :src="cat.img"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        :alt="cat.name">
                    <div class="cat-overlay"></div>
                    <div
                        class="cat-content absolute bottom-0 left-0 right-0 p-10 text-white transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                        <p class="uppercase tracking-[0.2em] text-[10px] mb-2 opacity-80">{{ cat.sub }}</p>
                        <h3 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold">{{ cat.name }}</h3>
                        <div
                            class="cat-line w-0 h-0.5 bg-[var(--accent)] mt-4 transition-all duration-500 group-hover:w-16">
                        </div>
                        <p
                            class="mt-4 text-white/70 max-w-xs text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            {{ cat.desc }}</p>
                        <div class="cat-arrow"><i class="fa-solid fa-arrow-right text-xs"></i></div>
                    </div>
                </router-link>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-12">
                <p class="text-[var(--text-muted)]">No categories available</p>
            </div>
        </section>

        <!-- Brands Section -->
        <section class="py-24 overflow-hidden">
            <div class="text-center mb-14 reveal">
                <span class="section-badge">Trusted Brands</span>
                <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Powered By Industry Leaders</h2>
                <p v-if="brandsStore.loading" class="text-[var(--text-muted)] mt-4">Loading brands...</p>
            </div>

            <!-- Brands Display -->
            <div v-if="brandNames.length > 0" class="brand-fade relative">
                <div class="brand-track flex gap-8">
                    <div v-for="(b, i) in brandNames" :key="i" @click="filterByBrand(b)"
                        class="min-w-[180px] h-[90px] glass-panel rounded-2xl flex items-center justify-center font-bold text-xl opacity-40 hover:opacity-100 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer">
                        {{ b }}
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!brandsStore.loading" class="text-center">
                <p class="text-[var(--text-muted)]">No brands available</p>
            </div>
        </section>

        <!-- Featured Products -->
        <section id="products" class="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 reveal">
                <div>
                    <span class="section-badge">Featured Products</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Hot Picks This Week</h2>
                    <p v-if="productsStore.loading" class="text-[var(--text-muted)] mt-4">Loading products...</p>
                    <p v-if="productsStore.error" class="text-red-500 mt-4 text-sm">{{ productsStore.error }}</p>
                </div>
                <router-link to="/products"
                    class="text-[var(--accent)] text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    View All <i class="fa-solid fa-arrow-right text-xs"></i>
                </router-link>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <ProductCard v-for="(p, i) in featured" :key="p.id" :product="p" class="reveal"
                    :class="`reveal-delay-${i + 1}`" />
            </div>
        </section>

        <!-- Offers Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div class="newsletter-section reveal text-center relative z-10">
                <div class="relative z-10">
                    <span class="section-badge">Current Offers</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Explore Current Deals</h2>
                    <p class="mt-4 text-[var(--text-muted)] max-w-md mx-auto">View discounts supplied by current Osimart pricing—without fabricated countdowns.</p>

                    <div class="mt-12">
                        <router-link to="/deals"
                            class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-xl">
                            View Deals
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <!-- Product Finder Section -->
        <section class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div
                class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] p-8 lg:p-20 reveal overflow-hidden relative">
                <div class="text-center relative z-10">
                    <span class="section-badge">Curated Recommendations</span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-5xl font-bold mt-6">Find Your Perfect Device
                    </h2>
                    <p class="mt-6 text-[var(--text-muted)] max-w-2xl mx-auto">Select your primary use case and discover
                        products tailored to your professional or creative execution needs.</p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 relative z-10">
                    <button v-for="opt in finderOptions" :key="opt.label" @click="selectFinder(opt.label)"
                        :class="activeFinder === opt.label ? 'border-[var(--accent)] bg-[var(--bg-muted)] shadow-xl -translate-y-2' : 'border-transparent bg-[var(--bg-muted)]/50'"
                        class="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2">
                        <span class="text-4xl">{{ opt.emoji }}</span>
                        <span class="font-bold uppercase tracking-widest text-xs">{{ opt.label }}</span>
                    </button>
                </div>

                <div class="text-center mt-16 relative z-10">
                    <button @click="generateRecommendation"
                        class="bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-2xl">
                        Generate Recommendations
                    </button>
                </div>
            </div>
        </section>

        <!-- Newsletter -->
        <NewsletterSection />
    </main>
</template>

<style scoped>
@keyframes float {
    0% {
        transform: translateY(0px) rotate(0deg);
    }

    100% {
        transform: translateY(-20px) rotate(1deg);
    }
}

/* Add any additional styles here if needed */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.visible {
    opacity: 1;
    transform: translateY(0);
}

.reveal-delay-1 {
    transition-delay: 0.1s;
}

.reveal-delay-2 {
    transition-delay: 0.2s;
}

.reveal-delay-3 {
    transition-delay: 0.3s;
}

.reveal-delay-4 {
    transition-delay: 0.4s;
}

.reveal-delay-5 {
    transition-delay: 0.5s;
}
</style>
