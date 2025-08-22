<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { exportToExcel, importFromExcel, createTemplate } from '../../services/excel'
import DrugsList from './DrugsList.vue'
import DrugsCreate from './DrugsCreate.vue'
import DrugsEdit from './DrugsEdit.vue'
import DrugsBatchAdd from './DrugsBatchAdd.vue'
import Breadcrumb from '../../components/Breadcrumb.vue'
import type { Drug } from '../../types'

const { t } = useI18n()
const store = useStore()

// 子组件引用
const createRef = ref()
const editRef = ref()
const batchAddRef = ref()

// 当前编辑的药品
const currentDrug = ref<Drug | null>(null)

// 从store获取药品数据
const drugs = computed(() => store.state.drugs)

// 方法
const handleAdd = () => {
	createRef.value?.open()
}

const handleEdit = (drug: Drug) => {
	currentDrug.value = drug
	editRef.value?.open(drug)
}

const handleExport = async () => {
	try {
		if (drugs.value.length === 0) {
			ElMessage.warning('没有数据可导出')
			return
		}
		
		// 准备导出数据，移除不需要的字段
		const exportData = drugs.value.map(drug => ({
			ID: drug.id,
			名称: drug.name,
			生产商: drug.manufacturer,
			批号: drug.batch,
			有效期: drug.expiry,
			库存: drug.stock,
			限额: drug.limit
		}))
		
		await exportToExcel('药品列表.xlsx', exportData)
		ElMessage.success('导出成功')
	} catch (error) {
		console.error('导出失败:', error)
		ElMessage.error('导出失败')
	}
}

const handleImport = async (file: File) => {
	try {
		console.log('开始导入文件:', file.name, file.size)
		
		const data = await importFromExcel(file)
		console.log('解析的Excel数据:', data)
		
		if (data.length === 0) {
			ElMessage.warning('Excel文件中没有数据')
			return
		}
		
		// 验证导入数据的格式
		const validData: Omit<Drug, 'id'>[] = []
		const errors: string[] = []
		
		data.forEach((row, index) => {
			const rowNum = index + 2 // Excel行号从2开始（第1行是标题）
			console.log(`处理第${rowNum}行数据:`, row)
			
			// 检查必需字段
			if (!row['名称'] || !row['生产商'] || !row['批号']) {
				const errorMsg = `第${rowNum}行：缺少必需字段（名称、生产商、批号）`
				console.warn(errorMsg, row)
				errors.push(errorMsg)
				return
			}
			
			// 转换数据格式
			const drugData: Omit<Drug, 'id'> = {
				name: String(row['名称']),
				manufacturer: String(row['生产商']),
				batch: String(row['批号']),
				expiry: row['有效期'] ? String(row['有效期']) : '',
				stock: Number(row['库存']) || 0,
				limit: Number(row['限额']) || 0
			}
			
			console.log(`第${rowNum}行转换后的数据:`, drugData)
			validData.push(drugData)
		})
		
		if (errors.length > 0) {
			ElMessage.error(`导入失败：\n${errors.join('\n')}`)
			return
		}
		
		console.log('开始批量添加药品，有效数据:', validData)
		
		// 批量添加药品
		for (const drugData of validData) {
			await store.dispatch('createDrug', drugData)
		}
		
		ElMessage.success(`成功导入${validData.length}条数据`)
		
		// 刷新列表
		await store.dispatch('fetchDrugs')
		
	} catch (error) {
		console.error('导入失败:', error)
		ElMessage.error('导入失败：' + (error instanceof Error ? error.message : '文件格式错误或数据无效'))
	}
}

const handleBatchAdd = () => {
	batchAddRef.value?.open()
}

const handleDownloadTemplate = () => {
	createTemplate('drugs')
	ElMessage.success('模板下载成功')
}

const handleSuccess = () => {
	// 刷新列表
	store.dispatch('fetchDrugs')
}
</script>

<template>
	<div class="drugs-management">
		<!-- 面包屑导航 -->
		<Breadcrumb />
		
		<!-- 药品列表组件 -->
		<DrugsList
			@add="handleAdd"
			@edit="handleEdit"
			@export="handleExport"
			@import="handleImport"
			@batch-add="handleBatchAdd"
			@download-template="handleDownloadTemplate"
		/>
		
		<!-- 新增药品组件 -->
		<DrugsCreate
			ref="createRef"
			@success="handleSuccess"
		/>
		
		<!-- 编辑药品组件 -->
		<DrugsEdit
			ref="editRef"
			@success="handleSuccess"
		/>
		
		<!-- 批量新增药品组件 -->
		<DrugsBatchAdd
			ref="batchAddRef"
			@success="handleSuccess"
		/>
	</div>
</template>

<style scoped>
.drugs-management {
	height: 100%;
}
</style>
