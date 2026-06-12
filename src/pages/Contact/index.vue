<script setup>
import { ref } from 'vue';
import { useToastStore } from '../../stores/toast';

const toastStore = useToastStore();
const sender = ref('');
const inquiry = ref('');

const transmit = () => {
    if (!sender.value || !inquiry.value) return;
    toastStore.showToast('Secure pipeline message transmitted successfully.', 'fa-paper-plane');
    sender.value = '';
    inquiry.value = '';
};
</script>

<template>
    <main class="pt-32 max-w-4xl mx-auto px-6 space-y-12">
        <div class="text-center space-y-3">
            <span class="section-badge">Communications Pipeline</span>
            <h1 class="font-[Playfair_Display] text-4xl font-extrabold">Initiate Terminal Connect</h1>
            <p class="text-sm text-[var(--text-muted)]">Direct channels into architectural oversight components.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[2rem] space-y-4">
                <div>
                    <label
                        class="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Corporate
                        Alias</label>
                    <input v-model="sender" type="text"
                        class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                    <label
                        class="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Inquiry
                        Parameter Description</label>
                    <textarea v-model="inquiry" rows="4"
                        class="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-sm focus:outline-none resize-none"></textarea>
                </div>
                <button @click="transmit"
                    class="w-full bg-[var(--accent)] hover:bg-[var(--accent-dk)] premium-btn text-white py-3 rounded-full font-bold transition-all text-sm">Transmit
                    Parameters</button>
            </div>

            <div class="flex flex-col justify-center space-y-6 text-sm text-[var(--text-muted)]">
                <div>
                    <h4 class="font-bold text-[var(--text)] uppercase tracking-wider mb-1">Secure Core Gateway</h4>
                    <p>secure_gateway@techhub-enterprise.infra</p>
                </div>
                <div>
                    <h4 class="font-bold text-[var(--text)] uppercase tracking-wider mb-1">Telephony Relays</h4>
                    <p>+1 (800) 555-TECH-HUB [Ext 400]</p>
                </div>
                <div>
                    <h4 class="font-bold text-[var(--text)] uppercase tracking-wider mb-1">Operational Hours Matrix</h4>
                    <p>Continuous Execution [24/7/365 Terminal Support]</p>
                </div>
            </div>
        </div>
    </main>
</template>