import type {
	Drug,
	Pharmacy,
	Prescription,
	FulfillmentResponse,
	AuditLog,
	AuditLogFilter,
	PrescriptionDrugItem,
} from '../types'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// In-memory data
let drugs: Drug[] = [
	{
		id: 'D001',
		name: '布洛芬 (Ibuprofen)',
		manufacturer: 'ACME 制药',
		batch: 'B202403',
		expiry: '2026-01-01',
		stock: 150,
		limit: 200,
	},
	{
		id: 'D002',
		name: '扑热息痛 (Paracetamol)',
		manufacturer: 'ACME 制药',
		batch: 'B202402',
		expiry: '2024-01-01',
		stock: 0,
		limit: 100,
	},
]

let pharmacies: Pharmacy[] = [
	{
		id: 'PH001',
		name: '成都总店',
		allocatedDrugs: [
			{ drugId: 'D001', drugName: '布洛芬', limit: 200 },
			{ drugId: 'D002', drugName: '扑热息痛', limit: 100 },
		],
	},
	{
		id: 'PH002',
		name: '高新分店',
		allocatedDrugs: [{ drugId: 'D001', drugName: '布洛芬', limit: 50 }],
	},
]

let prescriptions: Prescription[] = [
	{
		id: 'RX123',
		patientId: 'P001',
		pharmacyId: 'PH001',
		drugs: [
			{ drugId: 'D001', dosage: 400 },
			{ drugId: 'D002', dosage: 500 },
		],
		status: 'PENDING',
	},
]

let auditLogs: AuditLog[] = []

const isExpired = (expiry: string) => new Date(expiry).getTime() < Date.now()

const getPharmacyAllocationLimit = (pharmacyId: string, drugId: string): number | undefined => {
	const ph = pharmacies.find((p) => p.id === pharmacyId)
	return ph?.allocatedDrugs.find((a) => a.drugId === drugId)?.limit
}

const checkPrescription = (p: Prescription): { ok: boolean; errors: string[] } => {
	const errors: string[] = []
	for (const item of p.drugs) {
		const d = drugs.find((x) => x.id === item.drugId)
		if (!d) {
			errors.push(`药品 ${item.drugId} 不存在`)
			continue
		}
		if (isExpired(d.expiry)) {
			errors.push(`药品 ${item.drugId} 已过期`)
		}
		const allocLimit = getPharmacyAllocationLimit(p.pharmacyId, item.drugId)
		if (allocLimit != null && item.dosage > allocLimit) {
			errors.push(`药品 ${item.drugId} 超出药房分配限额`)
		}
		if (d.stock <= 0 || item.dosage > d.stock) {
			errors.push(`药品 ${item.drugId} 库存不足`)
		}
	}
	return { ok: errors.length === 0, errors }
}

export const api = {
	async getDrugs(): Promise<Drug[]> {
		await delay()
		return [...drugs]
	},
	async addDrug(payload: Drug): Promise<Drug> {
		await delay()
		drugs = [payload, ...drugs]
		return payload
	},
	async getPharmacies(): Promise<Pharmacy[]> {
		await delay()
		return [...pharmacies]
	},
	async getPharmacyById(id: string): Promise<Pharmacy | undefined> {
		await delay()
		return pharmacies.find((p) => p.id === id)
	},
	async getPrescriptions(): Promise<Prescription[]> {
		await delay()
		return [...prescriptions]
	},
	async getPrescriptionById(id: string): Promise<Prescription | undefined> {
		await delay()
		return prescriptions.find((p) => p.id === id)
	},
	async fulfillPrescription(id: string): Promise<FulfillmentResponse> {
		await delay()
		const p = prescriptions.find((x) => x.id === id)
		if (!p) return { success: false, errors: ['处方不存在'] }

		const { ok, errors } = checkPrescription(p)
		if (!ok) {
			p.status = 'FAILED'
			auditLogs.unshift({
				prescriptionId: p.id,
				patientId: p.patientId,
				pharmacyId: p.pharmacyId,
				status: 'FAILED',
				drugsRequested: [...p.drugs],
				drugsDispensed: [],
				failureReasons: errors,
			})
			return { success: false, errors }
		}

		// deduct stock
		for (const item of p.drugs) {
			const d = drugs.find((x) => x.id === item.drugId)!
			d.stock = Math.max(0, d.stock - item.dosage)
		}
		p.status = 'FULFILLED'
		auditLogs.unshift({
			prescriptionId: p.id,
			patientId: p.patientId,
			pharmacyId: p.pharmacyId,
			status: 'SUCCESS',
			drugsRequested: [...p.drugs],
			drugsDispensed: [...p.drugs],
			failureReasons: [],
		})
		return { success: true }
	},
	async getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
		await delay()
		return auditLogs.filter((log) => {
			if (filter.patientId && log.patientId !== filter.patientId) return false
			if (filter.pharmacyId && log.pharmacyId !== filter.pharmacyId) return false
			if (filter.success != null) {
				const isSuccess = log.status === 'SUCCESS'
				if (isSuccess !== filter.success) return false
			}
			return true
		})
	},
}

export type { Prescription, PrescriptionDrugItem }
export const __test__ = { isExpired, checkPrescription } 