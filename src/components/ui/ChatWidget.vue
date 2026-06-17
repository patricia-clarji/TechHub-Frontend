<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { useUIStore } from '@/stores/ui';
import { useProductsStore } from '@/stores/products';
import { useUserStore } from '@/stores/user';

const uiStore = useUIStore();
const productsStore = useProductsStore();
const userStore = useUserStore();

const messages = ref([
    { text: "Greetings. I am your **TechHub Concierge**. I am prepared to assist with hardware recommendations, logistics status, or architectural specifications. How may I facilitate your discovery today?", isBot: true }
]);
const inputMsg = ref("");
const isTyping = ref(false);
const chatContainer = ref(null);
const showSuggestions = ref(true);

const suggestions = ["Latest Deals", "Workstation Recommendations", "Shipping Policy", "Compare Smartphones"];

// Simple Markdown-lite parser for bolding and line breaks
const formatMessage = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
};

// Logic to detect if a product name is mentioned and return the object
const detectProduct = (text) => {
    return productsStore.sampleProducts.find(p => 
        text.toLowerCase().includes(p.name.toLowerCase())
    );
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' });
    }
};

const fetchAIResponse = async (userPrompt) => {
    // Integration with an AI Provider (e.g., OpenRouter / DeepSeek)
    // This simulates the System Prompt + Catalog Context injection
    const catalogContext = productsStore.sampleProducts.map(p => `${p.name} ($${p.price}): ${p.desc}`).join('|');
    
    try {
        // Placeholder for real fetch call:
        // const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { ... })
        
        // Simulated AI Logic for demonstration based on the catalog
        await new Promise(r => setTimeout(r, 1500));
        
        const query = userPrompt.toLowerCase();
        if (query.includes('laptop') || query.includes('work')) {
            return "Based on your productivity requirements, I recommend the **AeroBlade 14**. It is a featherweight performance laptop with an Intel i9 processor and 165Hz OLED display. It is currently in stock for **$1499**.";
        } else if (query.includes('shipping') || query.includes('delivery')) {
            return "Our logistics protocol ensures **Free Priority Shipping** for all orders over **$500**. Standard dispatch occurs within 24 hours of system verification.";
        } else if (query.includes('deal') || query.includes('sale')) {
            return "We currently have an active **Flash Sale Event**. I suggest looking at the **Nova X 5G** or the **Pulse One Headphones** for the best value-to-performance ratio.";
        }
        
        return "I have analyzed your inquiry. For specific technical deep-dives or custom hardware configurations, please specify a category or brand from our **Premium Catalog**.";
    } catch (error) {
        return "System Error: Connection to the AI Inference Node was interrupted. Please retry.";
    }
};

const sendChat = async (txt) => {
    const content = txt || inputMsg.value.trim();
    if (!content) return;

    messages.value.push({ text: content, isBot: false });
    if (!txt) inputMsg.value = "";
    showSuggestions.value = false;
    
    scrollToBottom();
    isTyping.value = true;

    const aiReply = await fetchAIResponse(content);
    messages.value.push({ 
        text: aiReply, 
        isBot: true, 
        product: detectProduct(aiReply) 
    });
    
    isTyping.value = false;
    scrollToBottom();
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
            class="absolute bottom-20 right-0 w-[90vw] sm:w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[550px] max-h-[70vh]">
            <!-- Header -->
            <div class="bg-[var(--bg-muted)] p-5 border-b border-[var(--border)] flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-inner">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h4 class="font-[Playfair_Display] font-bold text-sm text-[var(--text)]">TechHub Concierge</h4>
                        <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <p class="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Neural Link Active</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Feed -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-5 bg-[var(--bg)]/30 custom-scrollbar">
                <div v-for="(m, i) in messages" :key="i" :class="m.isBot ? 'justify-start' : 'justify-end'"
                    class="flex">
                    <div :class="m.isBot ? 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-tr-2xl' : 'bg-[var(--accent)] text-white rounded-tl-2xl'"
                        class="max-w-[85%] rounded-b-2xl px-4 py-3 text-sm shadow-sm">
                        <div v-html="formatMessage(m.text)" class="leading-relaxed"></div>
                        
                        <!-- Product Injection Card -->
                        <div v-if="m.product" class="mt-4 p-3 bg-[var(--bg-muted)] rounded-xl border border-[var(--border)] flex gap-3 items-center">
                            <img :src="m.product.img" class="w-12 h-12 rounded-lg object-cover" />
                            <div class="flex-1 min-w-0">
                                <p class="text-[10px] font-bold truncate">{{ m.product.name }}</p>
                                <p class="text-[10px] text-[var(--accent)] font-bold">${{ m.product.price }}</p>
                            </div>
                            <router-link :to="`/products/${m.product.id}`" class="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase">View</router-link>
                        </div>
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

            <!-- Input Area -->
            <div class="p-4 border-t border-[var(--border)] bg-[var(--bg-card)] space-y-3">
                <div v-if="showSuggestions" class="flex flex-wrap gap-2">
                    <button v-for="s in suggestions" :key="s" @click="sendChat(s)"
                        class="text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-muted)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] px-3 py-1.5 rounded-full transition-all">
                        {{ s }}
                    </button>
                </div>
                <div class="flex gap-2">
                    <input v-model="inputMsg" @keydown.enter="sendChat()" type="text" placeholder="Type an inquiry..."
                        class="flex-1 bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-all" />
                    <button @click="sendChat()"
                        class="w-12 h-12 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95">
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>