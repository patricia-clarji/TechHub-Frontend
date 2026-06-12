import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
    const searchModalOpen = ref(false);
    const authModalOpen = ref(false);
    const cartDrawerOpen = ref(false);
    const chatWindowOpen = ref(false);
    const quickViewProductId = ref(null);

    const toggleSearch = () => searchModalOpen.value = !searchModalOpen.value;
    const toggleAuth = () => authModalOpen.value = !authModalOpen.value;
    const toggleCart = () => cartDrawerOpen.value = !cartDrawerOpen.value;
    const toggleChat = () => chatWindowOpen.value = !chatWindowOpen.value;
    
    const openQuickView = (id) => quickViewProductId.value = id;
    const closeQuickView = () => quickViewProductId.value = null;

    return { searchModalOpen, authModalOpen, cartDrawerOpen, chatWindowOpen, quickViewProductId, 
             toggleSearch, toggleAuth, toggleCart, toggleChat, openQuickView, closeQuickView };
});