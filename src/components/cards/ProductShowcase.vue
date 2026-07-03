<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useCartStore } from '@/stores/shop/cart';

const props = defineProps({
    product: { type: Object, required: true },
    videoUrl: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    autoplay: { type: Boolean, default: true },
    loop: { type: Boolean, default: true },
    features: {
        type: Array,
        default: () => [
            { icon: 'fa-bolt', text: 'Peak Performance' },
            { icon: 'fa-battery-full', text: 'All-Day Endurance' },
            { icon: 'fa-shield-halved', text: 'Enterprise Security' }
        ]
    },
    animateOnce: { type: Boolean, default: true }
});

const emit = defineEmits(['add-to-cart', 'buy-now', 'view-details']);

const cartStore = useCartStore();
const showcaseSection = ref(null);
const videoRef = ref(null);
const isVisible = ref(false);
const hasBeenVisible = ref(false);

let observer = null;

const handleAddToCart = () => {
    cartStore.addToCart(props.product.id);
    emit('add-to-cart', props.product);
};

onMounted(() => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isVisible.value = true;
                hasBeenVisible.value = true;
                if (props.autoplay && videoRef.value) {
                    videoRef.value.play();
                }
            } else {
                isVisible.value = false;
                if (videoRef.value) {
                    videoRef.value.pause();
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    if (showcaseSection.value) {
        observer.observe(showcaseSection.value);
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});

// Watch visibility to handle video if props change
watch(isVisible, (visible) => {
    if (visible && props.autoplay && videoRef.value) {
        videoRef.value.play();
    } else if (!visible && videoRef.value) {
        videoRef.value.pause();
    }
});

const getAnimationClass = (baseClass) => {
    const active = props.animateOnce ? hasBeenVisible.value : isVisible.value;
    return `${baseClass} transition-all duration-1000 cubic-bezier ${active ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`;
};
</script>

<template>
    <section ref="showcaseSection"
        class="relative min-h-[80vh] flex items-center max-w-7xl mx-auto px-6 lg:px-10 py-24 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

            <!-- Left: Visual Content (Media) -->
            <div :class="getAnimationClass('relative hero-img-wrap')">
                <div
                    class="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl bg-[var(--bg-muted)] aspect-square lg:aspect-video flex items-center justify-center">
                    <video v-if="videoUrl" ref="videoRef" :src="videoUrl" class="w-full h-full object-cover" muted
                        playsinline :loop="loop"></video>
                    <img v-else :src="imageUrl" :alt="product.name"
                        class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />

                    <!-- Glassmorphism Overlay for Price -->
                    <div
                        class="absolute bottom-6 right-6 backdrop-blur-md bg-white/10 border border-white/20 px-6 py-3 rounded-2xl shadow-xl">
                        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">MSRP Deployment</p>
                        <p class="text-2xl font-black text-white">$ {{ product.price }}</p>
                    </div>
                </div>
                <!-- Background Glow decorative element -->
                <div
                    class="absolute -inset-4 bg-gradient-to-tr from-[var(--accent)] to-transparent opacity-10 blur-3xl -z-0">
                </div>
            </div>

            <!-- Right: Product Information -->
            <div class="space-y-10">
                <div :class="getAnimationClass('space-y-4 delay-100')">
                    <span class="section-badge inline-flex">
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-pulse mr-3"></span>
                        Architectural Feature
                    </span>
                    <h2 class="font-[Playfair_Display] text-4xl lg:text-6xl font-bold leading-tight">
                        {{ product.name }}
                    </h2>
                    <p class="text-[var(--text-muted)] text-lg leading-relaxed max-w-lg">
                        {{ product.desc }}
                    </p>
                    <!-- Average Rating Display -->
                    <div v-if="product.averageRating > 0" class="flex items-center gap-1">
                        <i v-for="n in 5" :key="n"
                            :class="n <= product.averageRating ? 'fa-solid text-[var(--accent)]' : 'fa-regular text-[var(--text-muted)]'"
                            class="fa-star text-lg"></i>
                        <span class="text-sm text-[var(--text-muted)] ml-2">({{ product.reviews.length }}
                            reviews)</span>
                    </div>
                </div>

                <!-- Feature Highlights -->
                <div class="space-y-4">
                    <div v-for="(feature, idx) in features" :key="idx" :class="getAnimationClass('')"
                        :style="{ transitionDelay: `${(idx + 3) * 150}ms` }"
                        class="flex items-center gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-colors group cursor-default">
                        <div
                            class="w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                            <i :class="['fa-solid', feature.icon]"></i>
                        </div>
                        <span class="font-bold text-sm uppercase tracking-widest text-[var(--text)]">{{ feature.text
                            }}</span>
                    </div>
                </div>

                <!-- CTA Area -->
                <div :class="getAnimationClass('flex flex-wrap gap-4 pt-6 delay-700')">
                    <button @click="handleAddToCart"
                        class="group inline-flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-lg">
                        <span>Integrate System</span>
                        <i class="fa-solid fa-cart-plus transition-transform group-hover:translate-x-1"></i>
                    </button>

                    <router-link :to="`/products/${product.id}`"
                        class="flex items-center gap-3 border border-[var(--accent)] text-[var(--accent)] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                        <span>Technical Specs</span>
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.cubic-bezier {
    transition-timing-function: cubic-bezier(.16, 1, .3, 1);
}

/* Smooth sequential reveal logic */
.delay-100 {
    transition-delay: 100ms;
}

.delay-700 {
    transition-delay: 700ms;
}

.hero-img-wrap {
    animation: heroContinuousWobble 8s ease-in-out infinite alternate;
}
</style>