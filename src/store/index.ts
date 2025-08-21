import Vuex, { Store as VuexStore } from 'vuex'
import { api } from '../services/mockApi'
import type { Drug, Pharmacy, Prescription, AuditLog } from '../types'

export interface RootState {
	drugs: Drug[]
	pharmacies: Pharmacy[]
	prescriptions: Prescription[]
	auditLogs: AuditLog[]
	loading: boolean
	error: string | null
}

const store = Vuex.createStore<RootState>({
	state: {
		drugs: [],
		pharmacies: [],
		prescriptions: [],
		auditLogs: [],
		loading: false,
		error: null,
	},
	mutations: {
		setLoading(state: RootState, val: boolean) {
			state.loading = val
		},
		setError(state: RootState, msg: string | null) {
			state.error = msg
		},
		setDrugs(state: RootState, list: Drug[]) {
			state.drugs = list
		},
		addDrug(state: RootState, item: Drug) {
			state.drugs.unshift(item)
		},
		setPharmacies(state: RootState, list: Pharmacy[]) {
			state.pharmacies = list
		},
		setPrescriptions(state: RootState, list: Prescription[]) {
			state.prescriptions = list
		},
		updatePrescription(state: RootState, p: Prescription) {
			const i = state.prescriptions.findIndex((x: Prescription) => x.id === p.id)
			if (i >= 0) state.prescriptions[i] = p
		},
		setAuditLogs(state: RootState, list: AuditLog[]) {
			state.auditLogs = list
		},
	},
	actions: {
		async fetchDrugs({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			commit('setLoading', true)
			try {
				const res = await api.getDrugs()
				commit('setDrugs', res)
			} catch (e: unknown) {
				const message = e instanceof Error ? e.message : '获取药品失败'
				commit('setError', message)
			} finally {
				commit('setLoading', false)
			}
		},
		async createDrug({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Drug) {
			const res = await api.addDrug(payload)
			commit('addDrug', res)
		},
		async fetchPharmacies({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const list = await api.getPharmacies()
			commit('setPharmacies', list)
		},
		async fetchPrescriptions({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const list = await api.getPrescriptions()
			commit('setPrescriptions', list)
		},
		async fulfillPrescription(
			{ dispatch }: { dispatch: VuexStore<RootState>['dispatch'] },
			id: string,
		) {
			const res = await api.fulfillPrescription(id)
			await dispatch('fetchPrescriptions')
			return res
		},
		async fetchAuditLogs({ commit }: { commit: VuexStore<RootState>['commit'] }, filter?: Record<string, unknown>) {
			const list = await api.getAuditLogs(filter)
			commit('setAuditLogs', list)
		},
	},
})

export default store 