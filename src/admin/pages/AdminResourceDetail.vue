<template>
  <AdminPageHeader :title="title" :description="config.description">
    <RouterLink :to="`/admin/${resource}`" class="admin-btn secondary">Back</RouterLink>
    <button class="admin-btn" disabled title="Backend write API required">Edit</button>
  </AdminPageHeader>
  <div v-if="loading" class="admin-card form-skeleton"></div>
  <div v-else-if="error" class="admin-notice warning"><i class="fa-solid fa-lock"></i><div><strong>Unable to load detail</strong><p>{{ error }}</p></div></div>
  <section v-else class="admin-card form-section">
    <div class="card-heading"><div><small>{{ config.title }}</small><h2>Record details</h2></div><span>Read only</span></div>
    <div class="settings-fields">
      <label v-for="field in fields" :key="field.key" class="admin-field"><span>{{ field.label }}</span><input :value="field.value" disabled></label>
    </div>
  </section>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { adminApi } from '@/services/adminApi';
import { getAdminResource } from '@/services/adminResources';
import { getDisplayValue } from '@/services/drf';
import AdminPageHeader from '@/admin/components/AdminPageHeader.vue';

const props = defineProps({ resource: { type:String, default:'' }, id: { type:String, default:'' } });
const route=useRoute(); const loading=ref(true); const error=ref(''); const record=ref({});
const resource=computed(()=>props.resource || String(route.params.resource || '')); const id=computed(()=>props.id || String(route.params.id || ''));
const config=computed(()=>getAdminResource(resource.value) || {title:'Resource',singular:'record',description:'Read-only detail.',columns:[['name','Name']]});
const title=computed(()=>getDisplayValue(record.value,'name') || `${config.value.singular || 'Record'} detail`);
const fields=computed(()=>Object.entries(record.value || {}).filter(([,value])=>['string','number','boolean'].includes(typeof value)).slice(0,24).map(([key,value])=>({key,label:key.replaceAll('_',' '),value:String(value)})));
onMounted(async()=>{try{record.value=await adminApi.getResourceDetail(resource.value,id.value) || {};}catch(value){error.value=value.message || 'Unable to load detail.';}finally{loading.value=false;}});
</script>
