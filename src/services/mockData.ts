import type { Drug, Pharmacy, Prescription, AuditLog, OperationLog, UserProfile, SystemSettings } from '../types'

// 药品数据
export const mockDrugs: Drug[] = [
	{
		id: 'D001',
		name: '布洛芬',
		manufacturer: 'ACME制药',
		batch: 'B2024001',
		expiry: '2025-12-31',
		stock: 100,
		limit: 50,
	},
	{
		id: 'D002',
		name: '阿司匹林',
		manufacturer: '健康药业',
		batch: 'B2024002',
		expiry: '2025-06-30',
		stock: 80,
		limit: 40,
	},
	{
		id: 'D003',
		name: '感冒灵',
		manufacturer: '感冒药厂',
		batch: 'B2024003',
		expiry: '2024-12-31',
		stock: 120,
		limit: 60,
	},
	{
		id: 'D004',
		name: '维生素C',
		manufacturer: '营养品公司',
		batch: 'B2024004',
		expiry: '2026-03-31',
		stock: 200,
		limit: 100,
	},
	{
		id: 'D005',
		name: '钙片',
		manufacturer: '保健品厂',
		batch: 'B2024005',
		expiry: '2025-09-30',
		stock: 150,
		limit: 75,
	},
]

// 药房数据
export const mockPharmacies: Pharmacy[] = [
	{
		id: 'PH001',
		name: '中心药房',
		allocatedDrugs: ['D001', 'D002', 'D003'],
	},
	{
		id: 'PH002',
		name: '门诊药房',
		allocatedDrugs: ['D001', 'D004'],
	},
	{
		id: 'PH003',
		name: '住院药房',
		allocatedDrugs: ['D002', 'D003', 'D005'],
	},
]

// 处方数据
export const mockPrescriptions: Prescription[] = [
	{
		id: 'P001',
		patientId: 'PAT001',
		pharmacyId: 'PH001',
		drugs: [
			{ drugId: 'D001', dosage: 2 },
			{ drugId: 'D002', dosage: 1 },
		],
		status: 'PENDING',
	},
	{
		id: 'P002',
		patientId: 'PAT002',
		pharmacyId: 'PH002',
		drugs: [{ drugId: 'D004', dosage: 3 }],
		status: 'FULFILLED',
	},
	{
		id: 'P003',
		patientId: 'PAT003',
		pharmacyId: 'PH003',
		drugs: [
			{ drugId: 'D003', dosage: 1 },
			{ drugId: 'D005', dosage: 2 },
		],
		status: 'FAILED',
	},
]

// 审计日志数据
export const mockAuditLogs: AuditLog[] = [
	{
		id: 'AL001',
		prescriptionId: 'P001',
		patientId: 'PAT001',
		pharmacyId: 'PH001',
		status: 'SUCCESS',
		timestamp: '2024-01-15T10:30:00Z',
		details: '处方验证通过',
	},
	{
		id: 'AL002',
		prescriptionId: 'P002',
		patientId: 'PAT002',
		pharmacyId: 'PH002',
		status: 'SUCCESS',
		timestamp: '2024-01-15T11:15:00Z',
		details: '处方履约成功',
	},
	{
		id: 'AL003',
		prescriptionId: 'P003',
		patientId: 'PAT003',
		pharmacyId: 'PH003',
		status: 'FAILED',
		timestamp: '2024-01-15T14:20:00Z',
		details: '库存不足',
		failureReasons: ['药品D003库存不足', '药品D005库存不足'],
	},
]

// 操作日志数据
export const mockOperationLogs: OperationLog[] = [
	{
		id: 'OL001',
		timestamp: '2024-01-15T09:00:00Z',
		user: 'admin',
		action: 'LOGIN',
		targetType: 'AUTH',
		targetId: 'admin',
		details: '用户登录系统',
	},
	{
		id: 'OL002',
		timestamp: '2024-01-15T10:00:00Z',
		user: 'admin',
		action: 'CREATE',
		targetType: 'DRUG',
		targetId: 'D006',
		details: '新增药品：感冒药',
	},
	{
		id: 'OL003',
		timestamp: '2024-01-15T11:00:00Z',
		user: 'pharmacist',
		action: 'UPDATE',
		targetType: 'PRESCRIPTION',
		targetId: 'P002',
		details: '更新处方状态为已履约',
	},
	{
		id: 'OL004',
		timestamp: '2024-01-15T12:00:00Z',
		user: 'admin',
		action: 'DELETE',
		targetType: 'DRUG',
		targetId: 'D007',
		details: '删除过期药品',
	},
	{
		id: 'OL005',
		timestamp: '2024-01-15T13:00:00Z',
		user: 'pharmacist',
		action: 'FULFILL',
		targetType: 'PRESCRIPTION',
		targetId: 'P001',
		details: '处理处方履约',
	},
]

// 用户资料数据
export const mockUserProfile: UserProfile = {
	username: 'admin',
	password: '123456',
	phone: '13800138000',
	email: 'admin@example.com',
}

// 系统设置数据
export const mockSystemSettings: SystemSettings = {
	prescriptionStatusEditable: true,
	drugStatusEditable: true,
	smsReminderEnabled: false,
}

// 用户认证数据
export const mockUsers = [
	{
		username: 'admin',
		password: '123456',
		phone: '13800138000',
		email: 'admin@example.com',
	},
	{
		username: 'pharmacist',
		password: '123456',
		phone: '13800138001',
		email: 'pharmacist@example.com',
	},
]
