<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Goods, OfficeBuilding, Document, DocumentCopy, House, Operation } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const active = computed(() => route.path)
</script>

<template>
  <div class="sidenav">
    <div class="brand">
      <span class="title">{{ t('app.title') }}</span>
    </div>
    <el-menu
      router
      :default-active="active"
      :collapse="false"
      :collapse-transition="false"
      class="menu"
    >
      <el-menu-item index="/home">
        <el-icon><House /></el-icon>
        <span>{{ t('nav.home') }}</span>
      </el-menu-item>
      <el-menu-item index="/drugs">
        <el-icon><Goods /></el-icon>
        <span>{{ t('nav.drugs') }}</span>
      </el-menu-item>
      <el-menu-item index="/pharmacies">
        <el-icon><OfficeBuilding /></el-icon>
        <span>{{ t('nav.pharmacies') }}</span>
      </el-menu-item>
      <el-menu-item index="/prescriptions">
        <el-icon><Document /></el-icon>
        <span>{{ t('nav.prescriptions') }}</span>
      </el-menu-item>
      <el-menu-item index="/audit-logs">
        <el-icon><DocumentCopy /></el-icon>
        <span>{{ t('nav.auditLogs') }}</span>
      </el-menu-item>
      <el-menu-item index="/operation-logs">
        <el-icon><Operation /></el-icon>
        <span>{{ t('nav.operationLogs') }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.sidenav { height: 100%; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; justify-content: center; padding: 14px 12px; }
.title { font-weight: 700; font-size: 14px; }
.menu :deep(.el-menu-item){ height: 42px; line-height: 42px; border-radius: 8px; margin: 4px 8px; }
</style>
