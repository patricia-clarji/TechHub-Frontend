<script setup>
import { ref } from 'vue';

const props = defineProps({
    images: { type: Array, required: true },
    modelValue: { type: Number, default: 0 }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="space-y-4">
        <!-- Main Image View -->
        <div class="relative aspect-square rounded-[2rem] overflow-hidden bg-[var(--bg-muted)] group cursor-zoom-in shadow-xl">
            <img 
                :src="images[modelValue]" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Hardware Module Display"
            />
            <div class="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                {{ modelValue + 1 }} / {{ images.length }}
            </div>
        </div>

        <!-- Thumbnail Array -->
        <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button 
                v-for="(img, idx) in images" 
                :key="idx"
                @click="$emit('update:modelValue', idx)"
                class="w-20 h-20 rounded-2xl overflow-hidden flex-none border-2 transition-all duration-300"
                :class="modelValue === idx ? 'border-[var(--accent)] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'"
            >
                <img :src="img" class="w-full h-full object-cover" />
            </button>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>