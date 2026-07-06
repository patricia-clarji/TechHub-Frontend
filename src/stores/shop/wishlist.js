import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { readJson, writeJson } from '@/utils/storage';

export const useWishlistStore = defineStore('wishlist', () => {
    const saved = readJson(localStorage, 'wishlist_ids', []);
    const productIds = ref(Array.isArray(saved) ? [...new Set(saved.map(String))] : []);

    const toggleWishlist = (id) => {
        const normalizedId = String(id);
        const index = productIds.value.indexOf(normalizedId);
        if (index > -1) {
            productIds.value.splice(index, 1);
        } else {
            productIds.value.push(normalizedId);
        }
    };

    const clearWishlist = () => productIds.value = [];

    watch(productIds, (newVal) => {
        writeJson(localStorage, 'wishlist_ids', newVal);
    }, { deep: true });

    return { productIds, toggleWishlist, clearWishlist };
});
