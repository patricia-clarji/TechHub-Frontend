<template>
  <AdminPageHeader title="Store settings" description="Configuration blueprint for identity, commerce, SEO, theme, and account security."><button class="admin-btn" disabled>Save changes</button></AdminPageHeader>
  <div class="admin-notice"><i class="fa-solid fa-shield-halved"></i><div><strong>Deployment configuration only</strong><p>Settings are not persisted in the browser. Connect an authenticated backend settings endpoint before enabling save.</p></div></div>
  <div class="settings-grid">
    <section v-for="section in sections" :key="section.title" class="admin-card settings-section"><span :class="section.tone"><i :class="section.icon"></i></span><div><h2>{{ section.title }}</h2><p>{{ section.description }}</p><div class="settings-fields"><label v-for="field in section.fields" :key="field" class="admin-field"><span>{{ field }}</span><input disabled :placeholder="`Configure ${field.toLowerCase()} in backend`"></label></div></div></section>
    <section class="admin-card settings-section"><span class="red"><i class="fa-solid fa-key"></i></span><div><h2>Admin account & security</h2><p>Require server-validated staff roles, short-lived sessions, MFA, audit logs, rate limiting, and re-authentication for destructive actions.</p><ul class="security-list"><li><i class="fa-solid fa-circle-check"></i>No admin secrets in Vite environment variables</li><li><i class="fa-solid fa-circle-check"></i>No sensitive tokens in localStorage</li><li><i class="fa-solid fa-circle-info"></i>Staff authentication endpoint still required</li></ul></div></section>
  </div>
</template>
<script setup>
import AdminPageHeader from '@/admin/components/AdminPageHeader.vue';
const sections=[
 {title:'Store profile',description:'Customer-facing identity and contact channels.',icon:'fa-solid fa-store',tone:'gold',fields:['Store name','Support email','Phone number','Business address']},
 {title:'Commerce',description:'Currency, tax and shipping policies.',icon:'fa-solid fa-coins',tone:'green',fields:['Currency','Tax configuration','Shipping policy']},
 {title:'Search & social',description:'SEO defaults and verified social profiles.',icon:'fa-solid fa-globe',tone:'blue',fields:['Meta title','Meta description','Facebook URL','Instagram URL']},
 {title:'Homepage & theme',description:'Publishing controls and presentation preferences.',icon:'fa-solid fa-palette',tone:'violet',fields:['Homepage sections','Default theme','Announcement text']},
];
</script>
