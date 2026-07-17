import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { readJson, writeJson } from '@/utils/storage';
import { getCartOwner } from '@/services/cartService';

export const useNotificationStore = defineStore('notifications', () => {
    const owner = ref(getCartOwner());
    const storageKey = (targetOwner = owner.value) => `techhub_notifications_v3:${targetOwner}`;
    const readNotifications = (targetOwner = owner.value) => {
        const saved = readJson(localStorage, storageKey(targetOwner), []);
        return Array.isArray(saved) ? saved : [];
    };
    const saved = readNotifications();
    const notifications = ref(Array.isArray(saved) ? saved : []);

    const syncOwner = () => {
        const nextOwner = getCartOwner();
        if (nextOwner === owner.value) return;
        owner.value = nextOwner;
        notifications.value = readNotifications(nextOwner);
    };

    const persist = () => {
        writeJson(localStorage, storageKey(), notifications.value);
    };

    const addNotification = (message, type = 'system') => {
        syncOwner();
        const newNotification = {
            id: globalThis.crypto?.randomUUID?.() || `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            message,
            type,
            date: new Date().toISOString().slice(0, 10),
            read: false,
        };
        notifications.value.unshift(newNotification);
        persist();
    };

    const markAsRead = (id) => {
        syncOwner();
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            persist();
        }
    };

    const markAllAsRead = () => {
        syncOwner();
        notifications.value.forEach(n => n.read = true);
        persist();
    };

    const clearAll = (targetOwner = owner.value) => {
        if (targetOwner === owner.value) notifications.value = [];
        writeJson(localStorage, storageKey(targetOwner), []);
    };

    const unreadCount = computed(() => {
        return notifications.value.filter(n => !n.read).length;
    });

    watch(notifications, (newVal) => {
        writeJson(localStorage, storageKey(), newVal);
    }, { deep: true });

    try { localStorage.removeItem('techhub_notifications_v2'); } catch { /* Storage may be unavailable. */ }

    return {
        notifications, addNotification, markAsRead, markAllAsRead, clearAll, unreadCount, syncOwner
    };
});
