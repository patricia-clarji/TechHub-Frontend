import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
    const productIds = ref(JSON.parse(localStorage.getItem('recently_viewed')) || []);

    const addProduct = (id) => {
        productIds.value = [id, ...productIds.value.filter(pId => pId !== id)].slice(0, 8);
    };

    const clearHistory = () => productIds.value = [];

    watch(productIds, (newVal) => {
        localStorage.setItem('recently_viewed', JSON.stringify(newVal));
    }, { deep: true });

    return { productIds, addProduct, clearHistory };
});