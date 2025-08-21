<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Goods, OfficeBuilding, Document, List } from '@element-plus/icons-vue'

const props = defineProps<{ collapsed?: boolean }>()
const route = useRoute()
const active = computed(() => route.path)
</script>

<template>
  <div class="sidenav">
    <div class="brand" :class="{ collapsed: props.collapsed }">
      <img src="/vite.svg" alt="logo" class="logo" />
      <span v-if="!props.collapsed" class="title">处方履约系统</span>
    </div>
    <div class="caption" v-if="!props.collapsed">导航</div>
    <el-menu
      router
      :default-active="active"
      :collapse="!!props.collapsed"
      :collapse-transition="false"
      class="menu"
    >
      <el-menu-item index="/home">
        <el-icon><Document /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/drugs">
        <el-icon><Goods /></el-icon>
        <span>药品管理</span>
      </el-menu-item>
      <el-menu-item index="/pharmacies">
        <el-icon><OfficeBuilding /></el-icon>
        <span>药房管理</span>
      </el-menu-item>
      <el-menu-item index="/prescriptions">
        <el-icon><Document /></el-icon>
        <span>处方管理</span>
      </el-menu-item>
      <el-menu-item index="/audit-logs">
        <el-icon><List /></el-icon>
        <span>审计日志</span>
      </el-menu-item>
      <el-menu-item index="/operation-logs">
        <el-icon><List /></el-icon>
        <span>操作日志</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.sidenav { height: 100%; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 10px; padding: 14px 12px; }
.brand .logo { width: 22px; height: 22px; }
.brand.collapsed { justify-content: center; }
.title { font-weight: 700; font-size: 14px; }
.caption { color: #8b8ea3; font-size: 12px; padding: 0 12px 8px; }
.menu :deep(.el-menu-item){ height: 42px; line-height: 42px; border-radius: 8px; margin: 4px 8px; }
.menu :deep(.el-menu-item.is-active){ background: rgba(58,122,254,.12); color: var(--el-color-primary); }
.menu :deep(.el-menu-item:hover){ background: rgba(0,0,0,.03); }
</style>
