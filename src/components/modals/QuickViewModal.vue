<script setup>
import { computed } from 'vue';
import { useProductsStore } from '@/stores/shop/products';
import { useUIStore } from '@/stores/ui/ui';
import { useCartStore } from '@/stores/shop/cart';

const productsStore = useProductsStore();
const uiStore = useUIStore();
const cartStore = useCartStore();

const product = computed(() => {
    return productsStore.sampleProducts.find(p => p.id === uiStore.quickViewProductId);
});

const close = () => {
    uiStore.closeQuickView();
};
</script>

<template>
    <div v-if="product"
        class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div @click="close" class="absolute inset-0"></div>
        <div
            class="bg-[var(--bg-card)] w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-[var(--border)] relative z-10 shadow-2xl animate-[zoomIn_0.3s_ease]">
            
            <button @click="close" class="absolute top-6 right-6 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="w-full md:w-1/2 aspect-square bg-[var(--bg-muted)]">
                <img :src="product.img" class="w-full h-full object-cover" />
            </div>

            <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{{ product.category }}</span>
                    <h2 class="font-[Playfair_Display] text-3xl font-bold mt-2">{{ product.name }}</h2>
                    <p class="text-2xl font-black text-[var(--accent)] mt-2">$ {{ product.price }}</p>
                </div>
                
                <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ product.desc }}</p>

                <div class="flex gap-4">
                    <button @click="cartStore.addToCart(product.id); close()"
                        class="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white py-4 rounded-full font-bold transition-all premium-btn">
                        Add to Deployment
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
</style>