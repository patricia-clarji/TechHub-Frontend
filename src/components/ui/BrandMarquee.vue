<script setup>
const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'ASUS'];
</script>

<template>
  <section class="py-24 overflow-hidden">
    <div class="brand-fade relative">
      <div class="brand-track flex gap-8">
        <div v-for="(b, i) in [...brands, ...brands]" :key="i" 
          class="min-w-[180px] h-[90px] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex items-center justify-center font-bold text-xl opacity-40 hover:opacity-100 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-default">
          {{ b }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.brand-track {
  display: flex;
  width: max-content;
  animation: brandScroll 24s linear infinite;
}
@keyframes brandScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
</style>