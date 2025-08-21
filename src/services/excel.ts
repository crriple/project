import * as XLSX from 'xlsx'

export function exportToExcel(filename: string, rows: Record<string, unknown>[]) {
	const worksheet = XLSX.utils.json_to_sheet(rows)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
	XLSX.writeFile(workbook, filename)
}

export async function importFromExcel(file: File): Promise<Record<string, unknown>[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			try {
				const data = new Uint8Array(reader.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const json = XLSX.utils.sheet_to_json(sheet)
				resolve(json as Record<string, unknown>[])
			} catch (e) {
				reject(e)
			}
		}
		reader.onerror = reject
		reader.readAsArrayBuffer(file)
	})
}


