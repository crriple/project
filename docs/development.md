# 医药处方履约系统 - 开发文档

## 项目概述
这是一个基于 Vue 3 + TypeScript + Element Plus 的医药处方履约管理系统，支持中英文国际化。

## 技术栈
- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Vuex 4
- **路由管理**: Vue Router 4
- **国际化**: Vue I18n 9
- **图表库**: ECharts
- **Excel处理**: xlsx
- **测试框架**: Vitest

## 项目结构

```
rx-fulfillment/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 静态资源（图片、字体等）
│   ├── components/        # 公共组件
│   │   ├── SideNav.vue    # 侧边栏导航组件
│   │   └── HelloWorld.vue # 示例组件
│   ├── locales/           # 国际化语言包
│   │   ├── zh-CN.ts      # 中文语言包
│   │   ├── en-US.ts      # 英文语言包
│   │   └── index.ts      # 国际化配置
│   ├── router/            # 路由配置
│   │   └── index.ts      # 路由定义
│   ├── services/          # 服务层
│   │   ├── __tests__/    # 测试文件目录
│   │   ├── mockApi.ts    # Mock API 服务
│   │   ├── mockData.ts   # Mock 静态数据
│   │   └── excel.ts      # Excel 导入导出服务
│   ├── store/             # Vuex 状态管理
│   │   └── index.ts      # Store 配置
│   ├── styles/            # 全局样式
│   │   ├── app.css       # 应用样式
│   │   └── theme.css     # 主题样式
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts      # 接口类型定义
│   ├── views/             # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── Login.vue     # 登录页
│   │   ├── drugs/        # 药品管理模块
│   │   ├── pharmacies/   # 药房管理模块
│   │   ├── prescriptions/ # 处方管理模块
│   │   ├── audit-logs/   # 审计日志模块
│   │   ├── operation-logs/ # 操作日志模块
│   │   ├── profile/      # 用户资料模块
│   │   └── settings/     # 系统设置模块
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── docs/                  # 项目文档
├── package.json           # 依赖配置
└── README.md              # 项目说明
```

## 文件夹作用说明

### `/src/components/`
存放可复用的公共组件，如导航栏、侧边栏等。

### `/src/locales/`
国际化语言包配置，支持中英文切换。

### `/src/router/`
Vue Router 路由配置，定义页面路由和懒加载。

### `/src/services/`
服务层，包含 API 调用、Mock 数据、Excel 处理等业务逻辑。

### `/src/store/`
Vuex 状态管理，管理全局状态如用户信息、药品数据等。

### `/src/styles/`
全局样式文件，定义应用的主题和通用样式。

### `/src/types/`
TypeScript 类型定义，定义数据模型和接口类型。

### `/src/views/`
页面组件，按业务模块组织，每个模块包含列表、新增、编辑等子组件。

## 模块职责

### 药品管理模块 (`/src/views/drugs/`)
- **DrugsList.vue**: 药品列表展示、查询、删除
- **DrugsCreate.vue**: 新增药品表单
- **DrugsEdit.vue**: 编辑药品表单
- **DrugsBatchAdd.vue**: 批量新增药品

### 药房管理模块 (`/src/views/pharmacies/`)
- **PharmaciesList.vue**: 药房列表展示、查询、删除
- **PharmaciesCreate.vue**: 新增药房表单
- **PharmaciesEdit.vue**: 编辑药房表单
- **PharmaciesBatchAdd.vue**: 批量新增药房
- **PharmacyDetail.vue**: 药房详情展示

### 处方管理模块 (`/src/views/prescriptions/`)
- **PrescriptionsList.vue**: 处方列表展示、查询、删除
- **PrescriptionsCreate.vue**: 新增处方表单
- **PrescriptionsEdit.vue**: 编辑处方表单
- **PrescriptionDetail.vue**: 处方详情展示

### 审计日志模块 (`/src/views/audit-logs/`)
- **AuditLogsList.vue**: 审计日志列表、查询筛选

### 操作日志模块 (`/src/views/operation-logs/`)
- **OperationLogsList.vue**: 操作日志列表展示

### 用户资料模块 (`/src/views/profile/`)
- **UserProfile.vue**: 用户信息编辑表单

### 系统设置模块 (`/src/views/settings/`)
- **SystemSettings.vue**: 系统参数配置

## 开发规范

### 组件命名
- 使用 PascalCase 命名组件文件
- 组件名应该具有描述性，如 `DrugsList.vue`

### 文件组织
- 按业务模块组织文件
- 每个模块包含相关的子组件
- 测试文件放在 `__tests__` 目录下

### 代码风格
- 使用 Vue 3 Composition API
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 最佳实践

### 状态管理
- 使用 Vuex 管理全局状态
- 按模块组织 store 结构

### 国际化
- 所有用户可见的文本都使用国际化
- 支持中英文切换

## 测试规范

### 测试文件组织
- 测试文件放在 `__tests__` 目录下
- 测试文件命名：`[模块名].test.ts`
- 例如：`drugs.test.ts`, `pharmacies.test.ts`

### 测试覆盖
- 单元测试覆盖核心业务逻辑
- 组件测试覆盖用户交互
- 集成测试覆盖模块间协作

## 部署说明

### 开发环境
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

## 常见问题

### Q: 如何添加新的业务模块？
A: 在 `src/views/` 下创建新的模块文件夹，包含相关的子组件，并在路由中添加对应配置。

### Q: 如何添加新的国际化文本？
A: 在 `src/locales/` 下的语言包文件中添加新的键值对，然后在组件中使用 `t('key')` 调用。

### Q: 如何添加新的 API 接口？
A: 在 `src/services/` 下创建新的服务文件，定义接口调用逻辑。

