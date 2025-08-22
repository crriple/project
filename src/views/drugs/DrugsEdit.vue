<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { Drug } from '../../types'

const store = useStore()
const { t } = useI18n()

// 响应式数据
const visible = ref(false)
const editLoading = ref(false)
const formRef = ref()

// 表单数据
const form = reactive<Drug>({
	id: '',
	name: '',
	manufacturer: '',
	batch: '',
	expiry: '',
	stock: 0,
	limit: 0
})

// 表单验证规则
const rules = {
	name: [
		{ required: true, message: t('drugs.nameRequired'), trigger: 'blur' }
	],
	manufacturer: [
		{ required: true, message: t('drugs.manufacturerRequired'), trigger: 'blur' }
	],
	batch: [
		{ required: true, message: t('drugs.batchRequired'), trigger: 'blur' }
	],
	expiry: [
		{ required: true, message: t('drugs.expiryRequired'), trigger: 'change' }
	],
	stock: [
		{ required: true, message: t('drugs.stockRequired'), trigger: 'blur' },
		{ type: 'number', min: 0, message: t('drugs.stockMin'), trigger: 'blur' }
	],
	limit: [
		{ required: true, message: t('drugs.limitRequired'), trigger: 'blur' },
		{ type: 'number', min: 0, message: t('drugs.limitMin'), trigger: 'blur' }
	]
}

// 方法
const open = (drug: Drug) => {
	visible.value = true
	Object.assign(form, drug)
}

const close = () => {
	visible.value = false
	resetForm()
}

const resetForm = () => {
	form.id = ''
	form.name = ''
	form.manufacturer = ''
	form.batch = ''
	form.expiry = ''
	form.stock = 0
	form.limit = 0
	formRef.value?.clearValidate()
}

const handleSubmit = async () => {
	try {
		await formRef.value.validate()
		editLoading.value = true
		
		await store.dispatch('updateDrug', form)
		ElMessage.success(t('drugs.editSuccess'))
		close()
		emit('success')
	} catch (error) {
		ElMessage.error(t('drugs.editFailed'))
	} finally {
		editLoading.value = false
	}
}

// 事件
const emit = defineEmits<{
	success: []
}>()

// 暴露方法给父组件
defineExpose({
	open
})
</script>

<template>
	<el-dialog
		v-model="visible"
		:title="t('drugs.edit')"
		width="600px"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<el-form
			ref="formRef"
			:model="form"
			:rules="rules"
			label-width="100px"
		>
			<el-form-item :label="t('drugs.id')">
				<el-input
					v-model="form.id"
					disabled
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.name')" prop="name">
				<el-input
					v-model="form.name"
					:placeholder="t('drugs.namePlaceholder')"
					clearable
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.manufacturer')" prop="manufacturer">
				<el-input
					v-model="form.manufacturer"
					:placeholder="t('drugs.manufacturerPlaceholder')"
					clearable
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.batch')" prop="batch">
				<el-input
					v-model="form.batch"
					:placeholder="t('drugs.batchPlaceholder')"
					clearable
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.expiry')" prop="expiry">
				<el-date-picker
					v-model="form.expiry"
					type="date"
					:placeholder="t('drugs.expiryPlaceholder')"
					format="YYYY-MM-DD"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.stock')" prop="stock">
				<el-input-number
					v-model="form.stock"
					:min="0"
					:step="1"
					:controls="false"
					:placeholder="t('drugs.stockPlaceholder')"
					style="width: 100%"
				/>
			</el-form-item>
			
			<el-form-item :label="t('drugs.limit')" prop="limit">
				<el-input-number
					v-model="form.limit"
					:min="0"
					:step="1"
					:controls="false"
					:placeholder="t('drugs.limitPlaceholder')"
					style="width: 100%"
				/>
			</el-form-item>
		</el-form>
		
		<template #footer>
			<el-button @click="close">{{ t('common.cancel') }}</el-button>
			<el-button
				type="primary"
				:loading="editLoading"
				@click="handleSubmit"
			>
				{{ t('common.save') }}
			</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.el-form-item {
	margin-bottom: 20px;
}
</style>

