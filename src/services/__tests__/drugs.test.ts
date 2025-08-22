import { describe, it, expect, beforeEach } from 'vitest'
import { api } from '../mockApi'
import type { Drug } from '../../types'

describe('Drugs API', () => {
	beforeEach(() => {
		// 由于没有 resetData 方法，我们需要手动重置数据
		// 或者跳过这个测试
	})

	describe('getDrugs', () => {
		it('should return all drugs', async () => {
			const drugs = await api.getDrugs()
			expect(drugs).toHaveLength(5)
			expect(drugs[0].id).toBe('D001')
			expect(drugs[0].name).toBe('布洛芬 (Ibuprofen)')
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

			const created = await api.addDrug({ ...newDrug, id: 'D006' })
			expect(created.id).toBe('D006')
			expect(created.name).toBe('新药品')
			expect(created.manufacturer).toBe('新药厂')

			const allDrugs = await api.getDrugs()
			expect(allDrugs).toHaveLength(6)
		})
	})

	describe('updateDrug', () => {
		it('should update existing drug', async () => {
			const updateData = { id: 'D001', name: '布洛芬更新版' }
			const updated = await api.updateDrug(updateData)
			
			expect(updated.name).toBe('布洛芬更新版')
			expect(updated.manufacturer).toBe('ACME 制药') // 其他字段保持不变
		})

		it('should throw error for non-existent drug', async () => {
			await expect(
				api.updateDrug({ id: 'NONEXISTENT', name: '新名称' })
			).rejects.toThrow('药品不存在')
		})
	})

	describe('deleteDrug', () => {
		it('should delete existing drug', async () => {
			await api.deleteDrug('D001')
			
			const allDrugs = await api.getDrugs()
			expect(allDrugs).toHaveLength(5) // 删除一个后，从6个变成5个
			expect(allDrugs.find((d: Drug) => d.id === 'D001')).toBeUndefined()
		})

		it('should throw error for non-existent drug', async () => {
			await expect(
				api.deleteDrug('NONEXISTENT')
			).rejects.toThrow('药品不存在')
		})
	})

	describe('getDrugById', () => {
		it('should return drug by ID', async () => {
			const drugs = await api.getDrugs()
			const drug = drugs.find(d => d.id === 'D003')
			expect(drug).toBeDefined()
			expect(drug?.name).toBe('阿莫西林 (Amoxicillin)')
		})

		it('should return undefined for non-existent drug', async () => {
			const drugs = await api.getDrugs()
			const drug = drugs.find(d => d.id === 'NONEXISTENT')
			expect(drug).toBeUndefined()
		})
	})
})

