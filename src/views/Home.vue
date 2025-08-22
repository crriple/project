<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { Goods, OfficeBuilding, Document, List } from '@element-plus/icons-vue'
import Breadcrumb from '../components/Breadcrumb.vue'

const store = useStore()
const { t } = useI18n()
const drugCount = computed(() => store.state.drugs.length)
const pharmacyCount = computed(() => store.state.pharmacies.length)
const prescriptionCount = computed(() => store.state.prescriptions.length)
const loading = ref(false)

// 拉取数据
onMounted(async () => {
	await fetchData()
})

const fetchData = async () => {
	loading.value = true
	try {
		await Promise.all([
			store.dispatch('fetchDrugs'),
			store.dispatch('fetchPharmacies'),
			store.dispatch('fetchPrescriptions'),
			store.dispatch('fetchAuditLogs')
		])
	} finally {
		loading.value = false
	}
}

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
	<!-- 面包屑导航 -->
	<Breadcrumb />
	
	<el-card class="mb-4" v-loading="loading">
		<template #header>{{ t('home.overview') }}</template>
		<el-row :gutter="24" class="stat-row">
			<el-col :span="8">
				<div class="stat-card">
					<div class="stat-icon-wrapper drugs">
						<el-icon class="stat-icon"><Goods /></el-icon>
					</div>
					<div class="stat-content">
						<div class="stat-value">{{ drugCount }}</div>
						<div class="stat-title">{{ t('home.drugCount') }}</div>
					</div>
				</div>
			</el-col>
			<el-col :span="8">
				<div class="stat-card">
					<div class="stat-icon-wrapper pharmacies">
						<el-icon class="stat-icon"><OfficeBuilding /></el-icon>
					</div>
					<div class="stat-content">
						<div class="stat-value">{{ pharmacyCount }}</div>
						<div class="stat-title">{{ t('home.pharmacyCount') }}</div>
					</div>
				</div>
			</el-col>
			<el-col :span="8">
				<div class="stat-card">
					<div class="stat-icon-wrapper prescriptions">
						<el-icon class="stat-icon"><Document /></el-icon>
					</div>
					<div class="stat-content">
						<div class="stat-value">{{ prescriptionCount }}</div>
						<div class="stat-title">{{ t('home.prescriptionCount') }}</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<div class="features-section">
			<div class="features-title">功能特性</div>
			<div class="features-grid">
				<div class="feature-item">
					<el-icon class="feature-icon drugs"><Goods /></el-icon>
					<div class="feature-text">{{ t('home.features.drugs') }}</div>
				</div>
				<div class="feature-item">
					<el-icon class="feature-icon pharmacies"><OfficeBuilding /></el-icon>
					<div class="feature-text">{{ t('home.features.pharmacies') }}</div>
				</div>
				<div class="feature-item">
					<el-icon class="feature-icon prescriptions"><Document /></el-icon>
					<div class="feature-text">{{ t('home.features.prescriptions') }}</div>
				</div>
				<div class="feature-item">
					<el-icon class="feature-icon audit"><List /></el-icon>
					<div class="feature-text">{{ t('home.features.auditLogs') }}</div>
				</div>
			</div>
		</div>
	</el-card>

	<el-row :gutter="24">
		<el-col :span="12">
			<el-card>
				<template #header>{{ t('home.stockTop5') }}</template>
				<div ref="barRef" style="height:300px;"></div>
			</el-card>
		</el-col>
		<el-col :span="12">
			<el-card>
				<template #header>{{ t('home.prescriptionStatus') }}</template>
				<div ref="pieRef" style="height:300px;"></div>
			</el-card>
		</el-col>
	</el-row>
</template>

<style scoped>
.mb-4{ margin-bottom: 24px; }

.stat-row {
	margin-bottom: 32px;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 24px;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 16px;
	border: 1px solid #e2e8f0;
	transition: all 0.3s ease;
}

.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
	width: 64px;
	height: 64px;
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20px;
	flex-shrink: 0;
}

.stat-icon-wrapper.drugs {
	background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon-wrapper.pharmacies {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon-wrapper.prescriptions {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon {
	font-size: 28px;
	color: white;
}

.stat-content {
	flex: 1;
}

.stat-value {
	font-size: 32px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 8px;
	line-height: 1;
}

.stat-title {
	font-size: 14px;
	color: #64748b;
	font-weight: 500;
}

.features-section {
	margin-top: 32px;
}

.features-title {
	font-size: 18px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 20px;
	text-align: center;
}

.features-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20px;
}

.feature-item {
	display: flex;
	align-items: center;
	padding: 20px;
	background: #f8fafc;
	border-radius: 12px;
	border: 1px solid #e2e8f0;
	transition: all 0.3s ease;
}

.feature-item:hover {
	background: #f1f5f9;
	transform: translateX(4px);
}

.feature-icon {
	font-size: 24px;
	margin-right: 16px;
	flex-shrink: 0;
}

.feature-icon.drugs {
	color: #3b82f6;
}

.feature-icon.pharmacies {
	color: #10b981;
}

.feature-icon.prescriptions {
	color: #f59e0b;
}

.feature-icon.audit {
	color: #8b5cf6;
}

.feature-text {
	font-size: 14px;
	color: #475569;
	line-height: 1.5;
}
</style>

