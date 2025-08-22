import * as XLSX from 'xlsx'

export function exportToExcel(filename: string, rows: Record<string, unknown>[]) {
	try {
		const worksheet = XLSX.utils.json_to_sheet(rows)
		const workbook = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
		XLSX.writeFile(workbook, filename)
	} catch (error) {
		console.error('导出Excel失败:', error)
		throw new Error('导出Excel失败')
	}
}

export function createTemplate(templateType: 'drugs' | 'pharmacies'): void {
	let headers: string[] = []
	let sampleData: Record<string, unknown>[] = []
	
	if (templateType === 'drugs') {
		headers = ['名称', '生产商', '批号', '有效期', '库存', '限额']
		sampleData = [
			{
				名称: '布洛芬',
				生产商: 'ACME制药',
				批号: 'B001',
				有效期: '2025-12-31',
				库存: 100,
				限额: 50
			},
			{
				名称: '阿司匹林',
				生产商: '健康药业',
				批号: 'A002',
				有效期: '2025-06-30',
				库存: 200,
				限额: 100
			}
		]
	} else if (templateType === 'pharmacies') {
		headers = ['名称']
		sampleData = [
			{ 名称: '中心药房' },
			{ 名称: '社区药房' }
		]
	}
	
	// 创建工作表
	const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData.map(row => headers.map(header => row[header]))])
	
	// 设置列宽
	const colWidths = headers.map(header => Math.max(header.length * 2, 10))
	worksheet['!cols'] = colWidths.map(width => ({ width }))
	
	// 创建工作簿
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
	
	// 下载模板
	const filename = `${templateType === 'drugs' ? '药品导入模板' : '药房导入模板'}.xlsx`
	XLSX.writeFile(workbook, filename)
}

export async function importFromExcel(file: File): Promise<Record<string, unknown>[]> {
	return new Promise((resolve, reject) => {
		console.log('开始读取Excel文件:', file.name, file.size, file.type)
		
		const reader = new FileReader()
		
		reader.onload = () => {
			try {
				console.log('文件读取完成，开始解析Excel')
				
				const data = new Uint8Array(reader.result as ArrayBuffer)
				console.log('文件数据长度:', data.length)
				
				const workbook = XLSX.read(data, { type: 'array' })
				console.log('Excel工作簿信息:', {
					sheetNames: workbook.SheetNames,
					sheets: Object.keys(workbook.Sheets)
				})
				
				if (workbook.SheetNames.length === 0) {
					reject(new Error('Excel文件没有工作表'))
					return
				}
				
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				console.log('选择工作表:', sheetName)
				
				if (!sheet) {
					reject(new Error('无法读取工作表'))
					return
				}
				
				const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
				console.log('解析的JSON数据:', json)
				
				if (json.length < 2) {
					reject(new Error('Excel文件至少需要标题行和一行数据'))
					return
				}
				
				// 获取标题行
				const headers = json[0] as string[]
				console.log('标题行:', headers)
				
				if (!headers || headers.length === 0) {
					reject(new Error('Excel文件第一行必须是标题行'))
					return
				}
				
				// 转换数据行
				const result: Record<string, unknown>[] = []
				for (let i = 1; i < json.length; i++) {
					const row = json[i] as unknown[]
					console.log(`处理第${i + 1}行:`, row)
					
					if (row && row.length > 0) {
						const rowData: Record<string, unknown> = {}
						headers.forEach((header, index) => {
							if (header && row[index] !== undefined) {
								rowData[header] = row[index]
							}
						})
						
						console.log(`第${i + 1}行转换结果:`, rowData)
						
						if (Object.keys(rowData).length > 0) {
							result.push(rowData)
						}
					}
				}
				
				console.log('最终结果:', result)
				resolve(result)
			} catch (error) {
				console.error('解析Excel文件失败:', error)
				reject(new Error('Excel文件格式错误: ' + (error instanceof Error ? error.message : '未知错误')))
			}
		}
		
		reader.onerror = (error) => {
			console.error('文件读取失败:', error)
			reject(new Error('读取文件失败: ' + (error instanceof Error ? error.message : '未知错误')))
		}
		
		reader.readAsArrayBuffer(file)
	})
}



