<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { importFromExcel } from '../../services/excel'
import type { Drug } from '../../types'

const store = useStore()
const { t } = useI18n()

// 响应式数据
const listLoading = ref(false)
const searchForm = ref({
	id: '',
	name: '',
	manufacturer: ''
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算属性
const drugs = computed(() => store.state.drugs)
const filteredDrugs = computed(() => {
	let result = drugs.value
	
	if (searchForm.value.id) {
		result = result.filter(d => d.id.toLowerCase().includes(searchForm.value.id.toLowerCase()))
	}
	if (searchForm.value.name) {
		result = result.filter(d => d.name.toLowerCase().includes(searchForm.value.name.toLowerCase()))
	}
	if (searchForm.value.manufacturer) {
		result = result.filter(d => d.manufacturer.toLowerCase().includes(searchForm.value.manufacturer.toLowerCase()))
	}
	
	return result
})

// 分页后的数据
const paginatedDrugs = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return filteredDrugs.value.slice(start, end)
})

// 总数
const totalCount = computed(() => filteredDrugs.value.length)

// 方法
const handleReset = () => {
	searchForm.value = {
		id: '',
		name: '',
		manufacturer: ''
	}
	// 重置分页
	currentPage.value = 1
}

// 分页相关方法
const handleCurrentChange = (page: number) => {
	currentPage.value = page
}

const handleSizeChange = (size: number) => {
	pageSize.value = size
	currentPage.value = 1 // 切换每页条数时重置到第一页
}

// 搜索时重置分页
const handleSearch = () => {
	currentPage.value = 1
}

const handleDelete = async (drug: Drug) => {
	try {
		await ElMessageBox.confirm(
			`确认要删除药品 ${drug.name} (${drug.id}) 吗？删除后数据不可恢复，请谨慎操作`,
			'确认删除',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
		)
		
		await store.dispatch('deleteDrug', drug.id)
		ElMessage.success('删除成功')
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

const handleEdit = (drug: Drug) => {
	// 触发编辑事件，由父组件处理
	emit('edit', drug)
}

const handleImportFile = async (file: any) => {
	try {
		console.log('导入文件:', file)
		
		if (!file || !file.raw) {
			ElMessage.error('请选择有效的Excel文件')
			return
		}
		
		// 验证文件类型
		const fileName = file.name || file.raw.name
		if (!fileName.match(/\.(xls|xlsx)$/i)) {
			ElMessage.error('请选择Excel文件(.xls或.xlsx)')
			return
		}
		
		// 调用父组件的导入方法
		emit('import', file.raw)
		
	} catch (error) {
		console.error('导入失败:', error)
		ElMessage.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'))
	}
}

// 事件
const emit = defineEmits<{
	edit: [drug: Drug]
	add: []
	export: []
	batchAdd: []
	downloadTemplate: []
	import: [file: File]
}>()

// 生命周期
onMounted(async () => {
	listLoading.value = true
	try {
		await store.dispatch('fetchDrugs')
	} finally {
		listLoading.value = false
	}
})
</script>

<template>
	<div class="drugs-list">
		<!-- 搜索表单 -->
		<el-card class="search-card">
			<el-form :model="searchForm" inline>
				<el-form-item :label="t('drugs.id')">
					<el-input
						v-model="searchForm.id"
						:placeholder="t('drugs.idPlaceholder')"
						clearable
						@keyup.enter="handleSearch"
					/>
				</el-form-item>
				<el-form-item :label="t('drugs.name')">
					<el-input
						v-model="searchForm.name"
						:placeholder="t('drugs.namePlaceholder')"
						clearable
						@keyup.enter="handleSearch"
					/>
				</el-form-item>
				<el-form-item :label="t('drugs.manufacturer')">
					<el-input
						v-model="searchForm.manufacturer"
						:placeholder="t('drugs.manufacturerPlaceholder')"
						clearable
						@keyup.enter="handleSearch"
					/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">
						{{ t('common.search') }}
					</el-button>
					<el-button @click="handleReset">
						{{ t('common.reset') }}
					</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 操作按钮 -->
		<el-card class="action-card">
			<div class="action-buttons">
				<el-button type="primary" @click="emit('add')">
					{{ t('drugs.add') }}
				</el-button>
				<el-upload 
					class="inline-upload" 
					:auto-upload="false" 
					:show-file-list="false" 
					accept=".xls,.xlsx" 
					:on-change="handleImportFile"
					:before-upload="() => false"
				>
					<el-button type="success">
						{{ t('drugs.importExcel') }}
					</el-button>
				</el-upload>
				<el-button type="warning" @click="emit('export')">
					{{ t('drugs.exportExcel') }}
				</el-button>
				<el-button type="info" @click="emit('batchAdd')">
					{{ t('drugs.batchAdd') }}
				</el-button>
				<el-button @click="emit('downloadTemplate')">
					{{ t('common.downloadTemplate') }}
				</el-button>
			</div>
		</el-card>

		<!-- 药品列表 -->
		<el-card class="list-card">
			<el-table
				:data="paginatedDrugs"
				v-loading="listLoading"
				style="width: 100%"
				:header-cell-style="{ background: '#f5f7fa' }"
				class="data-table"
			>
				<el-table-column prop="id" :label="t('drugs.id')" width="120" />
				<el-table-column prop="name" :label="t('drugs.name')" width="180" />
				<el-table-column prop="manufacturer" :label="t('drugs.manufacturer')" width="180" />
				<el-table-column prop="batch" :label="t('drugs.batch')" width="120" />
				<el-table-column prop="expiry" :label="t('drugs.expiry')" width="120" />
				<el-table-column prop="stock" :label="t('drugs.stock')" width="80" />
				<el-table-column prop="limit" :label="t('drugs.limit')" width="80" />
				<el-table-column :label="t('common.actions')" width="160" fixed="right">
					<template #default="{ row }">
						<el-button size="small" type="primary" @click="handleEdit(row)">
							{{ t('common.edit') }}
						</el-button>
						<el-button size="small" type="danger" @click="handleDelete(row)">
							{{ t('common.delete') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			
			<!-- 分页组件 -->
			<div class="pagination-wrapper">
				<el-pagination
					v-model:current-page="currentPage"
					v-model:page-size="pageSize"
					:page-sizes="[10, 20, 50, 100]"
					:total="totalCount"
					layout="total, sizes, prev, pager, next, jumper"
					@current-change="handleCurrentChange"
					@size-change="handleSizeChange"
				/>
			</div>
		</el-card>
	</div>
</template>

<style scoped>
.drugs-list {
	padding: 20px;
}

.search-card {
	margin-bottom: 20px;
}

.action-card {
	margin-bottom: 20px;
}

.action-buttons {
	display: flex;
	gap: 10px;
}

.list-card {
	margin-bottom: 20px;
}

.pagination-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid #f0f0f0;
}

/* 统一表格样式 */
:deep(.data-table) {
	border-radius: 8px;
	overflow: hidden;
}

:deep(.data-table .el-table__header) {
	background-color: #f5f7fa;
}

:deep(.data-table .el-table__header th) {
	background-color: #f5f7fa !important;
	color: #606266;
	font-weight: 600;
	border-bottom: 1px solid #ebeef5;
}

:deep(.data-table .el-table__body td) {
	border-bottom: 1px solid #f0f0f0;
}

:deep(.data-table .el-table__body tr:hover > td) {
	background-color: #f5f7fa;
}
</style>
