<script setup>
import { computed, ref } from 'vue';
import { useProductsStore } from '../../stores/products';

const productsStore = useProductsStore();
const searchQuery = ref('');

const filtered = computed(() => {
    if (!searchQuery.value.trim()) return [];
    return productsStore.sampleProducts.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
</script>

<template>
    <div v-if="productsStore.searchModalOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center p-4 pt-20">
        <div @click.self="productsStore.searchModalOpen = false" class="absolute inset-0"></div>
        <div
            class="bg-[var(--bg-card)] w-full max-w-2xl rounded-3xl h-fit max-h-[70vh] flex flex-col p-6 border border-[var(--border)] relative z-10 shadow-2xl">
            <div class="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <i class="fa-solid fa-magnifying-glass text-[var(--text-muted)]"></i>
                <input v-model="searchQuery" type="text" placeholder="Search elite electronic provisions..."
                    class="flex-1 bg-transparent text-lg focus:outline-none" />
                <button @click="productsStore.searchModalOpen = false"
                    class="text-sm px-3 py-1 bg-[var(--bg-muted)] rounded-xl">ESC</button>
            </div>

            <div class="overflow-y-auto mt-4 space-y-2">
                <div v-for="p in filtered" :key="p.id"
                    @click="productsStore.searchModalOpen = false; $router.push(`/products/${p.id}`)"
                    class="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-muted)] cursor-pointer transition-all">
                    <img :src="p.img" class="w-12 h-12 object-cover rounded-xl" />
                    <div class="flex-1">
                        <h4 class="font-semibold text-sm">{{ p.name }}</h4>
                        <p class="text-xs text-[var(--text-muted)]">{{ p.category }}</p>
                    </div>
                    <span class="font-bold text-sm">${ {{ p.price }} }</span>
                </div>
                <p v-if="searchQuery && filtered.length === 0"
                    class="text-center text-sm py-6 text-[var(--text-muted)]">No premium matches identified.</p>
            </div>
        </div>
    </div>
</template>