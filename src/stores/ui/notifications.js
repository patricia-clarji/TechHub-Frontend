import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { readJson, writeJson } from '@/utils/storage';

export const useNotificationStore = defineStore('notifications', () => {
    const saved = readJson(localStorage, 'techhub_notifications_v2', []);
    const notifications = ref(Array.isArray(saved) ? saved : []);

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
        writeJson(localStorage, 'techhub_notifications_v2', newVal);
    }, { deep: true });

    return {
        notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount
    };
});
