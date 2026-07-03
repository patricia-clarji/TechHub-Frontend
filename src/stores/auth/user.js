import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useWishlistStore } from '@/stores/shop/wishlist';
import { useRecentlyViewedStore } from '@/stores/shop/recentlyViewed';
import { debug, error as logError } from '@/utils/logger';

const encoder = new TextEncoder();
const toHex = (buffer) => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
const hashPassword = async (password) => {
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return toHex(hash);
};

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

    const login = async (email, password) => {
        if (!email || password.length < 6) {
            return {
                success: false,
                message: 'Invalid credentials. Password must be 6+ characters.'
            };
        }

        const db = getUsersDB();
        const normalizedEmail = email.toLowerCase().trim();
        const savedUser = db[normalizedEmail];
        const hashed = await hashPassword(password);

        if (savedUser) {
            if (savedUser.hashedPassword && savedUser.hashedPassword !== hashed) {
                return {
                    success: false,
                    message: 'Incorrect password.'
                };
            }
            // Do not expose password or hashedPassword in currentUser
            const { hashedPassword, password: _p, ...publicUser } = savedUser;
            currentUser.value = publicUser;
        } else {
            // Register dynamically on first login with any valid credentials
            const newUser = {
                name: email.split('@')[0],
                email: email,
                hashedPassword: hashed,
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
            const { hashedPassword, ...publicUser } = newUser;
            currentUser.value = publicUser;
        }

        return { success: true };
    };

    const signup = async (name, email, password) => {
        if (name && email && password.length >= 6) {
            const db = getUsersDB();
            const normalizedEmail = email.toLowerCase().trim();
            if (db[normalizedEmail]) {
                return { success: false, message: 'An account with this email already exists.' };
            }

            const hashed = await hashPassword(password);
            const newUser = { 
                name, 
                email,
                hashedPassword: hashed,
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
            const { hashedPassword, ...publicUser } = newUser;
            currentUser.value = publicUser;
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
        try {
            localStorage.removeItem('techhub_user');
        } catch (e) {
            logError('Failed to remove techhub_user from localStorage', e);
        }
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

    const changePassword = async (currentPassword, newPassword) => {
        if (!currentUser.value) return { success: false, message: 'Not logged in' };
        
        const db = getUsersDB();
        const normalizedEmail = currentUser.value.email.toLowerCase().trim();
        const savedUser = db[normalizedEmail];
        const currentHash = await hashPassword(currentPassword);
        if (savedUser && savedUser.hashedPassword !== currentHash) {
            return { success: false, message: 'Incorrect current password.' };
        }
        const newHash = await hashPassword(newPassword);
        if (savedUser) {
            savedUser.hashedPassword = newHash;
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
        try {
            if (newVal) {
                // Never persist password or hashedPassword to localStorage
                const { hashedPassword, password, ...publicUser } = newVal;
                localStorage.setItem('techhub_user', JSON.stringify(publicUser));
            } else {
                localStorage.removeItem('techhub_user');
            }
        } catch (e) {
            logError('Failed to persist currentUser safely', e);
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

