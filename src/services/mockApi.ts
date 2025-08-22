import type { Drug, Pharmacy, Prescription, AuditLog, OperationLog, UserProfile, SystemSettings } from '../types'
import { 
	mockDrugs, 
	mockPharmacies, 
	mockPrescriptions, 
	mockAuditLogs, 
	mockOperationLogs, 
	mockUserProfile, 
	mockSystemSettings, 
	mockUsers 
} from './mockData'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟数据存储
let _drugs = [...mockDrugs]
let _pharmacies = [...mockPharmacies]
let _prescriptions = [...mockPrescriptions]
let _auditLogs = [...mockAuditLogs]
let _operationLogs = [...mockOperationLogs]
let _users = [...mockUsers]
let _settings = { ...mockSystemSettings }

// 生成唯一ID
const generateId = (prefix: string) => `${prefix}${Date.now()}`

// 药品相关API
export const drugsApi = {
	async getDrugs(): Promise<Drug[]> {
		await delay(300)
		return [..._drugs]
	},

	async createDrug(drug: Omit<Drug, 'id'>): Promise<Drug> {
		await delay(500)
		const newDrug = { ...drug, id: generateId('D') }
		_drugs.push(newDrug)
		return newDrug
	},

	async updateDrug(drug: Partial<Drug> & { id: string }): Promise<Drug> {
		await delay(500)
		const index = _drugs.findIndex(d => d.id === drug.id)
		if (index === -1) throw new Error('药品不存在')
		_drugs[index] = { ..._drugs[index], ...drug }
		return _drugs[index]
	},

	async deleteDrug(id: string): Promise<void> {
		await delay(300)
		const index = _drugs.findIndex(d => d.id === id)
		if (index === -1) throw new Error('药品不存在')
		_drugs.splice(index, 1)
	},

	async getDrugById(id: string): Promise<Drug | null> {
		await delay(200)
		return _drugs.find(d => d.id === id) || null
	}
}

// 药房相关API
export const pharmaciesApi = {
	async getPharmacies(): Promise<Pharmacy[]> {
		await delay(300)
		return [..._pharmacies]
	},

	async createPharmacy(pharmacy: Omit<Pharmacy, 'id'>): Promise<Pharmacy> {
		await delay(500)
		const newPharmacy = { ...pharmacy, id: generateId('PH') }
		_pharmacies.push(newPharmacy)
		return newPharmacy
	},

	async updatePharmacy(pharmacy: Partial<Pharmacy> & { id: string }): Promise<Pharmacy> {
		await delay(500)
		const index = _pharmacies.findIndex(p => p.id === pharmacy.id)
		if (index === -1) throw new Error('药房不存在')
		_pharmacies[index] = { ..._pharmacies[index], ...pharmacy }
		return _pharmacies[index]
	},

	async deletePharmacy(id: string): Promise<void> {
		await delay(300)
		const index = _pharmacies.findIndex(p => p.id === id)
		if (index === -1) throw new Error('药房不存在')
		_pharmacies.splice(index, 1)
	},

	async getPharmacyById(id: string): Promise<Pharmacy | null> {
		await delay(200)
		return _pharmacies.find(p => p.id === id) || null
	}
}

// 处方相关API
export const prescriptionsApi = {
	async getPrescriptions(): Promise<Prescription[]> {
		await delay(300)
		return [..._prescriptions]
	},

	async createPrescription(prescription: Omit<Prescription, 'id'>): Promise<Prescription> {
		await delay(500)
		const newPrescription = { ...prescription, id: generateId('P') }
		_prescriptions.push(newPrescription)
		return newPrescription
	},

	async updatePrescription(prescription: Partial<Prescription> & { id: string }): Promise<Prescription> {
		await delay(500)
		const index = _prescriptions.findIndex(p => p.id === prescription.id)
		if (index === -1) throw new Error('处方不存在')
		_prescriptions[index] = { ..._prescriptions[index], ...prescription }
		return _prescriptions[index]
	},

	async deletePrescription(id: string): Promise<void> {
		await delay(300)
		const index = _prescriptions.findIndex(p => p.id === id)
		if (index === -1) throw new Error('处方不存在')
		_prescriptions.splice(index, 1)
	},

	async getPrescriptionById(id: string): Promise<Prescription | null> {
		await delay(200)
		return _prescriptions.find(p => p.id === id) || null
	},

	async fulfillPrescription(id: string): Promise<{ success: boolean; errors?: string[] }> {
		await delay(1000)
		const prescription = _prescriptions.find(p => p.id === id)
		if (!prescription) {
			return { success: false, errors: ['处方不存在'] }
		}

		// 检查库存
		const errors: string[] = []
		for (const drugItem of prescription.drugs) {
			const drug = _drugs.find(d => d.id === drugItem.drugId)
			if (!drug) {
				errors.push(`药品${drugItem.drugId}不存在`)
			} else if (drug.stock < drugItem.dosage) {
				errors.push(`药品${drug.name}库存不足`)
			}
		}

		if (errors.length > 0) {
			return { success: false, errors }
		}

		// 扣减库存
		for (const drugItem of prescription.drugs) {
			const drug = _drugs.find(d => d.id === drugItem.drugId)
			if (drug) {
				drug.stock -= drugItem.dosage
			}
		}

		// 更新处方状态
		prescription.status = 'FULFILLED'

		// 记录操作日志
		_operationLogs.push({
			id: generateId('OL'),
			timestamp: new Date().toISOString(),
			user: 'system',
			action: 'FULFILL',
			targetType: 'PRESCRIPTION',
			targetId: id,
			details: '处方履约成功'
		})

		return { success: true }
	}
}

// 审计日志相关API
export const auditLogsApi = {
	async getAuditLogs(filters?: { patientId?: string; pharmacyId?: string; success?: boolean }): Promise<AuditLog[]> {
		await delay(300)
		let logs = [..._auditLogs]
		
		if (filters) {
			if (filters.patientId) {
				logs = logs.filter(log => log.patientId.toLowerCase().includes(filters.patientId!.toLowerCase()))
			}
			if (filters.pharmacyId) {
				logs = logs.filter(log => log.pharmacyId.toLowerCase().includes(filters.pharmacyId!.toLowerCase()))
			}
			if (filters.success !== undefined) {
				logs = logs.filter(log => (filters.success ? log.status === 'SUCCESS' : log.status === 'FAILED'))
			}
		}
		
		return logs
	}
}

// 操作日志相关API
export const operationLogsApi = {
	async getOperationLogs(): Promise<OperationLog[]> {
		await delay(300)
		return [..._operationLogs]
	}
}

// 用户认证相关API
export const authApi = {
	async login(credentials: { username: string; password: string }): Promise<{ token: string; user: UserProfile }> {
		await delay(500)
		const user = _users.find(u => u.username === credentials.username && u.password === credentials.password)
		if (!user) {
			throw new Error('用户名或密码错误')
		}

		// 记录登录日志
		_operationLogs.push({
			id: generateId('OL'),
			timestamp: new Date().toISOString(),
			user: credentials.username,
			action: 'LOGIN',
			targetType: 'AUTH',
			targetId: credentials.username,
			details: '用户登录系统'
		})

		return {
			token: `token_${Date.now()}`,
			user: { username: user.username, phone: user.phone, email: user.email }
		}
	},

	async logout(): Promise<void> {
		await delay(200)
		// 记录登出日志
		_operationLogs.push({
			id: generateId('OL'),
			timestamp: new Date().toISOString(),
			user: 'system',
			action: 'LOGOUT',
			targetType: 'AUTH',
			targetId: 'system',
			details: '用户登出系统'
		})
	}
}

// 用户资料相关API
export const userProfileApi = {
	async getUserProfile(): Promise<UserProfile> {
		await delay(300)
		return { ...mockUserProfile }
	},

	async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
		await delay(500)
		Object.assign(mockUserProfile, profile)
		return { ...mockUserProfile }
	}
}

// 系统设置相关API
export const systemSettingsApi = {
	async getSystemSettings(): Promise<SystemSettings> {
		await delay(300)
		return { ..._settings }
	},

	async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
		await delay(500)
		Object.assign(_settings, settings)
		return { ..._settings }
	}
}

// 统一API导出
export const api = {
	drugs: drugsApi,
	pharmacies: pharmaciesApi,
	prescriptions: prescriptionsApi,
	auditLogs: auditLogsApi,
	operationLogs: operationLogsApi,
	auth: authApi,
	userProfile: userProfileApi,
	systemSettings: systemSettingsApi,
}

// 测试相关导出
export const __test__ = {
	// 重置所有数据到初始状态
	resetData() {
		_drugs = [...mockDrugs]
		_pharmacies = [...mockPharmacies]
		_prescriptions = [...mockPrescriptions]
		_auditLogs = [...mockAuditLogs]
		_operationLogs = [...mockOperationLogs]
		_users = [...mockUsers]
		_settings = { ...mockSystemSettings }
	},

	// 获取当前数据状态
	getDataState() {
		return {
			drugs: [..._drugs],
			pharmacies: [..._pharmacies],
			prescriptions: [..._prescriptions],
			auditLogs: [..._auditLogs],
			operationLogs: [..._operationLogs],
			users: [..._users],
			settings: { ..._settings }
		}
	},

	// 处方校验逻辑
	checkPrescription(prescription: Prescription): { ok: boolean; errors: string[] } {
		const errors: string[] = []
		
		if (!prescription.id) errors.push('处方ID不能为空')
		if (!prescription.patientId) errors.push('患者ID不能为空')
		if (!prescription.pharmacyId) errors.push('药房ID不能为空')
		if (!prescription.drugs || prescription.drugs.length === 0) {
			errors.push('处方必须包含至少一个药品')
		}

		// 检查药品库存
		for (const drugItem of prescription.drugs) {
			const drug = _drugs.find(d => d.id === drugItem.drugId)
			if (!drug) {
				errors.push(`药品${drugItem.drugId}不存在`)
			} else if (drug.stock < drugItem.dosage) {
				errors.push(`药品${drug.name}库存不足，当前库存${drug.stock}，需要${drugItem.dosage}`)
			}
		}

		return { ok: errors.length === 0, errors }
	}
} 