<script setup>
import { ref } from 'vue';

const props = defineProps({
    product: { type: Object, required: true }
});

const activeTab = ref('specifications');
const tabs = [
    { id: 'specifications', label: 'Technical Specs' },
    { id: 'features', label: 'Core Features' },
    { id: 'shipping', label: 'Logistics' }
];
</script>

<template>
    <div class="mt-12">
        <div class="flex border-b border-[var(--border)] overflow-x-auto no-scrollbar">
            <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative"
                :class="activeTab === tab.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'"
            >
                {{ tab.label }}
                <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"></div>
            </button>
        </div>

        <div class="py-10">
            <Transition name="fade" mode="out-in">
                <div :key="activeTab">
                    <!-- Specifications Matrix -->
                    <div v-if="activeTab === 'specifications'" class="space-y-4">
                        <div v-for="(val, key) in product.specifications" :key="key" class="flex justify-between py-3 border-b border-[var(--border)]/30">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{{ key }}</span>
                            <span class="text-xs font-semibold">{{ val }}</span>
                        </div>
                    </div>
                    
                    <!-- Features List -->
                    <div v-if="activeTab === 'features'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="feature in product.features" :key="feature" class="flex items-center gap-3 text-xs text-[var(--text-muted)] p-3 bg-[var(--bg-muted)]/30 rounded-xl">
                            <i class="fa-solid fa-circle-check text-[var(--accent)]"></i>
                            {{ feature }}
                        </div>
                    </div>
                    
                    <!-- Logistics / Shipping Information -->
                    <div v-if="activeTab === 'shipping'" class="space-y-6">
                        <div class="flex items-start gap-4">
                            <i class="fa-solid fa-truck-fast text-[var(--accent)] mt-1"></i>
                            <div>
                                <p class="text-xs font-bold uppercase tracking-widest">Global Priority Dispatch</p>
                                <p class="text-[10px] text-[var(--text-muted)] mt-1">Orders are finalized and dispatched within 24 hours. Estimated transit duration: 2-4 business days.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4">
                            <i class="fa-solid fa-box-open text-[var(--accent)] mt-1"></i>
                            <div>
                                <p class="text-xs font-bold uppercase tracking-widest">Architectural Packaging</p>
                                <p class="text-[10px] text-[var(--text-muted)] mt-1">Your provision is housed in premium, impact-resistant sustained housing for total integrity during transit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>