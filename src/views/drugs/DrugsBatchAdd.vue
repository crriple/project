<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { Drug } from '../../types'

const store = useStore()
const { t } = useI18n()

// 响应式数据
const visible = ref(false)
const batchLoading = ref(false)
const tableRef = ref()

// 校验状态
const validationErrors = ref<Record<number, Record<string, string>>>({})

// 批量数据
const batchRows = ref<Omit<Drug, 'id'>[]>([
	{
		name: '',
		manufacturer: '',
		batch: '',
		expiry: '',
		stock: 0,
		limit: 0
	}
])

// 方法
const open = () => {
	visible.value = true
	resetBatchData()
}

const close = () => {
	visible.value = false
	resetBatchData()
}

const resetBatchData = () => {
	batchRows.value = [
		{
			name: '',
			manufacturer: '',
			batch: '',
			expiry: '',
			stock: 0,
			limit: 0
		}
	]
}

const addBatchRow = () => {
	batchRows.value.push({
		name: '',
		manufacturer: '',
		batch: '',
		expiry: '',
		stock: 0,
		limit: 0
	})
}

const removeBatchRow = (index: number) => {
	if (batchRows.value.length > 1) {
		batchRows.value.splice(index, 1)
		// 清除对应行的校验错误
		delete validationErrors.value[index]
		// 重新索引校验错误
		const newErrors: Record<number, Record<string, string>> = {}
		Object.keys(validationErrors.value).forEach(key => {
			const oldIndex = parseInt(key)
			if (oldIndex > index) {
				newErrors[oldIndex - 1] = validationErrors.value[oldIndex]
			} else if (oldIndex < index) {
				newErrors[oldIndex] = validationErrors.value[oldIndex]
			}
		})
		validationErrors.value = newErrors
	}
}

// 实时校验单个字段
const validateField = (rowIndex: number, field: string, value: any) => {
	const errors = validationErrors.value[rowIndex] || {}
	
	switch (field) {
		case 'name':
			if (!value.trim()) {
				errors[field] = '药品名称不能为空'
			} else if (value.trim().length < 2) {
				errors[field] = '至少需要2个字符'
			} else if (value.trim().length > 50) {
				errors[field] = '不能超过50个字符'
			} else {
				delete errors[field]
			}
			break
			
		case 'manufacturer':
			if (!value.trim()) {
				errors[field] = '生产商不能为空'
			} else if (value.trim().length < 2) {
				errors[field] = '至少需要2个字符'
			} else if (value.trim().length > 100) {
				errors[field] = '不能超过100个字符'
			} else {
				delete errors[field]
			}
			break
			
		case 'batch':
			if (!value.trim()) {
				errors[field] = '批号不能为空'
			} else if (value.trim().length < 3) {
				errors[field] = '至少需要3个字符'
			} else if (value.trim().length > 30) {
				errors[field] = '不能超过30个字符'
			} else {
				delete errors[field]
			}
			break
			
		case 'expiry':
			if (!value) {
				errors[field] = '有效期不能为空'
			} else {
				const today = new Date()
				const expiryDate = new Date(value)
				if (expiryDate <= today) {
					errors[field] = '不能是今天或过去的日期'
				} else {
					const maxExpiry = new Date()
					maxExpiry.setFullYear(maxExpiry.getFullYear() + 10)
					if (expiryDate > maxExpiry) {
						errors[field] = '不能超过10年'
					} else {
						delete errors[field]
					}
				}
			}
			break
			
		case 'stock':
			if (value < 0) {
				errors[field] = '不能为负数'
			} else if (value > 999999) {
				errors[field] = '不能超过999999'
			} else {
				delete errors[field]
			}
			break
			
		case 'limit':
			if (value < 0) {
				errors[field] = '不能为负数'
			} else if (value > 999999) {
				errors[field] = '不能超过999999'
			} else {
				delete errors[field]
			}
			break
	}
	
	if (Object.keys(errors).length === 0) {
		delete validationErrors.value[rowIndex]
	} else {
		validationErrors.value[rowIndex] = errors
	}
}

// 检查行是否有错误
const hasRowErrors = (rowIndex: number): boolean => {
	return validationErrors.value[rowIndex] && Object.keys(validationErrors.value[rowIndex]).length > 0
}

// 获取字段错误信息
const getFieldError = (rowIndex: number, field: string): string => {
	return validationErrors.value[rowIndex]?.[field] || ''
}

const validateBatchData = (): boolean => {
	// 检查是否有空行
	const emptyRows = batchRows.value.filter(row => 
		!row.name.trim() && !row.manufacturer.trim() && !row.batch.trim() && !row.expiry
	)
	
	if (emptyRows.length > 0) {
		ElMessage.warning('检测到空行，已自动移除')
		batchRows.value = batchRows.value.filter(row => 
		row.name.trim() || row.manufacturer.trim() || row.batch.trim() || row.expiry
		)
	}
	
	// 检查是否还有数据
	if (batchRows.value.length === 0) {
		ElMessage.error('请至少添加一条有效数据')
		return false
	}
	
	// 逐行验证数据
	for (let i = 0; i < batchRows.value.length; i++) {
		const row = batchRows.value[i]
		const rowNum = i + 1
		
		// 必填字段验证
		if (!row.name.trim()) {
			ElMessage.error(`第${rowNum}行：药品名称不能为空`)
			return false
		}
		
		if (!row.manufacturer.trim()) {
			ElMessage.error(`第${rowNum}行：生产商不能为空`)
			return false
		}
		
		if (!row.batch.trim()) {
			ElMessage.error(`第${rowNum}行：批号不能为空`)
			return false
		}
		
		if (!row.expiry) {
			ElMessage.error(`第${rowNum}行：有效期不能为空`)
			return false
		}
		
		// 数据格式验证
		if (row.name.trim().length < 2) {
			ElMessage.error(`第${rowNum}行：药品名称至少需要2个字符`)
			return false
		}
		
		if (row.name.trim().length > 50) {
			ElMessage.error(`第${rowNum}行：药品名称不能超过50个字符`)
			return false
		}
		
		if (row.manufacturer.trim().length < 2) {
			ElMessage.error(`第${rowNum}行：生产商名称至少需要2个字符`)
			return false
		}
		
		if (row.manufacturer.trim().length > 100) {
			ElMessage.error(`第${rowNum}行：生产商名称不能超过100个字符`)
			return false
		}
		
		if (row.batch.trim().length < 3) {
			ElMessage.error(`第${rowNum}行：批号至少需要3个字符`)
			return false
		}
		
		if (row.batch.trim().length > 30) {
			ElMessage.error(`第${rowNum}行：批号不能超过30个字符`)
			return false
		}
		
		// 数值验证
		if (row.stock < 0) {
			ElMessage.error(`第${rowNum}行：库存不能为负数`)
			return false
		}
		
		if (row.stock > 999999) {
			ElMessage.error(`第${rowNum}行：库存不能超过999999`)
			return false
		}
		
		if (row.limit < 0) {
			ElMessage.error(`第${rowNum}行：限额不能为负数`)
			return false
		}
		
		if (row.limit > 999999) {
			ElMessage.error(`第${rowNum}行：限额不能超过999999`)
			return false
		}
		
		// 日期验证
		const today = new Date()
		const expiryDate = new Date(row.expiry)
		if (expiryDate <= today) {
			ElMessage.error(`第${rowNum}行：有效期不能是今天或过去的日期`)
			return false
		}
		
		// 检查有效期是否超过10年
		const maxExpiry = new Date()
		maxExpiry.setFullYear(maxExpiry.getFullYear() + 10)
		if (expiryDate > maxExpiry) {
			ElMessage.error(`第${rowNum}行：有效期不能超过10年`)
			return false
		}
	}
	
	// 检查重复数据
	const nameBatchCombinations = batchRows.value.map(row => `${row.name.trim()}-${row.batch.trim()}`)
	const uniqueCombinations = new Set(nameBatchCombinations)
	
	if (nameBatchCombinations.length !== uniqueCombinations.size) {
		ElMessage.error('检测到重复的药品名称和批号组合，请检查')
		return false
	}
	
	return true
}

const submitBatch = async () => {
	if (!validateBatchData()) {
		return
	}

	try {
		batchLoading.value = true
		
		// 批量添加药品
		for (const row of batchRows.value) {
			await store.dispatch('addDrug', row)
		}
		
		ElMessage.success(`成功批量添加${batchRows.value.length}个药品`)
		close()
		emit('success')
	} catch (error) {
		ElMessage.error('批量添加失败')
	} finally {
		batchLoading.value = false
	}
}

// 事件
const emit = defineEmits<{
	success: []
}>()

// 暴露方法给父组件
defineExpose({
	open
})
</script>

<template>
	<el-dialog
		v-model="visible"
		:title="t('drugs.batchAdd')"
		width="1000px"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
	>
		<div class="batch-add-content">
			<div class="batch-actions">
				<el-button type="primary" @click="addBatchRow">
					{{ t('drugs.addRow') }}
				</el-button>
			</div>
			
			<el-table
				ref="tableRef"
				:data="batchRows"
				style="width: 100%"
				:header-cell-style="{ background: '#f5f7fa' }"
			>
				<el-table-column :label="t('drugs.name')" width="200">
					<template #default="{ row, $index }">
						<el-input
							v-model="row.name"
							:placeholder="t('drugs.namePlaceholder')"
							clearable
							:class="{ 'is-error': getFieldError($index, 'name') }"
							@input="validateField($index, 'name', row.name)"
						/>
						<span v-if="getFieldError($index, 'name')" class="error-message">
							{{ getFieldError($index, 'name') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('drugs.manufacturer')" width="200">
					<template #default="{ row, $index }">
						<el-input
							v-model="row.manufacturer"
							:placeholder="t('drugs.manufacturerPlaceholder')"
							clearable
							:class="{ 'is-error': getFieldError($index, 'manufacturer') }"
							@input="validateField($index, 'manufacturer', row.manufacturer)"
						/>
						<span v-if="getFieldError($index, 'manufacturer')" class="error-message">
							{{ getFieldError($index, 'manufacturer') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('drugs.batch')" width="150">
					<template #default="{ row, $index }">
						<el-input
							v-model="row.batch"
							:placeholder="t('drugs.batchPlaceholder')"
							clearable
							:class="{ 'is-error': getFieldError($index, 'batch') }"
							@input="validateField($index, 'batch', row.batch)"
						/>
						<span v-if="getFieldError($index, 'batch')" class="error-message">
							{{ getFieldError($index, 'batch') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('drugs.expiry')" width="150">
					<template #default="{ row, $index }">
						<el-date-picker
							v-model="row.expiry"
							type="date"
							:placeholder="t('drugs.expiryPlaceholder')"
							format="YYYY-MM-DD"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							:class="{ 'is-error': getFieldError($index, 'expiry') }"
							@change="validateField($index, 'expiry', row.expiry)"
						/>
						<span v-if="getFieldError($index, 'expiry')" class="error-message">
							{{ getFieldError($index, 'expiry') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('drugs.stock')" width="120">
					<template #default="{ row, $index }">
						<el-input-number
							v-model="row.stock"
							:min="0"
							:step="1"
							:controls="false"
							:placeholder="t('drugs.stockPlaceholder')"
							style="width: 100%"
							:class="{ 'is-error': getFieldError($index, 'stock') }"
							@change="validateField($index, 'stock', row.stock)"
						/>
						<span v-if="getFieldError($index, 'stock')" class="error-message">
							{{ getFieldError($index, 'stock') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('drugs.limit')" width="120">
					<template #default="{ row, $index }">
						<el-input-number
							v-model="row.limit"
							:min="0"
							:step="1"
							:controls="false"
							:placeholder="t('drugs.limitPlaceholder')"
							style="width: 100%"
							:class="{ 'is-error': getFieldError($index, 'limit') }"
							@change="validateField($index, 'limit', row.limit)"
						/>
						<span v-if="getFieldError($index, 'limit')" class="error-message">
							{{ getFieldError($index, 'limit') }}
						</span>
					</template>
				</el-table-column>
				
				<el-table-column :label="t('common.actions')" width="100" fixed="right">
					<template #default="{ $index }">
						<el-button
							size="small"
							type="danger"
							@click="removeBatchRow($index)"
							:disabled="batchRows.length <= 1"
						>
							{{ t('common.delete') }}
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		
		<template #footer>
			<el-button @click="close">{{ t('common.cancel') }}</el-button>
			<el-button
				type="primary"
				:loading="batchLoading"
				@click="submitBatch"
			>
				{{ t('common.confirm') }}
			</el-button>
		</template>
	</el-dialog>
</template>

<style scoped>
.batch-add-content {
	padding: 20px 0;
}

.batch-actions {
	margin-bottom: 20px;
}

.el-table {
	margin-bottom: 20px;
}

:deep(.el-table__body-wrapper) {
	max-height: 400px;
	overflow-y: auto;
}

.error-message {
	color: #f56c6c;
	font-size: 12px;
	margin-top: 4px;
	display: block;
}

:deep(.is-error .el-input__wrapper) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-input-number__wrapper) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-input-number__wrapper:hover) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-date-editor) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.is-error .el-date-editor:hover) {
	box-shadow: 0 0 0 1px #f56c6c inset;
}
</style>
