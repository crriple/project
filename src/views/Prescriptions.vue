<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { Prescription } from '../types'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const prescriptions = computed(() => store.state.prescriptions)

// 查询
const query = ref<{ id?: string; patientId?: string; pharmacyId?: string }>({})
const filtered = computed(() => {
	const { id, patientId, pharmacyId } = query.value
	return prescriptions.value.filter((p) => {
		if (id && !p.id.toLowerCase().includes(id.toLowerCase())) return false
		if (patientId && !p.patientId.toLowerCase().includes(patientId.toLowerCase())) return false
		if (pharmacyId && !p.pharmacyId.toLowerCase().includes(pharmacyId.toLowerCase())) return false
		return true
	})
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 分页后的数据
const paginatedPrescriptions = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return filtered.value.slice(start, end)
})

// 总数
const totalCount = computed(() => filtered.value.length)

// 新增
const addVisible = ref(false)
const addForm = ref<Prescription>({ id: '', patientId: '', pharmacyId: '', drugs: [], status: 'PENDING' })
const addLoading = ref(false)

// 编辑
const editVisible = ref(false)
const editForm = ref<Partial<Prescription> & { id: string }>({ id: '' })
const editLoading = ref(false)

// 列表加载状态
const listLoading = ref(false)

onMounted(async () => {
	await fetchPrescriptions()
})

const fetchPrescriptions = async () => {
	listLoading.value = true
	try {
		await store.dispatch('fetchPrescriptions')
	} finally {
		listLoading.value = false
	}
}

const openAdd = () => { 
	addForm.value = { id: '', patientId: '', pharmacyId: '', drugs: [], status: 'PENDING' }; 
	addVisible.value = true 
}

const submitAdd = async () => {
	addLoading.value = true
	try {
		await store.dispatch('createPrescription', addForm.value)
		ElMessage.success('新增成功')
		addVisible.value = false
	} finally {
		addLoading.value = false
	}
}

const openEdit = (row: Prescription) => {
	editForm.value = { ...row }
	editVisible.value = true
}

const submitEdit = async () => {
	editLoading.value = true
	try {
		await store.dispatch('updatePrescriptionAction', { id: editForm.value.id, status: editForm.value.status })
		ElMessage.success('处方更新成功')
		editVisible.value = false
	} finally {
		editLoading.value = false
	}
}

const doDelete = async (row: Prescription) => {
	try {
		await ElMessageBox.confirm(
			`确认要删除处方【${row.id}】吗？\n删除后数据不可修复，请谨慎操作！`,
			'删除确认',
			{
				type: 'warning',
				confirmButtonText: '确认删除',
				cancelButtonText: '取消',
				dangerouslyUseHTMLString: true,
			}
		)
		
		await store.dispatch('deletePrescription', row.id)
		ElMessage.success('删除成功')
	} catch (e) {
		if (e !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

const doFulfill = async (row: Prescription) => {
	try {
		const res = await store.dispatch('fulfillPrescription', row.id)
		if (res.success) {
			ElMessage.success('履约成功')
		} else {
			ElMessage.error(`履约失败: ${res.errors?.join(', ')}`)
		}
	} catch (e) {
		ElMessage.error('履约失败')
	}
}

const resetQuery = () => { 
	query.value = {}
	// 重置分页
	currentPage.value = 1
}
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>{{ t('prescriptions.title') }}</div>
				<el-button type="primary" @click="openAdd">{{ t('common.add') }}</el-button>
			</div>
		</template>

		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item :label="t('drugs.id')"><el-input v-model="query.id" style="width: 200px" /></el-form-item>
			<el-form-item :label="t('prescriptions.patientId')"><el-input v-model="query.patientId" style="width: 200px" /></el-form-item>
			<el-form-item :label="t('prescriptions.pharmacyId')"><el-input v-model="query.pharmacyId" style="width: 200px" /></el-form-item>
			<el-form-item>
				<el-button type="primary">{{ t('common.query') }}</el-button>
				<el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
			</el-form-item>
		</el-form>

		<el-table v-loading="listLoading" :data="paginatedPrescriptions" class="data-table" style="width: 100%">
			<el-table-column :prop="'id'" :label="t('drugs.id')" width="120" />
			<el-table-column :prop="'patientId'" :label="t('prescriptions.patientId')" width="140" />
			<el-table-column :prop="'pharmacyId'" :label="t('prescriptions.pharmacyId')" width="140" />
			<el-table-column :prop="'status'" :label="t('common.status')" width="120" />
			<!-- 自适应占位列，用于填充剩余空间，避免右侧空白 -->
			<el-table-column />
			<el-table-column :label="t('common.operation')" width="320" fixed="right">
				<template #default="{ row }">
					<router-link :to="`/prescriptions/${row.id}`"><el-button type="primary" link>{{ t('common.details') }}</el-button></router-link>
					<el-divider direction="vertical" />
					<el-button type="primary" link @click="openEdit(row)">{{ t('common.edit') }}</el-button>
					<el-divider direction="vertical" />
					<el-button type="success" link @click="doFulfill(row)">{{ t('prescriptions.fulfill') }}</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">{{ t('common.delete') }}</el-button>
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

	<el-dialog v-model="addVisible" :title="t('common.add')" width="520px">
		<el-form label-width="100px">
			<el-form-item :label="t('drugs.id')"><el-input v-model="addForm.id" /></el-form-item>
			<el-form-item :label="t('prescriptions.patientId')"><el-input v-model="addForm.patientId" /></el-form-item>
			<el-form-item :label="t('prescriptions.pharmacyId')"><el-input v-model="addForm.pharmacyId" /></el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="addLoading" @click="submitAdd">{{ t('common.confirm') }}</el-button>
		</template>
	</el-dialog>

	<el-dialog v-model="editVisible" :title="t('common.edit')" width="520px">
		<el-form label-width="100px">
			<el-form-item :label="t('drugs.id')"><el-input v-model="editForm.id" disabled /></el-form-item>
			<el-form-item :label="t('common.status')">
				<el-select v-model="editForm.status">
					<el-option label="PENDING" value="PENDING" />
					<el-option label="FULFILLED" value="FULFILLED" />
					<el-option label="FAILED" value="FAILED" />
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="editLoading" @click="submitEdit">{{ t('common.save') }}</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }

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