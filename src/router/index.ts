import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
	{ path: '/', redirect: '/drugs' },
	{ path: '/drugs', component: () => import('../views/Drugs.vue') },
	{ path: '/pharmacies', component: () => import('../views/Pharmacies.vue') },
	{ path: '/pharmacies/:id', component: () => import('../views/PharmacyDetail.vue') },
	{ path: '/prescriptions', component: () => import('../views/Prescriptions.vue') },
	{ path: '/prescriptions/:id', component: () => import('../views/PrescriptionDetail.vue') },
	{ path: '/audit-logs', component: () => import('../views/AuditLogs.vue') },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router 