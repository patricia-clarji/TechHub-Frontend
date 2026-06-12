<template>
    <footer class="border-t border-[var(--border)] bg-[var(--bg-card)] mt-24 py-16 text-sm text-[var(--text-muted)]">
        <div class="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div class="space-y-6">
                <div class="text-2xl font-black tracking-tighter text-[var(--text)]">
                    TECH<span class="text-[var(--accent)]">HUB</span>
                </div>
                <p class="leading-relaxed opacity-80">
                    Premium curated choice electronics engineered for modern sustainable professional excellence workflows. We bridge the gap between architectural power and aesthetic elegance.
                </p>
                <div class="flex gap-4">
                    <a href="#" class="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" class="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" class="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>

            <div>
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Asset Catalog</h4>
                <ul class="space-y-4">
                    <li><router-link to="/products" class="hover:text-[var(--accent)] transition-colors">All Provisions</router-link></li>
                    <li><router-link to="/cart" class="hover:text-[var(--accent)] transition-colors">Active Basket</router-link></li>
                    <li><router-link to="/wishlist" class="hover:text-[var(--accent)] transition-colors">Saved Arrays</router-link></li>
                    <li><router-link to="/account" class="hover:text-[var(--accent)] transition-colors">User Terminal</router-link></li>
                </ul>
            </div>

            <div>
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Infrastructure</h4>
                <ul class="space-y-4">
                    <li><router-link to="/faq" class="hover:text-[var(--accent)] transition-colors">Operational FAQ</router-link></li>
                    <li><router-link to="/about" class="hover:text-[var(--accent)] transition-colors">The Blueprint</router-link></li>
                    <li><router-link to="/contact" class="hover:text-[var(--accent)] transition-colors">Connect Pipeline</router-link></li>
                </ul>
            </div>

            <div class="space-y-6">
                <h4 class="font-bold uppercase tracking-[0.2em] text-[10px] text-[var(--text)] mb-8">Dispatch HQ</h4>
                <p class="leading-relaxed">
                    100 Premium Luxury Boulevard,<br />
                    Silicon Galleria Suite 400<br />
                    San Francisco, CA 94103
                </p>
                <div class="p-4 bg-[var(--bg-muted)] rounded-2xl border border-[var(--border)]">
                    <p class="text-[10px] font-bold uppercase text-[var(--accent)] mb-1">Status</p>
                    <p class="text-xs text-[var(--text)]">All Systems Operational</p>
                </div>
            </div>
        </div>
        
        <div class="max-w-7xl mx-auto px-6 lg:px-10 border-t border-[var(--border)] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span>&copy; 2026 TechHub Architecture Enterprise</span>
            <div class="flex gap-8">
                <a href="#" class="hover:text-[var(--accent)]">Privacy Protocol</a>
                <a href="#" class="hover:text-[var(--accent)]">Terms of Execution</a>
            </div>
        </div>
    </footer>
</template>