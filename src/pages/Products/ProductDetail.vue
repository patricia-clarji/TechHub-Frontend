<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/shop/products';
import { useCartStore } from '@/stores/shop/cart';
import { useRecentlyViewedStore } from '@/stores/shop/recentlyViewed';
import { useToastStore } from '@/stores/ui/toast';

import ProductGallery from '@/components/products/ProductGallery.vue';
import ColorSelector from '@/components/products/ColorSelector.vue';
import VariantSelector from '@/components/products/VariantSelector.vue';
import ProductCard from '@/components/cards/ProductCard.vue';
import ProductTabs from '@/components/products/ProductTabs.vue';
import config from '@/config';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const toastStore = useToastStore();
const recentlyViewedStore = useRecentlyViewedStore();

const selectedQuantity = ref(1);
const activeImgIndex = ref(0);
const selectedColor = ref(null);
const selectedVariant = ref(null);

const product = ref(null);
const isLoading = ref(false);

const fetchProductData = async () => {
    const identifier = route.params.identifier;
    if (!identifier) return;

    isLoading.value = true;
    try {
        await productsStore.fetchProduct(identifier);
        product.value = productsStore.singleProduct;

            if (product.value) {
            selectedColor.value = product.value.colors?.[0] || null;
            selectedVariant.value = product.value.variants?.find(v => v.stock > 0) || product.value.variants?.[0] || null;

            recentlyViewedStore.addProduct(product.value.id);
            updateSEO(product.value);
        }
    } catch (error) {
        import('@/utils/logger').then(({ default: logger }) => logger.error('Error fetching product:', error));
    } finally {
        isLoading.value = false;
    }
};

const stockStatus = computed(() => {
    if (!product.value) return { label: 'Loading...', color: 'text-[var(--text-muted)]', icon: 'fa-spinner' };
    const stock = selectedVariant.value?.stock ?? product.value?.stock ?? 0;
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500', icon: 'fa-circle-xmark' };
    if (stock < 5) return { label: `Only ${stock} left in stock`, color: 'text-orange-500', icon: 'fa-clock' };
    return { label: 'In stock', color: 'text-green-500', icon: 'fa-circle-check' };
});

const finalPrice = computed(() => {
    return Number(selectedVariant.value?.price ?? product.value?.price ?? 0);
});
const availableStock = computed(() => Number(selectedVariant.value?.stock ?? product.value?.stock ?? 0));

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

    nextTick(() => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    });
};

const updateSEO = (p) => {
    if (!p) return;

    document.title = `${p.name} | TechHub`;

    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', p.desc);
    if (!document.querySelector('meta[name="description"]')) document.head.appendChild(metaDescription);

    const ogTags = {
        'og:title': p.name,
        'og:description': p.desc,
        'og:image': p.img,
        'og:type': 'product',
        'og:url': window.location.href
    };

    Object.entries(ogTags).forEach(([property, content]) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('property', property);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    });

    let scriptTag = document.getElementById('product-schema');
    if (scriptTag) scriptTag.remove();

    scriptTag = document.createElement('script');
    scriptTag.id = 'product-schema';
    scriptTag.type = 'application/ld+json';

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": p.name,
        "image": [p.img],
        "description": p.desc,
        "brand": { "@type": "Brand", "name": p.brand },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": p.price,
            "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": window.location.href
        }
    };

    if (p.reviews?.length > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": p.averageRating,
            "reviewCount": p.reviews.length
        };
    }

    scriptTag.text = JSON.stringify(schema);
    document.head.appendChild(scriptTag);

    document.getElementById('breadcrumb-schema')?.remove();
    const breadcrumb = document.createElement('script');
    breadcrumb.id = 'breadcrumb-schema';
    breadcrumb.type = 'application/ld+json';
    breadcrumb.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', config.SITE.URL || window.location.origin).href },
            { '@type': 'ListItem', position: 2, name: 'Products', item: new URL('/products', config.SITE.URL || window.location.origin).href },
            { '@type': 'ListItem', position: 3, name: p.name, item: window.location.href },
        ],
    });
    document.head.appendChild(breadcrumb);
};

const getHighlightIcon = (text) => {
    const low = text.toLowerCase();
    if (low.includes('battery') || low.includes('charge')) return 'fa-battery-full';
    if (low.includes('camera') || low.includes('lens')) return 'fa-camera';
    if (low.includes('display') || low.includes('oled') || low.includes('screen')) return 'fa-display';
    if (low.includes('fast') || low.includes('performance') || low.includes('chip')) return 'fa-bolt';
    if (low.includes('warranty') || low.includes('secure')) return 'fa-shield-halved';
    if (low.includes('wireless')) return 'fa-wifi';
    return 'fa-microchip';
};

watch(selectedColor, (newColor) => {
    if (newColor && typeof newColor.imgIndex === 'number') {
        activeImgIndex.value = newColor.imgIndex;
    }
});

const ratingDistribution = computed(() => {
    if (!product.value) return [];
    const dist = [0, 0, 0, 0, 0];
    product.value.reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            dist[r.rating - 1]++;
        }
    });
    const total = product.value.reviews.length || 1;
    return dist.map((count, i) => ({
        stars: i + 1,
        percentage: (count / total) * 100
    })).reverse();
});

const relatedProducts = computed(() => {
    if (!product.value) return [];
    return productsStore.sampleProducts
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 3);
});

const recentlyViewedProducts = computed(() => {
    return recentlyViewedStore.productIds
        .filter(id => id !== product.value?.id)
        .map(id => productsStore.sampleProducts.find(p => p.id === id))
        .filter(p => !!p)
        .slice(0, 4);
});

const handleAddToCart = () => {
    if (product.value) {
        const result = cartStore.addToCart(product.value, selectedQuantity.value, { variant: selectedVariant.value, color: selectedColor.value });
        toastStore.showToast(result.success ? 'Added to cart.' : result.message, result.success ? 'fa-cart-plus' : 'fa-triangle-exclamation');
    }
};

const handleBuyNow = () => {
    if (!product.value) return;
    cartStore.clearCart();
    const result = cartStore.addToCart(product.value, selectedQuantity.value, { variant: selectedVariant.value, color: selectedColor.value });
    if (result.success) router.push('/cart');
    else toastStore.showToast(result.message, 'fa-triangle-exclamation');
};

const goBack = () => router.back();

watch(() => route.params.identifier, () => {
    selectedQuantity.value = 1;
    fetchProductData();
}, { immediate: true });

onMounted(initObserver);

onUnmounted(() => {
    if (observer) observer.disconnect();
    const script = document.getElementById('product-schema');
    if (script) script.remove();
});

watch(product, () => {
    nextTick(() => {
        initObserver();
    });
});
</script>

<template>
    <main id="product-root" class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10" v-if="product">
        <!-- Navigation Header -->
        <div class="flex items-center justify-between mb-12 reveal">
            <button @click="goBack"
                class="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                <i class="fa-solid fa-arrow-left-long"></i>
                Back to Catalog
            </button>
            <div
                class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <router-link to="/" class="hover:text-[var(--accent)]">Home</router-link>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <router-link to="/products" class="hover:text-[var(--accent)]">Products</router-link>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <span class="text-[var(--accent)]">{{ product.category }}</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <!-- Left Column: Gallery -->
            <div class="lg:sticky lg:top-32 reveal">
                <ProductGallery v-model="activeImgIndex" :images="product.images || [product.img]" />

                <!-- High-End Trust Badges -->
                <div class="grid grid-cols-2 gap-4 mt-10">
                    <div v-for="badge in ['Secure Checkout', 'Free Shipping', '2-Year Warranty', 'Easy Returns']"
                        :key="badge"
                        class="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-muted)]/50 border border-[var(--border)]/40">
                        <i class="fa-solid fa-circle-check text-[var(--accent)] text-xs"></i>
                        <span class="text-[9px] font-bold uppercase tracking-widest">{{ badge }}</span>
                    </div>
                </div>
            </div>

            <!-- Right Column: Purchase Intelligence -->
            <article class="space-y-12 reveal reveal-delay-1">
                <div class="space-y-4">
                    <span class="section-badge">{{ product.category }}</span>
                    <h1 class="font-[Playfair_Display] text-5xl font-extrabold text-[var(--text)]">{{ product.name }}
                    </h1>
                    <div class="flex items-end justify-between">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <p class="text-4xl font-black text-[var(--accent)]">$ {{ finalPrice }}</p>
                                <span v-if="selectedVariant?.priceMod"
                                    class="text-xs text-[var(--text-muted)] line-through">$ {{ product.price }}</span>
                            </div>
                            <div :class="stockStatus.color"
                                class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <i :class="['fa-solid', stockStatus.icon]"></i>
                                {{ stockStatus.label }}
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="flex gap-0.5 mb-1">
                                <i v-for="n in 5" :key="n"
                                    :class="n <= Math.round(product.averageRating) ? 'fa-solid text-[var(--accent)]' : 'fa-regular text-[var(--border)]'"
                                    class="fa-star text-xs"></i>
                            </div>
                            <span class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{{
                                product.reviews.length }} Reviews</span>
                        </div>
                    </div>
                </div>

                <!-- Product High-Performance Highlight Cards -->
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="highlight in product.features.slice(0, 4)" :key="highlight"
                        class="p-5 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow group">
                        <i :class="['fa-solid', getHighlightIcon(highlight)]"
                            class="text-[var(--accent)] text-xl mb-3 group-hover:scale-110 transition-transform"></i>
                        <h5 class="text-[10px] font-black uppercase tracking-widest">{{ highlight }}</h5>
                    </div>
                </div>

                <!-- Interactive Selectors -->
                <ColorSelector v-if="product.colors" v-model="selectedColor" :colors="product.colors" />
                <VariantSelector v-if="product.variants" v-model="selectedVariant" :variants="product.variants" />

                <!-- Purchase Controls -->
                <div
                    class="sticky bottom-6 lg:relative lg:bottom-0 z-30 bg-[var(--bg-card)]/80 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none p-4 lg:p-0 rounded-[2.5rem] lg:rounded-none border lg:border-0 border-[var(--border)] shadow-2xl lg:shadow-none">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div
                            class="flex items-center bg-[var(--bg-muted)] rounded-2xl p-2 border border-[var(--border)]">
                            <button @click="selectedQuantity > 1 ? selectedQuantity-- : null"
                                class="w-10 h-10 flex items-center justify-center text-xs hover:text-[var(--accent)] transition-colors">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <input type="number" v-model="selectedQuantity" readonly
                                class="w-12 text-center bg-transparent font-bold text-sm outline-none">
                            <button @click="selectedQuantity < availableStock ? selectedQuantity++ : null"
                                :disabled="selectedQuantity >= availableStock"
                                class="w-10 h-10 flex items-center justify-center text-xs hover:text-[var(--accent)] transition-colors disabled:opacity-30">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>

                        <button @click="handleAddToCart" :disabled="availableStock === 0"
                            class="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white font-bold uppercase tracking-widest text-[10px] py-5 rounded-2xl premium-btn shadow-lg disabled:opacity-50">
                            Add to Cart
                        </button>
                    </div>
                    <button @click="handleBuyNow" v-if="availableStock > 0"
                        class="w-full mt-3 py-4 border-2 border-[var(--accent)] text-[var(--accent)] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                        Buy Now
                    </button>
                </div>

                <!-- Info Tabs -->
                <ProductTabs :product="product" />
            </article>
        </div>

        <!-- Reviews -->
        <section class="mt-32 pt-24 border-t border-[var(--border)] reveal">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <!-- Rating Summary -->
                <div class="space-y-8">
                    <div class="space-y-2">
                        <span class="section-badge">Customer feedback</span>
                        <h2 class="font-[Playfair_Display] text-3xl font-bold">Reviews</h2>
                    </div>

                    <div class="p-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] text-center">
                        <p class="text-6xl font-black text-[var(--text)]">{{ product.averageRating }}</p>
                        <div class="flex justify-center gap-1 my-4">
                            <i v-for="n in 5" :key="n"
                                :class="n <= Math.round(product.averageRating) ? 'fa-solid text-[var(--accent)]' : 'fa-regular text-[var(--border)]'"
                                class="fa-star"></i>
                        </div>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Based on {{
                            product.reviews.length }} reviews</p>
                    </div>

                    <div class="space-y-3">
                        <div v-for="dist in ratingDistribution" :key="dist.stars" class="flex items-center gap-4">
                            <span class="text-[10px] font-bold text-[var(--text-muted)] w-4">{{ dist.stars }}</span>
                            <div class="flex-1 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                                <div class="h-full bg-[var(--accent)] transition-all duration-1000"
                                    :style="{ width: dist.percentage + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Review Feed & Form -->
                <div class="lg:col-span-2 space-y-12">
                    <!-- List -->
                    <div class="space-y-8">
                        <div v-for="review in [...product.reviews].reverse()" :key="review.date + review.userId"
                            class="relative pl-12 group">
                            <div
                                class="absolute left-0 top-0 w-8 h-8 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold">
                                {{ review.userName.charAt(0) }}
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <h5 class="font-bold text-sm">{{ review.userName }}</h5>
                                        <p
                                            class="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                            {{ review.date }}</p>
                                    </div>
                                    <div class="flex gap-0.5">
                                        <i v-for="n in 5" :key="n"
                                            :class="n <= review.rating ? 'fa-solid text-[var(--accent)]' : 'fa-regular text-[var(--text-muted)]'"
                                            class="fa-star text-[10px]"></i>
                                    </div>
                                </div>
                                <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ review.comment }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Recently Viewed -->
        <section class="mt-32 pt-24 border-t border-[var(--border)] reveal" v-if="recentlyViewedProducts.length > 0">
            <div class="flex items-end justify-between mb-12">
                <div class="space-y-3">
                    <span class="section-badge">Your browsing history</span>
                    <h2 class="font-[Playfair_Display] text-3xl font-bold">Recently Viewed</h2>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <ProductCard v-for="p in recentlyViewedProducts" :key="p.id" :product="p" />
            </div>
        </section>

        <!-- Related Assets -->
        <section class="mt-32 pt-24 border-t border-[var(--border)] reveal" v-if="relatedProducts.length > 0">
            <div class="flex items-end justify-between mb-12">
                <div class="space-y-3">
                    <span class="section-badge">You may also like</span>
                    <h2 class="font-[Playfair_Display] text-3xl font-bold">Related Products</h2>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <router-link v-for="rel in relatedProducts" :key="rel.id"
                    :to="{ name: 'ProductDetail', params: { identifier: rel.slug || rel.id } }"
                    class="related-card group">
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

    <!-- Loading State -->
    <main v-else-if="isLoading" class="pt-48 pb-32 text-center space-y-8">
        <div
            class="w-24 h-24 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)] animate-pulse">
            <i class="fa-solid fa-microchip text-4xl opacity-20"></i>
        </div>
        <h1 class="font-[Playfair_Display] text-4xl font-bold">Loading Product…</h1>
        <p class="text-[var(--text-muted)] text-sm max-w-md mx-auto">Fetching hardware specifications from the catalog.
        </p>
    </main>

    <!-- 404 State -->
    <main v-else class="pt-48 pb-32 text-center space-y-8 reveal visible">
        <div
            class="w-24 h-24 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <i class="fa-solid fa-microchip text-4xl opacity-20"></i>
        </div>
        <h1 class="font-[Playfair_Display] text-4xl font-bold">Product Not Found</h1>
        <p class="text-[var(--text-muted)] text-sm max-w-md mx-auto">This product is unavailable or the link is
            incorrect.</p>
        <router-link to="/products"
            class="inline-block bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest premium-btn">Return
            to Catalog</router-link>
    </main>
</template>
