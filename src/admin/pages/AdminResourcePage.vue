<template>
  <AdminPageHeader :title="config.title" :description="config.description">
    <button v-if="config.exportable" class="admin-btn secondary" :disabled="!rows.length" @click="exportCsv"><i class="fa-solid fa-download"></i> Export CSV</button>
    <RouterLink v-if="resource === 'products'" to="/admin/products/new" class="admin-btn" aria-disabled="true"><i class="fa-solid fa-plus"></i> New product</RouterLink>
    <button v-else class="admin-btn" disabled title="Backend write API required"><i class="fa-solid fa-plus"></i> Add {{ config.singular }}</button>
  </AdminPageHeader>
  <div class="admin-toolbar">
    <label class="admin-field search-field"><span class="sr-only">Search {{ config.title }}</span><i class="fa-solid fa-magnifying-glass"></i><input v-model="query" :placeholder="`Search ${config.title.toLowerCase()}...`" @keydown.enter="load(1)"></label>
    <select v-model="status" aria-label="Filter by status" @change="load(1)"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="low">Low stock</option></select>
    <button class="admin-btn secondary" :disabled="loading" @click="load(page)"><i class="fa-solid fa-rotate"></i> Retry</button>
    <span class="result-count">{{ totalCount }} results</span>
  </div>
  <div v-if="loading" class="admin-card table-skeleton"><div v-for="n in 7" :key="n"></div></div>
  <div v-else-if="error" class="admin-notice warning"><i class="fa-solid fa-lock"></i><div><strong>{{ backendRequired ? 'Backend API required' : 'Backend connection required' }}</strong><p>{{ error }}</p><p v-if="backendRequired">No demo records are fabricated.</p></div></div>
  <div v-else-if="paginated.length" class="admin-card admin-table-wrap">
    <table class="admin-table"><thead><tr><th v-for="column in columns" :key="column.key">{{ column.label }}</th><th><span class="sr-only">Actions</span></th></tr></thead>
      <tbody><tr v-for="row in paginated" :key="row.id">
        <td v-for="column in columns" :key="column.key" :data-label="column.label">
          <div v-if="column.key === 'name'" class="entity-cell"><img v-if="row.image" :src="row.image" alt=""><span v-else><i :class="config.icon"></i></span><div><strong>{{ display(row,column.key) }}</strong><small>{{ row.slug || row.sku || row.id }}</small></div></div>
          <span v-else-if="column.key === 'status'" class="status-pill" :class="row.status">{{ display(row,column.key) }}</span>
          <span v-else>{{ display(row,column.key) }}</span>
        </td>
        <td class="row-actions"><RouterLink v-if="config.supportsDetail" :to="`/admin/${resource}/${encodeURIComponent(row.id)}`" aria-label="View details"><i class="fa-regular fa-eye"></i></RouterLink><button disabled aria-label="More actions" title="Backend write API required"><i class="fa-solid fa-ellipsis"></i></button></td>
      </tr></tbody>
    </table>
    <div class="pagination"><span>Page {{ page }} of {{ totalPages }}</span><div><button :disabled="page === 1 || loading" @click="load(page - 1)"><i class="fa-solid fa-chevron-left"></i></button><button :disabled="page === totalPages || loading" @click="load(page + 1)"><i class="fa-solid fa-chevron-right"></i></button></div></div>
  </div>
  <AdminEmptyState v-else :title="`No ${config.title.toLowerCase()} to show`" message="No records match the current filters." :icon="config.icon" />
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { adminApi } from '@/services/adminApi';
import { getAdminResource } from '@/services/adminResources';
import { normalizeResourceRow } from '@/services/drf';
import AdminPageHeader from '@/admin/components/AdminPageHeader.vue';
import AdminEmptyState from '@/admin/components/AdminEmptyState.vue';

const props = defineProps({ resource: { type:String, required:true } });
const query=ref(''); const status=ref(''); const rows=ref([]); const loading=ref(true); const error=ref(''); const page=ref(1); const totalCount=ref(0); const pageSize=10;
const config=computed(()=>getAdminResource(props.resource) || {title:'Admin resource',singular:'record',description:'This admin module is not configured.',columns:[['name','Name'],['status','Status']],icon:'fa-solid fa-circle-info',supportsDetail:false});
const columns=computed(()=>config.value.columns.map(([key,label])=>({key,label})));
const backendRequired = computed(() => /requires|not present|write api/i.test(error.value));
const totalPages=computed(()=>Math.max(1,Math.ceil(totalCount.value/pageSize)));
const paginated=computed(()=>rows.value);

const load=async(nextPage=page.value)=>{loading.value=true;error.value='';rows.value=[];try{const params={page:nextPage,page_size:pageSize};if(query.value.trim())params.search=query.value.trim();if(status.value&&status.value!=='low')params.status=status.value;const result=await adminApi.listResource(props.resource,params);rows.value=result.items.map((item,index)=>normalizeResourceRow(item,config.value,index));totalCount.value=result.count;page.value=nextPage;}catch(value){totalCount.value=0;error.value=value.message || 'Unable to load this resource.';}finally{loading.value=false;}};
onMounted(()=>load(1)); watch(()=>props.resource,()=>{query.value='';status.value='';load(1);});
const display=(row,key)=>{const value=row[key];if(key==='price'||key==='total')return value ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0) : '-';if(key==='status')return value==='active'?'Active':value==='inactive'?'Inactive':String(value||'Unknown');return value || '-';};
const exportCsv=()=>{const escape=(v)=>`"${String(v??'').replaceAll('"','""')}"`;const csv=[columns.value.map(c=>escape(c.label)).join(','),...rows.value.map(r=>columns.value.map(c=>escape(display(r,c.key))).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`techhub-${props.resource}.csv`;link.click();URL.revokeObjectURL(url);};
</script>
