<script setup>
import { ref } from 'vue';
import { useToastStore } from '@/stores/ui/toast';
import { apiClient } from '@/services/apiClient';
import config from '@/config';

const toastStore = useToastStore();
const senderName = ref('');
const senderEmail = ref('');
const inquirySubject = ref('');
const inquiry = ref('');
const isLoading = ref(false);
const formErrors = ref({});

const transmit = async () => {
    formErrors.value = {};
    if (senderName.value.trim().length < 2) formErrors.value.senderName = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.value.trim())) formErrors.value.senderEmail = 'Enter a valid email address.';
    if (inquirySubject.value.trim().length < 3) formErrors.value.inquirySubject = 'Enter a subject.';
    if (inquiry.value.trim().length < 10) formErrors.value.inquiry = 'Tell us how we can help.';

    if (Object.keys(formErrors.value).length > 0) {
        toastStore.showToast('Please complete all required fields.', 'fa-triangle-exclamation');
        return;
    }

    isLoading.value = true;
    const [firstName, ...lastName] = senderName.value.trim().split(/\s+/);
    try {
        const response = await apiClient.post('/contactmessage/', {
            first_name: firstName,
            last_name: lastName.join(' ') || '-',
            email: senderEmail.value.trim(),
            subject: inquirySubject.value.trim(),
            message: inquiry.value.trim(),
            store_id: config.API.STORE_ID,
        }, { retries: 0, dedupe: false });
        if (!response.success) throw response.error;
        toastStore.showToast('Message sent successfully.', 'fa-paper-plane');
        senderName.value = '';
        senderEmail.value = '';
        inquirySubject.value = '';
        inquiry.value = '';
    } catch {
        toastStore.showToast('We could not send your message. Please try again.', 'fa-triangle-exclamation');
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>

    <main class="pt-32 pb-24 max-w-6xl mx-auto px-6">

        <div class="text-center mb-16">

            <span class="section-badge">
                Contact Us
            </span>

            <h1 class="
    font-[Playfair_Display]
    text-5xl
    font-extrabold
    mt-6">

                We'd Love To Hear From You

            </h1>

            <p class="
    mt-4
    text-[var(--text-muted)]
    max-w-2xl
    mx-auto">

                Questions about products, orders,
                warranties, partnerships, or support?
                Our team is ready to help.

            </p>

        </div>

        <div class="grid lg:grid-cols-2 gap-12">

            <!-- FORM -->

            <form @submit.prevent="transmit" class="
    bg-[var(--bg-card)]
    border
    border-[var(--border)]
    p-8
    rounded-[2.5rem]
    shadow-xl
    space-y-6">

                <div>

                    <label class="
            block
            text-xs
            font-bold
            uppercase
            tracking-widest
            mb-2">

                        Full Name

                    </label>

                    <input v-model="senderName" type="text" placeholder="John Doe" class="
            w-full
            bg-[var(--bg-muted)]
            border
            border-[var(--border)]
            rounded-2xl
            px-6
            py-4
            focus:outline-none
            focus:border-[var(--accent)]">

                    <p v-if="formErrors.senderName" class="text-red-500 text-xs mt-2">

                        {{ formErrors.senderName }}

                    </p>

                </div>

                <div>

                    <label class="
            block
            text-xs
            font-bold
            uppercase
            tracking-widest
            mb-2">

                        Email Address

                    </label>

                    <input v-model="senderEmail" type="email" placeholder="john@example.com" class="
            w-full
            bg-[var(--bg-muted)]
            border
            border-[var(--border)]
            rounded-2xl
            px-6
            py-4
            focus:outline-none
            focus:border-[var(--accent)]">

                    <p v-if="formErrors.senderEmail" class="text-red-500 text-xs mt-2">

                        {{ formErrors.senderEmail }}

                    </p>

                </div>

                <div>

                    <label class="
            block
            text-xs
            font-bold
            uppercase
            tracking-widest
            mb-2">

                        Subject

                    </label>

                    <input v-model="inquirySubject" type="text" placeholder="Order Support" class="
            w-full
            bg-[var(--bg-muted)]
            border
            border-[var(--border)]
            rounded-2xl
            px-6
            py-4
            focus:outline-none
            focus:border-[var(--accent)]">

                    <p v-if="formErrors.inquirySubject" class="text-red-500 text-xs mt-2">

                        {{ formErrors.inquirySubject }}

                    </p>

                </div>

                <div>

                    <label class="
            block
            text-xs
            font-bold
            uppercase
            tracking-widest
            mb-2">

                        Message

                    </label>

                    <textarea v-model="inquiry" rows="6" placeholder="How can we help you?" class="
            w-full
            bg-[var(--bg-muted)]
            border
            border-[var(--border)]
            rounded-2xl
            px-6
            py-4
            resize-none
            focus:outline-none
            focus:border-[var(--accent)]">
            </textarea>

                    <p v-if="formErrors.inquiry" class="text-red-500 text-xs mt-2">

                        {{ formErrors.inquiry }}

                    </p>

                </div>

                <button type="submit" :disabled="isLoading" class="
        w-full
        bg-[var(--accent)]
        hover:bg-[var(--accent-dk)]
        text-white
        py-4
        rounded-2xl
        font-semibold
        transition-all">

                    {{ isLoading ? 'Sending...' : 'Send Message' }}

                </button>

            </form>

            <!-- INFO -->

            <div class="
    flex
    flex-col
    justify-center
    gap-8">

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-3xl
        p-6">

                    <i class="fa-solid fa-envelope text-2xl text-[var(--accent)]"></i>

                    <h3 class="font-bold mt-4">
                        Email Support
                    </h3>

                    <p class="text-[var(--text-muted)] mt-2">
                        Use the secure contact form
                    </p>

                </div>

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-3xl
        p-6">

                    <i class="fa-solid fa-phone text-2xl text-[var(--accent)]"></i>

                    <h3 class="font-bold mt-4">
                        Phone Support
                    </h3>

                    <p class="text-[var(--text-muted)] mt-2">
                        Shared during order confirmation
                    </p>

                </div>

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-3xl
        p-6">

                    <i class="fa-solid fa-clock text-2xl text-[var(--accent)]"></i>

                    <h3 class="font-bold mt-4">
                        Support Hours
                    </h3>

                    <p class="text-[var(--text-muted)] mt-2">
                        Response times vary by business day
                    </p>

                </div>

            </div>

        </div>


    </main>

</template>
