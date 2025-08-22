import { describe, it, expect, beforeEach } from 'vitest'
import { drugsApi, __test__ } from '../mockApi'
import type { Drug } from '../../types'

describe('Drugs API', () => {
	beforeEach(() => {
		__test__.resetData()
	})

	describe('getDrugs', () => {
		it('should return all drugs', async () => {
			const drugs = await drugsApi.getDrugs()
			expect(drugs).toHaveLength(5)
			expect(drugs[0].id).toBe('D001')
			expect(drugs[0].name).toBe('布洛芬')
		})
	})

	describe('createDrug', () => {
		it('should create a new drug with generated ID', async () => {
			const newDrug: Omit<Drug, 'id'> = {
				name: '新药品',
				manufacturer: '新药厂',
				batch: 'B2024006',
				expiry: '2026-12-31',
				stock: 50,
				limit: 25,
			}

			const created = await drugsApi.createDrug(newDrug)
			expect(created.id).toMatch(/^D\d+$/)
			expect(created.name).toBe('新药品')
			expect(created.manufacturer).toBe('新药厂')

			const allDrugs = await drugsApi.getDrugs()
			expect(allDrugs).toHaveLength(6)
		})
	})

	describe('updateDrug', () => {
		it('should update existing drug', async () => {
			const updateData = { id: 'D001', name: '布洛芬更新版' }
			const updated = await drugsApi.updateDrug(updateData)
			
			expect(updated.name).toBe('布洛芬更新版')
			expect(updated.manufacturer).toBe('ACME制药') // 其他字段保持不变
		})

		it('should throw error for non-existent drug', async () => {
			await expect(
				drugsApi.updateDrug({ id: 'NONEXISTENT', name: '新名称' })
			).rejects.toThrow('药品不存在')
		})
	})

	describe('deleteDrug', () => {
		it('should delete existing drug', async () => {
			await drugsApi.deleteDrug('D001')
			
			const allDrugs = await drugsApi.getDrugs()
			expect(allDrugs).toHaveLength(4)
			expect(allDrugs.find(d => d.id === 'D001')).toBeUndefined()
		})

		it('should throw error for non-existent drug', async () => {
			await expect(
				drugsApi.deleteDrug('NONEXISTENT')
			).rejects.toThrow('药品不存在')
		})
	})

	describe('getDrugById', () => {
		it('should return drug by ID', async () => {
			const drug = await drugsApi.getDrugById('D001')
			expect(drug).toBeDefined()
			expect(drug?.name).toBe('布洛芬')
		})

		it('should return null for non-existent drug', async () => {
			const drug = await drugsApi.getDrugById('NONEXISTENT')
			expect(drug).toBeNull()
		})
	})
})
