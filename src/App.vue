<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import SideNav from './components/SideNav.vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const collapsed = ref(false)
const asideWidth = computed(() => (collapsed.value ? '64px' : '220px'))
</script>

<template>
  <el-container class="app-layout">
    <el-aside :width="asideWidth" style="border-right: 1px solid var(--el-border-color)">
      <SideNav :collapsed="collapsed" />
    </el-aside>
    <el-container>
      <el-header class="app-header" style="border-bottom: 1px solid var(--el-border-color)">
        <div class="title">医药处方履约前端系统</div>
        <div>
          <el-button circle @click="collapsed = !collapsed">
            <el-icon><component :is="collapsed ? Expand : Fold" /></el-icon>
          </el-button>
        </div>
      </el-header>
      <el-main class="app-main" style="padding:16px">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-header{ background: #fff; }
</style>
