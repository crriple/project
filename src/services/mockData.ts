import type { Drug, Pharmacy, Prescription, AuditLog, OperationLog } from '../types'

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
		stock: 0, // 调整为0库存，用于测试库存不足
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
		allocatedDrugs: [
			{ drugId: 'D001', drugName: '布洛芬', limit: 50 },
			{ drugId: 'D002', drugName: '阿司匹林', limit: 40 },
			{ drugId: 'D003', drugName: '感冒灵', limit: 60 },
		],
	},
	{
		id: 'PH002',
		name: '门诊药房',
		allocatedDrugs: [
			{ drugId: 'D001', drugName: '布洛芬', limit: 50 },
			{ drugId: 'D004', drugName: '维生素C', limit: 100 },
		],
	},
	{
		id: 'PH003',
		name: '住院药房',
		allocatedDrugs: [
			{ drugId: 'D002', drugName: '阿司匹林', limit: 40 },
			{ drugId: 'D003', drugName: '感冒灵', limit: 60 },
			{ drugId: 'D005', drugName: '钙片', limit: 75 },
		],
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
		status: 'PENDING',
	},
	{
		id: 'P003',
		patientId: 'PAT003',
		pharmacyId: 'PH003',
		drugs: [
			{ drugId: 'D003', dosage: 1 }, // 需要1个感冒灵，但库存为0
			{ drugId: 'D005', dosage: 2 },
		],
		status: 'PENDING',
	},
]

// 审计日志数据
export const mockAuditLogs: AuditLog[] = [
	{
		prescriptionId: 'P001',
		patientId: 'PAT001',
		pharmacyId: 'PH001',
		status: 'SUCCESS',
		drugsRequested: [
			{ drugId: 'D001', dosage: 2 },
			{ drugId: 'D002', dosage: 1 },
		],
		drugsDispensed: [
			{ drugId: 'D001', dosage: 2 },
			{ drugId: 'D002', dosage: 1 },
		],
		failureReasons: [],
	},
	{
		prescriptionId: 'P002',
		patientId: 'PAT002',
		pharmacyId: 'PH002',
		status: 'SUCCESS',
		drugsRequested: [{ drugId: 'D004', dosage: 3 }],
		drugsDispensed: [{ drugId: 'D004', dosage: 3 }],
		failureReasons: [],
	},
	{
		prescriptionId: 'P003',
		patientId: 'PAT003',
		pharmacyId: 'PH003',
		status: 'FAILED',
		drugsRequested: [
			{ drugId: 'D003', dosage: 1 },
			{ drugId: 'D005', dosage: 2 },
		],
		drugsDispensed: [],
		failureReasons: ['药品感冒灵库存不足'],
	},
]

// 操作日志数据
export const mockOperationLogs: OperationLog[] = [
	{
		timestamp: '2024-01-15T10:30:00Z',
		user: 'admin',
		action: 'LOGIN',
		targetType: 'AUTH',
		targetId: 'admin',
		details: '用户登录系统',
	},
	{
		timestamp: '2024-01-15T11:15:00Z',
		user: 'pharmacist',
		action: 'CREATE',
		targetType: 'PRESCRIPTION',
		targetId: 'P001',
		details: '创建新处方',
	},
	{
		timestamp: '2024-01-15T14:20:00Z',
		user: 'admin',
		action: 'LOGOUT',
		targetType: 'AUTH',
		targetId: 'admin',
		details: '用户登出系统',
	},
]

// 用户数据
export const mockUsers = [
	{
		id: 'U001',
		username: 'admin',
		password: 'admin123',
		role: 'ADMIN',
	},
	{
		id: 'U002',
		username: 'pharmacist',
		password: 'pharm123',
		role: 'PHARMACIST',
	},
	{
		id: 'U003',
		username: 'doctor',
		password: 'doctor123',
		role: 'DOCTOR',
	},
]
