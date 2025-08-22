<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbItems" 
      :key="index"
      :to="item.path"
      :class="{ 'last-item': index === breadcrumbItems.length - 1 }"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface BreadcrumbItem {
  title: string
  path?: string
}

const route = useRoute()
const { t } = useI18n()

// 根据当前路由生成面包屑
const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []
  
  // 添加首页
  items.push({
    title: t('nav.home'),
    path: '/home'
  })
  
  // 根据路由路径添加对应的面包屑
  const path = route.path
  const routeName = route.name
  
  console.log('面包屑调试信息:', { path, routeName, params: route.params })
  
  if (path.startsWith('/drugs')) {
    items.push({
      title: t('nav.drugs'),
      path: '/drugs'
    })
    
    // 如果是药品详情页面
    if (path.includes('/detail')) {
      items.push({
        title: t('drugs.detail')
      })
    }
  } else if (path.startsWith('/pharmacies')) {
    items.push({
      title: t('nav.pharmacies'),
      path: '/pharmacies'
    })
    
    // 如果是药房详情页面（通过路由参数判断）
    if (route.params.id && routeName === 'pharmacy-detail') {
      items.push({
        title: t('pharmacies.detail')
      })
    }
  } else if (path.startsWith('/prescriptions')) {
    items.push({
      title: t('nav.prescriptions'),
      path: '/prescriptions'
    })
    
    // 如果是处方详情页面（通过路由参数判断）
    if (route.params.id && routeName === 'prescription-detail') {
      items.push({
        title: t('prescriptions.detail')
      })
    }
  } else if (path.startsWith('/audit-logs')) {
    items.push({
      title: t('nav.auditLogs'),
      path: '/audit-logs'
    })
  } else if (path.startsWith('/operation-logs')) {
    items.push({
      title: t('nav.operationLogs'),
      path: '/operation-logs'
    })
  } else if (path.startsWith('/profile')) {
    items.push({
      title: t('nav.profile'),
      path: '/profile'
    })
  } else if (path.startsWith('/settings')) {
    items.push({
      title: t('nav.settings'),
      path: '/settings'
    })
  } else if (path === '/home') {
    // 首页不需要额外添加
  }
  
  console.log('生成的面包屑项目:', items)
  return items
})
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  font-size: 14px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: #6c757d;
  font-weight: 500;
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #007bff;
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link) {
  color: #6c757d;
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) {
  color: #007bff;
}

.last-item :deep(.el-breadcrumb__inner) {
  color: #495057;
  font-weight: 600;
}

.last-item :deep(.el-breadcrumb__inner:hover) {
  color: #495057;
}
</style>
