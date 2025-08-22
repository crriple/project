<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import type { UserProfile } from '../types'
import { ElMessage } from 'element-plus'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const formRef = ref()
const form = reactive<UserProfile>({ username: '', password: '', phone: '', email: '' })
const saving = ref(false)
const loading = ref(false)

onMounted(async () => {
	await fetchUserProfile()
})

const fetchUserProfile = async () => {
	loading.value = true
	try {
		const data = await store.dispatch('fetchUserProfile')
		Object.assign(form, data)
	} catch (e) {
		// ignore
	} finally {
		loading.value = false
	}
}

const rules = {
	username: [{ required: true, message: '登录名必填', trigger: 'blur' }],
	password: [{ min: 6, message: '密码至少 6 位', trigger: 'blur' }],
	email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

const onSubmit = () => {
	formRef.value.validate(async (valid: boolean) => {
		if (!valid || saving.value) return
		try {
			saving.value = true
			await store.dispatch('updateUserProfile', { ...form })
			ElMessage.success('保存成功')
		} finally {
			saving.value = false
		}
	})
}
</script>

<template>
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card v-loading="loading">
		<template #header>{{ t('profile.title') }}</template>
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width:560px;">
			<el-form-item :label="t('profile.username')" prop="username">
				<el-input v-model="form.username" />
			</el-form-item>
			<el-form-item :label="t('profile.password')" prop="password">
				<el-input v-model="form.password" type="password" :placeholder="t('profile.passwordPlaceholder')" />
			</el-form-item>
			<el-form-item :label="t('profile.phone')">
				<el-input v-model="form.phone" />
			</el-form-item>
			<el-form-item :label="t('profile.email')" prop="email">
				<el-input v-model="form.email" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :loading="saving" @click="onSubmit">{{ t('common.save') }}</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<style scoped>
</style>



