<script setup>
import { useUIStore } from '@/stores/ui';
import { useCartStore } from '@/stores/cart';

const uiStore = useUIStore();
const cartStore = useCartStore();
</script>

<template>
    <div v-if="uiStore.cartDrawerOpen" class="fixed inset-0 z-[110] flex justify-end">
        <div @click="uiStore.cartDrawerOpen = false" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        <div class="relative w-full max-w-md bg-[var(--bg-card)] h-full border-l border-[var(--border)] shadow-2xl flex flex-col">
            <div class="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]">
                <div>
                    <h3 class="font-[Playfair_Display] text-2xl font-bold">Your Basket</h3>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-1">Resource Allocation</p>
                </div>
                <button @click="uiStore.cartDrawerOpen = false" class="w-10 h-10 rounded-full hover:bg-[var(--bg-muted)] transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 space-y-6">
                <div v-if="cartStore.items.length === 0" class="text-center py-20 opacity-40">
                    <i class="fa-solid fa-box-open text-4xl mb-4"></i>
                    <p class="text-sm font-bold uppercase tracking-widest">Basket Empty</p>
                </div>
                <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4 p-4 rounded-2xl bg-[var(--bg-muted)]/30 border border-[var(--border)]">
                    <!-- Item content logic here -->
                    <div class="flex-1">
                        <p class="text-sm font-bold">{{ item.name }}</p>
                        <p class="text-xs text-[var(--accent)] font-bold mt-1">$ {{ item.price }}</p>
                    </div>
                </div>
            </div>

            <div class="p-8 bg-[var(--bg)] border-t border-[var(--border)] space-y-6">
                <div class="flex justify-between items-end">
                    <span class="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Subtotal Matrix</span>
                    <span class="text-2xl font-black text-[var(--accent)]">$ {{ cartStore.subtotal }}</span>
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