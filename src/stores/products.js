import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProductsStore = defineStore('products', () => {
    const sampleProducts = ref([
        {
            id: 'nova-x-5g',
            name: 'Nova X 5G',
            category: 'Smartphones',
            price: 899,
            img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
            desc: 'Ultra-slim 6.7" OLED, AI camera suite, and premium wireless charging.',
            features: ['120Hz OLED display', 'Triple-lens night camera', '65W fast charging', '5G connectivity'],
        },
        {
            id: 'aeroblade-14',
            name: 'AeroBlade 14',
            category: 'Laptops',
            price: 1499,
            img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
            desc: 'Featherweight performance laptop with a premium aluminum chassis.',
            features: ['Intel i9 processor', '16GB RAM', '1TB SSD storage', 'Thunderbolt 4 support'],
        },
        {
            id: 'pulse-one',
            name: 'Pulse One Headphones',
            category: 'Audio',
            price: 249,
            img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
            desc: 'Noise-cancelling wireless headphones with studio-grade sound.',
            features: ['Active noise cancellation', '40-hour battery life', 'Hi-Res audio', 'Touch controls'],
        },
        {
            id: 'arc-gaming-pad',
            name: 'Arc Gaming Controller',
            category: 'Gaming',
            price: 129,
            img: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=80',
            desc: 'Ergonomic wireless controller built for precision and comfort.',
            features: ['Low-latency Bluetooth', 'Custom macro buttons', 'RGB lighting', 'Haptic feedback'],
        },
        {
            id: 'home-sync-hub',
            name: 'Home Sync Hub',
            category: 'Smart Home',
            price: 179,
            img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=900&q=80',
            desc: 'All-in-one smart home controller with voice assistant compatibility.',
            features: ['Voice control', 'Multi-device automation', 'Secure encryption', 'App monitoring'],
        },
        {
            id: 'galaxy-band',
            name: 'Galaxy Band S',
            category: 'Wearables',
            price: 159,
            img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80',
            desc: 'Sleek fitness tracker with sleep analysis and health monitoring.',
            features: ['24/7 heart rate monitoring', 'Sleep tracking', 'Water resistant', 'Smart notifications'],
        },
        {
            id: 'pixel-lite',
            name: 'Pixel Lite',
            category: 'Smartphones',
            price: 699,
            img: 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&w=900&q=80',
            desc: 'Compact flagship with crisp display and powerful selfie camera.',
            features: ['6.1" OLED display', 'Dual camera', 'Wireless charging', 'Premium glass finish'],
        },
        {
            id: 'studio-book',
            name: 'StudioBook Pro',
            category: 'Laptops',
            price: 1999,
            img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
            desc: 'High-performance creator laptop for editing, design, and animation.',
            features: ['2TB SSD option', 'NVIDIA RTX GPU', '4K display', 'Advanced cooling'],
        },
        {
            id: 'orbit-speaker',
            name: 'Orbit Smart Speaker',
            category: 'Smart Home',
            price: 129,
            img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=900&q=80',
            desc: 'Premium compact speaker with immersive sound and voice controls.',
            features: ['Premium bass', 'Multi-room support', 'AI assistant', 'Touch controls'],
        },
        {
            id: 'nova-watch',
            name: 'Nova Watch',
            category: 'Wearables',
            price: 229,
            img: 'https://images.unsplash.com/photo-1544117518-3befbc3b8a35?auto=format&fit=crop&w=900&q=80',
            desc: 'Luxury smartwatch with customizable watch faces and health insights.',
            features: ['GPS tracking', 'ECG monitoring', 'Long battery life', 'Premium strap options'],
        },
        {
            id: 'stealth-pro',
            name: 'Stealth Pro Laptop',
            category: 'Laptops',
            price: 1799,
            img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
            desc: 'Gaming laptop with fast refresh and high-end graphics for immersive play.',
            features: ['RTX 4080', '240Hz display', 'RGB keyboard', 'Fast charging'],
        },
        {
            id: 'soundcore-max',
            name: 'Soundcore Max',
            category: 'Audio',
            price: 129,
            img: 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?auto=format&fit=crop&w=900&q=80',
            desc: 'Portable wireless speaker with deep bass and glowing accents.',
            features: ['24-hour battery', 'Party lighting', 'Stereo pairing', 'IPX6 water resistance'],
        },
        {
            id: 'nova-vr',
            name: 'Nova VR',
            category: 'Gaming',
            price: 399,
            img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=80',
            desc: 'Immersive VR headset with crisp visuals and responsive motion tracking.',
            features: ['120Hz panel', 'Spatial audio', 'Comfort fit', 'Inside-out tracking'],
        },
        {
            id: 'smart-sensor-kit',
            name: 'Smart Sensor Kit',
            category: 'Smart Home',
            price: 99,
            img: 'https://images.unsplash.com/photo-1557002665-c552e1832483?auto=format&fit=crop&w=900&q=80',
            desc: 'Fast-install smart sensors for doors, windows, and motion detection.',
            features: ['Quick setup', 'Battery powered', 'App alerts', 'Home automation'],
        },
    ]);

    const categories = computed(() => {
        return ['All', ...new Set(sampleProducts.value.map(p => p.category))];
    });

    const searchQueries = ref('');
    return { sampleProducts, categories, searchQueries };
});