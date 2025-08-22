<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { SystemSettings } from '../types'
import { ElMessage } from 'element-plus'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const formRef = ref()
const form = reactive<SystemSettings>({
	prescriptionStatusEditable: true,
	drugStatusEditable: true,
	smsReminderEnabled: false,
})
const saving = ref(false)
const loading = ref(false)

onMounted(async () => {
	await fetchSystemSettings()
})

const fetchSystemSettings = async () => {
	loading.value = true
	try {
		const data = await store.dispatch('fetchSystemSettings')
		Object.assign(form, data)
	} finally {
		loading.value = false
	}
}

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
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card v-loading="loading">
		<template #header>{{ t('settings.title') }}</template>
		<el-form ref="formRef" :model="form" label-width="200px" style="max-width:680px;">
			<el-form-item :label="t('settings.prescriptionStatusEditable')">
				<el-switch v-model="form.prescriptionStatusEditable" />
			</el-form-item>
			<el-form-item :label="t('settings.drugStatusEditable')">
				<el-switch v-model="form.drugStatusEditable" />
			</el-form-item>
			<el-form-item :label="t('settings.smsReminderEnabled')">
				<el-switch v-model="form.smsReminderEnabled" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :loading="saving" @click="onSubmit">{{ t('common.save') }}</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<style scoped>
</style>



