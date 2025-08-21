import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import store from '../store'

const routes: RouteRecordRaw[] = [
	{ path: '/login', component: () => import('../views/Login.vue') },
	{ path: '/', redirect: '/home' },
	{ path: '/home', component: () => import('../views/Home.vue') },
	{ path: '/drugs', component: () => import('../views/Drugs.vue') },
	{ path: '/pharmacies', component: () => import('../views/Pharmacies.vue') },
	{ path: '/pharmacies/:id', component: () => import('../views/PharmacyDetail.vue') },
	{ path: '/prescriptions', component: () => import('../views/Prescriptions.vue') },
	{ path: '/prescriptions/:id', component: () => import('../views/PrescriptionDetail.vue') },
	{ path: '/audit-logs', component: () => import('../views/AuditLogs.vue') },
	{ path: '/operation-logs', component: () => import('../views/OperationLogs.vue') },
	{ path: '/profile', component: () => import('../views/UserProfile.vue') },
	{ path: '/settings', component: () => import('../views/SystemSettings.vue') },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to) => {
	if (to.path !== '/login' && !store.state.token) {
		return '/login'
	}
})

export default router 