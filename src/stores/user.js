import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useCartStore } from './cart';

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(JSON.parse(localStorage.getItem('techhub_user')) || null);

    const login = (email, password) => {
        // Mock login logic - in production, this would be an API call
        if (email && password.length >= 6) {
            currentUser.value = {
                name: email.split('@')[0],
                email: email,
                phone: '+1 (555) 822-9000',
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B6B47&color=fff`,
                preferences: {
                    language: 'English',
                    currency: 'USD',
                    notifications: { email: true, push: false, sms: true }
                }
            };
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials. Password must be 6+ characters.' };
    };

    const signup = (name, email, password) => {
        if (name && email && password.length >= 6) {
            currentUser.value = { 
                name, 
                email,
                phone: '',
                avatar: `https://ui-avatars.com/api/?name=${name}&background=8B6B47&color=fff`,
                preferences: {
                    language: 'English', currency: 'USD', notifications: { email: true, push: false, sms: true }
                }
            };
            return { success: true };
        }
        return { success: false, message: 'Please provide valid registration parameters.' };
    };

    const logout = () => {
        const cartStore = useCartStore();
        currentUser.value = null;
        cartStore.clearCart();
    };

    const updateProfile = (data) => {
        if (!currentUser.value) return;
        currentUser.value = { ...currentUser.value, ...data };
        return { success: true };
    };

    const updatePreferences = (prefs) => {
        if (!currentUser.value) return;
        currentUser.value.preferences = { ...currentUser.value.preferences, ...prefs };
        return { success: true };
    };

    // Persistent Session Logic
    watch(currentUser, (newVal) => {
        localStorage.setItem('techhub_user', JSON.stringify(newVal));
    }, { deep: true });

    return {
        currentUser,
        login,
        signup,
        logout,
        updateProfile,
        updatePreferences
    };
});