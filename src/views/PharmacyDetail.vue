<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/mockApi'
import type { Pharmacy } from '../types'

const route = useRoute()
const pharmacy = ref<Pharmacy | null>(null)

onMounted(async () => {
	const data = await api.getPharmacyById(String(route.params.id))
	pharmacy.value = data ?? null
})
</script>

<template>
	<el-card>
		<template #header>药房详情</template>
		<div v-if="!pharmacy">加载中...</div>
		<template v-else>
			<div class="mb-2"><b>名称：</b>{{ pharmacy.name }}　<b>ID：</b>{{ pharmacy.id }}</div>
			<el-table :data="pharmacy.allocatedDrugs">
				<el-table-column prop="drugName" label="药品名称" />
				<el-table-column prop="drugId" label="药品ID" />
				<el-table-column prop="limit" label="分配限额" />
			</el-table>
		</template>
	</el-card>
</template>

<style scoped>
.mb-2 { margin-bottom: 8px; }
</style> 