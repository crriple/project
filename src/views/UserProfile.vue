<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import type { UserProfile } from '../types'
import { ElMessage } from 'element-plus'

const store = useStore()
const formRef = ref()
const form = reactive<UserProfile>({ username: '', password: '', phone: '', email: '' })
const saving = ref(false)

onMounted(async () => {
	try {
		const data = await store.dispatch('fetchUserProfile')
		Object.assign(form, data)
	} catch (e) {
		// ignore
	}
})

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
	<el-card>
		<template #header>修改信息</template>
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width:560px;">
			<el-form-item label="登录名" prop="username">
				<el-input v-model="form.username" />
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<el-input v-model="form.password" type="password" placeholder="不修改可留空" />
			</el-form-item>
			<el-form-item label="手机号">
				<el-input v-model="form.phone" />
			</el-form-item>
			<el-form-item label="邮箱" prop="email">
				<el-input v-model="form.email" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
			</el-form-item>
		</el-form>
	</el-card>
</template>

<style scoped>
</style>


