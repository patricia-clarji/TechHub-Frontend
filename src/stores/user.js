import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null);

    const login = (email, password) => {
        // Mock login logic - in production, this would be an API call
        if (email && password.length >= 6) {
            currentUser.value = {
                name: email.split('@')[0],
                email: email
            };
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials. Password must be 6+ characters.' };
    };

    const signup = (name, email, password) => {
        if (name && email && password.length >= 6) {
            currentUser.value = { name, email };
            return { success: true };
        }
        return { success: false, message: 'Please provide valid registration parameters.' };
    };

    const logout = () => {
        currentUser.value = null;
    };

    return {
        currentUser,
        login,
        signup,
        logout
    };
});