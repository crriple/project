import Vuex, { Store as VuexStore } from 'vuex'
import { api } from '../services/mockApi'
import type { Drug, Pharmacy, Prescription, AuditLog, OperationLog, UserProfile, SystemSettings } from '../types'

export interface RootState {
	token: string | null
	username: string | null
	drugs: Drug[]
	pharmacies: Pharmacy[]
	prescriptions: Prescription[]
	auditLogs: AuditLog[]
	operationLogs: OperationLog[]
	loading: boolean
	error: string | null
	userProfile?: UserProfile | null
	systemSettings?: SystemSettings | null
}

const store = Vuex.createStore<RootState>({
	state: {
		token: null,
		username: null,
		drugs: [],
		pharmacies: [],
		prescriptions: [],
		auditLogs: [],
		operationLogs: [],
		loading: false,
		error: null,
		userProfile: null,
		systemSettings: null,
	},
	mutations: {
		setLoading(state: RootState, val: boolean) {
			state.loading = val
		},
		setError(state: RootState, msg: string | null) {
			state.error = msg
		},
		setAuth(state: RootState, payload: { token: string | null; username: string | null }) {
			state.token = payload.token
			state.username = payload.username
		},
		setDrugs(state: RootState, list: Drug[]) {
			state.drugs = list
		},
		addDrug(state: RootState, item: Drug) {
			state.drugs.unshift(item)
		},
		replaceDrug(state: RootState, item: Drug) {
			const i = state.drugs.findIndex((d) => d.id === item.id)
			if (i >= 0) state.drugs[i] = item
		},
		removeDrug(state: RootState, id: string) {
			state.drugs = state.drugs.filter((d) => d.id !== id)
		},
		setPharmacies(state: RootState, list: Pharmacy[]) {
			state.pharmacies = list
		},
		addPharmacy(state: RootState, item: Pharmacy) {
			state.pharmacies.unshift(item)
		},
		replacePharmacy(state: RootState, item: Pharmacy) {
			const i = state.pharmacies.findIndex((p) => p.id === item.id)
			if (i >= 0) state.pharmacies[i] = item
		},
		removePharmacy(state: RootState, id: string) {
			state.pharmacies = state.pharmacies.filter((p) => p.id !== id)
		},
		setPrescriptions(state: RootState, list: Prescription[]) {
			state.prescriptions = list
		},
		addPrescription(state: RootState, item: Prescription) {
			state.prescriptions.unshift(item)
		},
		replacePrescription(state: RootState, item: Prescription) {
			const i = state.prescriptions.findIndex((p) => p.id === item.id)
			if (i >= 0) state.prescriptions[i] = item
		},
		removePrescription(state: RootState, id: string) {
			state.prescriptions = state.prescriptions.filter((p) => p.id !== id)
		},
		updatePrescription(state: RootState, p: Prescription) {
			const i = state.prescriptions.findIndex((x: Prescription) => x.id === p.id)
			if (i >= 0) state.prescriptions[i] = p
		},
		setAuditLogs(state: RootState, list: AuditLog[]) {
			state.auditLogs = list
		},
		setOperationLogs(state: RootState, list: OperationLog[]) {
			state.operationLogs = list
		},
		setUserProfile(state: RootState, p: UserProfile | null) {
			state.userProfile = p
		},
		setSystemSettings(state: RootState, s: SystemSettings | null) {
			state.systemSettings = s
		},
	},
	actions: {
		initAuth({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const token = localStorage.getItem('token')
			const username = localStorage.getItem('username')
			if (token && username) commit('setAuth', { token, username })
		},
		async login({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: { username: string; password: string }) {
			const res = await api.login(payload.username, payload.password)
			localStorage.setItem('token', res.token)
			localStorage.setItem('username', res.username)
			commit('setAuth', { token: res.token, username: res.username })
		},
		logout({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			localStorage.removeItem('token')
			localStorage.removeItem('username')
			commit('setAuth', { token: null, username: null })
		},
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
		async updateDrug({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Partial<Drug> & { id: string }) {
			const res = await api.updateDrug(payload)
			commit('replaceDrug', res)
		},
		async deleteDrug({ commit }: { commit: VuexStore<RootState>['commit'] }, id: string) {
			await api.deleteDrug(id)
			commit('removeDrug', id)
		},
		async fetchPharmacies({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const list = await api.getPharmacies()
			commit('setPharmacies', list)
		},
		async createPharmacy({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Pharmacy) {
			const res = await api.addPharmacy(payload)
			commit('addPharmacy', res)
		},
		async updatePharmacy({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Partial<Pharmacy> & { id: string }) {
			const res = await api.updatePharmacy(payload)
			commit('replacePharmacy', res)
		},
		async deletePharmacy({ commit }: { commit: VuexStore<RootState>['commit'] }, id: string) {
			await api.deletePharmacy(id)
			commit('removePharmacy', id)
		},
		async fetchPrescriptions({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const list = await api.getPrescriptions()
			commit('setPrescriptions', list)
		},
		async createPrescription({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Prescription) {
			const res = await api.addPrescription(payload)
			commit('addPrescription', res)
		},
		async updatePrescriptionAction({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: Partial<Prescription> & { id: string }) {
			const res = await api.updatePrescription(payload)
			commit('replacePrescription', res)
		},
		async deletePrescription({ commit }: { commit: VuexStore<RootState>['commit'] }, id: string) {
			await api.deletePrescription(id)
			commit('removePrescription', id)
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
		async fetchOperationLogs({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const list = await api.getOperationLogs()
			commit('setOperationLogs', list)
		},
		async fetchUserProfile({ commit, state }: { commit: VuexStore<RootState>['commit']; state: RootState }) {
			if (!state.username) throw new Error('未登录')
			const p = await api.getUserProfile(state.username)
			commit('setUserProfile', p)
			return p
		},
		async updateUserProfile({ commit }: { commit: VuexStore<RootState>['commit'] }, payload: UserProfile) {
			const p = await api.updateUserProfile(payload)
			commit('setUserProfile', p)
			return p
		},
		async fetchSystemSettings({ commit }: { commit: VuexStore<RootState>['commit'] }) {
			const s = await api.getSystemSettings()
			commit('setSystemSettings', s)
			return s
		},
		async updateSystemSettings(
			{ commit }: { commit: VuexStore<RootState>['commit'] },
			payload: Partial<SystemSettings>,
		) {
			const s = await api.updateSystemSettings(payload)
			commit('setSystemSettings', s)
			return s
		},
	},
})

export default store 