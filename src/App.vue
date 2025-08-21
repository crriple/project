<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import SideNav from './components/SideNav.vue'
import { SwitchButton, User, Setting } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const collapsed = ref(false)
const asideWidth = computed(() => (collapsed.value ? '64px' : '220px'))
const isAuthed = computed(() => !!store.state.token)

const logout = () => {
	store.dispatch('logout')
	router.replace('/login')
}

const onCommand = (cmd: string) => {
	if (cmd === 'profile') router.push('/profile')
	if (cmd === 'settings') router.push('/settings')
}
</script>

<template>
  <template v-if="isAuthed">
    <el-container class="app-layout">
      <el-aside :width="asideWidth" style="border-right: 1px solid var(--el-border-color)">
        <SideNav :collapsed="collapsed" />
      </el-aside>
      <el-container>
        <el-header class="app-header" style="border-bottom: 1px solid var(--el-border-color)">
          <div class="title">医药处方履约前端系统</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <el-dropdown @command="onCommand">
              <span class="el-dropdown-link" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <el-tag type="info">{{ store.state.username }}</el-tag>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon style="margin-right:6px"><User /></el-icon>修改信息
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon style="margin-right:6px"><Setting /></el-icon>系统设置
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" :icon="SwitchButton" circle @click="logout" />
          </div>
        </el-header>
        <el-main class="app-main" style="padding:16px">
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </template>
  <template v-else>
    <RouterView />
  </template>
</template>

<style scoped>
.app-header{ background: #fff; }
</style>
