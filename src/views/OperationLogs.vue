<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const filters = reactive<{ user?: string; action?: string; targetType?: string }>({})

const list = computed(() => {
	const { user, action, targetType } = filters
	return store.state.operationLogs.filter((x) => {
		if (user && !x.user.toLowerCase().includes(user.toLowerCase())) return false
		if (action && x.action !== action) return false
		if (targetType && x.targetType !== targetType) return false
		return true
	})
})

const fetch = () => {
	store.dispatch('fetchOperationLogs')
}

onMounted(fetch)

const reset = () => {
	filters.user = ''
	filters.action = ''
	filters.targetType = ''
}
</script>

<template>
	<el-card>
		<template #header>操作日志</template>
		<el-form inline @submit.prevent>
			<el-form-item label="用户"><el-input v-model="filters.user" style="width:200px" /></el-form-item>
			<el-form-item label="动作">
				<el-select v-model="filters.action" clearable style="width:180px">
					<el-option value="CREATE" label="CREATE" />
					<el-option value="UPDATE" label="UPDATE" />
					<el-option value="DELETE" label="DELETE" />
					<el-option value="FULFILL" label="FULFILL" />
					<el-option value="LOGIN" label="LOGIN" />
					<el-option value="LOGOUT" label="LOGOUT" />
				</el-select>
			</el-form-item>
			<el-form-item label="对象类型">
				<el-select v-model="filters.targetType" clearable style="width:200px">
					<el-option value="DRUG" label="DRUG" />
					<el-option value="PHARMACY" label="PHARMACY" />
					<el-option value="PRESCRIPTION" label="PRESCRIPTION" />
					<el-option value="FULFILLMENT" label="FULFILLMENT" />
					<el-option value="AUTH" label="AUTH" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="fetch">刷新</el-button>
				<el-button @click="reset">重置</el-button>
			</el-form-item>
		</el-form>

		<el-table :data="list">
			<el-table-column prop="timestamp" label="时间" width="200" />
			<el-table-column prop="user" label="用户" width="120" />
			<el-table-column prop="action" label="动作" width="120" />
			<el-table-column prop="targetType" label="对象类型" width="140" />
			<el-table-column prop="targetId" label="对象ID" width="160" />
			<el-table-column prop="details" label="详情" />
		</el-table>
	</el-card>
</template>

