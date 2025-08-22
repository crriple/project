import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/Login.vue')
		},
		{
			path: '/',
			component: () => import('../components/Layout.vue'),
			children: [
				{
					path: '',
					redirect: '/home'
				},
				{
					path: 'home',
					name: 'home',
					component: () => import('../views/Home.vue')
				},
				{
					path: 'drugs',
					name: 'drugs',
					component: () => import('../views/drugs/index.vue')
				},
				{
					path: 'pharmacies',
					name: 'pharmacies',
					component: () => import('../views/Pharmacies.vue')
				},
				{
					path: 'prescriptions',
					name: 'prescriptions',
					component: () => import('../views/Prescriptions.vue')
				},
				{
					path: 'audit-logs',
					name: 'audit-logs',
					component: () => import('../views/AuditLogs.vue')
				},
				{
					path: 'operation-logs',
					name: 'operation-logs',
					component: () => import('../views/OperationLogs.vue')
				},
				{
					path: 'profile',
					name: 'profile',
					component: () => import('../views/UserProfile.vue')
				},
				{
					path: 'settings',
					name: 'settings',
					component: () => import('../views/SystemSettings.vue')
				},
				{
					path: 'pharmacies/:id',
					name: 'pharmacy-detail',
					component: () => import('../views/PharmacyDetail.vue')
				},
				{
					path: 'prescriptions/:id',
					name: 'prescription-detail',
					component: () => import('../views/PrescriptionDetail.vue')
				}
			]
		}
	]
})

export default router 