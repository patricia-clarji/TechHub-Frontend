import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useCartStore } from './cart';
import { useWishlistStore } from './wishlist';
import { useRecentlyViewedStore } from './recentlyViewed';

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(JSON.parse(localStorage.getItem('techhub_user')) || null);

    // Initialize users database from localStorage or an empty object
    const getUsersDB = () => {
        try {
            return JSON.parse(localStorage.getItem('techhub_users_db')) || {};
        } catch (e) {
            return {};
        }
    };

    const saveUsersDB = (db) => {
        localStorage.setItem('techhub_users_db', JSON.stringify(db));
    };

    const login = (email, password) => {
        if (!email || password.length < 6) {
            return {
                success: false,
                message: 'Invalid credentials. Password must be 6+ characters.'
            };
        }

        const db = getUsersDB();
        const normalizedEmail = email.toLowerCase().trim();
        const savedUser = db[normalizedEmail];

        if (savedUser) {
            if (savedUser.password && savedUser.password !== password) {
                return {
                    success: false,
                    message: 'Incorrect password.'
                };
            }
            currentUser.value = savedUser;
        } else {
            // Register dynamically on first login with any valid credentials
            const newUser = {
                name: email.split('@')[0],
                email: email,
                password: password,
                phone: '+1 (555) 822-9000',
                avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=8B6B47&color=fff`,
                preferences: {
                    language: 'English',
                    currency: 'USD',
                    notifications: {
                        orders: true,
                        promotions: false,
                        alerts: true
                    }
                },
                billing: {
                    cardName: '',
                    cardNumber: '',
                    expiry: '',
                    cvv: '',
                    address: ''
                }
            };
            db[normalizedEmail] = newUser;
            saveUsersDB(db);
            currentUser.value = newUser;
        }

        return { success: true };
    };

    const signup = (name, email, password) => {
        if (name && email && password.length >= 6) {
            const db = getUsersDB();
            const normalizedEmail = email.toLowerCase().trim();
            if (db[normalizedEmail]) {
                return { success: false, message: 'An account with this email already exists.' };
            }

            const newUser = { 
                name, 
                email,
                password,
                phone: '',
                avatar: `https://ui-avatars.com/api/?name=${name}&background=8B6B47&color=fff`,
                preferences: {
                    language: 'English', 
                    currency: 'USD', 
                    notifications: { 
                        orders: true, 
                        promotions: false, 
                        alerts: true 
                    }
                },
                billing: {
                    cardName: '',
                    cardNumber: '',
                    expiry: '',
                    cvv: '',
                    address: ''
                }
            };
            db[normalizedEmail] = newUser;
            saveUsersDB(db);
            currentUser.value = newUser;
            return { success: true };
        }
        return { success: false, message: 'Please provide valid registration parameters.' };
    };

    const logout = () => {
        const cartStore = useCartStore();
        const wishlistStore = useWishlistStore();
        const recentlyViewedStore = useRecentlyViewedStore();
        currentUser.value = null;
        cartStore.clearCart();
        wishlistStore.clearWishlist();
        recentlyViewedStore.clearHistory();
    };

    const updateProfile = (data) => {
        if (!currentUser.value) return { success: false, message: 'Not logged in' };
        currentUser.value = { ...currentUser.value, ...data };

        // Save to users DB
        const db = getUsersDB();
        const normalizedEmail = currentUser.value.email.toLowerCase().trim();
        if (db[normalizedEmail]) {
            db[normalizedEmail] = { ...db[normalizedEmail], ...data };
            saveUsersDB(db);
        }
        return { success: true };
    };

    const updatePreferences = (prefs) => {
        if (!currentUser.value) return { success: false, message: 'Not logged in' };
        currentUser.value.preferences = { ...currentUser.value.preferences, ...prefs };

        // Save to users DB
        const db = getUsersDB();
        const normalizedEmail = currentUser.value.email.toLowerCase().trim();
        if (db[normalizedEmail]) {
            db[normalizedEmail].preferences = { ...db[normalizedEmail].preferences, ...prefs };
            saveUsersDB(db);
        }
        return { success: true };
    };

    const changePassword = (currentPassword, newPassword) => {
        if (!currentUser.value) return { success: false, message: 'Not logged in' };
        
        const db = getUsersDB();
        const normalizedEmail = currentUser.value.email.toLowerCase().trim();
        const savedUser = db[normalizedEmail];
        
        if (savedUser && savedUser.password !== currentPassword) {
            return { success: false, message: 'Incorrect current password.' };
        }
        
        currentUser.value.password = newPassword;
        if (savedUser) {
            savedUser.password = newPassword;
            saveUsersDB(db);
        }
        return { success: true };
    };

    const deleteAccount = () => {
        if (!currentUser.value) return { success: false, message: 'Not logged in' };
        
        const db = getUsersDB();
        const normalizedEmail = currentUser.value.email.toLowerCase().trim();
        
        if (db[normalizedEmail]) {
            delete db[normalizedEmail];
            saveUsersDB(db);
        }
        
        logout();
        return { success: true };
    };

    // Persistent Session Logic (only write current user if not null, otherwise clear item)
    watch(currentUser, (newVal) => {
        if (newVal) {
            localStorage.setItem('techhub_user', JSON.stringify(newVal));
        } else {
            localStorage.removeItem('techhub_user');
        }
    }, { deep: true });

    return {
        currentUser,
        login,
        signup,
        logout,
        updateProfile,
        updatePreferences,
        changePassword,
        deleteAccount
    };
});

