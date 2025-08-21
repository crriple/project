<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { SystemSettings } from '../types'
import { ElMessage } from 'element-plus'

const store = useStore()
const formRef = ref()
const form = reactive<SystemSettings>({
	prescriptionStatusEditable: true,
	drugStatusEditable: true,
	smsReminderEnabled: false,
})
const saving = ref(false)

onMounted(async () => {
	const data = await store.dispatch('fetchSystemSettings')
	Object.assign(form, data)
})

const onSubmit = () => {
	formRef.value.validate?.(async () => {})
	;(async () => {
		try {
			saving.value = true
			await store.dispatch('updateSystemSettings', { ...form })
			ElMessage.success('已保存')
		} finally {
			saving.value = false
		}
	})()
}
</script>

<template>
	<el-card>
		<template #header>系统设置</template>
		<el-form ref="formRef" :model="form" label-width="200px" style="max-width:680px;">
			<el-form-item label="允许修改处方状态">
				<el-switch v-model="form.prescriptionStatusEditable" />
			</el-form-item>
			<el-form-item label="允许修改药品状态">
				<el-switch v-model="form.drugStatusEditable" />
			</el-form-item>
			<el-form-item label="开启短信提醒">
				<el-switch v-model="form.smsReminderEnabled" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<style scoped>
</style>


