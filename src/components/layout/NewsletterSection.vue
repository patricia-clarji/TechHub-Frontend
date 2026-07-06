<template>
  <section class="max-w-7xl mx-auto px-6 lg:px-10 py-24">
    <div class="newsletter-section bg-[var(--bg-muted)] rounded-[3rem] p-12 lg:p-24 text-center reveal overflow-hidden relative">
      <div class="relative z-10">
        <span class="section-badge">Discover More</span>
        <h2 class="font-[Playfair_Display] text-4xl lg:text-6xl font-bold mt-8">Find Your Next Device</h2>
        <p class="mt-6 text-[var(--text-muted)] max-w-lg mx-auto">
          Browse current products, pricing, and availability directly from the TechHub catalog.
        </p>
        <router-link to="/products"
          class="inline-block mt-10 bg-[var(--accent)] hover:bg-[var(--accent-dk)] text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all premium-btn shadow-xl">
          Browse Products
        </router-link>
      </div>
    </div>
  </section>
</template>
