<script setup>
import { computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useProductsStore } from '@/stores/shop/products';

const cartStore = useCartStore();
const productsStore = useProductsStore();

const cartItems = computed(() => {
    return cartStore.items.map(item => {
        const product = productsStore.sampleProducts.find(p => p.id === item.id);
        return {
            ...product,
            quantity: item.quantity
        };
    }).filter(item => item.id);
});

onMounted(() => {
    productsStore.fetchProducts();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
</script>

<template>
    <main class="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div class="mb-12 reveal">
            <span class="section-badge">Resource Allocation</span>
            <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-6">Your Active Basket</h1>
        </div>

        <div v-if="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <!-- Cart Items List -->
            <div class="lg:col-span-8 space-y-6">
                <div v-for="item in cartItems" :key="item.id"
                    class="reveal flex flex-col sm:flex-row gap-6 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[2rem] transition-all hover:shadow-xl">
                    <img :src="item.img" :alt="item.name" class="w-full sm:w-32 h-32 object-cover rounded-2xl">
                    <div class="flex-1 flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{{
                                    item.category }}</span>
                                <h3 class="font-[Playfair_Display] text-xl font-bold mt-1">{{ item.name }}</h3>
                            </div>
                            <button @click="cartStore.removeFromCart(item.id)"
                                class="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>
                        <div class="flex justify-between items-end mt-4">
                            <div
                                class="flex items-center bg-[var(--bg-muted)] rounded-xl p-1 border border-[var(--border)]">
                                <button @click="cartStore.addToCart(item.id, -1)" :disabled="item.quantity <= 1"
                                    class="w-8 h-8 flex items-center justify-center text-xs hover:text-[var(--accent)] disabled:opacity-30">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="w-8 text-center font-bold text-sm">{{ item.quantity }}</span>
                                <button @click="cartStore.addToCart(item.id, 1)"
                                    class="w-8 h-8 flex items-center justify-center text-xs hover:text-[var(--accent)]">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <p class="font-black text-[var(--accent)] text-lg">$ {{ item.price * item.quantity }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Summary -->
            <aside class="lg:col-span-4 sticky top-32 reveal">
                <div class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                    <h3 class="font-[Playfair_Display] text-2xl font-bold">Financial Summary</h3>
                    <div class="space-y-4 pt-4 border-t border-[var(--border)]">
                        <div class="flex justify-between text-sm">
                            <span class="text-[var(--text-muted)]">Subtotal Matrix</span>
                            <span class="font-bold">$ {{ cartStore.subtotal.toFixed(2) }}</span>
                        </div>
                        <div v-if="cartStore.discountTotal > 0"
                            class="flex justify-between text-sm text-green-600 font-bold">
                            <span class="text-[var(--text-muted)]">Promotional Credit Applied</span>
                            <span>-$ {{ cartStore.discountTotal.toFixed(2) }}</span>
                        </div>
                        <!-- Add a separator if there's a discount to visually group subtotal and discount -->
                        <div v-if="cartStore.discountTotal > 0" class="border-t border-[var(--border)] pt-4"></div>
                        <div class="flex justify-between text-lg pt-4 border-t border-[var(--border)]">
                            <span class="font-bold">Total Allocation</span>
                            <span class="font-black text-[var(--accent)]">$ {{ cartStore.totalAmount.toFixed(2)
                            }}</span>
                        </div>
                    </div>
                    <router-link to="/checkout"
                        class="block w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white text-center py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                        Authorize Checkout
                    </router-link>
                </div>
            </aside>
        </div>

        <div v-else class="text-center py-32 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border)] reveal">
            <p class="text-[var(--text-muted)] mb-8">Your deployment basket is currently empty.</p>
            <router-link to="/products"
                class="inline-block bg-[var(--accent)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest premium-btn">Return
                to Catalog</router-link>
        </div>
    </main>
</template>