<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '../../stores/products';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import ProductCard from '@/components/cards/ProductCard.vue';

const route = useRoute();
const productsStore = useProductsStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const product = ref(null);

const fetchProductData = async () => {
    const id = route.params.id;
    if (!id) return;

    productsStore.loading = true;
    try {
        await productsStore.fetchProduct(id);
        product.value = productsStore.singleProduct;
    } catch (error) {
        console.error('Error fetching product:', error);
    } finally {
        productsStore.loading = false;
    }
};

watch(() => route.params.id, () => {
    fetchProductData();
}, { immediate: true });

const relatedProducts = computed(() => {
    if (!product.value) return [];
    return productsStore.sampleProducts
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 3);
});
</script>

<template>
    <main v-if="product" class="pt-32 pb-20 max-w-7xl mx-auto px-6 lg:px-10 space-y-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div
                class="aspect-square bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-xl reveal">
                <img :src="product.img"
                    class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>

            <div class="space-y-8 reveal reveal-delay-1">
                <span class="section-badge">{{
                    product.category }}</span>
                <div>
                    <h1 class="font-[Playfair_Display] text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-4">{{
                        product.name }}</h1>
                    <div class="flex items-center gap-4">
                        <p class="text-3xl font-black text-[var(--accent)]">$ {{ product.price }}</p>
                        <span
                            class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-muted)] px-3 py-1 rounded-lg">MSRP
                            Deployment</span>
                    </div>
                </div>

                <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ product.desc }}</p>

                <div class="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl space-y-4 shadow-sm">
                    <h4
                        class="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--text)] border-b border-[var(--border)] pb-2">
                        Core Asset Capabilities
                    </h4>
                    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <li v-for="f in product.features" :key="f"
                            class="text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <span class="text-[var(--accent)]">✦</span> {{ f }}
                        </li>
                    </ul>
                </div>

                <div class="flex gap-4">
                    <button @click="cartStore.addToCart(product.id)"
                        class="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-dk)] premium-btn text-white py-4 rounded-full font-bold transition-all shadow-lg text-sm uppercase tracking-widest">
                        Add To Cart Deployment
                    </button>
                    <button @click="wishlistStore.toggleWishlist(product.id)"
                        class="w-14 h-14 bg-[var(--bg-card)] border border-[var(--border)] rounded-full flex items-center justify-center text-sm hover:bg-[var(--bg-muted)] transition-colors">
                        <i
                            :class="wishlistStore.productIds.includes(product.id) ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
                    </button>
                </div>
            </div>
        </div>

        <section v-if="related.length > 0" class="space-y-8 reveal">
            <div class="flex items-end justify-between">
                <h3 class="font-[Playfair_Display] text-3xl font-bold">Related Premium Gear</h3>
                <router-link to="/products"
                    class="text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline">View All
                    Provisions</router-link>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <ProductCard v-for="r in related" :key="r.id" :product="r" />
            </div>
        </section>
    </main>
</template>