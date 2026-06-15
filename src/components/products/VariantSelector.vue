<script setup>
defineProps(['variants', 'modelValue']);
defineEmits(['update:modelValue']);
</script>

<template>
    <div class="space-y-3">
        <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Configuration</h4>
        <div class="flex flex-wrap gap-2">
            <button 
                v-for="v in variants" 
                :key="v.id"
                @click="v.stock > 0 && $emit('update:modelValue', v)"
                class="px-5 py-3 rounded-xl border-2 font-bold text-xs transition-all relative overflow-hidden"
                :class="[
                    modelValue?.id === v.id ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg' : 'border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)]',
                    v.stock === 0 ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''
                ]"
            >
                {{ v.name }}
                <span v-if="v.stock === 0" class="absolute inset-0 flex items-center justify-center rotate-12">
                    <span class="h-px w-full bg-red-500/50"></span>
                </span>
                <span v-if="v.priceMod > 0" class="block text-[8px] opacity-70 mt-1">+$ {{ v.priceMod }}</span>
            </button>
        </div>
    </div>
</template>