<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Drug } from '../types'
import { exportToExcel, importFromExcel } from '../services/excel'

const store = useStore()

// 查询表单
const query = ref<{ id?: string; name?: string; manufacturer?: string }>({})

// 新增弹窗
const addVisible = ref(false)
const addFormRef = ref()
const addForm = ref<Drug>({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })

// 批量新增
const batchVisible = ref(false)
const batchRows = ref<Drug[]>([])

// 编辑弹窗
const editVisible = ref(false)
const editFormRef = ref()
const editForm = ref<Partial<Drug> & { id: string }>({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })

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

onMounted(() => {
	store.dispatch('fetchDrugs')
})

const isExpired = (date: string) => new Date(date).getTime() < Date.now()

const openAdd = () => {
	addForm.value = { id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 }
	addVisible.value = true
}
const submitAdd = () => {
	addFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		await store.dispatch('createDrug', { ...addForm.value })
		ElMessage.success('药品添加成功')
		addVisible.value = false
	})
}

const openEdit = (row: Drug) => {
	editForm.value = { ...row }
	editVisible.value = true
}
const submitEdit = () => {
	editFormRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		await store.dispatch('updateDrug', { ...editForm.value })
		ElMessage.success('药品更新成功')
		editVisible.value = false
	})
}

const doDelete = async (row: Drug) => {
	await ElMessageBox.confirm(`确定删除药品【${row.name}】(ID: ${row.id})？`, '删除确认', {
		type: 'warning',
		confirmButtonText: '删除',
		cancelButtonText: '取消',
	})
	await store.dispatch('deleteDrug', row.id)
	ElMessage.success('删除成功')
}

const resetQuery = () => {
	query.value = {}
}

// 导出 Excel
const onExport = () => {
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
}

// 导入 Excel
const onImportFile = async (file: File) => {
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
	const valid = batchRows.value.filter((x) => x.id && x.name)
	for (const item of valid) {
		await store.dispatch('createDrug', item)
	}
	ElMessage.success(`新增成功 ${valid.length} 条`)
	batchVisible.value = false
}
</script>

<template>
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>药品管理</div>
				<div>
					<el-upload class="inline-upload" :auto-upload="false" :show-file-list="false" accept=".xls,.xlsx" :on-change="(f:any)=>onImportFile(f.raw)">
						<el-button>导入Excel</el-button>
					</el-upload>
					<el-button @click="onExport">导出Excel</el-button>
					<el-button @click="openBatchAdd">批量新增</el-button>
					<el-button type="primary" @click="openAdd">新增药品</el-button>
				</div>
			</div>
		</template>

		<!-- 查询工具栏 -->
		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item label="ID">
				<el-input v-model="query.id" placeholder="如 D001" style="width: 200px" />
			</el-form-item>
			<el-form-item label="名称">
				<el-input v-model="query.name" placeholder="如 布洛芬" style="width: 220px" />
			</el-form-item>
			<el-form-item label="生产商">
				<el-input v-model="query.manufacturer" placeholder="如 ACME" style="width: 220px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary">查询</el-button>
				<el-button @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 列表 -->
		<el-table :data="filtered" style="width: 100%" stripe border>
			<el-table-column prop="id" label="ID" width="120" />
			<el-table-column prop="name" label="名称" />
			<el-table-column prop="limit" label="限额" width="120" />
			<el-table-column prop="manufacturer" label="生产商" />
			<el-table-column prop="batch" label="批号" />
			<el-table-column prop="expiry" label="有效期">
				<template #default="{ row }">
					<el-tag :type="isExpired(row.expiry) ? 'danger' : 'success'">{{ row.expiry }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="stock" label="库存" width="120" />
			<el-table-column label="操作" width="200" fixed="right">
				<template #default="{ row }">
					<el-button type="primary" link @click="openEdit(row)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-card>

	<!-- 新增弹窗 -->
	<el-dialog v-model="addVisible" title="新增药品" width="680px">
		<el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="ID" prop="id"><el-input v-model="addForm.id" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item label="名称" prop="name"><el-input v-model="addForm.name" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="生产商" prop="manufacturer"><el-input v-model="addForm.manufacturer" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item label="批号" prop="batch"><el-input v-model="addForm.batch" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="有效期" prop="expiry"><el-date-picker v-model="addForm.expiry" type="date" value-format="YYYY-MM-DD" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="库存" prop="stock"><el-input-number v-model="addForm.stock" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="限额" prop="limit"><el-input-number v-model="addForm.limit" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
			</el-row>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">取消</el-button>
			<el-button type="primary" @click="submitAdd">确定</el-button>
		</template>
	</el-dialog>

	<!-- 编辑弹窗 -->
	<el-dialog v-model="editVisible" title="编辑药品" width="680px">
		<el-form :model="editForm" :rules="{ ...rules, id: [] }" ref="editFormRef" label-width="100px">
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="ID"><el-input v-model="editForm.id" disabled /></el-form-item></el-col>
				<el-col :span="12"><el-form-item label="名称" prop="name"><el-input v-model="editForm.name" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="生产商" prop="manufacturer"><el-input v-model="editForm.manufacturer" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item label="批号" prop="batch"><el-input v-model="editForm.batch" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="有效期" prop="expiry"><el-date-picker v-model="editForm.expiry" type="date" value-format="YYYY-MM-DD" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="库存" prop="stock"><el-input-number v-model="editForm.stock" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="限额" prop="limit"><el-input-number v-model="editForm.limit" :min="0" :step="1" :controls="false" style="width: 100%" /></el-form-item></el-col>
			</el-row>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">取消</el-button>
			<el-button type="primary" @click="submitEdit">保存</el-button>
		</template>
	</el-dialog>

	<!-- 批量新增弹窗 -->
	<el-dialog v-model="batchVisible" title="批量新增药品" width="900px">
		<div>
			<el-table :data="batchRows" border style="margin-bottom:12px">
				<el-table-column label="ID" width="120">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].id" /></template>
				</el-table-column>
				<el-table-column label="名称" width="160">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].name" /></template>
				</el-table-column>
				<el-table-column label="生产商" width="160">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].manufacturer" /></template>
				</el-table-column>
				<el-table-column label="批号" width="140">
					<template #default="{ $index }"><el-input v-model="batchRows[$index].batch" /></template>
				</el-table-column>
				<el-table-column label="有效期" width="180">
					<template #default="{ $index }"><el-date-picker v-model="batchRows[$index].expiry" type="date" value-format="YYYY-MM-DD" /></template>
				</el-table-column>
				<el-table-column label="库存" width="120">
					<template #default="{ $index }"><el-input-number v-model="batchRows[$index].stock" :min="0" :step="1" :controls="false" /></template>
				</el-table-column>
				<el-table-column label="限额" width="120">
					<template #default="{ $index }"><el-input-number v-model="batchRows[$index].limit" :min="0" :step="1" :controls="false" /></template>
				</el-table-column>
				<el-table-column label="操作" width="100" fixed="right">
					<template #default="{ $index }">
						<el-button link type="danger" @click="removeBatchRow($index)">移除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-button @click="addBatchRow">新增一行</el-button>
		</div>
		<template #footer>
			<el-button @click="batchVisible = false">取消</el-button>
			<el-button type="primary" @click="submitBatch">提交</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>