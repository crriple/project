<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" style="border-right: 1px solid var(--el-border-color)">
      <div style="padding: 16px; font-weight: 600">处方履约系统</div>
      <el-menu router default-active="/drugs">
        <el-menu-item index="/drugs">药品管理</el-menu-item>
        <el-menu-item index="/pharmacies">药房管理</el-menu-item>
        <el-menu-item index="/prescriptions">处方管理</el-menu-item>
        <el-menu-item index="/audit-logs">审计日志</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="border-bottom: 1px solid var(--el-border-color)">
        <div style="font-weight: 600">医药处方履约前端系统</div>
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
</style>
