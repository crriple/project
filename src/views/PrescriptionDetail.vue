<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '../components/Breadcrumb.vue'

const route = useRoute()
const store = useStore()
const { t } = useI18n()
const prescriptionId = route.params.id as string
const loading = ref(false)

const prescription = computed(() => store.state.prescriptions.find((p) => p.id === prescriptionId))
const drugs = computed(() => {
	if (!prescription.value) return []
	return store.state.drugs.filter((d) => prescription.value?.drugs.some((pd) => pd.drugId === d.id))
})

onMounted(async () => {
	await fetchData()
})

const fetchData = async () => {
	loading.value = true
	try {
		await Promise.all([
			store.dispatch('fetchPrescriptions'),
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
		<template #header>{{ t('prescriptions.title') }} - {{ t('common.details') }}</template>
		
		<!-- 添加数据检查 -->
		<div v-if="!prescription" class="no-data">
			<el-empty description="处方信息不存在" />
		</div>
		
		<!-- 处方信息 -->
		<el-descriptions v-else :column="2" border>
			<el-descriptions-item :label="t('drugs.id')">{{ prescription.id }}</el-descriptions-item>
			<el-descriptions-item :label="t('prescriptions.patientId')">{{ prescription.patientId }}</el-descriptions-item>
			<el-descriptions-item :label="t('prescriptions.pharmacyId')">{{ prescription.pharmacyId }}</el-descriptions-item>
			<el-descriptions-item :label="t('common.status')">{{ prescription.status }}</el-descriptions-item>
		</el-descriptions>
		
		<el-divider />
		
		<div class="mb-4">
			<h3>{{ t('drugs.title') }}</h3>
			<el-table :data="drugs" v-if="drugs.length > 0">
				<el-table-column :prop="'id'" :label="t('drugs.id')" width="120" />
				<el-table-column :prop="'name'" :label="t('drugs.name')" />
				<el-table-column :prop="'manufacturer'" :label="t('drugs.manufacturer')" />
				<el-table-column :prop="'stock'" :label="t('drugs.stock')" width="120" />
			</el-table>
			<el-empty v-else :description="'暂无药品信息'" />
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