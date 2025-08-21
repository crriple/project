<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts'
import { Goods, OfficeBuilding, Document } from '@element-plus/icons-vue'

const store = useStore()
const drugCount = computed(() => store.state.drugs.length)
const pharmacyCount = computed(() => store.state.pharmacies.length)
const prescriptionCount = computed(() => store.state.prescriptions.length)

// 拉取数据
onMounted(() => {
	store.dispatch('fetchDrugs')
	store.dispatch('fetchPharmacies')
	store.dispatch('fetchPrescriptions')
	store.dispatch('fetchAuditLogs')
})

// 图表 refs
const barRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
let barChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

const topStockData = computed(() => {
	return [...store.state.drugs]
		.sort((a, b) => b.stock - a.stock)
		.slice(0, 5)
		.map((d) => ({ name: d.name, value: d.stock }))
})

const statusDist = computed(() => {
	const c = { PENDING: 0, FULFILLED: 0, FAILED: 0 }
	for (const p of store.state.prescriptions) {
		c[p.status as 'PENDING' | 'FULFILLED' | 'FAILED']++
	}
	return [
		{ name: 'PENDING', value: c.PENDING },
		{ name: 'FULFILLED', value: c.FULFILLED },
		{ name: 'FAILED', value: c.FAILED },
	]
})

function renderBar() {
	if (!barRef.value) return
	barChart = echarts.init(barRef.value)
	barChart.setOption({
		tooltip: { trigger: 'axis' },
		xAxis: { type: 'category', data: topStockData.value.map((i) => i.name) },
		yAxis: { type: 'value' },
		series: [{ type: 'bar', data: topStockData.value.map((i) => i.value), itemStyle: { color: '#3a7afe' } }],
		grid: { left: 16, right: 16, top: 24, bottom: 24 },
	})
}

function renderPie() {
	if (!pieRef.value) return
	pieChart = echarts.init(pieRef.value)
	pieChart.setOption({
		tooltip: { trigger: 'item' },
		legend: { bottom: 0 },
		series: [
			{
				name: '处方状态',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
				label: { show: false },
				emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
				data: statusDist.value,
			},
		],
	})
}

function refreshCharts() {
	barChart && barChart.setOption({
		xAxis: { data: topStockData.value.map((i) => i.name) },
		series: [{ data: topStockData.value.map((i) => i.value) }],
	})
	pieChart && pieChart.setOption({ series: [{ data: statusDist.value }] })
}

function resizeCharts() {
	barChart?.resize()
	pieChart?.resize()
}

onMounted(() => {
	renderBar()
	renderPie()
	window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', resizeCharts)
	barChart?.dispose(); pieChart?.dispose()
})

watch([topStockData, statusDist], () => refreshCharts())
</script>

<template>
	<el-card class="mb-4">
		<template #header>功能概览</template>
		<el-row :gutter="12" class="stat-row">
			<el-col :span="8">
				<el-statistic title="药品数量" :value="drugCount">
					<template #prefix>
						<el-icon class="stat-icon"><Goods /></el-icon>
					</template>
				</el-statistic>
			</el-col>
			<el-col :span="8">
				<el-statistic title="药房数量" :value="pharmacyCount">
					<template #prefix>
						<el-icon class="stat-icon"><OfficeBuilding /></el-icon>
					</template>
				</el-statistic>
			</el-col>
			<el-col :span="8">
				<el-statistic title="处方数量" :value="prescriptionCount">
					<template #prefix>
						<el-icon class="stat-icon"><Document /></el-icon>
					</template>
				</el-statistic>
			</el-col>
		</el-row>
		<div style="margin-top:12px; color:#666;">
			• 药品管理：查询/新增/编辑/删除、过期标记、表单校验<br/>
			• 药房管理：查看列表与详情、编辑/删除、分配药品展示<br/>
			• 处方管理：列表与详情、校验与履约、编辑/删除<br/>
			• 审计日志：按条件筛选结果、查看失败原因
		</div>
	</el-card>

	<el-row :gutter="12">
		<el-col :span="12">
			<el-card>
				<template #header>库存 Top5</template>
				<div ref="barRef" style="height:300px;"></div>
			</el-card>
		</el-col>
		<el-col :span="12">
			<el-card>
				<template #header>处方状态分布</template>
				<div ref="pieRef" style="height:300px;"></div>
			</el-card>
		</el-col>
	</el-row>
</template>

<style scoped>
.mb-4{ margin-bottom:16px; }
.stat-row :deep(.el-statistic__content){ display:flex; align-items:center; gap:6px; }
.stat-icon{ color:#3a7afe; margin-right:4px; }
</style>

