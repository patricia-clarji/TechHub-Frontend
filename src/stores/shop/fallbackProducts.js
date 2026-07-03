export const fallbackProducts = [
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
            img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200',
            images: [
                'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200',
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
                'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200',
                'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200',
                'https://images.unsplash.com/photo-1510557880182-3f8a1c1fdbec?w=1200'
            ],
            // Secondary image for Nova X 5G: https://images.unsplash.com/photo-1591339035010-3ee74837d483?auto=format&fit=crop&w=1200&q=80
            colors: [
                { name: 'Midnight Black', hex: '#1d1d1f', imgIndex: 0 },
                { name: 'Starlight', hex: '#f5f5f7', imgIndex: 1 },
                { name: 'Sierra Blue', hex: '#324c5f', imgIndex: 2 }
            ],
            variants: [
                { id: 'v1', name: '128GB', stock: 15, priceMod: 0 },
                { id: 'v2', name: '256GB', stock: 3, priceMod: 100 },
                { id: 'v3', name: '512GB', stock: 0, priceMod: 250 }
            ],
            specifications: {
                "Display": "6.7-inch Super Actua OLED",
                "Processor": "Tensor G3 Architectural Chip",
                "Camera": "50MP Main + 48MP Ultra-wide",
                "Battery": "5050 mAh with 65W Fast Charge"
            },
            stock: 18,
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
            img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
            images: [
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
                'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200',
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
                'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200',
                'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200'
            ],
            // Secondary image for AeroBlade 14: https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80
            colors: [
                { name: 'Space Gray', hex: '#1d1d1f', imgIndex: 0 },
                { name: 'Silver', hex: '#f5f5f7', imgIndex: 1 }
            ],
            specifications: {
                "Processor": "Intel Core i9-13900H",
                "Memory": "16GB LPDDR5X 6400MHz",
                "Storage": "1TB NVMe PCIe 4.0 SSD",
                "Display": "14.5\" QHD+ 165Hz OLED"
            },
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
            img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
            images: [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200',
                'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200',
                'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=1200',
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200'
            ],
            colors: [
                { name: 'Obsidian', hex: '#000000', imgIndex: 0 },
                { name: 'Titanium', hex: '#c0c0c0', imgIndex: 1 }
            ],
            specifications: {
                "Drivers": "40mm Bio-Cellulose Drivers",
                "Connectivity": "Bluetooth 5.3 + 3.5mm Jack",
                "Battery": "45 Hours (ANC On)",
                "Codecs": "LDAC, aptX HD, AAC"
            },
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
            img: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1200',
            images: [
                'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=1200',
                'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200',
                'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=1200',
                'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=1200',
                'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200'
            ],
            colors: [
                { name: 'Phantom Black', hex: '#1a1a1a', imgIndex: 0 },
                { name: 'Frost White', hex: '#ffffff', imgIndex: 1 }
            ],
            specifications: {
                "Response Time": "1ms Low Latency",
                "Compatibility": "PC, Console, Mobile",
                "Battery": "30 Hours Rechargeable",
                "Sensors": "6-Axis Motion Sensing"
            },
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
            img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
            desc: 'All-in-one smart home controller with voice assistant compatibility.',
            images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Networking": "Wi-Fi 6 + Zigbee 3.0",
                "Speaker": "2.5\" Full-Range Driver",
                "Microphones": "3-Mic Array for Voice",
                "Security": "Physical Mute Switch"
            },
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
            img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=1200',
            desc: 'Sleek fitness tracker with sleep analysis and health monitoring.',
            images: [
                'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=1200',
                'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200',
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200',
                'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1200',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'
            ],
            specifications: {
                "Display": "1.47\" AMOLED Always-on",
                "Waterproof": "5ATM (Up to 50m)",
                "Heart Rate": "PPG Sensor Technology",
                "Standby": "14 Days Typical Use"
            },
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
            img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
            desc: 'Compact flagship with crisp display and powerful selfie camera.',
            images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "CPU": "Architectural Octa-Core",
                "Screen": "6.1\" Liquid Retina",
                "Camera": "12MP Wide + 12MP Ultra",
                "Security": "Face Recognition 2.0"
            },
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
            img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
            desc: 'High-performance creator laptop for editing, design, and animation.',
            images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Display": "16\" XDR Pro 500 nits",
                "GPU": "RTX 4070 Laptop Edition",
                "RAM": "32GB Unified Memory",
                "Ports": "SDXC, HDMI 2.1, Magsafe"
            },
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
            img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=1200&q=80',
            desc: 'Premium compact speaker with immersive sound and voice controls.',
            images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?auto=format&fit=crop&w=1200&q=80'],
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
            img: 'https://images.unsplash.com/photo-1544117518-3befbc3b8a35?auto=format&fit=crop&w=1200&q=80',
            images: ['https://images.unsplash.com/photo-1544117518-3befbc3b8a35?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1508685096489-7aac29623b66?auto=format&fit=crop&w=1200&q=80'],
            // Secondary image for Nova Watch: https://images.unsplash.com/photo-1508685096489-7aac29623b66?auto=format&fit=crop&w=1200&q=80
            colors: ['#1d1d1f', '#f5f5f7'],
            sizes: ['40mm', '44mm'],
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
            img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80',
            desc: 'Gaming laptop with fast refresh and high-end graphics for immersive play.',
            images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80'],
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
            img: 'https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=1200&q=80',
            images: ['https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?auto=format&fit=crop&w=1200&q=80'],
            colors: [
                { name: 'Glow Black', hex: '#1a1a1a', imgIndex: 0 },
                { name: 'Aurora Red', hex: '#8b0000', imgIndex: 1 }
            ],
            specifications: {
                "Output": "80W Stereo Sound",
                "Protection": "IPX7 Full Waterproof",
                "Bluetooth": "V5.3 High Stability",
                "Weight": "1.2kg Portable Build"
            },
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
            img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1200&q=80',
            desc: 'Immersive VR headset with crisp visuals and responsive motion tracking.',
            images: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Optics": "Pancake Lens Technology",
                "Refresh Rate": "120Hz Low Persistence",
                "Tracking": "Inside-out 6DOF",
                "Controller": "Haptic Pro Included"
            },
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
            img: 'https://images.unsplash.com/photo-1557002665-c552e1832483?auto=format&fit=crop&w=1200&q=80',
            desc: 'Fast-install smart sensors for doors, windows, and motion detection.',
            images: ['https://images.unsplash.com/photo-1557002665-c552e1832483?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Sensors": "3x Motion, 2x Window",
                "Battery": "2-Year CR2032 Type",
                "Mounting": "Tool-free Adhesive",
                "Protocol": "Low Energy Zigbee"
            },
            features: ['Quick setup', 'Battery powered', 'App alerts', 'Home automation'],
        },
        {
            id: 'zen-tab-pro',
            name: 'ZenTab Pro 12',
            category: 'Tablets',
            brand: 'Zenith',
            price: 649,
            rating: 4.6,
            inStock: true,
            reviews: [
                { userId: 'user1', userName: 'Alice Smith', rating: 5, comment: 'Perfect for digital illustration. The stylus response is top-tier.', date: '2024-05-20' }
            ],
            createdAt: '2024-02-15',
            img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
            images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1561154464-82e9aff32764?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Display": "12.4\" ProMotion Liquid Retina",
                "Storage": "256GB / 512GB Options",
                "Stylus": "ZenPen Active Gen 2 Support",
                "Battery": "10,000 mAh High Capacity"
            },
            features: ['4K Video Support', 'Magnetic Stylus Charging', 'Quad-Speaker Array', 'Face Unlock'],
        },
        {
            id: 'vision-monitor-4k',
            name: 'Vision 32" 4K Monitor',
            category: 'Peripherals',
            brand: 'Vision',
            price: 549,
            rating: 4.8,
            inStock: true,
            reviews: [
                { userId: 'user2', userName: 'Bob Johnson', rating: 5, comment: 'Color accuracy is insane. A must-have for video editors.', date: '2024-04-12' }
            ],
            createdAt: '2024-03-10',
            img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200',
            images: [
                'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200',
                'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=1200',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
                'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'
            ],
            specifications: {
                "Resolution": "3840 x 2160 UHD",
                "Panel": "IPS Black Technology",
                "Refresh Rate": "60Hz (Pro Productivity)",
                "Ports": "USB-C Power Delivery 90W"
            },
            features: ['99% DCI-P3 Color Space', 'Ultra-Thin Bezel', 'Height Adjustable Stand', 'HDR600 Certified'],
        },
        {
            id: 'titan-desktop',
            name: 'Titan Gaming Station',
            category: 'Desktops',
            brand: 'Titan',
            price: 2499,
            rating: 4.9,
            inStock: true,
            reviews: [
                { userId: 'user3', userName: 'Charlie Brown', rating: 5, comment: 'Total beast. Handles everything I throw at it.', date: '2024-05-05' }
            ],
            createdAt: '2024-04-01',
            img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1200&q=80',
            images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "CPU": "AMD Ryzen 9 7950X",
                "GPU": "RTX 4090 24GB VRAM",
                "RAM": "64GB DDR5 6000MHz",
                "Cooling": "360mm Liquid Loop"
            },
            variants: [
                { id: 'v1', name: 'Standard Edition', stock: 5, priceMod: 0 },
                { id: 'v2', name: 'Titan Ultimate', stock: 2, priceMod: 800 }
            ],
            features: ['Glass Side Panel', 'RGB Lighting', 'Silent Operation', 'VR Ready Elite'],
        },
        {
            id: 'aura-drone-4k',
            name: 'Aura 4K Drone',
            category: 'Gadgets',
            brand: 'Aura',
            price: 799,
            rating: 4.7,
            inStock: true,
            reviews: [
                { userId: 'user4', userName: 'Diana Prince', rating: 5, comment: 'Stable flight and the tracking is incredibly smart.', date: '2024-03-22' }
            ],
            createdAt: '2024-01-20',
            img: 'https://images.unsplash.com/photo-1473968512447-ac175bb42fea?auto=format&fit=crop&w=1200&q=80',
            images: ['https://images.unsplash.com/photo-1473968512447-ac175bb42fea?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=1200&q=80'],
            specifications: {
                "Camera": "1/1.3-inch CMOS Sensor",
                "Flight Time": "45 Minutes Per Cell",
                "Range": "12km Video Transmission",
                "Weight": "249g Ultra-Light"
            },
            colors: [
                { name: 'Rescue Orange', hex: '#ff4500', imgIndex: 0 },
                { name: 'Stealth Grey', hex: '#696969', imgIndex: 1 }
            ],
            features: ['Obstacle Avoidance', 'ActiveTrack 5.0', 'Level 5 Wind Resistance', 'RAW Photo Support'],
        },
    ];