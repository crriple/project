<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const pharmacies = computed(() => store.state.pharmacies)

onMounted(() => {
	store.dispatch('fetchPharmacies')
})
</script>

<template>
	<el-card>
		<template #header>药房列表</template>
		<el-table :data="pharmacies">
			<el-table-column prop="id" label="ID" width="120" />
			<el-table-column prop="name" label="名称" />
			<el-table-column label="操作" width="120">
				<template #default="{ row }">
					<router-link :to="`/pharmacies/${row.id}`"><el-button type="primary" link>详情</el-button></router-link>
				</template>
			</el-table-column>
		</el-table>
	</el-card>
</template> 