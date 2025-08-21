export interface Drug {
	id: string
	name: string
	manufacturer: string
	batch: string
	expiry: string
	stock: number
	limit: number
}

export interface AllocatedDrug {
	drugId: string
	drugName: string
	limit: number
}

export interface Pharmacy {
	id: string
	name: string
	allocatedDrugs: AllocatedDrug[]
}

export interface PrescriptionDrugItem {
	drugId: string
	dosage: number
}

export type PrescriptionStatus = 'PENDING' | 'FULFILLED' | 'FAILED'

export interface Prescription {
	id: string
	patientId: string
	pharmacyId: string
	drugs: PrescriptionDrugItem[]
	status: PrescriptionStatus
}

export interface FulfillmentResponse {
	success: boolean
	errors?: string[]
}

export interface AuditLog {
	prescriptionId: string
	patientId: string
	pharmacyId: string
	status: 'SUCCESS' | 'FAILED'
	drugsRequested: PrescriptionDrugItem[]
	drugsDispensed: PrescriptionDrugItem[]
	failureReasons: string[]
}

export interface AuditLogFilter {
	patientId?: string
	pharmacyId?: string
	success?: boolean
}

export type OperationTarget = 'DRUG' | 'PHARMACY' | 'PRESCRIPTION' | 'FULFILLMENT' | 'AUTH'
export type OperationAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'FULFILL' | 'LOGIN' | 'LOGOUT'

export interface OperationLog {
	user: string
	action: OperationAction
	targetType: OperationTarget
	targetId: string
	details?: string
	timestamp: string
} 

// 用户基本信息
export interface UserProfile {
	username: string
	password?: string
	phone?: string
	email?: string
}

// 系统设置
export interface SystemSettings {
	prescriptionStatusEditable: boolean
	drugStatusEditable: boolean
	smsReminderEnabled: boolean
}