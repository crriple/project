<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { Pharmacy } from '../types'
import { exportToExcel, importFromExcel, createTemplate } from '../services/excel'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const pharmacies = computed(() => store.state.pharmacies)

// 查询
const query = ref<{ name?: string }>({})
const filtered = computed(() => {
	const { name } = query.value
	return pharmacies.value.filter((p) => {
		if (name && !p.name.toLowerCase().includes(name.toLowerCase())) return false
		return true
	})
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 分页后的数据
const paginatedPharmacies = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return filtered.value.slice(start, end)
})

// 总数
const totalCount = computed(() => filtered.value.length)

// 新增
const addVisible = ref(false)
const addForm = ref<Pharmacy>({ id: '', name: '', allocatedDrugs: [] })
const addLoading = ref(false)

// 批量新增
const batchVisible = ref(false)
const batchRows = ref<Pharmacy[]>([])
const batchLoading = ref(false)

// 编辑
const editVisible = ref(false)
const editForm = ref<Partial<Pharmacy> & { id: string; name?: string }>({ id: '' })
const editLoading = ref(false)

// 列表加载状态
const listLoading = ref(false)

onMounted(async () => {
	await fetchPharmacies()
})

const fetchPharmacies = async () => {
	listLoading.value = true
	try {
		await store.dispatch('fetchPharmacies')
	} finally {
		listLoading.value = false
	}
}

const openAdd = () => { 
	addForm.value = { id: '', name: '', allocatedDrugs: [] }; 
	addVisible.value = true 
}

const submitAdd = async () => {
	addLoading.value = true
	try {
		await store.dispatch('createPharmacy', addForm.value)
		ElMessage.success('新增成功')
		addVisible.value = false
	} finally {
		addLoading.value = false
	}
}

const openEdit = (row: Pharmacy) => {
	editForm.value = { id: row.id, name: row.name }
	editVisible.value = true
}

const submitEdit = async () => {
	editLoading.value = true
	try {
		await store.dispatch('updatePharmacy', { id: editForm.value.id, name: editForm.value.name })
		ElMessage.success('药房更新成功')
		editVisible.value = false
	} finally {
		editLoading.value = false
	}
}

const doDelete = async (row: Pharmacy) => {
	try {
		await ElMessageBox.confirm(
			`确认要删除药房【${row.name}】(ID: ${row.id})吗？\n删除后数据不可修复，请谨慎操作！`,
			'删除确认',
			{
				type: 'warning',
				confirmButtonText: '确认删除',
				cancelButtonText: '取消',
				dangerouslyUseHTMLString: true,
			}
		)
		
		await store.dispatch('deletePharmacy', row.id)
		ElMessage.success('删除成功')
	} catch (e) {
		if (e !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

const resetQuery = () => { 
	query.value = {}
	// 重置分页
	currentPage.value = 1
}

// 导出 Excel
const onExport = async () => {
	try {
		if (filtered.value.length === 0) {
			ElMessage.warning('没有数据可导出')
			return
		}
		
		const rows = filtered.value.map((p) => ({ 
			ID: p.id, 
			名称: p.name,
			分配药品: p.allocatedDrugs.join(', ')
		}))
		await exportToExcel('药房列表.xlsx', rows)
		ElMessage.success('导出成功')
	} catch (e) {
		console.error('导出失败:', e)
		ElMessage.error('导出失败')
	}
}

// 导入 Excel
const onImportFile = async (file: File) => {
	try {
		const rows = await importFromExcel(file)
		
		if (rows.length === 0) {
			ElMessage.warning('Excel文件中没有数据')
			return false
		}
		
		// 验证导入数据的格式
		const validData: Omit<Pharmacy, 'id'>[] = []
		const errors: string[] = []
		
		rows.forEach((row: any, index) => {
			const rowNum = index + 2 // Excel行号从2开始（第1行是标题）
			
			// 检查必需字段
			if (!row['名称'] || !row['名称'].toString().trim()) {
				errors.push(`第${rowNum}行：缺少药房名称`)
				return
			}
			
			// 转换数据格式
			const pharmacyData: Omit<Pharmacy, 'id'> = {
				name: String(row['名称']).trim(),
				allocatedDrugs: []
			}
			
			validData.push(pharmacyData)
		})
		
		if (errors.length > 0) {
			ElMessage.error(`导入失败：\n${errors.join('\n')}`)
			return false
		}
		
		// 批量添加药房
		for (const pharmacyData of validData) {
			await store.dispatch('createPharmacy', pharmacyData)
		}
		
		ElMessage.success(`成功导入${validData.length}条数据`)
		
		// 刷新列表
		await fetchPharmacies()
		
		return false
	} catch (e) {
		console.error('导入失败:', e)
		ElMessage.error('导入失败：文件格式错误或数据无效')
		return false
	}
}

// 批量新增相关
const openBatchAdd = () => { 
	batchRows.value = [{ id: '', name: '', allocatedDrugs: [] }]; 
	batchVisible.value = true 
	// 清除校验错误
	validationErrors.value = {}
}

const addBatchRow = () => { 
	batchRows.value.push({ id: '', name: '', allocatedDrugs: [] }) 
}

const removeBatchRow = (idx: number) => { 
	if (batchRows.value.length > 1) {
		batchRows.value.splice(idx, 1) 
		// 清除对应行的校验错误
		delete validationErrors.value[idx]
		// 重新索引校验错误
		const newErrors: Record<number, Record<string, string>> = {}
		Object.keys(validationErrors.value).forEach(key => {
			const oldIndex = parseInt(key)
			if (oldIndex > idx) {
				newErrors[oldIndex - 1] = validationErrors.value[oldIndex]
			} else if (oldIndex < idx) {
				newErrors[oldIndex] = validationErrors.value[oldIndex]
			}
		})
		validationErrors.value = newErrors
	}
}

// 校验状态
const validationErrors = ref<Record<number, Record<string, string>>>({})

// 实时校验单个字段
const validateField = (rowIndex: number, field: string, value: any) => {
	const errors = validationErrors.value[rowIndex] || {}
	
	switch (field) {
		case 'id':
			if (!value.trim()) {
				errors[field] = '药房ID不能为空'
			} else if (value.trim().length < 2) {
				errors[field] = '至少需要2个字符'
			} else if (value.trim().length > 20) {
				errors[field] = '不能超过20个字符'
			} else {
				// 检查ID格式（只能包含字母、数字、下划线、连字符）
				const idPattern = /^[a-zA-Z0-9_-]+$/
				if (!idPattern.test(value.trim())) {
					errors[field] = '只能包含字母、数字、下划线和连字符'
				} else {
					delete errors[field]
				}
			}
			break
			
		case 'name':
			if (!value.trim()) {
				errors[field] = '药房名称不能为空'
			} else if (value.trim().length < 2) {
				errors[field] = '至少需要2个字符'
			} else if (value.trim().length > 100) {
				errors[field] = '不能超过100个字符'
			} else {
				// 检查名称是否包含特殊字符（只允许中文、英文、数字、空格、括号、点号）
				const namePattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）.]+$/
				if (!namePattern.test(value.trim())) {
					errors[field] = '包含不允许的特殊字符'
				} else {
					delete errors[field]
				}
			}
			break
	}
	
	if (Object.keys(errors).length === 0) {
		delete validationErrors.value[rowIndex]
	} else {
		validationErrors.value[rowIndex] = errors
	}
}

// 检查行是否有错误
const hasRowErrors = (rowIndex: number): boolean => {
	return validationErrors.value[rowIndex] && Object.keys(validationErrors.value[rowIndex]).length > 0
}

// 获取字段错误信息
const getFieldError = (rowIndex: number, field: string): string => {
	return validationErrors.value[rowIndex]?.[field] || ''
}

const validateBatchData = (): boolean => {
	// 检查是否有空行
	const emptyRows = batchRows.value.filter(row => 
		!row.id.trim() && !row.name.trim()
	)
	
	if (emptyRows.length > 0) {
		ElMessage.warning('检测到空行，已自动移除')
		batchRows.value = batchRows.value.filter(row => 
			row.id.trim() || row.name.trim()
		)
	}
	
	// 检查是否还有数据
	if (batchRows.value.length === 0) {
		ElMessage.error('请至少添加一条有效数据')
		return false
	}
	
	// 逐行验证数据
	for (let i = 0; i < batchRows.value.length; i++) {
		const row = batchRows.value[i]
		const rowNum = i + 1
		
		// 必填字段验证
		if (!row.id.trim()) {
			ElMessage.error(`第${rowNum}行：药房ID不能为空`)
			return false
		}
		
		if (!row.name.trim()) {
			ElMessage.error(`第${rowNum}行：药房名称不能为空`)
			return false
		}
		
		// 数据格式验证
		if (row.id.trim().length < 2) {
			ElMessage.error(`第${rowNum}行：药房ID至少需要2个字符`)
			return false
		}
		
		if (row.id.trim().length > 20) {
			ElMessage.error(`第${rowNum}行：药房ID不能超过20个字符`)
			return false
		}
		
		// 检查ID格式（只能包含字母、数字、下划线、连字符）
		const idPattern = /^[a-zA-Z0-9_-]+$/
		if (!idPattern.test(row.id.trim())) {
			ElMessage.error(`第${rowNum}行：药房ID只能包含字母、数字、下划线和连字符`)
			return false
		}
		
		if (row.name.trim().length < 2) {
			ElMessage.error(`第${rowNum}行：药房名称至少需要2个字符`)
			return false
		}
		
		if (row.name.trim().length > 100) {
			ElMessage.error(`第${rowNum}行：药房名称不能超过100个字符`)
			return false
		}
		
		// 检查名称是否包含特殊字符（只允许中文、英文、数字、空格、括号、点号）
		const namePattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s()（）.]+$/
		if (!namePattern.test(row.name.trim())) {
			ElMessage.error(`第${rowNum}行：药房名称包含不允许的特殊字符`)
			return false
		}
	}
	
	// 检查重复数据
	const ids = batchRows.value.map(row => row.id.trim())
	const uniqueIds = new Set(ids)
	
	if (ids.length !== uniqueIds.size) {
		ElMessage.error('检测到重复的药房ID，请检查')
		return false
	}
	
	const names = batchRows.value.map(row => row.name.trim())
	const uniqueNames = new Set(names)
	
	if (names.length !== uniqueNames.size) {
		ElMessage.error('检测到重复的药房名称，请检查')
		return false
	}
	
	return true
}

const submitBatch = async () => {
	if (!validateBatchData()) {
		return
	}

	batchLoading.value = true
	try {
		const valid = batchRows.value.filter((x) => x.id.trim() && x.name.trim())
		for (const item of valid) {
			await store.dispatch('createPharmacy', {
				id: item.id.trim(),
				name: item.name.trim(),
				allocatedDrugs: []
			})
		}
		ElMessage.success(`批量新增成功 ${valid.length} 条`)
		batchVisible.value = false
		// 刷新列表
		await store.dispatch('fetchPharmacies')
	} catch (error) {
		ElMessage.error('批量新增失败，请检查数据')
		console.error('批量新增失败:', error)
	} finally {
		batchLoading.value = false
	}
}

const downloadTemplate = () => {
	createTemplate('pharmacies')
	ElMessage.success('模板下载成功')
}
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>{{ t('pharmacies.title') }}</div>
				<div>
					<el-upload class="inline-upload" :auto-upload="false" :show-file-list="false" accept=".xls,.xlsx" :on-change="(f:any)=>onImportFile(f.raw)">
						<el-button>{{ t('common.import') }}</el-button>
					</el-upload>
					<el-button @click="onExport">{{ t('common.export') }}</el-button>
					<el-button @click="openBatchAdd">{{ t('common.batchAdd') }}</el-button>
					<el-button @click="downloadTemplate">{{ t('common.downloadTemplate') }}</el-button>
					<el-button type="primary" @click="openAdd">{{ t('pharmacies.addPharmacy') }}</el-button>
				</div>
			</div>
		</template>

		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item :label="t('drugs.name')"><el-input v-model="query.name" style="width: 240px" /></el-form-item>
			<el-form-item>
				<el-button type="primary">{{ t('common.query') }}</el-button>
				<el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
			</el-form-item>
		</el-form>

		<el-table v-loading="listLoading" :data="paginatedPharmacies" class="data-table">
			<el-table-column :prop="'id'" :label="t('drugs.id')" width="120" />
			<el-table-column :prop="'name'" :label="t('drugs.name')" width="200" />
			<el-table-column :label="t('common.operation')" width="280" fixed="right">
				<template #default="{ row }">
					<router-link :to="`/pharmacies/${row.id}`"><el-button type="primary" link>{{ t('common.details') }}</el-button></router-link>
					<el-divider direction="vertical" />
					<el-button type="primary" link @click="openEdit(row)">{{ t('common.edit') }}</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">{{ t('common.delete') }}</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination
			v-if="totalCount > pageSize"
			style="margin-top: 20px; text-align: right;"
			background
			layout="total, sizes, prev, pager, next"
			:total="totalCount"
			:page-size="pageSize"
			:page-sizes="[5, 10, 20, 50]"
			@size-change="pageSize = $event"
			@current-change="currentPage = $event"
		/>
	</el-card>

	<el-dialog v-model="addVisible" :title="t('pharmacies.addPharmacy')" width="520px">
		<el-form label-width="100px">
			<el-form-item :label="t('drugs.id')"><el-input v-model="addForm.id" /></el-form-item>
			<el-form-item :label="t('drugs.name')"><el-input v-model="addForm.name" /></el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="addLoading" @click="submitAdd">{{ t('common.confirm') }}</el-button>
		</template>
	</el-dialog>

	<el-dialog v-model="editVisible" :title="t('pharmacies.editPharmacy')" width="520px">
		<el-form label-width="100px">
			<el-form-item :label="t('drugs.id')"><el-input v-model="editForm.id" disabled /></el-form-item>
			<el-form-item :label="t('drugs.name')"><el-input v-model="editForm.name" /></el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="editLoading" @click="submitEdit">{{ t('common.save') }}</el-button>
		</template>
	</el-dialog>

	<!-- 批量新增弹窗 -->
	<el-dialog v-model="batchVisible" :title="t('pharmacies.batchAddPharmacy')" width="700px">
		<el-table :data="batchRows" border style="margin-bottom:12px">
			<el-table-column :label="t('drugs.id')" width="200">
				<template #default="{ $index }">
					<div>
						<el-input 
							v-model="batchRows[$index].id" 
							@blur="validateField($index, 'id', batchRows[$index].id)"
							:class="{ 'is-error': getFieldError($index, 'id') }"
						/>
						<span v-if="getFieldError($index, 'id')" class="error-message">
							{{ getFieldError($index, 'id') }}
						</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="t('drugs.name')">
				<template #default="{ $index }">
					<div>
						<el-input 
							v-model="batchRows[$index].name" 
							@blur="validateField($index, 'name', batchRows[$index].name)"
							:class="{ 'is-error': getFieldError($index, 'name') }"
						/>
						<span v-if="getFieldError($index, 'name')" class="error-message">
							{{ getFieldError($index, 'name') }}
						</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column :label="t('common.operation')" width="120" fixed="right">
				<template #default="{ $index }">
					<el-button link type="danger" @click="removeBatchRow($index)">{{ t('common.delete') }}</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-button @click="addBatchRow">{{ t('common.add') }}</el-button>
		<template #footer>
			<el-button @click="batchVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="batchLoading" @click="submitBatch">{{ t('common.confirm') }}</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }

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

/* 错误提示样式 */
.error-message {
	color: #f56c6c;
	font-size: 12px;
	margin-top: 4px;
	display: block;
}

:deep(.is-error .el-input__wrapper) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}
</style> 