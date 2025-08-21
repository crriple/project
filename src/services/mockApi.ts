import type {
	Drug,
	Pharmacy,
	Prescription,
	FulfillmentResponse,
	AuditLog,
	AuditLogFilter,
	PrescriptionDrugItem,
	OperationLog,
	UserProfile,
	SystemSettings,
} from '../types'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// Simple mock users
const users: UserProfile[] = [{ username: 'admin', password: '123456', phone: '13800000000', email: 'admin@example.com' }]

// Operation logs
let operationLogs: OperationLog[] = []

function logOp(entry: Omit<OperationLog, 'timestamp'>) {
	operationLogs.unshift({ ...entry, timestamp: new Date().toISOString() })
}

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
	{
		id: 'D003',
		name: '阿莫西林 (Amoxicillin)',
		manufacturer: '华康制药',
		batch: 'B202405',
		expiry: '2026-06-30',
		stock: 500,
		limit: 300,
	},
	{
		id: 'D004',
		name: '氯雷他定 (Loratadine)',
		manufacturer: '康宁制药',
		batch: 'B202406',
		expiry: '2027-12-31',
		stock: 250,
		limit: 200,
	},
	{
		id: 'D005',
		name: '头孢克肟 (Cefixime)',
		manufacturer: '齐鲁制药',
		batch: 'B202401',
		expiry: '2025-11-30',
		stock: 80,
		limit: 120,
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
	{
		id: 'RX124',
		patientId: 'P002',
		pharmacyId: 'PH001',
		drugs: [
			{ drugId: 'D003', dosage: 250 },
			{ drugId: 'D004', dosage: 20 },
		],
		status: 'PENDING',
	},
	{
		id: 'RX125',
		patientId: 'P003',
		pharmacyId: 'PH002',
		drugs: [
			{ drugId: 'D001', dosage: 30 },
		],
		status: 'FULFILLED',
	},
	{
		id: 'RX126',
		patientId: 'P004',
		pharmacyId: 'PH001',
		drugs: [
			{ drugId: 'D002', dosage: 150 },
		],
		status: 'FAILED',
	},
]

let auditLogs: AuditLog[] = [
	{
		prescriptionId: 'RX125',
		patientId: 'P003',
		pharmacyId: 'PH002',
		status: 'SUCCESS',
		drugsRequested: [{ drugId: 'D001', dosage: 30 }],
		drugsDispensed: [{ drugId: 'D001', dosage: 30 }],
		failureReasons: [],
	},
	{
		prescriptionId: 'RX126',
		patientId: 'P004',
		pharmacyId: 'PH001',
		status: 'FAILED',
		drugsRequested: [{ drugId: 'D002', dosage: 150 }],
		drugsDispensed: [],
		failureReasons: ['药品 D002 已过期', '库存不足'],
	},
	{
		prescriptionId: 'RX123',
		patientId: 'P001',
		pharmacyId: 'PH001',
		status: 'FAILED',
		drugsRequested: [
			{ drugId: 'D001', dosage: 400 },
			{ drugId: 'D002', dosage: 500 },
		],
		drugsDispensed: [],
		failureReasons: ['药品 D002 已过期', '药品 D001 超出药房分配限额'],
	},
]

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
	async login(username: string, password: string): Promise<{ token: string; username: string }>{
		await delay()
		const match = users.find((u) => u.username === username && u.password === password)
		if (!match) {
			throw new Error('用户名或密码错误')
		}
		logOp({ user: username, action: 'LOGIN', targetType: 'AUTH', targetId: username, details: '用户登录' })
		return { token: 'mock-token-' + Date.now(), username }
	},

	// User profile
	async getUserProfile(username: string): Promise<UserProfile> {
		await delay()
		const u = users.find((x) => x.username === username)
		if (!u) throw new Error('用户不存在')
		return { ...u, password: undefined }
	},
	async updateUserProfile(payload: UserProfile): Promise<UserProfile> {
		await delay()
		const idx = users.findIndex((x) => x.username === payload.username)
		if (idx < 0) throw new Error('用户不存在')
		const updated = { ...users[idx], ...payload }
		users[idx] = updated
		logOp({ user: payload.username, action: 'UPDATE', targetType: 'AUTH', targetId: payload.username, details: '更新用户信息' })
		return { ...updated, password: undefined }
	},
	async getOperationLogs(): Promise<OperationLog[]> {
		await delay()
		return [...operationLogs]
	},

	// System settings (in-memory)
	_settings: { value: null as unknown as SystemSettings },
	initSettings() {
		if (!this._settings.value) {
			this._settings.value = {
				prescriptionStatusEditable: true,
				drugStatusEditable: true,
				smsReminderEnabled: false,
			}
		}
	},
	async getSystemSettings(): Promise<SystemSettings> {
		await delay()
		this.initSettings()
		return { ...this._settings.value }
	},
	async updateSystemSettings(payload: Partial<SystemSettings>): Promise<SystemSettings> {
		await delay()
		this.initSettings()
		this._settings.value = { ...this._settings.value, ...payload }
		logOp({ user: 'admin', action: 'UPDATE', targetType: 'FULFILLMENT', targetId: 'SETTINGS', details: '系统设置更新' })
		return { ...this._settings.value }
	},
	async getDrugs(): Promise<Drug[]> {
		await delay()
		return [...drugs]
	},
	async addDrug(payload: Drug): Promise<Drug> {
		await delay()
		drugs = [payload, ...drugs]
		logOp({ user: 'admin', action: 'CREATE', targetType: 'DRUG', targetId: payload.id, details: payload.name })
		return payload
	},
	async updateDrug(payload: Partial<Drug> & { id: string }): Promise<Drug> {
		await delay()
		const idx = drugs.findIndex((d) => d.id === payload.id)
		if (idx < 0) throw new Error('药品不存在')
		const updated: Drug = { ...drugs[idx], ...payload }
		drugs[idx] = updated
		logOp({ user: 'admin', action: 'UPDATE', targetType: 'DRUG', targetId: payload.id, details: updated.name })
		return updated
	},
	async deleteDrug(id: string): Promise<void> {
		await delay()
		const idx = drugs.findIndex((d) => d.id === id)
		if (idx < 0) throw new Error('药品不存在')
		drugs.splice(idx, 1)
		logOp({ user: 'admin', action: 'DELETE', targetType: 'DRUG', targetId: id })
	},
	async getPharmacies(): Promise<Pharmacy[]> {
		await delay()
		return [...pharmacies]
	},
	async getPharmacyById(id: string): Promise<Pharmacy | undefined> {
		await delay()
		return pharmacies.find((p) => p.id === id)
	},
	async addPharmacy(payload: Pharmacy): Promise<Pharmacy> {
		await delay()
		pharmacies = [payload, ...pharmacies]
		logOp({ user: 'admin', action: 'CREATE', targetType: 'PHARMACY', targetId: payload.id, details: payload.name })
		return payload
	},
	async updatePharmacy(payload: Partial<Pharmacy> & { id: string }): Promise<Pharmacy> {
		await delay()
		const idx = pharmacies.findIndex((p) => p.id === payload.id)
		if (idx < 0) throw new Error('药房不存在')
		const updated: Pharmacy = { ...pharmacies[idx], ...payload }
		pharmacies[idx] = updated
		logOp({ user: 'admin', action: 'UPDATE', targetType: 'PHARMACY', targetId: payload.id, details: updated.name })
		return updated
	},
	async deletePharmacy(id: string): Promise<void> {
		await delay()
		const idx = pharmacies.findIndex((p) => p.id === id)
		if (idx < 0) throw new Error('药房不存在')
		pharmacies.splice(idx, 1)
		logOp({ user: 'admin', action: 'DELETE', targetType: 'PHARMACY', targetId: id })
	},
	async getPrescriptions(): Promise<Prescription[]> {
		await delay()
		return [...prescriptions]
	},
	async getPrescriptionById(id: string): Promise<Prescription | undefined> {
		await delay()
		return prescriptions.find((p) => p.id === id)
	},
	async addPrescription(payload: Prescription): Promise<Prescription> {
		await delay()
		prescriptions = [payload, ...prescriptions]
		logOp({ user: 'admin', action: 'CREATE', targetType: 'PRESCRIPTION', targetId: payload.id })
		return payload
	},
	async updatePrescription(payload: Partial<Prescription> & { id: string }): Promise<Prescription> {
		await delay()
		const idx = prescriptions.findIndex((p) => p.id === payload.id)
		if (idx < 0) throw new Error('处方不存在')
		const updated: Prescription = { ...prescriptions[idx], ...payload }
		prescriptions[idx] = updated
		logOp({ user: 'admin', action: 'UPDATE', targetType: 'PRESCRIPTION', targetId: payload.id })
		return updated
	},
	async deletePrescription(id: string): Promise<void> {
		await delay()
		const idx = prescriptions.findIndex((p) => p.id === id)
		if (idx < 0) throw new Error('处方不存在')
		prescriptions.splice(idx, 1)
		logOp({ user: 'admin', action: 'DELETE', targetType: 'PRESCRIPTION', targetId: id })
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
			logOp({ user: 'admin', action: 'FULFILL', targetType: 'FULFILLMENT', targetId: id, details: '失败: ' + errors.join('; ') })
			return { success: false, errors }
		}

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
		logOp({ user: 'admin', action: 'FULFILL', targetType: 'FULFILLMENT', targetId: id, details: '成功' })
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