<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import ProductCard from '@/components/cards/ProductCard.vue'
import { useProductsStore } from '@/stores/products'

const productsStore = useProductsStore()

const selectedCategory = ref('all')

const categories = [
    { id: 'all', label: 'All Deals', icon: '🔥' },
    { id: 'laptops', label: 'Laptops', icon: '💻' },
    { id: 'smartphones', label: 'Phones', icon: '📱' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'smart-home', label: 'Smart Home', icon: '🏠' }
]

const saleProducts = computed(() => {

    let products =
        productsStore.sampleProducts.slice(0, 8)

    if (selectedCategory.value === 'all') {
        return products
    }

    return products.filter(product =>
        product.category?.toLowerCase() ===
        selectedCategory.value
    )
})

const countdown = ref({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
})

let interval: ReturnType<typeof setInterval>
let observer: IntersectionObserver | null = null

const initObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    nextTick(() => {
        document
            .querySelectorAll<HTMLElement>('.reveal')
            .forEach(el => observer?.observe(el))
    });
};

onMounted(() => {

    let saleEnd: string

    const storedSaleEnd =
        localStorage.getItem('saleEnd')

    if (!storedSaleEnd) {

        saleEnd = String(
            Date.now() +
            72 * 60 * 60 * 1000
        )

        localStorage.setItem(
            'saleEnd',
            saleEnd
        )

    } else {

        saleEnd = storedSaleEnd

    }

    const updateCountdown = () => {

        const distance =
            Number(saleEnd) -
            Date.now()

        if (distance <= 0) {

            countdown.value = {
                days: '00',
                hours: '00',
                minutes: '00',
                seconds: '00'
            }

            return
        }

        countdown.value = {

            days: String(
                Math.floor(
                    distance /
                    (1000 * 60 * 60 * 24)
                )
            ).padStart(2, '0'),

            hours: String(
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60 * 24)
                    ) /
                    (1000 * 60 * 60)
                )
            ).padStart(2, '0'),

            minutes: String(
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                )
            ).padStart(2, '0'),

            seconds: String(
                Math.floor(
                    (
                        distance %
                        (1000 * 60)
                    ) / 1000
                )
            ).padStart(2, '0')
        }
    }

    updateCountdown()

    interval = setInterval(updateCountdown, 1000)
    initObserver();
})

onUnmounted(() => {

    clearInterval(interval)

    if (observer) observer.disconnect();
})

// Re-run observer logic when filtered products change
watch(saleProducts, async () => {

    await nextTick()

    initObserver()

})
</script>

<template>

    <main class="
pt-28
pb-24
max-w-7xl
mx-auto
px-6
lg:px-10">


        <!-- HERO -->

        <section class="
reveal
text-center
mb-20">

            <span class="section-badge">

                Limited-Time Offers

            </span>

            <h1 class="
    font-[Playfair_Display]
    text-5xl
    lg:text-6xl
    font-extrabold
    mt-6">

                Exclusive TechHub Deals

            </h1>

            <p class="
    max-w-2xl
    mx-auto
    mt-6
    text-[var(--text-muted)]">

                Save on premium laptops,
                smartphones, gaming gear,
                and smart home devices.

            </p>

            <!-- COUNTDOWN -->

            <div class="
    mt-10
    flex
    justify-center
    gap-4
    flex-wrap">

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-2xl
        px-6
        py-4">

                    <div class="text-3xl font-black">
                        {{ countdown.days }}
                    </div>

                    <div class="text-xs uppercase">
                        Days
                    </div>

                </div>

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-2xl
        px-6
        py-4">

                    <div class="text-3xl font-black">
                        {{ countdown.hours }}
                    </div>

                    <div class="text-xs uppercase">
                        Hours
                    </div>

                </div>

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-2xl
        px-6
        py-4">

                    <div class="text-3xl font-black">
                        {{ countdown.minutes }}
                    </div>

                    <div class="text-xs uppercase">
                        Minutes
                    </div>

                </div>

                <div class="
        bg-[var(--bg-card)]
        border
        border-[var(--border)]
        rounded-2xl
        px-6
        py-4">

                    <div class="text-3xl font-black">
                        {{ countdown.seconds }}
                    </div>

                    <div class="text-xs uppercase">
                        Seconds
                    </div>

                </div>

            </div>

        </section>

        <!-- DEAL STATS -->

        <section class="
reveal
grid
grid-cols-2
lg:grid-cols-4
gap-6
mb-16">

            <div class="
    bg-[var(--bg-card)]
    border
    border-[var(--border)]
    rounded-3xl
    p-6
    text-center">

                <h3 class="text-3xl font-black">
                    125+
                </h3>

                <p class="text-sm text-[var(--text-muted)]">
                    Products On Sale
                </p>

            </div>

            <div class="
    bg-[var(--bg-card)]
    border
    border-[var(--border)]
    rounded-3xl
    p-6
    text-center">

                <h3 class="text-3xl font-black">
                    40%
                </h3>

                <p class="text-sm text-[var(--text-muted)]">
                    Maximum Savings
                </p>

            </div>

            <div class="
    bg-[var(--bg-card)]
    border
    border-[var(--border)]
    rounded-3xl
    p-6
    text-center">

                <h3 class="text-3xl font-black">
                    72h
                </h3>

                <p class="text-sm text-[var(--text-muted)]">
                    Flash Event
                </p>

            </div>

            <div class="
    bg-[var(--bg-card)]
    border
    border-[var(--border)]
    rounded-3xl
    p-6
    text-center">

                <h3 class="text-3xl font-black">
                    Free
                </h3>

                <p class="text-sm text-[var(--text-muted)]">
                    Shipping
                </p>

            </div>

        </section>

        <!-- FILTERS -->

        <section class="
reveal
flex
flex-wrap
justify-center
gap-3
mb-14">

            <button v-for="category in categories" :key="category.id" @click="selectedCategory = category.id" class="
    px-5
    py-3
    rounded-full
    border
    transition-all" :class="selectedCategory === category.id
        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
        : 'bg-[var(--bg-card)] border-[var(--border)]'">

                {{ category.icon }}
                {{ category.label }}

            </button>

        </section>

        <!-- PRODUCTS -->

        <section class="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
gap-8">

            <div v-for="product in saleProducts" :key="product.id" class="
    reveal
    relative">

                <div class="
        absolute
        top-4
        right-4
        z-20
        bg-red-500
        text-white
        text-[10px]
        font-black
        px-4
        py-2
        rounded-full">

                    SAVE 20%

                </div>

                <ProductCard :product="product" />

            </div>

        </section>

    </main>

</template>
