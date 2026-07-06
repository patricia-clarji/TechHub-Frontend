import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { readJson, writeJson } from '@/utils/storage';

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
    const saved = readJson(localStorage, 'recently_viewed', []);
    const productIds = ref(Array.isArray(saved) ? [...new Set(saved.map(String))].slice(0, 8) : []);

    const addProduct = (id) => {
        const normalizedId = String(id);
        productIds.value = [normalizedId, ...productIds.value.filter(pId => pId !== normalizedId)].slice(0, 8);
    };

    const clearHistory = () => productIds.value = [];

    watch(productIds, (newVal) => {
        writeJson(localStorage, 'recently_viewed', newVal);
    }, { deep: true });

    return { productIds, addProduct, clearHistory };
});
