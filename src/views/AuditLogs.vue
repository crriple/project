<script setup lang="ts">
import { onMounted, reactive, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const filters = reactive<{ patientId?: string; pharmacyId?: string; success?: boolean | '' }>({ success: '' })
const loading = ref(false)

const list = computed(() => store.state.auditLogs)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 分页后的数据
const paginatedList = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return list.value.slice(start, end)
})

// 总数
const totalCount = computed(() => list.value.length)

const fetch = async () => {
	loading.value = true
	try {
		const payload: any = {}
		if (filters.patientId) payload.patientId = filters.patientId
		if (filters.pharmacyId) payload.pharmacyId = filters.pharmacyId
		if (filters.success !== '') payload.success = filters.success
		await store.dispatch('fetchAuditLogs', payload)
	} finally {
		loading.value = false
	}
}

onMounted(fetch)
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card class="mb-4">
		<template #header>{{ t('auditLogs.title') }}</template>
		<el-form inline @submit.prevent>
			<el-form-item :label="t('auditLogs.patientId')">
				<el-input v-model="filters.patientId" placeholder="P001" style="width: 200px" />
			</el-form-item>
			<el-form-item :label="t('auditLogs.pharmacyId')">
				<el-input v-model="filters.pharmacyId" placeholder="PH001" style="width: 200px" />
			</el-form-item>
			<el-form-item :label="t('common.status')">
				<el-select v-model="filters.success" style="width: 160px">
					<el-option :value="''" :label="t('auditLogs.all')" />
					<el-option :value="true" :label="t('auditLogs.success')" />
					<el-option :value="false" :label="t('auditLogs.failed')" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :loading="loading" @click="fetch">{{ t('common.query') }}</el-button>
			</el-form-item>
		</el-form>
		
		<el-table v-loading="loading" :data="paginatedList" class="data-table">
			<el-table-column :prop="'prescriptionId'" :label="t('auditLogs.prescriptionId')" width="160" />
			<el-table-column :prop="'patientId'" :label="t('auditLogs.patientId')" width="140" />
			<el-table-column :prop="'pharmacyId'" :label="t('auditLogs.pharmacyId')" width="140" />
			<el-table-column :label="t('common.status')" width="120">
				<template #default="{ row }">
					<el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'">{{ row.status === 'SUCCESS' ? t('auditLogs.success') : t('auditLogs.failed') }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column :label="t('auditLogs.failureReasons')" min-width="200">
				<template #default="{ row }">
					<span v-if="row.failureReasons?.length">{{ row.failureReasons.join('；') }}</span>
					<span v-else>—</span>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 分页组件 -->
		<div class="pagination-wrapper">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="pageSize"
				:page-sizes="[10, 20, 50, 100]"
				:total="totalCount"
				layout="total, sizes, prev, pager, next, jumper"
				@current-change="currentPage = $event"
				@size-change="(size) => { pageSize = size; currentPage = 1 }"
			/>
		</div>
	</el-card>
</template>

<style scoped>
.mb-4{ margin-bottom: 16px; }

.pagination-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid #f0f0f0;
}

/* 统一表格样式 */
:deep(.data-table) {
	border-radius: 8px;
	overflow: hidden;
}

:deep(.data-table .el-table__header) {
	background-color: #f5f7fa;
}

:deep(.data-table .el-table__header th) {
	background-color: #f5f7fa !important;
	color: #606266;
	font-weight: 600;
	border-bottom: 1px solid #ebeef5;
}

:deep(.data-table .el-table__body td) {
	border-bottom: 1px solid #f0f0f0;
}

:deep(.data-table .el-table__body tr:hover > td) {
	background-color: #f5f7fa;
}
</style> 