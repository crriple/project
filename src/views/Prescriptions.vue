<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const list = computed(() => store.state.prescriptions)

onMounted(() => {
	store.dispatch('fetchPrescriptions')
})
</script>

<template>
	<el-card>
		<template #header>处方列表</template>
		<el-table :data="list">
			<el-table-column prop="id" label="处方ID" width="160" />
			<el-table-column prop="patientId" label="患者ID" width="140" />
			<el-table-column prop="status" label="状态" width="140" />
			<el-table-column label="操作" width="140">
				<template #default="{ row }">
					<router-link :to="`/prescriptions/${row.id}`"><el-button type="primary" link>详情</el-button></router-link>
				</template>
			</el-table-column>
		</el-table>
	</el-card>
</template> 