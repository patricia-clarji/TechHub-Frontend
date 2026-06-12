<script setup>
import { computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useCartStore } from '@/stores/cart';
import { useProductsStore } from '@/stores/products';

const uiStore = useUIStore();
const cartStore = useCartStore();
const productsStore = useProductsStore();

const cartItems = computed(() => {
    return cartStore.items.map(item => {
        const product = productsStore.sampleProducts.find(p => p.id === item.id);
        return { ...product, quantity: item.quantity };
    });
});
</script>

<template>
    <div v-if="uiStore.cartDrawerOpen" class="fixed inset-0 z-[110] flex justify-end">
        <div @click="uiStore.cartDrawerOpen = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        <div class="relative w-full max-w-[480px] bg-[var(--bg-card)] h-full border-l border-[var(--border)] shadow-2xl flex flex-col">
            <!-- Header -->
            <div class="p-8 border-b border-[var(--border)] flex-none flex justify-between items-center bg-[var(--bg)]">
                <div>
                    <h3 class="font-[Playfair_Display] text-2xl font-bold">Your Basket</h3>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">Resource Allocation</p>
                </div>
                <button @click="uiStore.cartDrawerOpen = false" class="w-10 h-10 rounded-full hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Scrollable Items -->
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div v-if="cartItems.length === 0" class="text-center py-20 opacity-40">
                    <i class="fa-solid fa-box-open text-4xl mb-4"></i>
                    <p class="text-sm font-bold uppercase tracking-widest">Basket Empty</p>
                </div>
                
                <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-6 py-6 border-b border-[var(--border)]/40 last:border-0">
                    <!-- LEFT: Image -->
                    <div class="w-20 h-20 bg-[var(--bg-muted)] rounded-xl overflow-hidden flex-none">
                        <img :src="item.img" class="w-full h-full object-cover" />
                    </div>
                    
                    <!-- CENTER: Info -->
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-sm truncate">{{ item.name }}</h4>
                        <p class="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">{{ item.category }}</p>
                    </div>

                    <!-- RIGHT: Actions -->
                    <div class="flex items-center gap-4 flex-none">
                        <div class="flex items-center bg-[var(--bg-muted)] rounded-lg p-1 border border-[var(--border)]">
                            <button @click="cartStore.addToCart(item.id, -1)" :disabled="item.quantity <= 1" class="w-6 h-6 flex items-center justify-center hover:text-[var(--accent)] transition-colors disabled:opacity-30">
                                <i class="fa-solid fa-minus text-[8px]"></i>
                            </button>
                            <span class="w-6 text-center text-xs font-bold">{{ item.quantity }}</span>
                            <button @click="cartStore.addToCart(item.id, 1)" class="w-6 h-6 flex items-center justify-center hover:text-[var(--accent)] transition-colors">
                                <i class="fa-solid fa-plus text-[8px]"></i>
                            </button>
                        </div>
                        <p class="text-sm font-black text-[var(--accent)] w-16 text-right">$ {{ item.price * item.quantity }}</p>
                        <button @click="cartStore.removeFromCart(item.id)" class="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-2">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-8 bg-[var(--bg)] border-t border-[var(--border)] flex-none space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div class="space-y-2">
                    <div v-if="cartStore.discountTotal > 0" class="flex justify-between text-[10px] text-green-600 font-bold uppercase tracking-widest">
                        <span>Discounts applied</span>
                        <span>-$ {{ cartStore.discountTotal.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Amount</span>
                        <span class="text-2xl font-black text-[var(--accent)]">$ {{ cartStore.totalAmount.toFixed(2) }}</span>
                    </div>
                </div>
                <router-link to="/cart" @click="uiStore.cartDrawerOpen = false" 
                    class="block w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white text-center py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn">
                    Authorize Checkout
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* High z-index to ensure it covers chatbot and fixed buttons */
.z-\[110\] { z-index: 110; }
</style>