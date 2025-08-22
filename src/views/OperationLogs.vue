<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const list = computed(() => store.state.operationLogs)
const loading = ref(false)

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

// 时间格式化函数
const formatTime = (timestamp: string | number) => {
	if (!timestamp) return '—'
	
	const date = new Date(timestamp)
	if (isNaN(date.getTime())) return '—'
	
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')
	
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 动作标签映射
const getActionTag = (action: string) => {
	const actionMap: Record<string, { type: string; text: string }> = {
		'CREATE': { type: 'success', text: t('operationLogs.actions.CREATE') },
		'UPDATE': { type: 'warning', text: t('operationLogs.actions.UPDATE') },
		'DELETE': { type: 'danger', text: t('operationLogs.actions.DELETE') },
		'LOGIN': { type: 'info', text: t('operationLogs.actions.LOGIN') },
		'LOGOUT': { type: 'info', text: t('operationLogs.actions.LOGOUT') },
		'EXPORT': { type: 'primary', text: t('operationLogs.actions.EXPORT') },
		'IMPORT': { type: 'primary', text: t('operationLogs.actions.IMPORT') },
		'VIEW': { type: 'info', text: t('operationLogs.actions.VIEW') },
		'FULFILL': { type: 'success', text: t('operationLogs.actions.FULFILL') },
		'APPROVE': { type: 'success', text: t('operationLogs.actions.APPROVE') },
		'REJECT': { type: 'danger', text: t('operationLogs.actions.REJECT') },
		'RESET': { type: 'warning', text: t('operationLogs.actions.RESET') },
		'BACKUP': { type: 'info', text: t('operationLogs.actions.BACKUP') },
		'RESTORE': { type: 'warning', text: t('operationLogs.actions.RESTORE') }
	}
	
	return actionMap[action] || { type: 'info', text: t('operationLogs.actions.UNKNOWN') }
}

onMounted(async () => {
	await fetchOperationLogs()
})

const fetchOperationLogs = async () => {
	loading.value = true
	try {
		await store.dispatch('fetchOperationLogs')
	} finally {
		loading.value = false
	}
}
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card>
		<template #header>{{ t('operationLogs.title') }}</template>
		<el-table v-loading="loading" :data="paginatedList" class="data-table">
			<el-table-column :label="t('operationLogs.time')" width="180">
				<template #default="{ row }">
					{{ formatTime(row.timestamp) }}
				</template>
			</el-table-column>
			<el-table-column :prop="'user'" :label="t('operationLogs.user')" width="120" />
			<el-table-column :label="t('operationLogs.action')" width="120">
				<template #default="{ row }">
					<el-tag :type="getActionTag(row.action).type" size="small">
						{{ getActionTag(row.action).text }}
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column :prop="'targetType'" :label="t('operationLogs.targetType')" width="140" />
			<el-table-column :prop="'targetId'" :label="t('operationLogs.targetId')" width="160" />
			<el-table-column :prop="'details'" :label="t('operationLogs.details')" min-width="200" />
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
.pagination-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid #f0f0f0;
}

/* 动作标签样式 */
:deep(.el-tag) {
	font-weight: 500;
	min-width: 50px;
	text-align: center;
}

:deep(.el-tag--success) {
	background-color: #f0f9ff;
	border-color: #0ea5e9;
	color: #0c4a6e;
}

:deep(.el-tag--warning) {
	background-color: #fffbeb;
	border-color: #f59e0b;
	color: #92400e;
}

:deep(.el-tag--danger) {
	background-color: #fef2f2;
	border-color: #ef4444;
	color: #991b1b;
}

:deep(.el-tag--info) {
	background-color: #f8fafc;
	border-color: #64748b;
	color: #334155;
}

:deep(.el-tag--primary) {
	background-color: #eff6ff;
	border-color: #3b82f6;
	color: #1e40af;
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

