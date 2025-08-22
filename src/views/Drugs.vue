<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import type { Drug } from '../types'
import { exportToExcel, importFromExcel } from '../services/excel'

const store = useStore()
const { t } = useI18n()

// 查询表单
const query = ref<{ id?: string; name?: string; manufacturer?: string }>({})

// 新增弹窗
const addVisible = ref(false)
const addFormRef = ref()
const addForm = ref<Drug>({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })
const addLoading = ref(false)

// 编辑弹窗
const editVisible = ref(false)
const editFormRef = ref()
const editForm = ref<Partial<Drug> & { id: string }>({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })
const editLoading = ref(false)

// 批量新增
const batchVisible = ref(false)
const batchRows = ref<Drug[]>([])
const batchLoading = ref(false)

// 列表加载状态
const listLoading = ref(false)

const rules = {
	id: [{ required: true, message: '必填', trigger: 'blur' }],
	name: [{ required: true, message: '必填', trigger: 'blur' }],
	manufacturer: [{ required: true, message: '必填', trigger: 'blur' }],
	batch: [{ required: true, message: '必填', trigger: 'blur' }],
	expiry: [{ required: true, message: '必填', trigger: 'change' }],
	stock: [
		{ required: true, message: '必填', trigger: 'blur' },
		{ type: 'number', min: 0, message: '不可小于 0', trigger: 'blur' },
	],
	limit: [
		{ required: true, message: '必填', trigger: 'blur' },
		{ type: 'number', min: 0, message: '不可小于 0', trigger: 'blur' },
	],
}

const drugs = computed(() => store.state.drugs)
const filtered = computed(() => {
	const list = drugs.value
	const { id, name, manufacturer } = query.value
	return list.filter((d) => {
		if (id && !d.id.toLowerCase().includes(id.toLowerCase())) return false
		if (name && !d.name.toLowerCase().includes(name.toLowerCase())) return false
		if (manufacturer && !d.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())) return false
		return true
	})
})

onMounted(async () => {
	await fetchDrugs()
})

const fetchDrugs = async () => {
	listLoading.value = true
	try {
		await store.dispatch('fetchDrugs')
	} finally {
		listLoading.value = false
	}
}

const isExpired = (date: string) => new Date(date).getTime() < Date.now()

const openAdd = () => {
	addForm.value = { id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 }
	addVisible.value = true
}

const submitAdd = () => {
	addFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		addLoading.value = true
		try {
			await store.dispatch('createDrug', { ...addForm.value })
			ElMessage.success('药品添加成功')
			addVisible.value = false
		} finally {
			addLoading.value = false
		}
	})
}

const openEdit = (row: Drug) => {
	editForm.value = { ...row }
	editVisible.value = true
}

const submitEdit = () => {
	editFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		editLoading.value = true
		try {
			await store.dispatch('updateDrug', { ...editForm.value })
			ElMessage.success('药品更新成功')
			editVisible.value = false
		} finally {
			editLoading.value = false
		}
	})
}

const doDelete = async (row: Drug) => {
	try {
		await ElMessageBox.confirm(
			`确认要删除药品【${row.name}】(ID: ${row.id})吗？\n删除后数据不可修复，请谨慎操作！`,
			'删除确认',
			{
				type: 'warning',
				confirmButtonText: '确认删除',
				cancelButtonText: '取消',
				dangerouslyUseHTMLString: true,
			}
		)
		
		await store.dispatch('deleteDrug', row.id)
		ElMessage.success('删除成功')
	} catch (e) {
		if (e !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

const resetQuery = () => {
	query.value = {}
}

// 导出 Excel
const onExport = async () => {
	try {
		const rows = filtered.value.map((d) => ({
			ID: d.id,
			名称: d.name,
			生产商: d.manufacturer,
			批号: d.batch,
			有效期: d.expiry,
			库存: d.stock,
			限额: d.limit,
		}))
		exportToExcel('药品列表.xlsx', rows as any)
		ElMessage.success('导出成功')
	} catch (e) {
		ElMessage.error('导出失败')
	}
}

// 导入 Excel
const onImportFile = async (file: File) => {
	try {
		const rows = await importFromExcel(file)
		const mapRow = (r: any): Drug => ({
			id: r.ID || r.id || '',
			name: r.名称 || r.name || '',
			manufacturer: r.生产商 || r.manufacturer || '',
			batch: r.批号 || r.batch || '',
			expiry: r.有效期 || r.expiry || '',
			stock: Number(r.库存 ?? r.stock ?? 0),
			limit: Number(r.限额 ?? r.limit ?? 0),
		})
		const items = rows.map(mapRow).filter((x) => x.id && x.name)
		for (const item of items) {
			await store.dispatch('createDrug', item)
		}
		ElMessage.success(`导入成功 ${items.length} 条`)
		return false as any
	} catch (e) {
		ElMessage.error('导入失败')
		return false as any
	}
}

// 批量新增
const openBatchAdd = () => {
	batchRows.value = [
		{ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 },
	]
	batchVisible.value = true
}

const addBatchRow = () => {
	batchRows.value.push({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })
}

const removeBatchRow = (idx: number) => {
	batchRows.value.splice(idx, 1)
}

const submitBatch = async () => {
	batchLoading.value = true
	try {
		const valid = batchRows.value.filter((x) => x.id && x.name)
		for (const item of valid) {
			await store.dispatch('createDrug', item)
		}
		ElMessage.success(`新增成功 ${valid.length} 条`)
		batchVisible.value = false
	} finally {
		batchLoading.value = false
	}
}
</script>

<template>
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>{{ t('drugs.title') }}</div>
				<div>
					<el-upload class="inline-upload" :auto-upload="false" :show-file-list="false" accept=".xls,.xlsx" :on-change="(f:any)=>onImportFile(f.raw)">
						<el-button>{{ t('common.import') }}</el-button>
					</el-upload>
					<el-button @click="onExport">{{ t('common.export') }}</el-button>
					<el-button @click="openBatchAdd">{{ t('common.batchAdd') }}</el-button>
					<el-button type="primary" @click="openAdd">{{ t('drugs.addDrug') }}</el-button>
				</div>
			</div>
		</template>

		<!-- 查询工具栏 -->
		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item :label="t('drugs.id')">
				<el-input v-model="query.id" :placeholder="t('drugs.searchPlaceholder.id')" style="width: 200px" />
			</el-form-item>
			<el-form-item :label="t('drugs.name')">
				<el-input v-model="query.name" :placeholder="t('drugs.searchPlaceholder.name')" style="width: 220px" />
			</el-form-item>
			<el-form-item :label="t('drugs.manufacturer')">
				<el-input v-model="query.manufacturer" :placeholder="t('drugs.searchPlaceholder.manufacturer')" style="width: 220px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary">{{ t('common.query') }}</el-button>
				<el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
			</el-form-item>
		</el-form>

		<!-- 列表 -->
		<el-table v-loading="listLoading" :data="filtered" style="width: 100%" stripe border>
			<el-table-column :prop="'id'" :label="t('drugs.id')" width="120" />
			<el-table-column :prop="'name'" :label="t('drugs.name')" />
			<el-table-column :prop="'limit'" :label="t('drugs.limit')" width="120" />
			<el-table-column :prop="'manufacturer'" :label="t('drugs.manufacturer')" />
			<el-table-column :prop="'batch'" :label="t('drugs.batch')" />
			<el-table-column :prop="'expiry'" :label="t('drugs.expiry')">
				<template #default="{ row }">
					<el-tag :type="isExpired(row.expiry) ? 'danger' : 'success'">{{ row.expiry }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column :prop="'stock'" :label="t('drugs.stock')" width="120" />
			<el-table-column :label="t('common.operation')" width="200" fixed="right">
				<template #default="{ row }">
					<el-button type="primary" link @click="openEdit(row)">{{ t('common.edit') }}</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">{{ t('common.delete') }}</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-card>

	<!-- 新增弹窗 -->
	<el-dialog v-model="addVisible" :title="t('drugs.addDrug')" width="680px">
		<el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.id')" prop="id"><el-input v-model="addForm.id" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item :label="t('drugs.name')" prop="name"><el-input v-model="addForm.name" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.manufacturer')" prop="manufacturer"><el-input v-model="addForm.manufacturer" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item :label="t('drugs.batch')" prop="batch"><el-input v-model="addForm.batch" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.expiry')" prop="expiry"><el-date-picker v-model="addForm.expiry" type="date" value-format="YYYY-MM-DD" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item :label="t('drugs.stock')" prop="stock"><el-input-number v-model="addForm.stock" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item :label="t('drugs.limit')" prop="limit"><el-input-number v-model="addForm.limit" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
			</el-row>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="addLoading" @click="submitAdd">{{ t('common.confirm') }}</el-button>
		</template>
	</el-dialog>

	<!-- 编辑弹窗 -->
	<el-dialog v-model="editVisible" :title="t('drugs.editDrug')" width="680px">
		<el-form :model="editForm" :rules="{ ...rules, id: [] }" ref="editFormRef" label-width="100px">
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.id')"><el-input v-model="editForm.id" disabled /></el-form-item></el-col>
				<el-col :span="12"><el-form-item :label="t('drugs.name')" prop="name"><el-input v-model="editForm.name" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.manufacturer')" prop="manufacturer"><el-input v-model="editForm.manufacturer" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item :label="t('drugs.batch')" prop="batch"><el-input v-model="editForm.batch" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item :label="t('drugs.expiry')" prop="expiry"><el-date-picker v-model="editForm.expiry" type="date" value-format="YYYY-MM-DD" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item :label="t('drugs.stock')" prop="stock"><el-input-number v-model="editForm.stock" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item :label="t('drugs.limit')" prop="limit"><el-input-number v-model="editForm.limit" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
			</el-row>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="editLoading" @click="submitEdit">{{ t('common.save') }}</el-button>
		</template>
	</el-dialog>

	<!-- 批量新增弹窗 -->
	<el-dialog v-model="batchVisible" :title="t('drugs.batchAddDrug')" width="900px">
		<div>
			<el-table :data="batchRows" border style="margin-bottom:12px">
				<el-table-column :label="t('drugs.id')" width="120">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].id" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.name')" width="160">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].name" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.manufacturer')" width="160">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].manufacturer" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.batch')" width="140">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].batch" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.expiry')" width="180">
					<template #default="{ $index }"><el-date-picker v-model="batchRows[$index].expiry" type="date" value-format="YYYY-MM-DD" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.stock')" width="120">
					<template #default="{ $index }"><el-input-number v-model="batchRows[$index].stock" :min="0" :step="1" :controls="false" /></template>
				</el-table-column>
				<el-table-column :label="t('drugs.limit')" width="120">
					<template #default="{ $index }"><el-input-number v-model="batchRows[$index].limit" :min="0" :step="1" :controls="false" /></template>
				</el-table-column>
				<el-table-column :label="t('common.operation')" width="100" fixed="right">
					<template #default="{ $index }">
						<el-button link type="danger" @click="removeBatchRow($index)">{{ t('common.delete') }}</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-button @click="addBatchRow">{{ t('common.add') }}</el-button>
		</div>
		<template #footer>
			<el-button @click="batchVisible = false">{{ t('common.cancel') }}</el-button>
			<el-button type="primary" :loading="batchLoading" @click="submitBatch">{{ t('common.confirm') }}</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>