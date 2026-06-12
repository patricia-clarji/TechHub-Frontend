import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useWishlistStore = defineStore('wishlist', () => {
    const productIds = ref(JSON.parse(localStorage.getItem('wishlist_ids')) || []);

    const toggleWishlist = (id) => {
        const index = productIds.value.indexOf(id);
        if (index > -1) {
            productIds.value.splice(index, 1);
        } else {
            productIds.value.push(id);
        }
    };

    const clearWishlist = () => productIds.value = [];

    watch(productIds, (newVal) => {
        localStorage.setItem('wishlist_ids', JSON.stringify(newVal));
    }, { deep: true });

    return { productIds, toggleWishlist, clearWishlist };
});