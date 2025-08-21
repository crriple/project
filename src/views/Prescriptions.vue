<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Prescription } from '../types'

const store = useStore()
const list = computed(() => store.state.prescriptions)

// 查询
const query = ref<{ id?: string; patientId?: string; status?: string }>({})
const filtered = computed(() => {
	const { id, patientId, status } = query.value
	return list.value.filter((p) => {
		if (id && !p.id.toLowerCase().includes(id.toLowerCase())) return false
		if (patientId && !p.patientId.toLowerCase().includes(patientId.toLowerCase())) return false
		if (status && p.status !== status) return false
		return true
	})
})

// 新增
const addVisible = ref(false)
const addForm = ref<Prescription>({ id: '', patientId: '', pharmacyId: 'PH001', drugs: [], status: 'PENDING' })
const addDrugRow = () => addForm.value.drugs.push({ drugId: 'D001', dosage: 1 })
const removeDrugRow = (i: number) => addForm.value.drugs.splice(i, 1)

// 编辑
const editVisible = ref(false)
const editForm = ref<Partial<Prescription> & { id: string }>({ id: '' })

onMounted(() => {
	store.dispatch('fetchPrescriptions')
})

const openAdd = () => { addForm.value = { id: '', patientId: '', pharmacyId: 'PH001', drugs: [], status: 'PENDING' }; addVisible.value = true }
const submitAdd = async () => {
	if (!addForm.value.id || !addForm.value.patientId || addForm.value.drugs.length === 0) {
		ElMessage.error('请填写处方ID、患者ID并至少添加一个药品项')
		return
	}
	await store.dispatch('createPrescription', addForm.value)
	ElMessage.success('新增成功')
	addVisible.value = false
}

const openEdit = (row: Prescription) => {
	editForm.value = { id: row.id, patientId: row.patientId, status: row.status }
	editVisible.value = true
}
const submitEdit = async () => {
	await store.dispatch('updatePrescriptionAction', { id: editForm.value.id, patientId: editForm.value.patientId, status: editForm.value.status })
	ElMessage.success('处方更新成功')
	editVisible.value = false
}

const doDelete = async (row: Prescription) => {
	await ElMessageBox.confirm(`确定删除处方【${row.id}】？`, '删除确认', {
		type: 'warning',
		confirmButtonText: '删除',
		cancelButtonText: '取消',
	})
	await store.dispatch('deletePrescription', row.id)
	ElMessage.success('删除成功')
}

const resetQuery = () => { query.value = {} }
</script>

<template>
	<el-card>
		<template #header>
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
				<div>处方管理</div>
				<el-button type="primary" @click="openAdd">新增处方</el-button>
			</div>
		</template>

		<!-- 查询工具栏 -->
		<el-form :inline="true" :model="query" class="mb-4">
			<el-form-item label="处方ID"><el-input v-model="query.id" style="width: 200px" /></el-form-item>
			<el-form-item label="患者ID"><el-input v-model="query.patientId" style="width: 200px" /></el-form-item>
			<el-form-item label="状态">
				<el-select v-model="query.status" clearable style="width: 160px">
					<el-option value="PENDING" label="PENDING" />
					<el-option value="FULFILLED" label="FULFILLED" />
					<el-option value="FAILED" label="FAILED" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary">查询</el-button>
				<el-button @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="filtered">
			<el-table-column prop="id" label="处方ID" width="160" />
			<el-table-column prop="patientId" label="患者ID" width="140" />
			<el-table-column prop="status" label="状态" width="140" />
			<el-table-column label="操作" width="240">
				<template #default="{ row }">
					<router-link :to="`/prescriptions/${row.id}`"><el-button type="primary" link>详情</el-button></router-link>
					<el-divider direction="vertical" />
					<el-button type="primary" link @click="openEdit(row)">编辑</el-button>
					<el-divider direction="vertical" />
					<el-button type="danger" link @click="doDelete(row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-card>

	<!-- 新增弹窗 -->
	<el-dialog v-model="addVisible" title="新增处方" width="680px">
		<el-form label-width="100px">
			<el-row :gutter="12">
				<el-col :span="12"><el-form-item label="处方ID"><el-input v-model="addForm.id" /></el-form-item></el-col>
				<el-col :span="12"><el-form-item label="患者ID"><el-input v-model="addForm.patientId" /></el-form-item></el-col>
			</el-row>
			<el-form-item label="药房ID"><el-input v-model="addForm.pharmacyId" /></el-form-item>
			<el-divider />
			<el-form-item label="药品项">
				<el-button type="primary" @click="addDrugRow">添加一行</el-button>
			</el-form-item>
			<el-table :data="addForm.drugs" size="small" style="width:100%; margin-bottom: 8px;">
				<el-table-column label="药品ID" width="200">
					<template #default="{ row }"><el-input v-model="row.drugId" /></template>
				</el-table-column>
				<el-table-column label="剂量" width="180">
					<template #default="{ row }"><el-input-number v-model="row.dosage" :min="1" /></template>
				</el-table-column>
				<el-table-column label="操作" width="120">
					<template #default="{ $index }">
						<el-button type="danger" link @click="removeDrugRow($index)">移除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-form>
		<template #footer>
			<el-button @click="addVisible = false">取消</el-button>
			<el-button type="primary" @click="submitAdd">确定</el-button>
		</template>
	</el-dialog>

	<!-- 编辑弹窗 -->
	<el-dialog v-model="editVisible" title="编辑处方" width="520px">
		<el-form label-width="100px">
			<el-form-item label="处方ID"><el-input v-model="editForm.id" disabled /></el-form-item>
			<el-form-item label="患者ID"><el-input v-model="editForm.patientId" /></el-form-item>
			<el-form-item label="状态">
				<el-select v-model="editForm.status" style="width: 200px">
					<el-option value="PENDING" label="PENDING" />
					<el-option value="FULFILLED" label="FULFILLED" />
					<el-option value="FAILED" label="FAILED" />
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="editVisible = false">取消</el-button>
			<el-button type="primary" @click="submitEdit">保存</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style> 