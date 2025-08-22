import { describe, it, expect, beforeEach } from 'vitest'
import { pharmaciesApi, __test__ } from '../mockApi'
import type { Pharmacy } from '../../types'

describe('Pharmacies API', () => {
	beforeEach(() => {
		__test__.resetData()
	})

	describe('getPharmacies', () => {
		it('should return all pharmacies', async () => {
			const pharmacies = await pharmaciesApi.getPharmacies()
			expect(pharmacies).toHaveLength(3)
			expect(pharmacies[0].id).toBe('PH001')
			expect(pharmacies[0].name).toBe('中心药房')
		})
	})

	describe('createPharmacy', () => {
		it('should create a new pharmacy with generated ID', async () => {
			const newPharmacy: Omit<Pharmacy, 'id'> = {
				name: '新药房',
				allocatedDrugs: ['D001', 'D002'],
			}

			const created = await pharmaciesApi.createPharmacy(newPharmacy)
			expect(created.id).toMatch(/^PH\d+$/)
			expect(created.name).toBe('新药房')
			expect(created.allocatedDrugs).toEqual(['D001', 'D002'])

			const allPharmacies = await pharmaciesApi.getPharmacies()
			expect(allPharmacies).toHaveLength(4)
		})
	})

	describe('updatePharmacy', () => {
		it('should update existing pharmacy', async () => {
			const updateData = { id: 'PH001', name: '中心药房更新版' }
			const updated = await pharmaciesApi.updatePharmacy(updateData)
			
			expect(updated.name).toBe('中心药房更新版')
			expect(updated.allocatedDrugs).toEqual(['D001', 'D002', 'D003']) // 其他字段保持不变
		})

		it('should throw error for non-existent pharmacy', async () => {
			await expect(
				pharmaciesApi.updatePharmacy({ id: 'NONEXISTENT', name: '新名称' })
			).rejects.toThrow('药房不存在')
		})
	})

	describe('deletePharmacy', () => {
		it('should delete existing pharmacy', async () => {
			await pharmaciesApi.deletePharmacy('PH001')
			
			const allPharmacies = await pharmaciesApi.getPharmacies()
			expect(allPharmacies).toHaveLength(2)
			expect(allPharmacies.find(p => p.id === 'PH001')).toBeUndefined()
		})

		it('should throw error for non-existent pharmacy', async () => {
			await expect(
				pharmaciesApi.deletePharmacy('NONEXISTENT')
			).rejects.toThrow('药房不存在')
		})
	})

	describe('getPharmacyById', () => {
		it('should return pharmacy by ID', async () => {
			const pharmacy = await pharmaciesApi.getPharmacyById('PH001')
			expect(pharmacy).toBeDefined()
			expect(pharmacy?.name).toBe('中心药房')
			expect(pharmacy?.allocatedDrugs).toEqual(['D001', 'D002', 'D003'])
		})

		it('should return null for non-existent pharmacy', async () => {
			const pharmacy = await pharmaciesApi.getPharmacyById('NONEXISTENT')
			expect(pharmacy).toBeNull()
		})
	})
})
