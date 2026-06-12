<script setup>
import { computed } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useProductsStore } from '../../stores/products';

const cartStore = useCartStore();
const productsStore = useProductsStore();

const itemsWithDetails = computed(() => {
    return cartStore.items.map(item => {
        const details = productsStore.sampleProducts.find(p => p.id === item.id);
        return { ...details, ...item };
    }).filter(i => i.name);
});
</script>

<template>
    <main class="pt-32 max-w-7xl mx-auto px-6 lg:px-10 space-y-12">
        <h1 class="font-[Playfair_Display] text-4xl font-bold">Your Selection Basket</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div class="lg:col-span-2 space-y-4">
                <div v-for="i in itemsWithDetails" :key="i.id"
                    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem]">
                    <div class="flex items-center gap-4">
                        <img :src="i.img" class="w-20 h-20 object-cover rounded-2xl" />
                        <div>
                            <h3 class="font-bold text-base">{{ i.name }}</h3>
                            <p class="text-xs text-[var(--text-muted)]">{{ i.category }}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div class="flex items-center gap-2">
                            <button @click="cartStore.updateQuantity(i.id, -1)"
                                class="w-8 h-8 bg-[var(--bg-muted)] rounded-lg font-bold">-</button>
                            <span class="w-6 text-center font-semibold text-sm">{{ i.quantity }}</span>
                            <button @click="cartStore.updateQuantity(i.id, 1)"
                                class="w-8 h-8 bg-[var(--bg-muted)] rounded-lg font-bold">+</button>
                        </div>
                        <span class="font-bold text-base">${ {{ i.price * i.quantity }} }</span>
                        <button @click="cartStore.removeFromCart(i.id)" class="text-red-500 text-sm p-1"><i
                                class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>

                <p v-if="itemsWithDetails.length === 0"
                    class="text-center text-sm py-16 text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem]">
                    No items allocated in basket parameters.</p>
            </div>

            <div class="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[2rem] space-y-4">
                <h3 class="font-bold text-lg border-b border-[var(--border)] pb-2">Order Configuration</h3>
                <div class="flex justify-between text-sm">
                    <span class="text-[var(--text-muted)]">Subtotal</span>
                    <span class="font-semibold">${ {{ cartStore.subtotal }} }</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-[var(--text-muted)]">Freight Distribution</span>
                    <span class="font-semibold">{{ cartStore.shippingCost === 0 ? 'Free Shipping' : '$' +
                        cartStore.shippingCost }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-[var(--text-muted)]">Estimated Duties (8%)</span>
                    <span class="font-semibold">${ {{ cartStore.estimatedTax }} }</span>
                </div>
                <div
                    class="border-t border-[var(--border)] pt-4 flex justify-between font-bold text-lg text-[var(--accent)]">
                    <span>Final Computation</span>
                    <span>${ {{ cartStore.totalAmount }} }</span>
                </div>

                <button @click="$router.push('/checkout')" :disabled="itemsWithDetails.length === 0"
                    class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] premium-btn disabled:opacity-50 text-white font-bold py-4 rounded-full text-center block transition-all shadow-md mt-4">
                    Execute Checkout Pipeline
                </button>
            </div>
        </div>
    </main>
</template>