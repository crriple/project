<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Pharmacy } from '../types'
import { exportToExcel, importFromExcel } from '../services/excel'

const store = useStore()
const pharmacies = computed(() => store.state.pharmacies)

// 查询
const query = ref<{ id?: string; name?: string }>({})
const filtered = computed(() => {
	const { id, name } = query.value
	return pharmacies.value.filter((p) => {
		if (id && !p.id.toLowerCase().includes(id.toLowerCase())) return false
		if (name && !p.name.toLowerCase().includes(name.toLowerCase())) return false
		return true
	})
})

// 新增
const addVisible = ref(false)
const addForm = ref<Pharmacy>({ id: '', name: '', allocatedDrugs: [] })

// 批量新增
const batchVisible = ref(false)
const batchRows = ref<Pharmacy[]>([])

// 编辑
const editVisible = ref(false)
const editForm = ref<Partial<Pharmacy> & { id: string; name?: string }>({ id: '' })

onMounted(() => {
	store.dispatch('fetchPharmacies')
})

const openAdd = () => { addForm.value = { id: '', name: '', allocatedDrugs: [] }; addVisible.value = true }
const submitAdd = async () => {
	await store.dispatch('createPharmacy', addForm.value)
	ElMessage.success('新增成功')
	addVisible.value = false
}

const openEdit = (row: Pharmacy) => {
	editForm.value = { id: row.id, name: row.name }
	editVisible.value = true
}
const submitEdit = async () => {
	await store.dispatch('updatePharmacy', { id: editForm.value.id, name: editForm.value.name })
	ElMessage.success('药房更新成功')
	editVisible.value = false
}

const doDelete = async (row: Pharmacy) => {
	await ElMessageBox.confirm(`确定删除药房【${row.name}】(ID: ${row.id})？`, '删除确认', {
		type: 'warning',
		confirmButtonText: '删除',
		cancelButtonText: '取消',
	})
	await store.dispatch('deletePharmacy', row.id)
	ElMessage.success('删除成功')
}

const resetQuery = () => { query.value = {} }

// 导出 Excel
const onExport = () => {
	const rows = filtered.value.map((p) => ({ ID: p.id, 名称: p.name }))
	exportToExcel('药房列表.xlsx', rows as any)
}

// 导入 Excel
const onImportFile = async (file: File) => {
	const rows = await importFromExcel(file)
	const items: Pharmacy[] = rows.map((r: any) => ({ id: r.ID || r.id || '', name: r.名称 || r.name || '', allocatedDrugs: [] }))
	const valid = items.filter((x) => x.id && x.name)
	for (const item of valid) {
		await store.dispatch('createPharmacy', item)
	}
	ElMessage.success(`导入成功 ${valid.length} 条`)
	return false as any
}

// 批量新增相关
const openBatchAdd = () => { batchRows.value = [{ id: '', name: '', allocatedDrugs: [] }]; batchVisible.value = true }
const addBatchRow = () => { batchRows.value.push({ id: '', name: '', allocatedDrugs: [] }) }
const removeBatchRow = (idx: number) => { batchRows.value.splice(idx, 1) }
const submitBatch = async () => {
	const valid = batchRows.value.filter((x) => x.id && x.name)
	for (const item of valid) await store.dispatch('createPharmacy', item)
	ElMessage.success(`新增成功 ${valid.length} 条`)
	batchVisible.value = false
}
</script>

<template>
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>药房管理</div>
				<div>
					<el-upload class="inline-upload" :auto-upload="false" :show-file-list="false" accept=".xls,.xlsx" :on-change="(f:any)=>onImportFile(f.raw)">
						<el-button>导入Excel</el-button>
					</el-upload>
					<el-button @click="onExport">导出Excel</el-button>
					<el-button @click="openBatchAdd">批量新增</el-button>
					<el-button type="primary" @click="openAdd">新增药房</el-button>
				</div>
			</div>
		</template>

		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item label="ID"><el-input v-model="query.id" style="width: 220px" /></el-form-item>
			<el-form-item label="名称"><el-input v-model="query.name" style="width: 240px" /></el-form-item>
			<el-form-item>
				<el-button type="primary">查询</el-button>
				<el-button @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="filtered">
			<el-table-column prop="id" label="ID" width="120" />
			<el-table-column prop="name" label="名称" />
			<el-table-column label="操作" width="260">
				<template #default="{ row }">
					<router-link :to="`/pharmacies/${row.id}`"><el-button type="primary" link>详情</el-button></router-link>
					<el-divider direction="vertical" />
					<el-button type="primary" link @click="openEdit(row)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-card>

	<el-dialog v-model="addVisible" title="新增药房" width="520px">
		<el-form label-width="100px">
			<el-form-item label="ID"><el-input v-model="addForm.id" /></el-form-item>
			<el-form-item label="名称"><el-input v-model="addForm.name" /></el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">取消</el-button>
			<el-button type="primary" @click="submitAdd">确定</el-button>
		</template>
	</el-dialog>

	<el-dialog v-model="editVisible" title="编辑药房" width="520px">
		<el-form label-width="100px">
			<el-form-item label="ID"><el-input v-model="editForm.id" disabled /></el-form-item>
			<el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">取消</el-button>
			<el-button type="primary" @click="submitEdit">保存</el-button>
		</template>
	</el-dialog>

	<!-- 批量新增弹窗 -->
	<el-dialog v-model="batchVisible" title="批量新增药房" width="700px">
		<el-table :data="batchRows" border style="margin-bottom:12px">
			<el-table-column label="ID" width="200">
				<template #default="{ $index }"><el-input v-model="batchRows[$index].id" /></template>
			</el-table-column>
			<el-table-column label="名称">
				<template #default="{ $index }"><el-input v-model="batchRows[$index].name" /></template>
			</el-table-column>
			<el-table-column label="操作" width="120" fixed="right">
				<template #default="{ $index }">
					<el-button link type="danger" @click="removeBatchRow($index)">移除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-button @click="addBatchRow">新增一行</el-button>
		<template #footer>
			<el-button @click="batchVisible = false">取消</el-button>
			<el-button type="primary" @click="submitBatch">提交</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style> 