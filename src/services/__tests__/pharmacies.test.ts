import { describe, it, expect, beforeEach } from 'vitest'
import { api } from '../mockApi'
import type { Pharmacy } from '../../types'

describe('Pharmacies API', () => {
	beforeEach(() => {
		// 由于没有 resetData 方法，我们需要手动重置数据
		// 或者跳过这个测试
	})

	describe('getPharmacies', () => {
		it('should return all pharmacies', async () => {
			const pharmacies = await api.getPharmacies()
			expect(pharmacies).toHaveLength(2)
			expect(pharmacies[0].id).toBe('PH001')
			expect(pharmacies[0].name).toBe('成都总店')
		})
	})

	describe('createPharmacy', () => {
		it('should create a new pharmacy with generated ID', async () => {
			const newPharmacy: Omit<Pharmacy, 'id'> = {
				name: '新药房',
				allocatedDrugs: [
					{ drugId: 'D001', drugName: '布洛芬', limit: 100 },
					{ drugId: 'D002', drugName: '扑热息痛', limit: 50 },
				],
			}

			const created = await api.addPharmacy({ ...newPharmacy, id: 'PH003' })
			expect(created.id).toBe('PH003')
			expect(created.name).toBe('新药房')
			expect(created.allocatedDrugs).toEqual([
				{ drugId: 'D001', drugName: '布洛芬', limit: 100 },
				{ drugId: 'D002', drugName: '扑热息痛', limit: 50 },
			])

			const allPharmacies = await api.getPharmacies()
			expect(allPharmacies).toHaveLength(3)
		})
	})

	describe('updatePharmacy', () => {
		it('should update existing pharmacy', async () => {
			const updateData = { id: 'PH001', name: '成都总店更新版' }
			const updated = await api.updatePharmacy(updateData)
			
			expect(updated.name).toBe('成都总店更新版')
			expect(updated.allocatedDrugs).toEqual([
				{ drugId: 'D001', drugName: '布洛芬', limit: 200 },
				{ drugId: 'D002', drugName: '扑热息痛', limit: 100 },
			]) // 其他字段保持不变
		})

		it('should throw error for non-existent pharmacy', async () => {
			await expect(
				api.updatePharmacy({ id: 'NONEXISTENT', name: '新名称' })
			).rejects.toThrow('药房不存在')
		})
	})

	describe('deletePharmacy', () => {
		it('should delete existing pharmacy', async () => {
			await api.deletePharmacy('PH001')
			
			const allPharmacies = await api.getPharmacies()
			expect(allPharmacies).toHaveLength(2) // 删除一个后，从3个变成2个
			expect(allPharmacies.find(p => p.id === 'PH001')).toBeUndefined()
		})

		it('should throw error for non-existent pharmacy', async () => {
			await expect(
				api.deletePharmacy('NONEXISTENT')
			).rejects.toThrow('药房不存在')
		})
	})

	describe('getPharmacyById', () => {
		it('should return pharmacy by ID', async () => {
			const pharmacy = await api.getPharmacyById('PH002')
			expect(pharmacy).toBeDefined()
			expect(pharmacy?.name).toBe('高新分店')
			expect(pharmacy?.allocatedDrugs).toEqual([
				{ drugId: 'D001', drugName: '布洛芬', limit: 50 },
			])
		})

		it('should return undefined for non-existent pharmacy', async () => {
			const pharmacy = await api.getPharmacyById('NONEXISTENT')
			expect(pharmacy).toBeUndefined()
		})
	})
})

