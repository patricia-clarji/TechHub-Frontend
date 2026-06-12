<script setup>
import { ref } from 'vue';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
const messages = ref([
    { text: "Hello! How can I assist you with premium electronics today?", isBot: true }
]);
const inputMsg = ref("");

const suggestions = ["Warranty Policy", "Shipping Speed", "Gaming Products"];

const sendChat = (txt) => {
    const content = txt || inputMsg.value.trim();
    if (!content) return;
    messages.value.push({ text: content, isBot: false });
    if (!txt) inputMsg.value = "";

    setTimeout(() => {
        let reply = "Our premium team responds within minutes! Let us know your contact info.";
        const lower = content.toLowerCase();
        if (lower.includes('warranty')) reply = "All devices feature a 2-year enterprise warranty coverage.";
        if (lower.includes('shipping')) reply = "Complimentary courier dispatch on all orders over $500.";
        if (lower.includes('gaming')) reply = "Check our top rated active mechanical input suites under Gaming.";
        messages.value.push({ text: reply, isBot: true });
    }, 600);
};
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 font-sans">
        <button @click="uiStore.toggleChat()"
            class="w-14 h-14 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 premium-btn"
            style="animation: chatbotPulse 2.5s infinite">
            <i :class="uiStore.chatWindowOpen ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-comments text-lg'"></i>
        </button>

        <div v-if="uiStore.chatWindowOpen"
            class="absolute bottom-20 right-0 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[450px]">
            <div class="bg-[var(--accent)] p-4 text-white">
                <h4 class="font-bold">TechHub Concierge</h4>
                <p class="text-xs text-white/80 font-light">AI Assistants Online</p>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <div v-for="(m, i) in messages" :key="i" :class="m.isBot ? 'justify-start' : 'justify-end'"
                    class="flex">
                    <div :class="m.isBot ? 'bg-[var(--bg-muted)] text-[var(--text)]' : 'bg-[var(--accent)] text-white'"
                        class="max-w-[75%] rounded-2xl px-3 py-2 text-sm">
                        {{ m.text }}
                    </div>
                </div>
            </div>

            <div class="p-3 border-t border-[var(--border)] bg-[var(--bg)] space-y-2">
                <div class="flex flex-wrap gap-1.5">
                    <button v-for="s in suggestions" :key="s" @click="sendChat(s)"
                        class="text-[10px] bg-[var(--bg-card)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] px-2 py-1 rounded-full transition-all">
                        {{ s }}
                    </button>
                </div>
                <div class="flex gap-2">
                    <input v-model="inputMsg" @keydown.enter="sendChat()" type="text" placeholder="Type an inquiry..."
                        class="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-1.5 text-sm focus:outline-none" />
                    <button @click="sendChat()"
                        class="w-8 h-8 bg-[var(--accent)] text-white rounded-full flex items-center justify-center"><i
                            class="fa-solid fa-paper-plane text-xs"></i></button>
                </div>
            </div>
        </div>
    </div>
</template>