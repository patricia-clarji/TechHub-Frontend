<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/stores/ui/ui';
import { useProductsStore } from '@/stores/shop/products';
import { useUserStore } from '@/stores/auth/user';
import logger from '@/utils/logger';

const uiStore = useUIStore();
const productsStore = useProductsStore();
const userStore = useUserStore();
const router = useRouter();

const messages = ref([
    { text: "Greetings. I am your **TechHub Concierge**. My neural pathways are synchronized to facilitate your discovery of premium hardware and architectural specifications. How may I assist your acquisition today?", isBot: true }
]);
const inputMsg = ref("");
const isTyping = ref(false);
const chatContainer = ref(null);
const showSuggestions = ref(true);

const suggestions = ["Latest Deals", "Workstation Recommendations", "Shipping Policy", "Compare Smartphones"];

// Simple Markdown-lite parser for bolding and line breaks
// Escape incoming text before injecting limited HTML tags to avoid XSS
const escapeHtml = (unsafe) => {
    return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const formatMessage = (text) => {
    if (!text) return '';
    // Work on escaped text
    let t = escapeHtml(text);
    // Allow a few safe tags by injecting them via replacement on escaped text
    t = t.replace(/^### (.*$)/gim, '<h3 class="font-bold text-sm mt-3 mb-1 uppercase tracking-wider">$1</h3>');
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/^\s*[-*]\s+(.*)/gm, '<div class="flex gap-2 mb-1"><span class="text-[var(--accent)]">•</span><span>$1</span></div>');
    t = t.replace(/\n/g, '<br/>');
    return t;
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

const processAIStreaming = async (userPrompt, targetMsgIndex) => {
    const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
    const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const DEEPSEEK_MODEL = 'deepseek/deepseek-chat';

    if (!DEEPSEEK_API_KEY) {
        messages.value[targetMsgIndex].text = "System Error: AI Provisioning key is not configured in the environment.";
        return;
    }

    // Prepare catalog context for the AI, including product features for better recommendations
    const catalogContext = productsStore.sampleProducts.map(p =>
        `${p.name} ($${p.price}): ${p.desc} - Features: ${p.features ? p.features.join(', ') : 'N/A'}`
    ).join('\n');

    // Extract history for context (last 6 messages)
    const history = messages.value.slice(-7, -1).map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text
    }));

    messages.value[targetMsgIndex].text = "";

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'TechHub Concierge'
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                temperature: 0.7,
                stream: true,
                messages: [
                    {
                        role: 'system',
                        content: `You are the TechHub Concierge, a high-fidelity architectural interface for a luxury electronics boutique. 
                        Your tone is professional, sophisticated, and technically precise.
                        
                        Guidelines:
                        1. Use the provided catalog context to answer queries accurately.
                        2. Use Markdown (**bolding**) for product names and prices.
                        3. If asked about shipping, mention our $500 threshold for free priority freight.
                        
                        Available Products:
                        ${catalogContext}`
                    },
                    ...history,
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.error?.message || errorData.message || 'Unknown error';
            messages.value[targetMsgIndex].text = `Protocol Error: ${errorMsg} (Status: ${response.status})`;
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.substring(6));
                        const content = data.choices[0]?.delta?.content || "";
                        messages.value[targetMsgIndex].text += content;
                        scrollToBottom();
                    } catch (e) {
                        // Continue through minor parsing issues
                    }
                }
            }
        }

        // Post-processing for product injection
        messages.value[targetMsgIndex].product = detectProduct(messages.value[targetMsgIndex].text);

    } catch (error) {
        logger.error('Network or parsing error:', error);
        messages.value[targetMsgIndex].text = "Neural Link Error: Connection to the AI Inference Node was interrupted.";
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

    // Pre-inject streaming message
    const botMsgIndex = messages.value.push({ text: "", isBot: true }) - 1;
    
    await processAIStreaming(content, botMsgIndex);

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
            class="w-14 h-14 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(139,107,71,0.3)] transition-all duration-500 hover:scale-110 hover:rotate-12 active:scale-90 premium-btn"
            style="animation: chatbotPulse 3s infinite">
            <i :class="uiStore.chatWindowOpen ? 'fa-solid fa-chevron-down text-lg' : 'fa-solid fa-comments text-lg'"></i>
        </button>

        <div v-if="uiStore.chatWindowOpen"
            class="absolute bottom-20 right-0 w-[90vw] sm:w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[550px] max-h-[70vh]">
            <!-- Header -->
            <div class="bg-[var(--bg-muted)] p-5 border-b border-[var(--border)] flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-inner">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h4 class="font-[Playfair_Display] font-bold text-sm text-[var(--text)]">TechHub Concierge</h4>
                        <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <p class="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">Neural
                                Link Active</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Feed -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-5 bg-[var(--bg)]/30 custom-scrollbar">
                <div v-for="(m, i) in messages" :key="i" :class="m.isBot ? 'justify-start' : 'justify-end'"
                    class="flex">
                    <div :class="m.isBot ? 'bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border)] rounded-tr-2xl shadow-[0_4px_20px_var(--glow)] animate-[settleIn_0.4s_ease-out_both]' : 'bg-[var(--accent)] text-white rounded-tl-2xl shadow-lg'"
                        class="max-w-[88%] rounded-b-2xl px-5 py-4 text-[13px] leading-relaxed">
                        <div v-html="formatMessage(m.text)"></div>

                        <!-- Product Injection Card -->
                        <div v-if="m.product"
                            class="mt-4 p-3 bg-[var(--bg-muted)] rounded-xl border border-[var(--border)] flex gap-3 items-center">
                            <img :src="m.product.img" class="w-12 h-12 rounded-lg object-cover" />
                            <div class="flex-1 min-w-0">
                                <p class="text-[10px] font-bold truncate">{{ m.product.name }}</p>
                                <p class="text-[10px] text-[var(--accent)] font-bold">${{ m.product.price }}</p>
                            </div>
                            <button @click="router.push(`/products/${m.product.id}`)"
                                class="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase hover:bg-[var(--accent-dk)] transition-colors">
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Typing Indicator -->
                <div v-if="isTyping" class="flex justify-start">
                    <div
                        class="bg-[var(--bg-muted)] text-[var(--text-muted)] rounded-2xl px-4 py-2 text-xs flex gap-1 items-center">
                        <span class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                        <span
                            class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span
                            class="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
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