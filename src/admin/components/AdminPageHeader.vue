<template>
  <div class="admin-page-header">
    <div><p class="admin-eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p>{{ description }}</p></div>
    <div class="admin-header-actions"><slot /></div>
  </div>
</template>
<script setup>
defineProps({ eyebrow: { type: String, default: 'Store operations' }, title: { type: String, required: true }, description: { type: String, default: '' } });
</script>
