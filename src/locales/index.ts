import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const i18n = createI18n({
	legacy: false,
	locale: localStorage.getItem('locale') || 'zh-CN',
	fallbackLocale: 'zh-CN',
	messages: {
		'zh-CN': zhCN,
		'en-US': enUS,
	},
})

export default i18n

// 页面搜索数据
export const pageSearchData = [
	{
		title: '首页',
		subtitle: '功能概览、数据统计、图表展示',
		path: '/home',
		keywords: ['首页', 'home', 'dashboard', '概览', '统计', '图表'],
	},
	{
		title: '药品管理',
		subtitle: '药品的增删改查、库存管理、过期标记',
		path: '/drugs',
		keywords: ['药品', 'drug', '管理', '库存', '过期', '增删改查'],
	},
	{
		title: '药房管理',
		subtitle: '药房信息管理、药品分配、详情查看',
		path: '/pharmacies',
		keywords: ['药房', 'pharmacy', '管理', '分配', '详情'],
	},
	{
		title: '处方管理',
		subtitle: '处方列表、详情查看、履约处理',
		path: '/prescriptions',
		keywords: ['处方', 'prescription', '管理', '履约', '详情'],
	},
	{
		title: '审计日志',
		subtitle: '系统操作审计、失败原因分析',
		path: '/audit-logs',
		keywords: ['审计', 'audit', '日志', '操作', '失败'],
	},
	{
		title: '操作日志',
		subtitle: '用户操作记录、系统行为追踪',
		path: '/operation-logs',
		keywords: ['操作', 'operation', '日志', '记录', '追踪'],
	},
	{
		title: '修改信息',
		subtitle: '用户基本信息修改、密码更新',
		path: '/profile',
		keywords: ['信息', 'profile', '修改', '密码', '用户'],
	},
	{
		title: '系统设置',
		subtitle: '系统参数配置、功能开关设置',
		path: '/settings',
		keywords: ['系统', 'system', '设置', '配置', '参数'],
	},
]
