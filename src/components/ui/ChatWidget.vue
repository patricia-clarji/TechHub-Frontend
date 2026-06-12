<script setup>
import { ref, watch, nextTick } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useProductsStore } from '@/stores/products';

const uiStore = useUIStore();
const productsStore = useProductsStore();

const messages = ref([
    { text: "System Online. I am the TechHub Concierge. How can I facilitate your architectural provisions today?", isBot: true }
]);
const inputMsg = ref("");
const isTyping = ref(false);
const chatContainer = ref(null);

const suggestions = ["Verify Warranty", "Logistics Speed", "Recommend Laptop", "System Catalog"];

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

const getArchitecturalReply = (input) => {
    const query = input.toLowerCase();
    
    // Dynamic Product Search
    if (query.includes('recommend') || query.includes('best') || query.includes('find')) {
        const category = ['laptop', 'phone', 'gaming', 'audio', 'smart home'].find(cat => query.includes(cat));
        if (category) {
            const found = productsStore.sampleProducts.filter(p => p.category.toLowerCase().includes(category))[0];
            if (found) return `Analysis complete. For ${category} requirements, we recommend the ${found.name} ($${found.price}). It features ${found.features[0]}. Shall I provide details?`;
        }
        return "Specify a hardware category (e.g., Laptops, Gaming) for an optimized recommendation matrix.";
    }

    // Core Policy Responses
    if (query.includes('warranty')) return "Standard deployment includes a 24-month enterprise-grade warranty. Priority support tokens are available for executive hardware tiers.";
    if (query.includes('shipping') || query.includes('logistics')) return "Complimentary priority dispatch is initialized for all order aggregates exceeding $500. Expected transit duration: 2-4 logic days.";
    if (query.includes('catalog') || query.includes('products')) return "The current provision catalog contains 14 active hardware modules across 6 luxury categories. Use the search terminal for specific ID lookup.";
    if (query.includes('hello') || query.includes('hi')) return "Greetings. Operational status: Nominal. I am ready for inquiry processing.";
    
    return "Query parameters recognized, but no specific data node found. Contact our human terminal at support@techhub.com for deep-level technical assistance.";
};

const sendChat = (txt) => {
    const content = txt || inputMsg.value.trim();
    if (!content) return;

    messages.value.push({ text: content, isBot: false });
    if (!txt) inputMsg.value = "";
    
    scrollToBottom();
    isTyping.value = true;

    setTimeout(() => {
        const reply = getArchitecturalReply(content);
        messages.value.push({ text: reply, isBot: true });
        isTyping.value = false;
        scrollToBottom();
    }, 1200);
};

// Auto-scroll when window opens
watch(() => uiStore.chatWindowOpen, (val) => {
    if (val) scrollToBottom();
});
</script>

<template>
    <div class="fixed bottom-24 right-6 z-[100] font-sans">
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

            <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div v-for="(m, i) in messages" :key="i" :class="m.isBot ? 'justify-start' : 'justify-end'"
                    class="flex">
                    <div :class="m.isBot ? 'bg-[var(--bg-muted)] text-[var(--text)]' : 'bg-[var(--accent)] text-white'"
                        class="max-w-[75%] rounded-2xl px-3 py-2 text-sm">
                        {{ m.text }}
                    </div>
                </div>
                <!-- Typing Indicator -->
                <div v-if="isTyping" class="flex justify-start">
                    <div class="bg-[var(--bg-muted)] text-[var(--text-muted)] rounded-2xl px-4 py-2 text-xs flex gap-1 items-center">
                        <span class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                        <span class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
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