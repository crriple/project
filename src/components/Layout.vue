<template>
  <el-container class="app-layout">
    <el-aside :width="asideWidth" style="border-right: 1px solid var(--el-border-color)">
      <SideNav />
    </el-aside>
    <el-container>
      <el-header class="app-header" style="border-bottom: 1px solid var(--el-border-color)">
        <div class="header-left">
          <!-- 搜索框 -->
          <el-input
            v-model="searchQuery"
            :placeholder="t('common.search')"
            class="header-search"
            @input="onSearch"
            @focus="searchVisible = true"
            @blur="setTimeout(() => searchVisible.value = false, 200)"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 搜索结果下拉 -->
          <div v-if="searchVisible && searchResults.length > 0" class="search-results">
            <div
              v-for="result in searchResults"
              :key="result.path"
              class="search-result-item"
              @click="onSearchSelect(result.path)"
            >
              <div class="result-title">{{ result.title }}</div>
              <div class="result-subtitle">{{ result.subtitle }}</div>
            </div>
          </div>
        </div>
        
        <div class="header-right">
          <!-- 语言切换按钮 -->
          <el-button @click="toggleLanguage" class="lang-btn">
            <el-icon><Setting /></el-icon>
            {{ locale === 'zh-CN' ? t('common.en') : t('common.zh') }}
          </el-button>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="onCommand">
            <span class="el-dropdown-link" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <el-tag type="info">{{ store.state.username }}</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon style="margin-right:6px"><User /></el-icon>{{ t('nav.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon style="margin-right:6px"><Setting /></el-icon>{{ t('nav.settings') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 退出按钮 -->
          <el-button type="danger" :icon="SwitchButton" circle @click="logout" />
        </div>
      </el-header>
      <el-main class="app-main" style="padding:16px">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { Search, Setting, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import SideNav from './SideNav.vue'
import { pageSearchData } from '../locales'

const store = useStore()
const router = useRouter()
const { t, locale } = useI18n()
const asideWidth = '260px'

// 认证检查
const isAuthed = computed(() => !!store.state.token)

// 认证检查
onMounted(() => {
  if (!isAuthed.value) {
    router.replace('/login')
  }
})

// 搜索相关
const searchVisible = ref(false)
const searchQuery = ref('')
const searchResults = ref<typeof pageSearchData>([])

const logout = async () => {
	try {
		await ElMessageBox.confirm(
			'确认要退出登录吗？',
			'退出确认',
			{ type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' }
		)
		// 先本地清理并立即跳转
		store.commit('setAuth', { token: null, username: null })
		localStorage.removeItem('token')
		localStorage.removeItem('username')
		router.replace('/login')
		// 后台调用登出接口（忽略结果，不阻塞跳转）
		store.dispatch('logout').catch(() => {})
	} catch (e) {
		// 用户取消，无需处理
	}
}

const onCommand = (cmd: string) => {
	if (cmd === 'profile') router.push('/profile')
	if (cmd === 'settings') router.push('/settings')
}

// 搜索功能
const onSearch = () => {
	if (!searchQuery.value.trim()) {
		searchResults.value = []
		return
	}
	
	const query = searchQuery.value.toLowerCase()
	searchResults.value = pageSearchData.filter(page => 
		page.title.toLowerCase().includes(query) ||
		page.subtitle.toLowerCase().includes(query) ||
		page.keywords.some(keyword => keyword.toLowerCase().includes(query))
	)
}

const onSearchSelect = (path: string) => {
	router.push(path)
	searchVisible.value = false
	searchQuery.value = ''
	searchResults.value = []
}

// 语言切换
const toggleLanguage = () => {
	const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
	locale.value = newLocale
	localStorage.setItem('locale', newLocale)
}
</script>

<style scoped>
.app-header{ 
  background: #fff; 
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.header-search {
  width: 100%;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:hover {
  background-color: #f5f7fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.result-subtitle {
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
</style>
