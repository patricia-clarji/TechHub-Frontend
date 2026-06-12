<script setup>
import { computed } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useProductsStore } from '../../stores/products';

const cartStore = useCartStore();
const productsStore = useProductsStore();

const fullItems = computed(() => {
    return cartStore.items.map(item => {
        const p = productsStore.sampleProducts.find(x => x.id === item.id);
        return { ...p, ...item };
    }).filter(i => i.name);
});
</script>

<template>
    <div v-if="cartStore.drawerOpen" class="fixed inset-0 z-50 flex justify-end">
        <div @click="cartStore.drawerOpen = false" class="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

        <div
            class="bg-[var(--bg-card)] border-l border-[var(--border)] w-full max-w-md h-full relative z-10 p-6 flex flex-col justify-between shadow-2xl animate-[slideLeft_0.35s_ease]">
            <div>
                <div class="flex justify-between items-center pb-4 border-b border-[var(--border)]">
                    <h3 class="font-[Playfair_Display] text-xl font-bold">Shopping Basket</h3>
                    <button @click="cartStore.drawerOpen = false"
                        class="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center"><i
                            class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="overflow-y-auto max-h-[60vh] mt-4 space-y-4 pr-1">
                    <div v-for="i in fullItems" :key="i.id"
                        class="flex gap-4 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl group transition-all hover:border-[var(--accent)]/30 shadow-sm">
                        <img :src="i.img" class="w-16 h-16 object-cover rounded-xl bg-white" />
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm truncate">{{ i.name }}</h4>
                            <p class="text-xs text-[var(--text-muted)] mb-2">${ {{ i.price }} }</p>
                            <div class="flex items-center gap-2">
                                <button @click="cartStore.updateQuantity(i.id, -1)"
                                    class="w-6 h-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-md flex items-center justify-center text-xs">-</button>
                                <span class="text-sm font-semibold">{{ i.quantity }}</span>
                                <button @click="cartStore.updateQuantity(i.id, 1)"
                                    class="w-6 h-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-md flex items-center justify-center text-xs">+</button>
                            </div>
                        </div>
                        <button @click="cartStore.removeFromCart(i.id)" class="text-xs text-red-500 self-start p-1"><i
                                class="fa-solid fa-trash-can"></i></button>
                    </div>

                    <p v-if="fullItems.length === 0" class="text-center text-sm py-12 text-[var(--text-muted)]">Your
                        item basket is currently empty.</p>
                </div>
            </div>

            <div class="border-t border-[var(--border)] pt-6 space-y-4">
                <div class="flex justify-between text-base font-bold">
                    <span>Cart Subtotal</span>
                    <span>${ {{ cartStore.subtotal }} }</span>
                </div>
                <p class="text-xs text-[var(--text-muted)]">Taxes and freight are generated during final execution
                    steps.</p>
                <div class="grid grid-cols-2 gap-3">
                    <button @click="cartStore.drawerOpen = false; $router.push('/cart')"
                        class="w-full bg-[var(--bg-muted)] text-[var(--text)] font-semibold py-3 rounded-full text-center text-sm">Full
                        View</button>
                    <button @click="cartStore.drawerOpen = false; $router.push('/checkout')"
                        :disabled="fullItems.length === 0"
                        class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] disabled:opacity-50 premium-btn text-white font-semibold py-3 rounded-full text-center text-sm">Checkout</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes slideLeft {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}
</style>