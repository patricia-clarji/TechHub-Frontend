import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);

    const showToast = (message, icon = 'fa-info-circle') => {
        const id = Date.now() + Math.random();
        toasts.value.push({ id, message, icon });
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        }, 3000);
    };

    return { toasts, showToast };
});