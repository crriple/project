<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api, __test__ } from '../services/mockApi'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import type { Prescription } from '../types'

const route = useRoute()
const store = useStore()
const data = ref<Prescription | null>(null)
const loading = ref(false)
const fulfilling = ref(false)

const load = async () => {
	loading.value = true
	try {
		const d = await api.getPrescriptionById(String(route.params.id))
		data.value = d ?? null
	} finally {
		loading.value = false
	}
}

onMounted(load)

const check = computed(() => {
	if (!data.value) return { ok: false, errors: ['无数据'] }
	return __test__.checkPrescription(data.value)
})

const fulfill = async () => {
	if (!data.value || fulfilling.value) return
	if (!check.value.ok) {
		ElMessage.error('存在校验错误，无法履约')
		return
	}
	fulfilling.value = true
	try {
		const res = await store.dispatch('fulfillPrescription', data.value.id)
		if (res?.success) {
			ElMessage.success('履约成功')
			await load()
		} else {
			ElMessage.error(res?.errors?.join('；') ?? '履约失败')
		}
	} finally {
		fulfilling.value = false
	}
}
</script>

<template>
	<el-card>
		<template #header>处方详情</template>
		<div v-if="loading">加载中...</div>
		<template v-else-if="data">
			<div class="mb-2">
				<b>处方ID：</b>{{ data.id }}　<b>患者：</b>{{ data.patientId }}　<b>药房：</b>{{ data.pharmacyId }}　<b>状态：</b>{{ data.status }}
			</div>
			<el-table :data="data.drugs">
				<el-table-column prop="drugId" label="药品ID" />
				<el-table-column prop="dosage" label="剂量" />
			</el-table>
			<div class="mt-2">
				<el-alert v-if="!check.ok" title="校验失败" type="error" :closable="false">
					<ul style="margin: 8px 0 0 16px;">
						<li v-for="(e, i) in check.errors" :key="i">{{ e }}</li>
					</ul>
				</el-alert>
			</div>
			<div class="mt-2">
				<el-button type="primary" :disabled="!check.ok || fulfilling" :loading="fulfilling" @click="fulfill">履约</el-button>
			</div>
		</template>
	</el-card>
</template>

<style scoped>
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
</style> 