import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProductsStore = defineStore('products', () => {
    const sampleProducts = ref([
        {
            id: 'nova-x-5g',
            name: 'Nova X 5G',
            category: 'Smartphones',
            price: 899,
            img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
            desc: 'Ultra-slim 6.7" OLED, AI camera suite, and premium wireless charging.',
            features: ['120Hz OLED display', 'Triple-lens night camera', '65W fast charging', '5G connectivity'],
        },
        {
            id: 'aeroblade-14',
            name: 'AeroBlade 14',
            category: 'Laptops',
            price: 1499,
            img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
            desc: 'Featherweight performance laptop with a premium aluminum chassis.',
            features: ['Intel i9 processor', '16GB RAM', '1TB SSD storage', 'Thunderbolt 4 support'],
        },
        {
            id: 'pulse-one',
            name: 'Pulse One Headphones',
            category: 'Audio',
            price: 249,
            img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
            desc: 'Noise-cancelling wireless headphones with studio-grade sound.',
            features: ['Active noise cancellation', '40-hour battery life', 'Hi-Res audio', 'Touch controls'],
        },
        {
            id: 'arc-gaming-pad',
            name: 'Arc Gaming Controller',
            category: 'Gaming',
            price: 129,
            img: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=900&q=80',
            desc: 'Ergonomic wireless controller built for precision and comfort.',
            features: ['Low-latency Bluetooth', 'Custom macro buttons', 'RGB lighting', 'Haptic feedback'],
        },
        {
            id: 'home-sync-hub',
            name: 'Home Sync Hub',
            category: 'Smart Home',
            price: 179,
            img: 'https://images.unsplash.com/photo-1512499617640-c2f99912f96b?auto=format&fit=crop&w=900&q=80',
            desc: 'All-in-one smart home controller with voice assistant compatibility.',
            features: ['Voice control', 'Multi-device automation', 'Secure encryption', 'App monitoring'],
        },
        {
            id: 'galaxy-band',
            name: 'Galaxy Band S',
            category: 'Wearables',
            price: 159,
            img: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=900&q=80',
            desc: 'Sleek fitness tracker with sleep analysis and health monitoring.',
            features: ['24/7 heart rate monitoring', 'Sleep tracking', 'Water resistant', 'Smart notifications'],
        },
        {
            id: 'pixel-lite',
            name: 'Pixel Lite',
            category: 'Smartphones',
            price: 699,
            img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
            desc: 'Compact flagship with crisp display and powerful selfie camera.',
            features: ['6.1" OLED display', 'Dual camera', 'Wireless charging', 'Premium glass finish'],
        },
        {
            id: 'studio-book',
            name: 'StudioBook Pro',
            category: 'Laptops',
            price: 1999,
            img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
            desc: 'High-performance creator laptop for editing, design, and animation.',
            features: ['2TB SSD option', 'NVIDIA RTX GPU', '4K display', 'Advanced cooling'],
        },
        {
            id: 'orbit-speaker',
            name: 'Orbit Smart Speaker',
            category: 'Smart Home',
            price: 129,
            img: 'https://images.unsplash.com/photo-1580894742352-0a5e6c30b5b0?auto=format&fit=crop&w=900&q=80',
            desc: 'Premium compact speaker with immersive sound and voice controls.',
            features: ['Premium bass', 'Multi-room support', 'AI assistant', 'Touch controls'],
        },
        {
            id: 'nova-watch',
            name: 'Nova Watch',
            category: 'Wearables',
            price: 229,
            img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80',
            desc: 'Luxury smartwatch with customizable watch faces and health insights.',
            features: ['GPS tracking', 'ECG monitoring', 'Long battery life', 'Premium strap options'],
        },
        {
            id: 'stealth-pro',
            name: 'Stealth Pro Laptop',
            category: 'Laptops',
            price: 1799,
            img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
            desc: 'Gaming laptop with fast refresh and high-end graphics for immersive play.',
            features: ['RTX 4080', '240Hz display', 'RGB keyboard', 'Fast charging'],
        },
        {
            id: 'soundcore-max',
            name: 'Soundcore Max',
            category: 'Audio',
            price: 129,
            img: 'https://images.unsplash.com/photo-1519305700350-2a7a439b2608?auto=format&fit=crop&w=900&q=80',
            desc: 'Portable wireless speaker with deep bass and glowing accents.',
            features: ['24-hour battery', 'Party lighting', 'Stereo pairing', 'IPX6 water resistance'],
        },
        {
            id: 'nova-vr',
            name: 'Nova VR',
            category: 'Gaming',
            price: 399,
            img: 'https://images.unsplash.com/photo-1573495628364-5d2f84e7d75f?auto=format&fit=crop&w=900&q=80',
            desc: 'Immersive VR headset with crisp visuals and responsive motion tracking.',
            features: ['120Hz panel', 'Spatial audio', 'Comfort fit', 'Inside-out tracking'],
        },
        {
            id: 'smart-sensor-kit',
            name: 'Smart Sensor Kit',
            category: 'Smart Home',
            price: 99,
            img: 'https://images.unsplash.com/photo-1581091012184-90eef2b1c8e6?auto=format&fit=crop&w=900&q=80',
            desc: 'Fast-install smart sensors for doors, windows, and motion detection.',
            features: ['Quick setup', 'Battery powered', 'App alerts', 'Home automation'],
        },
    ]);

    const categories = computed(() => {
        return ['All', ...new Set(sampleProducts.value.map(p => p.category))];
    });

    const searchQueries = ref('');
    const quickViewProductId = ref(null);
    const searchModalOpen = ref(false);

    return { sampleProducts, categories, searchQueries, quickViewProductId, searchModalOpen };
});