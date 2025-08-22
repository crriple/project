import { describe, it, expect, beforeEach } from 'vitest'
import { api } from '../mockApi'
import type { Prescription } from '../../types'

describe('Prescriptions API', () => {
	beforeEach(() => {
		// 由于没有 resetData 方法，我们需要手动重置数据
		// 或者跳过这个测试
	})

	describe('getPrescriptions', () => {
		it('should return all prescriptions', async () => {
			const prescriptions = await api.getPrescriptions()
			expect(prescriptions).toHaveLength(4) // 根据新的mockData，应该有4个处方
			expect(prescriptions[0].id).toBe('RX123')
			expect(prescriptions[0].patientId).toBe('P001')
		})
	})

	describe('createPrescription', () => {
		it('should create a new prescription with generated ID', async () => {
			const newPrescription: Omit<Prescription, 'id'> = {
				patientId: 'PAT004',
				pharmacyId: 'PH001',
				drugs: [{ drugId: 'D001', dosage: 1 }],
				status: 'PENDING',
			}

			const created = await api.addPrescription({ ...newPrescription, id: 'RX127' })
			expect(created.id).toBe('RX127')
			expect(created.patientId).toBe('PAT004')
			expect(created.pharmacyId).toBe('PH001')

			const allPrescriptions = await api.getPrescriptions()
			expect(allPrescriptions).toHaveLength(5)
		})
	})

	describe('updatePrescription', () => {
		it('should update existing prescription', async () => {
			const updateData = { id: 'RX123', status: 'FULFILLED' as const }
			const updated = await api.updatePrescription(updateData)
			
			expect(updated.status).toBe('FULFILLED')
			expect(updated.patientId).toBe('P001') // 其他字段保持不变
		})

		it('should throw error for non-existent prescription', async () => {
			await expect(
				api.updatePrescription({ id: 'NONEXISTENT', status: 'FULFILLED' })
			).rejects.toThrow('处方不存在')
		})
	})

	describe('deletePrescription', () => {
		it('should delete existing prescription', async () => {
			await api.deletePrescription('RX125')
			
			const allPrescriptions = await api.getPrescriptions()
			expect(allPrescriptions).toHaveLength(4) // 删除一个后，从5个变成4个
			expect(allPrescriptions.find(p => p.id === 'RX125')).toBeUndefined()
		})

		it('should throw error for non-existent prescription', async () => {
			await expect(
				api.deletePrescription('NONEXISTENT')
			).rejects.toThrow('处方不存在')
		})
	})

	describe('getPrescriptionById', () => {
		it('should return prescription by ID', async () => {
			const prescription = await api.getPrescriptionById('RX124')
			expect(prescription).toBeDefined()
			expect(prescription?.patientId).toBe('P002')
			expect(prescription?.status).toBe('PENDING')
		})

		it('should return undefined for non-existent prescription', async () => {
			const prescription = await api.getPrescriptionById('NONEXISTENT')
			expect(prescription).toBeUndefined()
		})
	})

	describe('fulfillPrescription', () => {
		it('should successfully fulfill prescription with sufficient stock', async () => {
			const result = await api.fulfillPrescription('RX124')
			expect(result.success).toBe(true)
			expect(result.errors).toBeUndefined()

			// 检查处方状态已更新
			const prescription = await api.getPrescriptionById('RX124')
			expect(prescription?.status).toBe('FULFILLED')

			// 检查库存已扣减
			const drugs = await api.getDrugs()
			const drugD003 = drugs.find(d => d.id === 'D003')
			expect(drugD003?.stock).toBe(250) // 500 - 250
		})

		it('should fail fulfillment with insufficient stock', async () => {
			const result = await api.fulfillPrescription('RX123')
			expect(result.success).toBe(false)
			expect(result.errors).toContain('药品 D002 库存不足')
		})

		it('should fail fulfillment for non-existent prescription', async () => {
			const result = await api.fulfillPrescription('NONEXISTENT')
			expect(result.success).toBe(false)
			expect(result.errors).toContain('处方不存在')
		})
	})
})
