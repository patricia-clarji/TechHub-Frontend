<script setup>
defineProps(['colors', 'modelValue']);
defineEmits(['update:modelValue']);
</script>

<template>
    <div class="space-y-3">
        <div class="flex justify-between items-center">
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Select Finish</h4>
            <span class="text-[10px] font-bold text-[var(--accent)]">{{ modelValue?.name }}</span>
        </div>
        <div class="flex gap-3">
            <button 
                type="button"
                v-for="color in colors" 
                :key="color.name"
                :aria-label="`Select ${color.name}`"
                :aria-pressed="modelValue?.name === color.name"
                @click="$emit('update:modelValue', color)"
                class="w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative group"
                :style="{ backgroundColor: color.hex }"
                :class="modelValue?.name === color.name ? 'border-[var(--accent)] scale-110 shadow-lg' : 'border-transparent hover:border-[var(--border)]'"
            >
                <span class="absolute -top-8 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {{ color.name }}
                </span>
                <i v-if="modelValue?.name === color.name" class="fa-solid fa-check text-[10px]" :class="color.hex === '#f5f5f7' ? 'text-black' : 'text-white'"></i>
            </button>
        </div>
    </div>
</template>
