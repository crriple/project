<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

const formRef = ref()
const form = reactive({ username: 'admin', password: '123456' })
const remember = ref(true)
const logging = ref(false)

const rules = {
	username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

onMounted(() => {
	store.dispatch('initAuth')
	const saved = localStorage.getItem('remember_username')
	if (saved) form.username = saved
	if (store.state.token) router.replace('/')
})

const onSubmit = () => {
	formRef.value.validate(async (valid: boolean) => {
		if (!valid || logging.value) return
		try {
			logging.value = true
			await store.dispatch('login', { username: form.username, password: form.password })
			if (remember.value) localStorage.setItem('remember_username', form.username)
			else localStorage.removeItem('remember_username')
			ElMessage.success('登录成功')
			router.replace('/')
		} catch (e) {
			ElMessage.error((e as Error).message)
		} finally {
			logging.value = false
		}
	})
}
</script>

<template>
	<div class="login-wrap">
		<el-card class="login-card">
			<div class="brand">
				<div class="title">医药处方履约系统</div>
				<div class="subtitle">Pharmaceutical Prescription Fulfillment</div>
			</div>
			<el-form ref="formRef" :model="form" :rules="rules" label-position="top" hide-required-asterisk @keyup.enter.native="onSubmit">
				<el-form-item label="用户名" prop="username">
					<el-input v-model="form.username" size="large" autocomplete="username">
						<template #prefix><el-icon><User /></el-icon></template>
					</el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="form.password" size="large" type="password" show-password autocomplete="current-password">
						<template #prefix><el-icon><Lock /></el-icon></template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<div class="actions">
						<el-checkbox v-model="remember">记住账号</el-checkbox>
						<a class="link" href="javascript:void(0)">忘记密码？</a>
					</div>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" size="large" round :loading="logging" @click="onSubmit" class="btn-full">登录</el-button>
				</el-form-item>
			</el-form>
			<div class="hint">演示账号：admin / 123456</div>
		</el-card>
	</div>
</template>

<style scoped>
.login-wrap{
	height:100vh;
	display:flex;
	align-items:center;
	justify-content:center;
	/* Show full image without cropping */
	background-color:#0b1f3a;
	background-image: linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)), url('/login-bg.jpg');
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover; /* keep entire image visible */
}
.login-card{
	width: 520px;
	background: rgba(255,255,255,0.9);
	backdrop-filter: blur(8px);
	border: 1px solid rgba(255,255,255,0.65);
	padding: 16px 18px 8px;
}
.brand{ text-align:center; margin-bottom: 6px; }
.title{ font-size: 20px; font-weight: 700; color:#0ea5a9; }
.subtitle{ font-size: 12px; color: #6b7280; }
.actions{ display:flex; justify-content:space-between; width:100%; }
.link{ color:#0ea5a9; font-size:12px; }
.btn-full{ width:100%; }
.hint{ color:#6b7280; font-size:12px; margin-top:6px; text-align:center; }
@media (max-width: 560px){
	.login-card{ width: 92vw; }
}
</style>
