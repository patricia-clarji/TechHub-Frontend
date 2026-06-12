import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useProductsStore } from './products';

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart_items')) || []);
    const productsStore = useProductsStore();

    const addToCart = (productId, quantity = 1) => {
        const existing = items.value.find(i => i.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.value.push({ id: productId, quantity });
        }
    };

    const removeFromCart = (productId) => {
        items.value = items.value.filter(i => i.id !== productId);
    };

    const clearCart = () => items.value = [];

    const subtotal = computed(() => {
        return items.value.reduce((total, item) => {
            const product = productsStore.sampleProducts.find(p => p.id === item.id);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    });

    const discountTotal = computed(() => {
        return items.value.reduce((total, item) => {
            const product = productsStore.sampleProducts.find(p => p.id === item.id);
            // Synchronized with Deals page logic (first 8 products are on sale)
            const isSaleProduct = productsStore.sampleProducts.slice(0, 8).some(p => p.id === item.id);
            if (product && isSaleProduct) {
                return total + (product.price * item.quantity * 0.20);
            }
            return total;
        }, 0);
    });

    const totalAmount = computed(() => subtotal.value - discountTotal.value);

    const itemCount = computed(() => items.value.reduce((total, item) => total + item.quantity, 0));

    watch(items, (newVal) => {
        localStorage.setItem('cart_items', JSON.stringify(newVal));
    }, { deep: true });

    return { items, addToCart, removeFromCart, clearCart, subtotal, discountTotal, totalAmount, itemCount };
});