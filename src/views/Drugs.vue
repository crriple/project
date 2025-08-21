<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import type { Drug } from '../types'

const store = useStore()
const form = ref<Drug>({ id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 })
const formRef = ref()

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

onMounted(() => {
	store.dispatch('fetchDrugs')
})

const isExpired = (date: string) => new Date(date).getTime() < Date.now()

const onSubmit = () => {
	formRef.value.validate(async (valid: boolean) => {
		if (!valid) return
		await store.dispatch('createDrug', { ...form.value })
		ElMessage.success('药品添加成功')
		form.value = { id: '', name: '', manufacturer: '', batch: '', expiry: '', stock: 0, limit: 0 }
	})
}
</script>

<template>
	<el-card>
		<template #header>药品管理</template>
		<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="mb-4">
			<el-row :gutter="12">
				<el-col :span="6"><el-form-item label="ID" prop="id"><el-input v-model="form.id" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="生产商" prop="manufacturer"><el-input v-model="form.manufacturer" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="批号" prop="batch"><el-input v-model="form.batch" /></el-form-item></el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="6"><el-form-item label="有效期" prop="expiry"><el-date-picker v-model="form.expiry" type="date" value-format="YYYY-MM-DD" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="库存" prop="stock"><el-input-number v-model="form.stock" :min="0" /></el-form-item></el-col>
				<el-col :span="6"><el-form-item label="限额" prop="limit"><el-input-number v-model="form.limit" :min="0" /></el-form-item></el-col>
				<el-col :span="6" class="flex items-end"><el-button type="primary" @click="onSubmit">添加</el-button></el-col>
			</el-row>
		</el-form>

		<el-table :data="drugs" style="width: 100%">
			<el-table-column prop="id" label="ID" width="100" />
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
		</el-table>
	</el-card>
</template>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.flex { display: flex; }
.items-end { align-items: end; }
</style> 