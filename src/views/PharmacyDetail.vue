<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '../components/Breadcrumb.vue'

const route = useRoute()
const store = useStore()
const { t } = useI18n()
const pharmacyId = route.params.id as string
const loading = ref(false)

const pharmacy = computed(() => store.state.pharmacies.find((p) => p.id === pharmacyId))
const allocatedDrugs = computed(() => {
	if (!pharmacy.value) return []
	return store.state.drugs.filter((d) => pharmacy.value?.allocatedDrugs.includes(d.id))
})

onMounted(async () => {
	await fetchData()
})

const fetchData = async () => {
	loading.value = true
	try {
		await Promise.all([
			store.dispatch('fetchPharmacies'),
			store.dispatch('fetchDrugs')
		])
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card v-loading="loading">
		<template #header>{{ t('pharmacies.title') }} - {{ t('common.details') }}</template>
		
		<!-- 添加数据检查 -->
		<div v-if="!pharmacy" class="no-data">
			<el-empty description="药房信息不存在" />
		</div>
		
		<!-- 药房信息 -->
		<el-descriptions v-else :column="2" border>
			<el-descriptions-item :label="t('drugs.id')">{{ pharmacy.id }}</el-descriptions-item>
			<el-descriptions-item :label="t('drugs.name')">{{ pharmacy.name }}</el-descriptions-item>
		</el-descriptions>
		
		<el-divider />
		
		<div class="mb-4">
			<h3>{{ t('drugs.title') }}</h3>
			<el-table :data="allocatedDrugs" v-if="allocatedDrugs.length > 0">
				<el-table-column :prop="'id'" :label="t('drugs.id')" width="120" />
				<el-table-column :prop="'name'" :label="t('drugs.name')" />
				<el-table-column :prop="'manufacturer'" :label="t('drugs.manufacturer')" />
				<el-table-column :prop="'stock'" :label="t('drugs.stock')" width="120" />
			</el-table>
			<el-empty v-else :description="'暂无分配药品'" />
		</div>
	</el-card>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }

.no-data {
	text-align: center;
	padding: 40px 0;
}
</style> 