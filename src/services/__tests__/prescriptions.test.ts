import { describe, it, expect, beforeEach } from 'vitest'
import { prescriptionsApi, __test__ } from '../mockApi'
import type { Prescription } from '../../types'

describe('Prescriptions API', () => {
	beforeEach(() => {
		__test__.resetData()
	})

	describe('getPrescriptions', () => {
		it('should return all prescriptions', async () => {
			const prescriptions = await prescriptionsApi.getPrescriptions()
			expect(prescriptions).toHaveLength(3)
			expect(prescriptions[0].id).toBe('P001')
			expect(prescriptions[0].patientId).toBe('PAT001')
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

			const created = await prescriptionsApi.createPrescription(newPrescription)
			expect(created.id).toMatch(/^P\d+$/)
			expect(created.patientId).toBe('PAT004')
			expect(created.pharmacyId).toBe('PH001')

			const allPrescriptions = await prescriptionsApi.getPrescriptions()
			expect(allPrescriptions).toHaveLength(4)
		})
	})

	describe('updatePrescription', () => {
		it('should update existing prescription', async () => {
			const updateData = { id: 'P001', status: 'FULFILLED' as const }
			const updated = await prescriptionsApi.updatePrescription(updateData)
			
			expect(updated.status).toBe('FULFILLED')
			expect(updated.patientId).toBe('PAT001') // 其他字段保持不变
		})

		it('should throw error for non-existent prescription', async () => {
			await expect(
				prescriptionsApi.updatePrescription({ id: 'NONEXISTENT', status: 'FULFILLED' })
			).rejects.toThrow('处方不存在')
		})
	})

	describe('deletePrescription', () => {
		it('should delete existing prescription', async () => {
			await prescriptionsApi.deletePrescription('P001')
			
			const allPrescriptions = await prescriptionsApi.getPrescriptions()
			expect(allPrescriptions).toHaveLength(2)
			expect(allPrescriptions.find(p => p.id === 'P001')).toBeUndefined()
		})

		it('should throw error for non-existent prescription', async () => {
			await expect(
				prescriptionsApi.deletePrescription('NONEXISTENT')
			).rejects.toThrow('处方不存在')
		})
	})

	describe('getPrescriptionById', () => {
		it('should return prescription by ID', async () => {
			const prescription = await prescriptionsApi.getPrescriptionById('P001')
			expect(prescription).toBeDefined()
			expect(prescription?.patientId).toBe('PAT001')
			expect(prescription?.status).toBe('PENDING')
		})

		it('should return null for non-existent prescription', async () => {
			const prescription = await prescriptionsApi.getPrescriptionById('NONEXISTENT')
			expect(prescription).toBeNull()
		})
	})

	describe('fulfillPrescription', () => {
		it('should successfully fulfill prescription with sufficient stock', async () => {
			const result = await prescriptionsApi.fulfillPrescription('P002')
			expect(result.success).toBe(true)
			expect(result.errors).toBeUndefined()

			// 检查处方状态已更新
			const prescription = await prescriptionsApi.getPrescriptionById('P002')
			expect(prescription?.status).toBe('FULFILLED')

			// 检查库存已扣减
			const drugs = await prescriptionsApi.api.drugs.getDrugs()
			const drugD004 = drugs.find(d => d.id === 'D004')
			expect(drugD004?.stock).toBe(197) // 200 - 3
		})

		it('should fail fulfillment with insufficient stock', async () => {
			const result = await prescriptionsApi.fulfillPrescription('P003')
			expect(result.success).toBe(false)
			expect(result.errors).toContain('药品感冒灵库存不足')
		})

		it('should fail fulfillment for non-existent prescription', async () => {
			const result = await prescriptionsApi.fulfillPrescription('NONEXISTENT')
			expect(result.success).toBe(false)
			expect(result.errors).toContain('处方不存在')
		})
	})
})
