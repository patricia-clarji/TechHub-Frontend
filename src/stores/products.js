import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProductsStore = defineStore('products', () => {
    const sampleProducts = ref([
        {
            id: 'nova-x-5g',
            name: 'Nova X 5G',
            category: 'Smartphones',
            brand: 'Nova',
            price: 899,
            rating: 4.8,
            inStock: true,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 5, comment: 'Exceptional performance and sleek design. Highly recommend!', date: '2024-05-10' },
                { userId: 'user2', userName: 'Bob Johnson', rating: 4, comment: 'Great phone, but the battery life could be better.', date: '2024-05-12' },
            ],
            createdAt: '2023-10-01',
            img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
            desc: 'Ultra-slim 6.7" OLED, AI camera suite, and premium wireless charging.',
            features: ['120Hz OLED display', 'Triple-lens night camera', '65W fast charging', '5G connectivity'],
        },
        {
            id: 'aeroblade-14',
            name: 'AeroBlade 14',
            category: 'Laptops',
            brand: 'Aero',
            price: 1499,
            rating: 4.9,
            inStock: true,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 5, comment: 'Blazing fast and incredibly light. Perfect for my work.', date: '2024-04-28' },
                { userId: 'user3', userName: 'Charlie Brown', rating: 4, comment: 'Solid laptop, but runs a bit hot under heavy load.', date: '2024-05-01' },
            ],
            createdAt: '2023-11-15',
            img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
            desc: 'Featherweight performance laptop with a premium aluminum chassis.',
            features: ['Intel i9 processor', '16GB RAM', '1TB SSD storage', 'Thunderbolt 4 support'],
        },
        {
            id: 'pulse-one',
            name: 'Pulse One Headphones',
            category: 'Audio',
            brand: 'Pulse',
            price: 249,
            rating: 4.7,
            inStock: true,
            reviews: [
                { userId: 'user2', userName: 'Bob Johnson', rating: 5, comment: 'Amazing sound quality and comfortable for long sessions.', date: '2024-05-05' },
                { userId: 'user4', userName: 'Diana Prince', rating: 4, comment: 'Good noise cancellation, but a bit pricey.', date: '2024-05-08' },
            ],
            createdAt: '2023-09-20',
            img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
            desc: 'Noise-cancelling wireless headphones with studio-grade sound.',
            features: ['Active noise cancellation', '40-hour battery life', 'Hi-Res audio', 'Touch controls'],
        },
        {
            id: 'arc-gaming-pad',
            name: 'Arc Gaming Controller',
            category: 'Gaming',
            brand: 'Arc',
            price: 129,
            rating: 4.5,
            inStock: false,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 4, comment: 'Responsive and comfortable, but the battery drains quickly.', date: '2024-03-15' },
            ],
            createdAt: '2023-12-01',
            img: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=80',
            desc: 'Ergonomic wireless controller built for precision and comfort.',
            features: ['Low-latency Bluetooth', 'Custom macro buttons', 'RGB lighting', 'Haptic feedback'],
        },
        {
            id: 'home-sync-hub',
            name: 'Home Sync Hub',
            category: 'Smart Home',
            brand: 'HomeSync',
            price: 179,
            rating: 4.3,
            inStock: true,
            reviews: [
                { userId: 'user3', userName: 'Charlie Brown', rating: 5, comment: 'Easy to set up and integrates well with other devices.', date: '2024-04-01' },
            ],
            createdAt: '2023-08-10',
            img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=900&q=80',
            desc: 'All-in-one smart home controller with voice assistant compatibility.',
            features: ['Voice control', 'Multi-device automation', 'Secure encryption', 'App monitoring'],
        },
        {
            id: 'galaxy-band',
            name: 'Galaxy Band S',
            category: 'Wearables',
            brand: 'Galaxy',
            price: 159,
            rating: 4.2,
            inStock: true,
            reviews: [
                { userId: 'user4', userName: 'Diana Prince', rating: 4, comment: 'Accurate tracking and stylish design. Good value.', date: '2024-03-20' },
            ],
            createdAt: '2023-07-25',
            img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80',
            desc: 'Sleek fitness tracker with sleep analysis and health monitoring.',
            features: ['24/7 heart rate monitoring', 'Sleep tracking', 'Water resistant', 'Smart notifications'],
        },
        {
            id: 'pixel-lite',
            name: 'Pixel Lite',
            category: 'Smartphones',
            brand: 'Pixel',
            price: 699,
            rating: 4.6,
            inStock: true,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 5, comment: 'Compact and powerful. The camera is fantastic!', date: '2024-02-18' },
            ],
            createdAt: '2024-01-05',
            img: 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&w=900&q=80',
            desc: 'Compact flagship with crisp display and powerful selfie camera.',
            features: ['6.1" OLED display', 'Dual camera', 'Wireless charging', 'Premium glass finish'],
        },
        {
            id: 'studio-book',
            name: 'StudioBook Pro',
            category: 'Laptops',
            brand: 'Studio',
            price: 1999,
            rating: 5.0,
            inStock: true,
            reviews: [
                { userId: 'user2', userName: 'Bob Johnson', rating: 5, comment: 'The best laptop for creative work. Flawless.', date: '2024-03-05' },
            ],
            createdAt: '2024-02-10',
            img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
            desc: 'High-performance creator laptop for editing, design, and animation.',
            features: ['2TB SSD option', 'NVIDIA RTX GPU', '4K display', 'Advanced cooling'],
        },
        {
            id: 'orbit-speaker',
            name: 'Orbit Smart Speaker',
            category: 'Smart Home',
            brand: 'Orbit',
            price: 129,
            rating: 4.4,
            inStock: true,
            reviews: [
                { userId: 'user3', userName: 'Charlie Brown', rating: 4, comment: 'Good sound for its size, but the AI assistant is a bit slow.', date: '2024-01-25' },
            ],
            createdAt: '2023-11-20',
            img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=900&q=80',
            desc: 'Premium compact speaker with immersive sound and voice controls.',
            features: ['Premium bass', 'Multi-room support', 'AI assistant', 'Touch controls'],
        },
        {
            id: 'nova-watch',
            name: 'Nova Watch',
            category: 'Wearables',
            brand: 'Nova',
            price: 229,
            rating: 4.7,
            inStock: true,
            reviews: [
                { userId: 'user4', userName: 'Diana Prince', rating: 5, comment: 'Stylish and functional. Love the health features.', date: '2024-02-01' },
            ],
            createdAt: '2023-12-15',
            img: 'https://images.unsplash.com/photo-1544117518-3befbc3b8a35?auto=format&fit=crop&w=900&q=80',
            desc: 'Luxury smartwatch with customizable watch faces and health insights.',
            features: ['GPS tracking', 'ECG monitoring', 'Long battery life', 'Premium strap options'],
        },
        {
            id: 'stealth-pro',
            name: 'Stealth Pro Laptop',
            category: 'Laptops',
            brand: 'Stealth',
            price: 1799,
            rating: 4.8,
            inStock: false,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 5, comment: 'Beast of a machine for gaming. Worth every penny!', date: '2024-04-10' },
            ],
            createdAt: '2024-03-01',
            img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
            desc: 'Gaming laptop with fast refresh and high-end graphics for immersive play.',
            features: ['RTX 4080', '240Hz display', 'RGB keyboard', 'Fast charging'],
        },
        {
            id: 'soundcore-max',
            name: 'Soundcore Max',
            category: 'Audio',
            brand: 'Soundcore',
            price: 129,
            rating: 4.1,
            inStock: true,
            reviews: [
                { userId: 'user2', userName: 'Bob Johnson', rating: 4, comment: 'Decent portable speaker, good for outdoor use.', date: '2024-01-10' },
            ],
            createdAt: '2023-10-15',
            img: 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?auto=format&fit=crop&w=900&q=80',
            desc: 'Portable wireless speaker with deep bass and glowing accents.',
            features: ['24-hour battery', 'Party lighting', 'Stereo pairing', 'IPX6 water resistance'],
        },
        {
            id: 'nova-vr',
            name: 'Nova VR',
            category: 'Gaming',
            brand: 'Nova',
            price: 399,
            rating: 4.9,
            inStock: true,
            reviews: [
                { userId: 'user3', userName: 'Charlie Brown', rating: 5, comment: 'Mind-blowing VR experience. The visuals are stunning.', date: '2024-03-25' },
            ],
            createdAt: '2024-01-20',
            img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=80',
            desc: 'Immersive VR headset with crisp visuals and responsive motion tracking.',
            features: ['120Hz panel', 'Spatial audio', 'Comfort fit', 'Inside-out tracking'],
        },
        {
            id: 'smart-sensor-kit',
            name: 'Smart Sensor Kit',
            category: 'Smart Home',
            brand: 'SmartKit',
            price: 99,
            rating: 4.0,
            inStock: true,
            reviews: [
                { userId: 'user4', userName: 'Diana Prince', rating: 4, comment: 'Easy to install and provides good security alerts.', date: '2024-04-15' },
            ],
            createdAt: '2023-06-15',
            img: 'https://images.unsplash.com/photo-1557002665-c552e1832483?auto=format&fit=crop&w=900&q=80',
            desc: 'Fast-install smart sensors for doors, windows, and motion detection.',
            features: ['Quick setup', 'Battery powered', 'App alerts', 'Home automation'],
        },
    ]);

    const categories = computed(() => {
        return ['All', ...new Set(sampleProducts.value.map(p => p.category))];
    });
    
    // Add averageRating to each product
    const productsWithAvgRating = computed(() => {
        return sampleProducts.value.map(product => {
            const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = product.reviews.length > 0 ? (totalRating / product.reviews.length) : 0;
            return { ...product, averageRating: parseFloat(averageRating.toFixed(1)) };
        });
    });
    const brands = computed(() => {
        return [...new Set(sampleProducts.value.map(p => p.brand))].sort();
    });

    const filters = ref({
        category: 'All',
        minPrice: 0,
        maxPrice: 2500,
        brands: [],
        onlyInStock: false
    });

    const sortBy = ref('featured'); // options: featured, price-low, price-high, rating, newest

    const searchQueries = ref('');

    const filteredProducts = computed(() => {
        let products = [...productsWithAvgRating.value]; // Use products with average rating

        // Filter by Category
        if (filters.value.category !== 'All') {
            products = products.filter(p => p.category === filters.value.category);
        }

        // Filter by Search Query
        if (searchQueries.value) {
            const query = searchQueries.value.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
        }

        // Filter by Price
        products = products.filter(p => p.price >= filters.value.minPrice && p.price <= filters.value.maxPrice);

        // Filter by Brand
        if (filters.value.brands.length > 0) {
            products = products.filter(p => filters.value.brands.includes(p.brand));
        }

        // Filter by Availability
        if (filters.value.onlyInStock) {
            products = products.filter(p => p.inStock);
        }

        // Sorting
        switch (sortBy.value) {
            case 'price-low': products.sort((a, b) => a.price - b.price); break;
            case 'price-high': products.sort((a, b) => b.price - a.price); break;
            case 'rating': products.sort((a, b) => b.rating - a.rating); break;
            case 'newest': products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            default: break; // Featured/Default
        }

        return products;
    });

    const resetFilters = () => {
        filters.value = { category: 'All', minPrice: 0, maxPrice: 2500, brands: [], onlyInStock: false };
        sortBy.value = 'featured';
    };

    const submitReview = (productId, userId, userName, rating, comment) => {
        const product = sampleProducts.value.find(p => p.id === productId);
        if (product) {
            product.reviews.push({
                userId,
                userName,
                rating,
                comment,
                date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
            });
        }
    };

    return { sampleProducts: productsWithAvgRating, categories, brands, filters, sortBy, searchQueries, filteredProducts, resetFilters, submitReview };
});