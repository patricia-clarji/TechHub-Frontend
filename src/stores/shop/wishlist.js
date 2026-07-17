import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { readJson, writeJson } from '@/utils/storage';
import { getCartOwner } from '@/services/cartService';

export const useWishlistStore = defineStore('wishlist', () => {
    const owner = ref(getCartOwner());
    const storageKey = (targetOwner = owner.value) => `techhub_wishlist_v2:${targetOwner}`;
    const readWishlist = (targetOwner = owner.value) => {
        const saved = readJson(localStorage, storageKey(targetOwner), []);
        return Array.isArray(saved) ? [...new Set(saved.map(String))] : [];
    };
    const saved = readWishlist();
    const productIds = ref(Array.isArray(saved) ? [...new Set(saved.map(String))] : []);

    const syncOwner = () => {
        const nextOwner = getCartOwner();
        if (nextOwner === owner.value) return;
        owner.value = nextOwner;
        productIds.value = readWishlist(nextOwner);
    };

    const persist = () => {
        writeJson(localStorage, storageKey(), productIds.value);
    };

    const toggleWishlist = (id) => {
        syncOwner();
        const normalizedId = String(id);
        const index = productIds.value.indexOf(normalizedId);
        if (index > -1) {
            productIds.value.splice(index, 1);
        } else {
            productIds.value.push(normalizedId);
        }
        persist();
    };

    const clearWishlist = (targetOwner = owner.value) => {
        if (targetOwner === owner.value) productIds.value = [];
        writeJson(localStorage, storageKey(targetOwner), []);
    };

    watch(productIds, (newVal) => {
        writeJson(localStorage, storageKey(), newVal);
    }, { deep: true });

    try { localStorage.removeItem('wishlist_ids'); } catch { /* Storage may be unavailable. */ }

    return { productIds, toggleWishlist, clearWishlist, syncOwner };
});
