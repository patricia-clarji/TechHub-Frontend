import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref(JSON.parse(localStorage.getItem('techhub_notifications')) || [
        { id: 'notif1', message: 'System Update: New firmware available for Nova X 5G. Optimize now!', type: 'system', date: '2024-06-15', read: false },
        { id: 'notif2', message: 'Special Offer: 20% off all Audio modules this week. Limited time!', type: 'promo', date: '2024-06-14', read: false },
        { id: 'notif3', message: 'Order #TH7890: Your AeroBlade 14 has been dispatched. Tracking ID: AB12345.', type: 'order', date: '2024-06-13', read: true },
        { id: 'notif4', message: 'Wishlist Alert: Pixel Lite is now back in stock!', type: 'wishlist', date: '2024-06-12', read: false },
    ]);

    const addNotification = (message, type = 'system') => {
        const newNotification = {
            id: `notif${Date.now()}`,
            message,
            type,
            date: new Date().toISOString().slice(0, 10),
            read: false,
        };
        notifications.value.unshift(newNotification); // Add to the beginning
    };

    const markAsRead = (id) => {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    };

    const markAllAsRead = () => {
        notifications.value.forEach(n => n.read = true);
    };

    const clearAll = () => {
        notifications.value = [];
    };

    const unreadCount = computed(() => {
        return notifications.value.filter(n => !n.read).length;
    });

    // Persist notifications to localStorage
    watch(notifications, (newVal) => {
        localStorage.setItem('techhub_notifications', JSON.stringify(newVal));
    }, { deep: true });

    return {
        notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount
    };
});