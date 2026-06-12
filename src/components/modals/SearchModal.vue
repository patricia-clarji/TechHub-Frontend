<script setup>
import { ref, computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useProductsStore } from '@/stores/products';
import { useRouter } from 'vue-router';

const uiStore = useUIStore();
const productsStore = useProductsStore();
const router = useRouter();

const searchQuery = ref('');

const filteredProducts = computed(() => {
    if (!searchQuery.value) return [];
    const query = searchQuery.value.toLowerCase();
    return productsStore.sampleProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.desc.toLowerCase().includes(query)
    );
});

const selectProduct = (productId) => {
    uiStore.toggleSearch();
    searchQuery.value = '';
    router.push(`/products/${productId}`);
};
</script>

<template>
    <div v-if="uiStore.searchModalOpen" class="fixed inset-0 z-[120] bg-black/40 backdrop-blur-md flex items-start justify-center p-6">
        <div @click="uiStore.toggleSearch()" class="absolute inset-0"></div>
        <div class="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-2xl animate-[zoomIn_0.3s_ease]">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-[Playfair_Display] text-2xl font-bold">Search TechHub</h3>
                <button @click="uiStore.toggleSearch()" class="w-10 h-10 rounded-full hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            
            <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search for products, categories..." 
                autofocus
                class="w-full bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
            />

            <div v-if="searchQuery && filteredProducts.length > 0" class="mt-6 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                <div v-for="product in filteredProducts" :key="product.id" 
                    @click="selectProduct(product.id)"
                    class="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-muted)] transition-colors cursor-pointer">
                    <img :src="product.img" class="w-12 h-12 object-cover rounded-lg" />
                    <div class="flex-1">
                        <p class="font-bold text-sm">{{ product.name }}</p>
                        <p class="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{{ product.category }}</p>
                    </div>
                    <p class="font-black text-[var(--accent)] text-sm">${{ product.price }}</p>
                </div>
            </div>
            <div v-else-if="searchQuery && filteredProducts.length === 0" class="mt-6 text-center text-[var(--text-muted)] text-sm">
                No provisions found matching your query.
            </div>
        </div>
    </div>
</template>