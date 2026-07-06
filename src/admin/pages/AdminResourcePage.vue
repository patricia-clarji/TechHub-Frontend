<template>
  <AdminPageHeader :title="config.title" :description="config.description">
    <button v-if="config.exportable" class="admin-btn secondary" :disabled="!rows.length" @click="exportCsv"><i class="fa-solid fa-download"></i> Export CSV</button>
    <RouterLink v-if="resource === 'products'" to="/admin/products/new" class="admin-btn" aria-disabled="true"><i class="fa-solid fa-plus"></i> New product</RouterLink>
    <button v-else-if="config.create" class="admin-btn" disabled title="Requires a verified staff API"><i class="fa-solid fa-plus"></i> Add {{ config.singular }}</button>
  </AdminPageHeader>
  <div class="admin-toolbar">
    <label class="admin-field search-field"><span class="sr-only">Search {{ config.title }}</span><i class="fa-solid fa-magnifying-glass"></i><input v-model="query" :placeholder="`Search ${config.title.toLowerCase()}…`"></label>
    <select v-model="status" aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="low">Low stock</option></select>
    <span class="result-count">{{ filteredRows.length }} results</span>
  </div>
  <div v-if="loading" class="admin-card table-skeleton"><div v-for="n in 7" :key="n"></div></div>
  <div v-else-if="error" class="admin-notice warning"><i class="fa-solid fa-lock"></i><div><strong>Backend connection required</strong><p>{{ error }}</p></div></div>
  <div v-else-if="filteredRows.length" class="admin-card admin-table-wrap">
    <table class="admin-table"><thead><tr><th v-for="column in config.columns" :key="column.key">{{ column.label }}</th><th><span class="sr-only">Actions</span></th></tr></thead>
      <tbody><tr v-for="row in paginated" :key="row.id">
        <td v-for="column in config.columns" :key="column.key" :data-label="column.label">
          <div v-if="column.key === 'name'" class="entity-cell"><img v-if="row.image" :src="row.image" alt=""><span v-else><i :class="config.icon"></i></span><div><strong>{{ display(row,column.key) }}</strong><small>{{ row.slug || row.sku || row.id }}</small></div></div>
          <span v-else-if="column.key === 'status'" class="status-pill" :class="row.status">{{ display(row,column.key) }}</span>
          <span v-else>{{ display(row,column.key) }}</span>
        </td>
        <td class="row-actions"><RouterLink v-if="resource === 'products'" :to="`/admin/products/${row.id}/edit`" aria-label="Inspect product"><i class="fa-regular fa-eye"></i></RouterLink><button disabled aria-label="More actions" title="Write actions require staff API"><i class="fa-solid fa-ellipsis"></i></button></td>
      </tr></tbody>
    </table>
    <div class="pagination"><span>Page {{ page }} of {{ totalPages }}</span><div><button :disabled="page === 1" @click="page--"><i class="fa-solid fa-chevron-left"></i></button><button :disabled="page === totalPages" @click="page++"><i class="fa-solid fa-chevron-right"></i></button></div></div>
  </div>
  <AdminEmptyState v-else :title="config.emptyTitle" :message="config.emptyMessage" :icon="config.icon" />
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { adminApi } from '@/services/adminApi';
import { normalizeProduct } from '@/services/normalizers';
import { mediaAPI } from '@/services/osimart';
import AdminPageHeader from '@/admin/components/AdminPageHeader.vue'; import AdminEmptyState from '@/admin/components/AdminEmptyState.vue';
const props = defineProps({ resource: { type:String, required:true } });
const query=ref(''); const status=ref(''); const rows=ref([]); const loading=ref(true); const error=ref(''); const page=ref(1); const perPage=10;
const definitions = {
 products:{title:'Products',singular:'product',description:'Search and inspect the live Osimart catalog.',columns:[['name','Product'],['category','Category'],['brand','Brand'],['price','Price'],['stock','Stock'],['status','Status']],icon:'fa-solid fa-box',create:true,exportable:true},
 categories:{title:'Categories',singular:'category',description:'Live catalog taxonomy and merchandising structure.',columns:[['name','Category'],['slug','Slug'],['count','Products'],['status','Status']],icon:'fa-solid fa-grid-2',create:true},
 brands:{title:'Brands',singular:'brand',description:'Brand identities currently exposed by Osimart.',columns:[['name','Brand'],['slug','Slug'],['count','Products'],['status','Status']],icon:'fa-solid fa-copyright',create:true},
 orders:{title:'Orders',singular:'order',description:'Fulfilment, payment and delivery operations.',columns:[['name','Order'],['customer','Customer'],['total','Total'],['status','Status']],icon:'fa-solid fa-receipt',exportable:true},
 customers:{title:'Customers',singular:'customer',description:'Customer profiles, segments and commerce history.',columns:[['name','Customer'],['contact','Contact'],['orders','Orders'],['spent','Total spent'],['status','Status']],icon:'fa-solid fa-users'},
 banners:{title:'Banners',singular:'banner',description:'Live storefront campaign artwork and calls to action.',columns:[['name','Banner'],['link','Destination'],['order','Position'],['status','Status']],icon:'fa-regular fa-image',create:true},
 promotions:{title:'Promotions',singular:'promotion',description:'Coupons, campaigns, limits and schedules.',columns:[['name','Promotion'],['discount','Discount'],['period','Period'],['status','Status']],icon:'fa-solid fa-tags',create:true},
 inventory:{title:'Inventory',singular:'adjustment',description:'Current product stock and replenishment signals.',columns:[['name','Product'],['sku','SKU'],['stock','Available'],['threshold','Threshold'],['status','Status']],icon:'fa-solid fa-warehouse',exportable:true},
 reviews:{title:'Reviews',singular:'review',description:'Moderation queue for verified customer feedback.',columns:[['name','Product'],['customer','Customer'],['rating','Rating'],['status','Status']],icon:'fa-regular fa-star'},
};
const config=computed(()=>{const raw=definitions[props.resource]; return {...raw,columns:raw.columns.map(([key,label])=>({key,label})),emptyTitle:`No ${raw.title.toLowerCase()} to show`,emptyMessage: ['orders','customers','promotions','reviews'].includes(props.resource)?'This private dataset is not exposed by the current public API. No demo records are fabricated.':'No records match the current filters.'};});
const productRows=(items)=>items.map(normalizeProduct).map((p)=>({...p,image:p.img,status:p.inStock?'active':'inactive',threshold:5}));
const genericRows=(items)=>items.map((r,index)=>({id:r.id||index,name:r.name||r.title||`Banner ${index+1}`,slug:r.slugified_name||r.slug||'',image:mediaAPI.getImageUrl(r.image||r.logo),count:r.product_count||r.products_count||'—',link:r.link||r.url||'—',order:r.order||r.position||index+1,status:r.is_active===false?'inactive':'active'}));
const load=async()=>{loading.value=true;error.value='';rows.value=[];try{if(props.resource==='products'||props.resource==='inventory')rows.value=productRows(await adminApi.listProducts());else if(props.resource==='categories')rows.value=genericRows(await adminApi.listCategories());else if(props.resource==='brands')rows.value=genericRows(await adminApi.listBrands());else if(props.resource==='banners')rows.value=genericRows(await adminApi.listBanners());else throw new Error(config.value.emptyMessage);}catch(value){error.value=value.message;}finally{loading.value=false;}};
onMounted(load); watch(()=>props.resource,()=>{page.value=1;load();});
const filteredRows=computed(()=>rows.value.filter((row)=>{const haystack=Object.values(row).filter((v)=>typeof v!=='object').join(' ').toLowerCase();const queryMatch=haystack.includes(query.value.toLowerCase());const statusMatch=!status.value||(status.value==='low'?Number(row.stock)>0&&Number(row.stock)<=5:row.status===status.value);return queryMatch&&statusMatch;}));
const totalPages=computed(()=>Math.max(1,Math.ceil(filteredRows.value.length/perPage))); const paginated=computed(()=>filteredRows.value.slice((page.value-1)*perPage,page.value*perPage)); watch([query,status],()=>page.value=1);
const display=(row,key)=>{const value=row[key];if(key==='price')return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value||0));if(key==='status')return value==='active'?'Active':value==='inactive'?'Inactive':String(value||'Unknown');return value??'—';};
const exportCsv=()=>{const columns=config.value.columns;const escape=(v)=>`"${String(v??'').replaceAll('"','""')}"`;const csv=[columns.map(c=>escape(c.label)).join(','),...filteredRows.value.map(r=>columns.map(c=>escape(display(r,c.key))).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`techhub-${props.resource}.csv`;link.click();URL.revokeObjectURL(url);};
</script>
