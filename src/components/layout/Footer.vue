<template>
    <footer class="border-t border-[var(--border)] bg-[var(--bg-card)] mt-24 py-16 text-sm text-[var(--text-muted)]">
        <div class="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div class="space-y-6">
                <div class="text-2xl font-black tracking-tighter text-[var(--text)]">
                    TECH<span class="text-[var(--accent)]">HUB</span>
                </div>
                <p class="leading-relaxed opacity-80">
                    A curated selection of premium electronics for work, entertainment, and everyday life.
                </p>
            </div>

            <div>
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Shop</h4>
                <ul class="space-y-4">
                    <li><router-link to="/products" class="hover:text-[var(--accent)] transition-colors">All Products</router-link></li>
                    <li><router-link to="/cart" class="hover:text-[var(--accent)] transition-colors">Cart</router-link></li>
                    <li><router-link to="/wishlist" class="hover:text-[var(--accent)] transition-colors">Wishlist</router-link></li>
                </ul>
            </div>

            <div>
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Help</h4>
                <ul class="space-y-4">
                    <li><router-link to="/faq" class="hover:text-[var(--accent)] transition-colors">Frequently Asked Questions</router-link></li>
                    <li><router-link to="/about" class="hover:text-[var(--accent)] transition-colors">About TechHub</router-link></li>
                    <li><router-link to="/contact" class="hover:text-[var(--accent)] transition-colors">Contact Us</router-link></li>
                </ul>
            </div>

            <div class="space-y-6">
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Customer Support</h4>
                <p class="leading-relaxed">Questions about a product or order request? Send our team a message.</p>
                <div class="p-4 bg-[var(--bg-muted)] rounded-2xl border border-[var(--border)]">
                    <router-link to="/contact" class="text-xs font-bold text-[var(--accent)]">Open Contact Form</router-link>
                </div>
            </div>
        </div>
        
        <div class="max-w-7xl mx-auto px-6 lg:px-10 border-t border-[var(--border)] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span>&copy; 2026 TechHub</span>
            <span>Legal policies require client approval before launch.</span>
        </div>
    </footer>
</template>
