<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useRecentlyViewedStore } from '@/stores/recentlyViewed';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const recentlyViewedStore = useRecentlyViewedStore();

const quantity = ref(1);
let observer = null;

const initObserver = () => {
    if (observer) observer.disconnect();
    
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Use nextTick to ensure v-if has rendered the elements
    nextTick(() => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    });
};

const product = computed(() => {
    // Ensure matching works even if types differ (string vs number)
    return productsStore.sampleProducts.find(p => String(p.id) === String(route.params.id));
});

watch(product, (newProd) => {
    if (newProd) recentlyViewedStore.addProduct(newProd.id);
}, { immediate: true });

const relatedProducts = computed(() => {
    if (!product.value) return [];
    return productsStore.sampleProducts
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 3);
});

const handleAddToCart = () => {
    if (product.value) {
        cartStore.addToCart(product.value.id, quantity.value);
    }
};

const isWishlisted = computed(() => {
    return wishlistStore.productIds.includes(product.value?.id);
});

const goBack = () => router.back();

onMounted(initObserver);
onUnmounted(() => {
    if (observer) observer.disconnect();
});

// Re-run observer logic when the route ID changes (navigating between related products)
watch(() => route.params.id, () => {
    quantity.value = 1;
    // Ensure product is updated before re-observing
    nextTick(() => {
        initObserver();
    });
});
</script>

<template>
    <main id="product-root" class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10" v-if="product">
        <!-- Navigation Header -->
        <div class="flex items-center justify-between mb-12 reveal">
            <button @click="goBack" class="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                <i class="fa-solid fa-arrow-left-long"></i>
                Back to Catalog
            </button>
            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <router-link to="/" class="hover:text-[var(--accent)]">Home</router-link>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <router-link to="/products" class="hover:text-[var(--accent)]">Provisions</router-link>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <span class="text-[var(--accent)]">{{ product.category }}</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <!-- Product Imagery -->
            <div class="hero-img-wrap sticky top-32 reveal">
                <img :src="product.img" :alt="product.name" class="w-full aspect-square object-cover">
                <button 
                    @click="wishlistStore.toggleWishlist(product.id)"
                    class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-90"
                    :class="isWishlisted ? 'text-red-500' : 'text-[var(--text-muted)]'"
                >
                    <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                </button>
            </div>

            <!-- Product Intelligence -->
            <article class="space-y-10 reveal reveal-delay-1">
                <div class="space-y-4">
                    <span class="section-badge">{{ product.category }}</span>
                    <h1 class="font-[Playfair_Display] text-5xl font-extrabold text-[var(--text)]">{{ product.name }}</h1>
                    <div class="flex items-center gap-4">
                        <p class="text-3xl font-light text-[var(--accent)]">${{ product.price }}</p>
                        <span class="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full">In Stock</span>
                    </div>
                </div>

                <p class="text-[var(--text-muted)] leading-relaxed">
                    {{ product.desc }}
                </p>

                <!-- Specification Matrix -->
                <div class="space-y-4">
                    <h4 class="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Technical Specifications</h4>
                    <ul class="feature-list">
                        <li v-for="feature in product.features" :key="feature" class="text-sm">
                            {{ feature }}
                        </li>
                    </ul>
                </div>

                <!-- Purchase Controls -->
                <div class="product-actions pt-8 border-t border-[var(--border)]">
                    <div class="flex items-center bg-[var(--bg-muted)] rounded-2xl p-2 border border-[var(--border)]">
                        <button @click="quantity > 1 ? quantity-- : null" class="w-10 h-10 flex items-center justify-center text-xs hover:text-[var(--accent)] transition-colors">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <input type="number" v-model="quantity" readonly class="w-12 text-center bg-transparent font-bold text-sm outline-none">
                        <button @click="quantity++" class="w-10 h-10 flex items-center justify-center text-xs hover:text-[var(--accent)] transition-colors">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    
                    <button 
                        @click="handleAddToCart"
                        class="flex-1 bg-[var(--accent)] text-white font-bold uppercase tracking-widest text-xs py-5 rounded-2xl premium-btn shadow-lg"
                    >
                        Integrate to System (Add to Cart)
                    </button>
                </div>
            </article>
        </div>

        <!-- Related Assets -->
        <section class="mt-32 pt-24 border-t border-[var(--border)] reveal" v-if="relatedProducts.length > 0">
            <div class="flex items-end justify-between mb-12">
                <div class="space-y-3">
                    <span class="section-badge">Similar Modules</span>
                    <h2 class="font-[Playfair_Display] text-3xl font-bold">Related Provisions</h2>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <router-link 
                    v-for="rel in relatedProducts" 
                    :key="rel.id" 
                    :to="`/products/${rel.id}`"
                    class="related-card group"
                >
                    <img :src="rel.img" :alt="rel.name">
                    <div>
                        <span class="label">{{ rel.category }}</span>
                        <h4 class="font-bold group-hover:text-[var(--accent)] transition-colors">{{ rel.name }}</h4>
                        <p>${{ rel.price }}</p>
                    </div>
                </router-link>
            </div>
        </section>
    </main>

    <!-- 404 State -->
    <main v-else class="pt-48 pb-32 text-center space-y-8 reveal visible">
        <div class="w-24 h-24 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <i class="fa-solid fa-microchip text-4xl opacity-20"></i>
        </div>
        <h1 class="font-[Playfair_Display] text-4xl font-bold">Provision Not Found</h1>
        <p class="text-[var(--text-muted)] text-sm max-w-md mx-auto">The requested hardware identification does not exist within our current architectural database.</p>
        <router-link to="/products" class="inline-block bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest premium-btn">Return to Catalog</router-link>
    </main>
</template>