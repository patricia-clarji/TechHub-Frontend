<script setup>
import { useToastStore } from '../../stores/toast';
const toastStore = useToastStore();
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <transition-group name="toast">
            <div v-for="t in toastStore.toasts" :key="t.id"
                class="pointer-events-auto flex items-center gap-3 bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] shadow-xl px-5 py-3 rounded-2xl animate-[slideIn_0.3s_ease]">
                <i :class="t.icon" class="text-[var(--accent)] text-base"></i>
                <span class="text-sm font-medium">{{ t.message }}</span>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
@keyframes slideIn {
    from {
        transform: translateY(20px) scale(0.9);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}
</style>