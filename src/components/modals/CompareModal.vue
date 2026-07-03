<script setup>
import { computed } from 'vue';
import { useProductsStore } from '@/stores/shop/products';
import { useUIStore } from '@/stores/ui/ui';

const productsStore = useProductsStore();
const uiStore = useUIStore();

const products = computed(() => productsStore.compareProducts);

// Extract unique specification keys across all products in the queue
const specKeys = computed(() => {
    const keys = new Set();
    products.value.forEach(p => {
        if (p.specifications) {
            Object.keys(p.specifications).forEach(k => keys.add(k));
        }
    });
    return Array.from(keys);
});

const closeModal = () => {
    uiStore.compareModalOpen = false;
};
</script>

<template>
    <Transition name="fade">
        <div v-if="uiStore.compareModalOpen" class="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-2xl bg-black/60">
            <div @click="closeModal" class="absolute inset-0"></div>
            
            <div class="relative w-full max-w-5xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)] flex-none">
                    <div>
                        <span class="section-badge mb-2">Technical Analysis</span>
                        <h2 class="font-[Playfair_Display] text-3xl font-bold">Hardware Matrix Comparison</h2>
                    </div>
                    <button @click="closeModal" class="w-12 h-12 rounded-full hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center border border-[var(--border)]">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Matrix Content -->
                <div class="flex-1 overflow-auto p-8 custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th class="w-1/4 pb-8"></th>
                                <th v-for="p in products" :key="p.id" class="w-1/4 pb-8 px-4">
                                    <div class="space-y-4">
                                        <img :src="p.img" class="w-full aspect-square object-cover rounded-2xl border border-[var(--border)] shadow-sm" />
                                        <h3 class="font-bold text-sm leading-tight">{{ p.name }}</h3>
                                        <p class="text-[var(--accent)] font-black text-lg">$ {{ p.price }}</p>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[var(--border)]/30">
                            <!-- Basic Info -->
                            <tr>
                                <td class="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Category</td>
                                <td v-for="p in products" :key="p.id" class="py-4 px-4 text-xs font-bold">{{ p.category }}</td>
                            </tr>
                            <tr>
                                <td class="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">User Rating</td>
                                <td v-for="p in products" :key="p.id" class="py-4 px-4">
                                    <div class="flex items-center gap-1">
                                        <i class="fa-solid fa-star text-[var(--accent)] text-[10px]"></i>
                                        <span class="text-xs font-bold">{{ p.averageRating }}</span>
                                    </div>
                                </td>
                            </tr>
                            <!-- Dynamic Specs -->
                            <tr v-for="key in specKeys" :key="key">
                                <td class="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{{ key }}</td>
                                <td v-for="p in products" :key="p.id" class="py-4 px-4 text-xs">
                                    {{ p.specifications?.[key] || '—' }}
                                </td>
                            </tr>
                            <!-- Availability -->
                            <tr>
                                <td class="py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Stock Status</td>
                                <td v-for="p in products" :key="p.id" class="py-4 px-4">
                                    <span :class="p.inStock ? 'text-green-600' : 'text-red-500'" class="text-[10px] font-black uppercase tracking-widest">
                                        {{ p.inStock ? 'Available' : 'Depleted' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footer Actions -->
                <div class="p-8 border-t border-[var(--border)] bg-[var(--bg)] flex justify-end gap-4 flex-none">
                    <button @click="productsStore.compareIds = []" class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition-colors">
                        Clear Comparison
                    </button>
                    <button @click="closeModal" class="bg-[var(--accent)] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest premium-btn">
                        Dismiss Analysis
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Custom Scrollbar for Matrix */
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
</style>