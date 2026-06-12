import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToastStore } from './toast';
import { useProductsStore } from './products';

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'));
    const drawerOpen = ref(false);
    const toastStore = useToastStore();
    const productsStore = useProductsStore();

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(items.value));
    };

    const addToCart = (productId, qty = 1) => {
        const existing = items.value.find(i => i.id === productId);
        if (existing) {
            existing.quantity += qty;
        } else {
            items.value.push({ id: productId, quantity: qty });
        }
        saveCart();
        toastStore.showToast('Added to cart successfully!', 'fa-cart-plus');
    };

    const removeFromCart = (productId) => {
        items.value = items.value.filter(i => i.id !== productId);
        saveCart();
        toastStore.showToast('Removed from shopping cart.', 'fa-trash-can');
    };

    const updateQuantity = (productId, amt) => {
        const matched = items.value.find(i => i.id === productId);
        if (matched) {
            matched.quantity += amt;
            if (matched.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    };

    const clearCart = () => {
        items.value = [];
        saveCart();
    };

    const subtotal = computed(() => {
        return items.value.reduce((acc, item) => {
            const product = productsStore.sampleProducts.find(p => p.id === item.id);
            return acc + (product ? product.price : 0) * item.quantity;
        }, 0);
    });

    const totalCount = computed(() => items.value.reduce((acc, i) => acc + i.quantity, 0));
    const shippingCost = computed(() => (subtotal.value > 500 || subtotal.value === 0 ? 0 : 15));
    const estimatedTax = computed(() => Math.round(subtotal.value * 0.08));
    const totalAmount = computed(() => subtotal.value + shippingCost.value + estimatedTax.value);

    return { items, drawerOpen, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalCount, shippingCost, estimatedTax, totalAmount };
});