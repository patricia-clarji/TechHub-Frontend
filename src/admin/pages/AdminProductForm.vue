<template>
  <AdminPageHeader :title="isNew ? 'Create product' : 'Product details'" description="A production-shaped editor kept read-only until Osimart staff authorization is available.">
    <RouterLink to="/admin/products" class="admin-btn secondary">Cancel</RouterLink><button class="admin-btn" disabled title="Requires server-verified staff authorization">Save product</button>
  </AdminPageHeader>
  <div class="admin-notice"><i class="fa-solid fa-lock"></i><div><strong>Editing is securely disabled</strong><p>This form demonstrates the required schema without pretending to persist changes. Image files remain on your device and are never uploaded.</p></div></div>
  <div v-if="loading" class="admin-card form-skeleton"></div>
  <form v-else class="product-editor" @submit.prevent>
    <div class="editor-main">
      <section class="admin-card form-section"><div class="card-heading"><div><small>Core details</small><h2>Product information</h2></div></div>
        <div class="form-grid"><label class="admin-field full"><span>Product name</span><input v-model.trim="form.name" disabled maxlength="160"></label>
          <label class="admin-field"><span>SKU</span><input v-model.trim="form.sku" disabled maxlength="80"></label><label class="admin-field"><span>Status</span><select v-model="form.status" disabled><option>Published</option><option>Draft</option></select></label>
          <label class="admin-field full"><span>Description</span><textarea v-model.trim="form.description" disabled rows="7" maxlength="5000"></textarea></label></div>
      </section>
      <section class="admin-card form-section"><div class="card-heading"><div><small>Commerce</small><h2>Pricing and inventory</h2></div></div>
        <div class="form-grid"><label class="admin-field"><span>Price (USD)</span><input v-model.number="form.price" disabled type="number" min="0" step=".01"></label><label class="admin-field"><span>Old price (USD)</span><input v-model.number="form.oldPrice" disabled type="number" min="0" step=".01"></label><label class="admin-field"><span>Stock</span><input v-model.number="form.stock" disabled type="number" min="0"></label><label class="admin-field"><span>Restock threshold</span><input v-model.number="form.threshold" disabled type="number" min="0"></label></div>
      </section>
      <section class="admin-card form-section"><div class="card-heading"><div><small>Configuration</small><h2>Specifications and variants</h2></div><button type="button" class="text-action" disabled>+ Add variant</button></div>
        <div class="variant-row"><span>Attribute</span><span>Value</span><span>Price adjustment</span><span>Stock</span></div>
        <div class="variant-row muted"><span>Color / storage / size</span><span>Connect write API</span><span>—</span><span>—</span></div>
      </section>
    </div>
    <aside class="editor-side">
      <section class="admin-card form-section"><div class="card-heading"><div><small>Media</small><h2>Gallery</h2></div></div><div class="upload-zone"><i class="fa-regular fa-images"></i><strong>Upload product media</strong><small>PNG, JPG or WebP · max 5 MB</small><button type="button" disabled>Choose files</button></div></section>
      <section class="admin-card form-section"><div class="card-heading"><div><small>Organization</small><h2>Catalog placement</h2></div></div><label class="admin-field"><span>Category</span><input v-model="form.category" disabled></label><label class="admin-field"><span>Brand</span><input v-model="form.brand" disabled></label><label class="toggle-row"><span><strong>Featured product</strong><small>Highlight across storefront</small></span><input v-model="form.featured" type="checkbox" disabled></label><label class="toggle-row"><span><strong>On sale</strong><small>Show promotional pricing</small></span><input v-model="form.sale" type="checkbox" disabled></label></section>
    </aside>
  </form>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'; import { useRoute } from 'vue-router';
import { adminApi } from '@/services/adminApi'; import { normalizeProduct } from '@/services/normalizers'; import AdminPageHeader from '@/admin/components/AdminPageHeader.vue';
const route=useRoute(); const isNew=computed(()=>route.name==='AdminProductNew'); const loading=ref(!isNew.value);
const form=reactive({name:'',sku:'',description:'',price:0,oldPrice:0,stock:0,threshold:5,status:'Draft',category:'',brand:'',featured:false,sale:false});
onMounted(async()=>{if(isNew.value)return;try{const p=normalizeProduct(await adminApi.getProduct(route.params.id));Object.assign(form,{name:p.name,sku:p.sku||'',description:p.description||'',price:p.price,oldPrice:p.oldPrice||0,stock:p.stock,category:p.category,brand:p.brand,status:p.is_active?'Published':'Draft',featured:Boolean(p.featured),sale:Boolean(p.oldPrice>p.price)});}finally{loading.value=false;}});
</script>
