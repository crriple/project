<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const filters = reactive<{ patientId?: string; pharmacyId?: string; success?: boolean | '' }>({ success: '' })

const list = computed(() => store.state.auditLogs)

const fetch = () => {
	const payload: any = {}
	if (filters.patientId) payload.patientId = filters.patientId
	if (filters.pharmacyId) payload.pharmacyId = filters.pharmacyId
	if (filters.success !== '') payload.success = filters.success
	store.dispatch('fetchAuditLogs', payload)
}

onMounted(fetch)
</script>

<template>
	<el-card>
		<template #header>审计日志</template>
		<el-form inline @submit.prevent>
			<el-form-item label="患者ID">
				<el-input v-model="filters.patientId" placeholder="P001" style="width: 200px" />
			</el-form-item>
			<el-form-item label="药房ID">
				<el-input v-model="filters.pharmacyId" placeholder="PH001" style="width: 200px" />
			</el-form-item>
			<el-form-item label="是否成功">
				<el-select v-model="filters.success" style="width: 160px">
					<el-option :value="''" label="全部" />
					<el-option :value="true" label="成功" />
					<el-option :value="false" label="失败" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="fetch">筛选</el-button>
			</el-form-item>
		</el-form>
		
		<el-table :data="list">
			<el-table-column prop="prescriptionId" label="处方ID" width="160" />
			<el-table-column prop="patientId" label="患者ID" width="140" />
			<el-table-column prop="pharmacyId" label="药房ID" width="140" />
			<el-table-column label="状态" width="120">
				<template #default="{ row }">
					<el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'">{{ row.status }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="失败原因">
				<template #default="{ row }">
					<span v-if="row.failureReasons?.length">{{ row.failureReasons.join('；') }}</span>
					<span v-else>—</span>
				</template>
			</el-table-column>
		</el-table>
	</el-card>
</template> 