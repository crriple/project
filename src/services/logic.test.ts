import { describe, it, expect } from 'vitest'
import { __test__ } from './mockApi'
import type { Prescription } from '../types'

describe('prescription checks', () => {
	it('detects expired drug and allocation overflow and stock', () => {
		const p: Prescription = {
			id: 'RX_T',
			patientId: 'P1',
			pharmacyId: 'PH001',
			drugs: [
				{ drugId: 'D002', dosage: 1000 }, // expired and over stock/limit
			],
			status: 'PENDING',
		}
		const res = __test__.checkPrescription(p)
		expect(res.ok).toBe(false)
		expect(res.errors.some((e) => e.includes('已过期'))).toBe(true)
		expect(res.errors.some((e) => e.includes('库存不足'))).toBe(true)
		expect(res.errors.some((e) => e.includes('分配限额'))).toBe(true)
	})
}) 