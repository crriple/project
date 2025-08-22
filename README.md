# 医药处方履约前端系统

该项目旨在提供一个基于Web的医药处方履约管理界面，提供完整的药品管理、药房管理、处方管理、审计日志和操作日志等功能。

## 🚀 功能特性

### 核心功能
- **药品管理**: 药品信息录入、编辑、删除、批量导入/导出
- **药房管理**: 药房信息管理、药品分配、详情查看
- **处方管理**: 处方创建、编辑、履约状态管理
- **审计日志**: 处方履约审计记录、失败原因分析
- **操作日志**: 系统操作记录、用户行为追踪

### 高级功能
- **Excel导入导出**: 支持批量数据导入和导出
- **批量操作**: 支持药品和药房的批量新增
- **实时校验**: 完善的表单验证和错误提示
- **多语言支持**: 中英文界面切换
- **响应式设计**: 适配不同屏幕尺寸

## 📋 系统要求

- **Node.js**: >= 18.15.0
- **包管理器**: 推荐使用 pnpm
- **浏览器**: 支持现代浏览器 (Chrome, Firefox, Safari, Edge)

## 🛠️ 安装与运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd rx-fulfillment
```

### 2. 安装依赖
```bash
# 推荐使用 pnpm
pnpm install

# 或者使用 npm
npm install
```

### 3. 启动开发服务器
```bash
pnpm run dev
# 或
npm run dev
```

### 4. 构建生产版本
```bash
pnpm run build
# 或
npm run build
```

## 🏗️ 项目结构

```
rx-fulfillment/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Layout.vue      # 主布局组件
│   │   ├── SideNav.vue     # 侧边导航
│   │   └── Breadcrumb.vue  # 面包屑导航
│   ├── views/              # 页面组件
│   │   ├── Home.vue        # 首页
│   │   ├── drugs/          # 药品管理
│   │   ├── Pharmacies.vue  # 药房管理
│   │   ├── Prescriptions.vue # 处方管理
│   │   ├── AuditLogs.vue   # 审计日志
│   │   └── OperationLogs.vue # 操作日志
│   ├── store/              # Vuex状态管理
│   ├── router/             # 路由配置
│   ├── services/           # 服务层
│   │   ├── mockApi.ts      # 模拟API
│   │   ├── excel.ts        # Excel处理
│   │   └── __tests__/      # 单元测试
│   ├── locales/            # 国际化文件
│   ├── types.ts            # TypeScript类型定义
│   └── styles/             # 全局样式
├── docs/                   # 项目文档
├── public/                 # 静态资源
└── package.json            # 项目配置
```

## 🎯 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **状态管理**: Vuex 4
- **路由管理**: Vue Router 4
- **UI组件库**: Element Plus
- **国际化**: Vue I18n 9
- **测试框架**: Vitest
- **类型系统**: TypeScript
- **样式预处理**: CSS3 + CSS Variables

## 🔧 开发指南

### 代码规范
- 使用 Vue 3 Composition API
- 遵循 Vue 3 最佳实践
- 使用 TypeScript 进行类型检查
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 组件开发
- 组件粒度适中，职责单一
- 使用 `<script setup>` 语法
- 合理使用 `defineProps` 和 `defineEmits`
- 组件样式使用 `scoped` 作用域

### 状态管理
- 使用 Vuex 管理全局状态
- 模块化组织 store
- 异步操作使用 actions
- 计算属性使用 getters

## 📚 使用说明

### 药品管理
1. 点击"药品管理"菜单
2. 使用"添加"按钮新增药品
3. 支持Excel批量导入和导出
4. 使用"批量新增"进行批量操作

### 药房管理
1. 点击"药房管理"菜单
2. 管理药房基本信息和药品分配
3. 支持批量操作和Excel导入导出

### 处方管理
1. 点击"处方管理"菜单
2. 创建和管理处方信息
3. 跟踪处方履约状态

### 系统设置
1. 点击右上角用户菜单
2. 选择"系统设置"
3. 配置系统参数和提醒设置

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
pnpm run test

# 运行测试并监听文件变化
pnpm run test:watch

# 生成测试覆盖率报告
pnpm run test:coverage
```

### 测试规范
- 测试文件放在 `src/services/__tests__/` 目录
- 测试文件命名格式: `service.test.ts`
- 使用 Vitest 作为测试框架
- 编写完整的单元测试用例

## 🌐 国际化

系统支持中英文切换：
- 中文 (zh-CN): 默认语言
- 英文 (en-US): 支持完整翻译

### 添加新翻译
1. 在 `src/locales/zh-CN.ts` 添加中文翻译
2. 在 `src/locales/en-US.ts` 添加英文翻译
3. 在组件中使用 `t('key')` 函数

## 📦 构建与部署

### 开发环境
```bash
pnpm run dev
```

### 生产构建
```bash
pnpm run build
```

### 预览构建结果
```bash
pnpm run preview
```

## 🔍 调试

### 浏览器调试
- 使用浏览器开发者工具
- 查看控制台日志和错误信息
- 使用 Vue DevTools 插件

### 代码调试
- 在 VS Code 中设置断点
- 使用 `console.log` 进行日志输出
- 检查网络请求和响应

## 📝 更新日志

详细的更新日志请查看 [CHANGELOG.md](./CHANGELOG.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 许可证

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 项目讨论区

## 🙏 致谢

感谢所有为项目做出贡献的开发者和用户！

---

**注意**: 本项目仅供学习和研究使用，请勿用于商业用途。
