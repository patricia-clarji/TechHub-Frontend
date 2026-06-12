import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToastStore } from './toast';

export const useWishlistStore = defineStore('wishlist', () => {
    const productIds = ref(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    const toastStore = useToastStore();

    const toggleWishlist = (productId) => {
        if (productIds.value.includes(productId)) {
            productIds.value = productIds.value.filter(id => id !== productId);
            toastStore.showToast('Removed from wishlist', 'fa-heart-crack');
        } else {
            productIds.value.push(productId);
            toastStore.showToast('Added to your wishlist!', 'fa-heart');
        }
        localStorage.setItem('wishlist', JSON.stringify(productIds.value));
    };

    const count = computed(() => productIds.value.length);

    return { productIds, toggleWishlist, count };
});