<template>
  <div class="admin-empty">
    <span><i :class="icon"></i></span><h3>{{ title }}</h3><p>{{ message }}</p><slot />
  </div>
</template>
<script setup>
defineProps({ icon: { type: String, default: 'fa-solid fa-shield-halved' }, title: { type: String, required: true }, message: { type: String, required: true } });
</script>
