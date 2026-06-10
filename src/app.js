// Shared app logic for products, cart, quick view, chat, and interactions
(function () {
    const sampleProducts = [
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
    ];

    let selectedCategory = 'All';

    function getProducts() {
        return sampleProducts;
    }

    function getCategories() {
        return ['All', ...Array.from(new Set(sampleProducts.map((p) => p.category)))];
    }

    // --- CART ---
    function getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
    }

    function saveWishlist(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
    }

    function toggleWishlist(productName) {
        const product = getProducts().find((p) => p.name === productName);
        if (!product) return;
        const wishlist = getWishlist();
        const exists = wishlist.includes(product.id);
        if (exists) {
            saveWishlist(wishlist.filter((id) => id !== product.id));
            showToast('Removed from wishlist', 'fa-heart-crack');
        } else {
            saveWishlist([...wishlist, product.id]);
            showToast('Added to wishlist', 'fa-heart');
        }
    }

    function updateWishlistCount() {
        const count = getWishlist().length;
        document.querySelectorAll('#wishlist-count').forEach((el) => (el.textContent = count));
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem('techhub-users') || '[]');
    }

    function saveUsers(users) {
        localStorage.setItem('techhub-users', JSON.stringify(users));
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('techhub-current-user') || 'null');
    }

    function setCurrentUser(user) {
        localStorage.setItem('techhub-current-user', JSON.stringify(user));
        updateAuthUI();
    }

    function clearCurrentUser() {
        localStorage.removeItem('techhub-current-user');
        updateAuthUI();
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function authLogin(email, password) {
        const users = getUsers();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) {
            return { success: false, message: 'Email or password is incorrect.' };
        }
        setCurrentUser({ name: user.name, email: user.email });
        return { success: true };
    }

    function authSignup(name, email, password) {
        const users = getUsers();
        if (!name.trim() || !validateEmail(email) || password.length < 6) {
            return { success: false, message: 'Please enter a valid name, email, and password (6+ chars).' };
        }
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'This email is already registered.' };
        }
        const newUser = { name: name.trim(), email: email.toLowerCase(), password };
        saveUsers([...users, newUser]);
        setCurrentUser({ name: newUser.name, email: newUser.email });
        return { success: true };
    }

    function updateAuthUI() {
        const userIcon = document.getElementById('user-icon');
        const userBtn = document.getElementById('user-btn');
        const currentUser = getCurrentUser();
        if (!userIcon || !userBtn) return;
        if (currentUser) {
            userIcon.className = 'fa-solid fa-user-check text-sm';
            userBtn.title = `Logged in as ${currentUser.name}`;
        } else {
            userIcon.className = 'fa-solid fa-user text-sm';
            userBtn.title = 'Sign in or sign up';
        }
    }

    function renderAuthModalState(activeTab = 'signin') {
        const currentUser = getCurrentUser();
        const signInForm = document.getElementById('signin-form');
        const signUpForm = document.getElementById('signup-form');
        const profileView = document.getElementById('profile-view');
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        if (!signInForm || !signUpForm || !profileView || !loginTab || !signupTab) return;

        if (currentUser) {
            signInForm.classList.add('hidden');
            signUpForm.classList.add('hidden');
            profileView.classList.remove('hidden');
            document.getElementById('profile-name').textContent = currentUser.name;
            document.getElementById('profile-email').textContent = currentUser.email;
            loginTab.classList.add('hidden');
            signupTab.classList.add('hidden');
            document.getElementById('auth-subtitle').textContent = 'Welcome back! Manage your account here.';
            return;
        }

        loginTab.classList.remove('hidden');
        signupTab.classList.remove('hidden');
        profileView.classList.add('hidden');
        document.getElementById('auth-subtitle').textContent = 'Sign in or create an account to save your wishlist and orders.';
        if (activeTab === 'signup') {
            signInForm.classList.add('hidden');
            signUpForm.classList.remove('hidden');
            loginTab.classList.remove('bg-[var(--accent)]');
            loginTab.classList.add('bg-[var(--bg-muted)]', 'text-[var(--text)]');
            signupTab.classList.remove('bg-[var(--bg-muted)]', 'text-[var(--text)]');
            signupTab.classList.add('bg-[var(--accent)]', 'text-white');
        } else {
            signInForm.classList.remove('hidden');
            signUpForm.classList.add('hidden');
            signupTab.classList.remove('bg-[var(--accent)]', 'text-white');
            signupTab.classList.add('bg-[var(--bg-muted)]', 'text-[var(--text)]');
            loginTab.classList.remove('bg-[var(--bg-muted)]', 'text-[var(--text)]');
            loginTab.classList.add('bg-[var(--accent)]', 'text-white');
        }
    }

    function initializeAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const userBtn = document.getElementById('user-btn');
        const authClose = document.getElementById('auth-close');
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const signInBtn = document.getElementById('signin-btn');
        const signUpBtn = document.getElementById('signup-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const authError = document.getElementById('auth-error');
        if (!authModal || !userBtn || !authClose || !loginTab || !signupTab || !signInBtn || !signUpBtn || !logoutBtn || !authError) return;

        function closeModal() {
            authModal.classList.add('hidden');
            authError.classList.add('hidden');
            authError.textContent = '';
        }

        function openModal(tab = 'signin') {
            renderAuthModalState(tab);
            authModal.classList.remove('hidden');
        }

        userBtn.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            openModal(currentUser ? 'profile' : 'signin');
        });
        authClose.addEventListener('click', closeModal);
        authModal.addEventListener('click', (event) => {
            if (event.target === authModal) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !authModal.classList.contains('hidden')) closeModal();
        });

        loginTab.addEventListener('click', () => renderAuthModalState('signin'));
        signupTab.addEventListener('click', () => renderAuthModalState('signup'));

        signInBtn.addEventListener('click', () => {
            const email = document.getElementById('signin-email').value.trim();
            const password = document.getElementById('signin-password').value;
            const result = authLogin(email, password);
            if (!result.success) {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
                return;
            }
            authError.classList.add('hidden');
            closeModal();
            showToast('Signed in successfully!', 'fa-check');
        });

        signUpBtn.addEventListener('click', () => {
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const result = authSignup(name, email, password);
            if (!result.success) {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
                return;
            }
            authError.classList.add('hidden');
            closeModal();
            showToast('Account created and signed in!', 'fa-check');
        });

        logoutBtn.addEventListener('click', () => {
            clearCurrentUser();
            closeModal();
            showToast('Signed out.', 'fa-right-from-bracket');
        });

        updateAuthUI();
    }

    function initializeHeaderActions() {
        const cartIcon = document.getElementById('cart-icon');
        const wishlistIcon = document.getElementById('wishlist-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                location.href = 'cart.html';
            });
        }
        if (wishlistIcon) {
            wishlistIcon.addEventListener('click', () => {
                const count = getWishlist().length;
                showToast(count ? `Wishlist has ${count} item${count > 1 ? 's' : ''}` : 'No items in wishlist yet', 'fa-heart');
            });
        }
    }

    function addToCart(id, qty = 1) {
        const cart = getCart();
        const existing = cart.find((i) => i.id === id);
        if (existing) existing.qty += qty;
        else cart.push({ id, qty });
        saveCart(cart);
        showToast('Added to cart', 'fa-cart-plus');
        renderMiniCart();
    }

    function removeFromCart(id) {
        let cart = getCart();
        cart = cart.filter((i) => i.id !== id);
        saveCart(cart);
        renderCartRoot();
        renderMiniCart();
    }

    function updateQty(id, qty) {
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (!item) return;
        item.qty = Math.max(1, qty);
        saveCart(cart);
        renderCartRoot();
        renderMiniCart();
    }

    function cartSubtotal() {
        const cart = getCart();
        const products = getProducts();
        return cart.reduce((s, c) => {
            const p = products.find((x) => x.id === c.id);
            return s + (p ? p.price * c.qty : 0);
        }, 0);
    }

    // --- RENDERING ---
    function renderCategoryFilters() {
        const el = document.getElementById('category-filters');
        if (!el) return;
        el.innerHTML = getCategories()
            .map(
                (category) => `
          <button type="button" class="category-pill ${selectedCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>
        `,
            )
            .join('');
        el.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', () => {
                selectedCategory = btn.dataset.category;
                renderCategoryFilters();
                renderProductsGrid();
            });
        });
    }

    function renderProductsGrid() {
        const el = document.getElementById('products-grid');
        if (!el) return;
        const products = selectedCategory === 'All' ? getProducts() : getProducts().filter((p) => p.category === selectedCategory);
        const countEl = document.getElementById('products-count');
        if (countEl) countEl.textContent = `${products.length} products`;

        if (!products.length) {
            el.innerHTML = '<div class="text-center text-[var(--text-muted)] py-10">No products found in this category.</div>';
            return;
        }

        el.innerHTML = products
            .map(
                (p) => `
        <article class="product-card">
          <figure>
            <img src="${p.img}" alt="${p.name}" loading="lazy">
          </figure>
          <div class="product-meta">
            <span class="category-tag">${p.category}</span>
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div class="flex items-center justify-between gap-3 mt-4">
              <div>
                <div class="text-lg font-bold">$${p.price}</div>
                <div class="text-[var(--text-muted)] text-xs mt-1">Premium choice</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button data-id="${p.id}" data-name="${p.name}" data-price="$${p.price}" data-image="${p.img}" class="quick-view-btn finder-btn bg-[var(--bg-muted)] hover:bg-[var(--border)] rounded-full py-2 px-4 text-sm">Quick View</button>
                <button data-id="${p.id}" class="action-btn premium-btn bg-[var(--accent)] text-white rounded-full py-2 px-4 text-sm">Add to Cart</button>
              </div>
            </div>
          </div>
        </article>
        `,
            )
            .join('');

        document.querySelectorAll('.action-btn[data-id]').forEach((button) => {
            button.addEventListener('click', (event) => addToCart(event.currentTarget.dataset.id));
        });
        document.querySelectorAll('.quick-view-btn').forEach((btn) => btn.addEventListener('click', () => openQuickView(btn.dataset)));
    }

    function renderProductDetail() {
        const root = document.getElementById('product-root');
        if (!root) return;
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        const p = getProducts().find((x) => x.id === id) || getProducts()[0];
        root.innerHTML = `
        <div class="hero-img-wrap">
          <img src="${p.img}" alt="${p.name}">
        </div>
        <article>
          <span class="category-tag">${p.category}</span>
          <h1 class="text-4xl font-[Playfair_Display] font-bold mt-4">${p.name}</h1>
          <p class="text-[var(--text-muted)] mt-4">${p.desc}</p>
          <div class="mt-6 flex items-center gap-4 flex-wrap">
            <div class="text-3xl font-bold">$${p.price}</div>
            <div class="rounded-full bg-[var(--bg-muted)] px-4 py-2 text-sm text-[var(--text-muted)]">Best seller</div>
          </div>
          <ul class="feature-list">
            ${p.features.map((feature) => `<li>${feature}</li>`).join('')}
          </ul>
          <div class="product-actions mt-8">
            <button id="add-to-cart-btn" class="premium-btn bg-[var(--accent)] text-white py-3 px-7 rounded-xl">Add to Cart</button>
            <button id="buy-now-btn" class="border border-[var(--border)] rounded-xl py-3 px-7">Buy Now</button>
          </div>
        </article>
        `;

        document.getElementById('add-to-cart-btn').addEventListener('click', () => addToCart(p.id));
        document.getElementById('buy-now-btn').addEventListener('click', () => {
            addToCart(p.id);
            location.href = 'cart.html';
        });
        renderRelatedProducts(p);
    }

    function renderRelatedProducts(product) {
        const root = document.getElementById('related-products');
        if (!root) return;
        const related = getProducts().filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
        if (!related.length) {
            root.innerHTML = '<p class="text-[var(--text-muted)]">No related items at this time.</p>';
            return;
        }
        root.innerHTML = related
            .map(
                (item) => `
          <article class="related-card">
            <img src="${item.img}" alt="${item.name}" loading="lazy">
            <div>
              <span class="label">${item.category}</span>
              <h4>${item.name}</h4>
              <p class="text-[var(--text-muted)] text-xs">${item.desc}</p>
              <div class="mt-3 flex items-center gap-2">
                <span class="font-bold">$${item.price}</span>
                <a href="product.html?id=${item.id}" class="text-[var(--accent)] text-xs font-semibold">View</a>
              </div>
            </div>
          </article>
        `,
            )
            .join('');
    }

    function openQuickView(data) {
        const modal = document.getElementById('quick-view-modal');
        if (!modal) return;
        const nameEl = document.getElementById('qv-name');
        const priceEl = document.getElementById('qv-price');
        const imgEl = document.getElementById('qv-image');
        const productId = data.id;
        nameEl.textContent = data.name;
        priceEl.textContent = data.price;
        imgEl.src = data.image;
        modal.dataset.productId = productId;
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            const inner = modal.querySelector('[tabindex]');
            if (inner) inner.focus();
        });
    }

    function closeQuickView() {
        const modal = document.getElementById('quick-view-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => modal.classList.add('hidden'), 250);
    }

    function renderCartRoot() {
        const root = document.getElementById('cart-root');
        if (!root) return;
        const cart = getCart();
        const products = getProducts();
        if (cart.length === 0) {
            root.innerHTML = '<p class="text-[var(--text-muted)]">Your cart is empty.</p>';
            const subtotalEl = document.getElementById('cart-subtotal');
            if (subtotalEl) subtotalEl.textContent = '$0.00';
            return;
        }
        root.innerHTML = cart
            .map((item) => {
                const p = products.find((x) => x.id === item.id) || { name: item.id, price: 0, img: '' };
                return `
          <div class="p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] flex flex-col gap-4 sm:flex-row items-center">
            <img src="${p.img}" alt="${p.name}" class="w-full sm:w-32 h-32 object-cover rounded-2xl">
            <div class="flex-1">
              <div class="font-semibold text-lg">${p.name}</div>
              <div class="text-[var(--text-muted)] text-sm mt-1">$${p.price} each</div>
              <div class="mt-4 flex flex-wrap items-center gap-3">
                <button class="qty-decrease p-2 border rounded" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                <input type="number" value="${item.qty}" min="1" class="w-16 text-center qty-input rounded border" data-id="${item.id}">
                <button class="qty-increase p-2 border rounded" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-lg">$${(p.price * item.qty).toFixed(2)}</div>
              <button class="text-sm text-[var(--text-muted)] mt-3 remove-item" data-id="${item.id}">Remove</button>
            </div>
          </div>
        `;
            })
            .join('');
        document.querySelectorAll('.remove-item').forEach((btn) =>
            btn.addEventListener('click', (e) => removeFromCart(e.currentTarget.dataset.id)),
        );
        document.querySelectorAll('.qty-decrease').forEach((b) =>
            b.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const cur = document.querySelector(`input.qty-input[data-id="${id}"]`);
                updateQty(id, Number(cur.value) - 1);
            }),
        );
        document.querySelectorAll('.qty-increase').forEach((b) =>
            b.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const cur = document.querySelector(`input.qty-input[data-id="${id}"]`);
                updateQty(id, Number(cur.value) + 1);
            }),
        );
        document.querySelectorAll('input.qty-input').forEach((i) =>
            i.addEventListener('change', (e) => updateQty(e.currentTarget.dataset.id, Number(e.currentTarget.value))),
        );
        const subtotalEl = document.getElementById('cart-subtotal');
        if (subtotalEl) subtotalEl.textContent = '$' + cartSubtotal().toFixed(2);
    }

    // --- UI helpers ---
    function updateCartCount() {
        const count = getCart().reduce((s, i) => s + i.qty, 0);
        document.querySelectorAll('#cart-count').forEach((el) => (el.textContent = count));
    }

    function showToast(msg, iconClass) {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.log(msg);
            return;
        }
        const msgEl = document.getElementById('toast-message');
        const icon = document.getElementById('toast-icon');
        if (msgEl) msgEl.textContent = msg;
        if (icon) icon.className = `fa-solid ${iconClass} text-[var(--accent)]`;
        toast.classList.add('toast-visible');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => toast.classList.remove('toast-visible'), 2800);
    }

    function initializeChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatToggle = document.getElementById('chat-toggle');
        const chatSend = document.getElementById('chat-send');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        const suggestions = document.querySelectorAll('.chat-suggestion');
        if (!chatWindow || !chatToggle || !chatSend || !chatInput || !chatMessages) return;

        function appendMessage(text, isUser = false) {
            const div = document.createElement('div');
            div.className = isUser
                ? 'ml-auto bg-[var(--accent)] text-white p-3 rounded-2xl rounded-tr-sm w-fit max-w-[85%] text-xs'
                : 'bg-[var(--bg-muted)] p-3 rounded-2xl rounded-tl-sm w-fit max-w-[85%] text-xs';
            div.textContent = text;
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function getBotReply(msg) {
            const lower = msg.toLowerCase();
            if (lower.includes('shipping') || lower.includes('delivery')) return 'We offer free delivery on orders over $100. Standard shipping takes 2–5 business days.';
            if (lower.includes('return') || lower.includes('refund')) return 'We offer 30-day hassle-free returns on all products.';
            if (lower.includes('warranty')) return 'All products come with manufacturer warranty. Electronics are covered for 1–2 years.';
            if (lower.includes('gaming')) return 'Our Gaming collection includes consoles, controllers, headsets, and accessories.';
            if (lower.includes('laptop')) return 'We carry laptops from premium brands — optimized for work, creativity, and play.';
            if (lower.includes('phone') || lower.includes('smartphone')) return 'Our smartphone lineup offers top cameras, fast charging, and premium designs.';
            if (lower.includes('deal') || lower.includes('discount')) return 'Check our deals section for current promotions up to 40% off!';
            if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'Hello 👋 Welcome to TechHub! How can I assist you today?';
            return 'I can help with shipping, returns, warranty, products, and deals. What would you like to know?';
        }

        function sendChat() {
            const value = chatInput.value.trim();
            if (!value) return;
            appendMessage(value, true);
            chatInput.value = '';
            setTimeout(() => appendMessage(getBotReply(value), false), 600);
        }

        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) chatInput.focus();
        });
        chatSend.addEventListener('click', sendChat);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChat();
        });
        suggestions.forEach((btn) => {
            btn.addEventListener('click', () => {
                appendMessage(btn.textContent.trim(), true);
                setTimeout(() => appendMessage(getBotReply(btn.textContent), false), 500);
            });
        });
    }

    function initializeQuickView() {
        const qvModal = document.getElementById('quick-view-modal');
        const closeBtn = document.getElementById('close-qv');
        const qvAdd = document.getElementById('qv-add-to-cart');
        if (!qvModal || !closeBtn) return;

        closeBtn.addEventListener('click', closeQuickView);
        qvModal.addEventListener('click', (e) => {
            if (e.target === qvModal) closeQuickView();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !qvModal.classList.contains('hidden')) closeQuickView();
        });
        if (qvAdd) {
            qvAdd.addEventListener('click', () => {
                const pid = qvModal.dataset.productId;
                if (pid) {
                    addToCart(pid);
                    closeQuickView();
                }
            });
        }
    }

    function initializeCustomCursor() {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            requestAnimationFrame(animateRing);
        }
        animateRing();

        const hoverTargets = document.querySelectorAll('a, button, .cursor-pointer, .finder-btn, .premium-btn, .product-card, .category-pill, .nav-link');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    function initializeThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;
        const root = document.documentElement;
        if (localStorage.getItem('theme') === 'dark') root.classList.add('dark');
        toggle.addEventListener('click', () => {
            root.classList.toggle('dark');
            localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    function initializeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileBackdrop = document.getElementById('mobile-backdrop');
        const closeMenu = document.getElementById('close-menu');
        if (!hamburger || !mobileMenu || !mobileBackdrop || !closeMenu) return;

        function openMobileMenu() {
            mobileMenu.classList.add('mobile-menu-active');
            mobileBackdrop.classList.add('mobile-menu-active');
            hamburger.classList.add('hamburger-active');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('mobile-menu-active');
            mobileBackdrop.classList.remove('mobile-menu-active');
            hamburger.classList.remove('hamburger-active');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', openMobileMenu);
        closeMenu.addEventListener('click', closeMobileMenu);
        mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    function initializeSearchModal() {
        const searchBtn = document.getElementById('search-btn');
        const searchModal = document.getElementById('search-modal');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        if (!searchBtn || !searchModal || !closeSearch || !searchInput || !results) return;

        function closeModal() {
            searchModal.classList.remove('active');
            setTimeout(() => searchModal.classList.add('hidden'), 250);
        }

        function updateResults(query) {
            const q = query.trim().toLowerCase();
            if (!q) {
                results.innerHTML = '';
                return;
            }
            const matches = getProducts().filter((product) => product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q));
            results.innerHTML = matches.length
                ? matches
                    .map(
                        (product) => `
                    <a href="product.html?id=${product.id}" class="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border)] transition-colors text-sm">
                        <span>${product.name}</span>
                        <span class="text-[var(--accent)] font-semibold">$${product.price}</span>
                    </a>
                `,
                    )
                    .join('')
                : '<p class="text-[var(--text-muted)] text-sm text-center py-4">No products found.</p>';
        }

        searchBtn.addEventListener('click', () => {
            searchModal.classList.remove('hidden');
            requestAnimationFrame(() => searchModal.classList.add('active'));
            searchInput.value = '';
            searchInput.focus();
            results.innerHTML = '';
        });
        closeSearch.addEventListener('click', closeModal);
        searchModal.addEventListener('click', (event) => {
            if (event.target === searchModal) closeModal();
        });
        searchInput.addEventListener('input', (event) => updateResults(event.target.value));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeModal();
        });
    }

    function renderMiniCart() {
        const panel = document.getElementById('mini-cart-panel');
        if (!panel) return;
        const cart = getCart();
        const products = getProducts();
        if (cart.length === 0) {
            panel.innerHTML = `<div class="p-4 text-sm text-[var(--text-muted)]">Your cart is empty.</div>`;
            return;
        }
        panel.innerHTML = cart
            .map((item) => {
                const p = products.find((x) => x.id === item.id) || { name: item.id, price: 0, img: '' };
                return `
          <div class="flex items-center gap-3 p-3 border-b border-[var(--border)]">
            <img src="${p.img}" class="w-12 h-12 object-cover rounded" alt="${p.name}">
            <div class="flex-1">
              <div class="text-sm font-semibold">${p.name}</div>
              <div class="text-[var(--text-muted)] text-xs">${item.qty} × $${p.price}</div>
            </div>
            <div class="text-sm font-bold">$${(p.price * item.qty).toFixed(2)}</div>
            <button class="ml-2 text-xs text-[var(--text-muted)] remove-mini" data-id="${item.id}">Remove</button>
          </div>
        `;
            })
            .join('') + `
        <div class="p-3 flex gap-2">
          <a href="cart.html" class="flex-1 text-center py-2 rounded bg-[var(--bg-muted)] hover:bg-[var(--border)]">View Cart</a>
          <button id="mini-checkout" class="flex-1 py-2 rounded bg-[var(--accent)] text-white">Checkout</button>
        </div>`;

        panel.querySelectorAll('.remove-mini').forEach((b) =>
            b.addEventListener('click', (e) => {
                removeFromCart(e.currentTarget.dataset.id);
                renderMiniCart();
            }),
        );
        const miniCheckout = document.getElementById('mini-checkout');
        if (miniCheckout) miniCheckout.addEventListener('click', () => {
            location.href = 'cart.html';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeCustomCursor();
        initializeThemeToggle();
        initializeMobileMenu();
        initializeSearchModal();
        initializeAuthModal();
        initializeNewsletter();
        initializeHeaderActions();
        updateAuthUI();
        initializeWishlistButtons();
        renderCategoryFilters();
        renderProductsGrid();
        renderProductDetail();
        renderCartRoot();
        updateCartCount();
        updateWishlistCount();
        initializeQuickView();
        initializeChat();

        const floatBtn = document.querySelector('.float-cart-btn button');
        const miniPanel = document.getElementById('mini-cart-panel');
        if (floatBtn && miniPanel) {
            floatBtn.setAttribute('aria-haspopup', 'dialog');
            floatBtn.setAttribute('aria-controls', 'mini-cart-panel');
            floatBtn.setAttribute('tabindex', '0');
            floatBtn.setAttribute('aria-expanded', 'false');

            function toggleMini() {
                const hidden = miniPanel.classList.toggle('hidden');
                renderMiniCart();
                floatBtn.setAttribute('aria-expanded', String(!hidden));
            }

            floatBtn.addEventListener('click', toggleMini);
            floatBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMini();
                }
            });
            document.addEventListener('click', (ev) => {
                if (!miniPanel || !floatBtn) return;
                if (miniPanel.contains(ev.target) || floatBtn.contains(ev.target)) return;
                miniPanel.classList.add('hidden');
                floatBtn.setAttribute('aria-expanded', 'false');
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!miniPanel.classList.contains('hidden')) {
                        miniPanel.classList.add('hidden');
                        floatBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }

        const qvAdd = document.getElementById('qv-add-to-cart');
        const qvModalEl = document.getElementById('quick-view-modal');
        if (qvAdd && qvModalEl) {
            qvAdd.addEventListener('click', () => {
                const pid = qvModalEl.dataset.productId;
                if (pid) {
                    addToCart(pid);
                    closeQuickView();
                }
            });
        }

        const checkout = document.getElementById('checkout-btn');
        if (checkout) checkout.addEventListener('click', () => {
            localStorage.removeItem('cart');
            updateCartCount();
            showToast('Checkout complete', 'fa-check');
            location.href = 'index.html';
        });
    });

    window.TechHub = { addToCart, getCart, getProducts };
})();
