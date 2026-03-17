# JourneyHub 项目架构文档

## 概述

JourneyHub 是一个旅行足迹记录与行程规划平台，基于 React 18 + TypeScript 构建。项目采用**分层架构**（Layered Architecture）结合**按功能切片**（Feature-Sliced）的组织方式，实现关注点分离和高内聚低耦合。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 18.2 |
| 语言 | TypeScript | 5.3 |
| 构建工具 | Vite | 4.2 |
| 路由 | React Router | 6.9 |
| 服务端状态 | TanStack Query | 4.43 (v4) |
| 客户端状态 | Zustand | 5.0 |
| 表单 | React Hook Form + Zod 4 | 7.71 / 4.3 |
| 后端服务 | Supabase (Auth + Database + Storage) | 2.99 |
| 地图 | Leaflet + React Leaflet | 1.9 / 4.2 |
| 图表 | ECharts + echarts-for-react | 6.0 / 3.0 |
| 样式 | 普通 CSS（按组件拆分） | - |
| 代码质量 | ESLint + Prettier + Husky + lint-staged | - |
| 测试 | Vitest + Testing Library + fast-check | - |

## 目录结构

```
src/
├── app/                    # 应用壳层（Application Shell）
│   ├── layouts/            #   布局组件（AppLayout, AuthLayout）
│   ├── providers/          #   全局 Provider 配置
│   └── router/             #   路由配置（createBrowserRouter）
│
├── pages/                  # 页面层（Page Layer）
│   ├── auth/               #   认证页面（登录、注册）
│   ├── cities/             #   城市页面（列表、详情）
│   ├── insights/           #   数据统计仪表板
│   ├── map/                #   地图主页面
│   ├── profile/            #   个人资料页面
│   ├── trips/              #   行程页面（列表、详情、规划）
│   ├── wishlist/           #   愿望清单页面
│   ├── Homepage.tsx        #   首页（公开）
│   └── ProtectedRoute.tsx  #   路由守卫
│
├── components/             # UI 组件层（Component Layer）
│   ├── common/             #   通用组件（Button, Input, Modal, Spinner, Toast...）
│   ├── forms/              #   表单组件（ImageUpload）
│   ├── charts/             #   图表组件（ECharts 封装、统计卡片）
│   ├── map/                #   地图组件（MapContainer, CityMarker, MapControls）
│   ├── city/               #   城市业务组件（CityCard, CityList, CityForm...）
│   ├── trip/               #   行程业务组件（TripCard, TripList, TripForm...）
│   ├── wishlist/           #   愿望清单组件（WishlistCard, WishlistList...）
│   ├── Logo.tsx            #   Logo 组件
│   ├── PageNav.tsx         #   公开页面导航栏
│   ├── Sidebar.tsx         #   应用侧边栏
│   └── User.tsx            #   用户信息展示
│
├── features/               # 业务逻辑层（Feature Layer）
│   ├── auth/               #   认证（api.ts + hooks/）
│   ├── cities/             #   城市 CRUD（api.ts + hooks/）
│   ├── insights/           #   统计分析（hooks/ + utils/）
│   ├── profile/            #   个人资料（api.ts + hooks/）
│   ├── trips/              #   行程管理（api.ts + hooks/）
│   └── wishlist/           #   愿望清单（api.ts + hooks/）
│
├── schemas/                # 验证层（Validation Layer）
│   ├── authSchema.ts       #   认证表单验证（Zod v4）
│   ├── citySchema.ts       #   城市表单验证
│   └── tripSchema.ts       #   行程表单验证
│
├── services/               # 外部服务层（Service Layer）
│   ├── supabase/           #   Supabase 客户端初始化
│   └── geocoding/          #   Nominatim 地理编码服务
│
├── store/                  # 全局状态层（Store Layer）
│   ├── authStore.ts        #   认证状态（Zustand）
│   ├── uiStore.ts          #   UI 状态（侧边栏、地图视图模式）
│   └── toastStore.ts       #   Toast 通知状态
│
├── hooks/                  # 通用 Hooks（Shared Hooks）
│   ├── useMapState.ts      #   地图视图状态管理
│   ├── useMapClick.ts      #   地图点击事件处理
│   └── useGeolocation.ts   #   浏览器地理定位
│
├── types/                  # 类型定义层（Type Layer）
│   ├── database.ts         #   数据库表类型（与 Supabase 表结构对应）
│   ├── entities.ts         #   业务实体类型（枚举、表单、扩展类型）
│   └── index.ts            #   统一导出
│
├── utils/                  # 工具函数层（Utility Layer）
│   ├── authErrorHandler.ts #   认证错误处理（自动登出）
│   ├── dbErrorHandler.ts   #   数据库错误处理（错误码映射）
│   ├── errorLogger.ts      #   错误日志记录
│   └── storage.ts          #   本地存储工具
│
├── tests/                  # 测试目录
│   ├── unit/               #   单元测试
│   ├── integration/        #   集成测试
│   └── setup.ts            #   测试环境配置
│
├── App.tsx                 # 应用入口（QueryClient 配置 + 全局错误处理）
├── main.tsx                # 渲染入口
└── index.css               # 全局样式 + CSS 变量
```

## 分层架构与依赖规则

```
┌─────────────────────────────────────────────┐
│                  app/                        │  应用壳层
│         (layouts, router, providers)         │  ← 组装所有层
└──────────────────┬──────────────────────────┘
                   │ 引用
┌──────────────────▼──────────────────────────┐
│                 pages/                       │  页面层
│          (路由级页面组件)                      │  ← 组合 components + features
└────────┬─────────────────────┬──────────────┘
         │ 引用                 │ 引用
┌────────▼────────┐   ┌───────▼──────────────┐
│   components/   │   │     features/         │  业务逻辑层
│   (UI 组件)     │   │  (api + hooks)        │  ← 调用 services + schemas
└────────┬────────┘   └───────┬──────────────┘
         │                     │ 引用
         │            ┌───────▼──────────────┐
         │            │  schemas/ services/   │  基础设施层
         │            │  (验证 + 外部服务)     │
         │            └───────┬──────────────┘
         │                     │
┌────────▼─────────────────────▼──────────────┐
│        types/  store/  utils/  hooks/        │  共享层
│     (类型、全局状态、工具函数、通用 Hooks)      │  ← 任何层均可引用
└─────────────────────────────────────────────┘
```

### 依赖方向（自上而下，禁止反向）

1. `pages/` → `components/` + `features/` + `hooks/` + `store/`
2. `components/` → `hooks/` + `store/` + `types/`（不直接调用 `features/`）
3. `features/` → `services/` + `schemas/` + `store/` + `types/`
4. `services/` → `types/`（纯外部服务封装，无业务逻辑）
5. `schemas/` → `types/`（纯验证规则，无副作用）
6. `store/` / `utils/` / `hooks/` / `types/` → 互相之间可按需引用，但不引用上层

### 关键原则

- **pages 是组装层**：页面组件负责将 UI 组件和业务 hooks 组合在一起，不包含复杂业务逻辑
- **components 是纯 UI**：接收 props 渲染界面，通过回调通知父组件，不直接调用 API
- **features 是业务核心**：每个 feature 包含 `api.ts`（Supabase 调用）和 `hooks/`（TanStack Query 封装）
- **services 是外部适配**：封装第三方服务（Supabase、Nominatim），提供统一接口

## Feature 模块结构

每个 feature 模块遵循统一结构：

```
features/{domain}/
├── api.ts              # Supabase 数据库操作函数
└── hooks/
    ├── index.ts        # 统一导出
    ├── use{Domain}s.ts # 列表查询 Hook（useQuery）
    ├── use{Domain}.ts  # 单条查询 Hook（useQuery）
    ├── useCreate{D}.ts # 创建 Hook（useMutation）
    ├── useUpdate{D}.ts # 更新 Hook（useMutation）
    └── useDelete{D}.ts # 删除 Hook（useMutation）
```

### 数据流

```
用户操作 → Page 调用 feature hook → hook 调用 api.ts → api.ts 调用 Supabase
                                  ↓
                          TanStack Query 管理缓存
                                  ↓
                        自动更新 → Component 重新渲染
```

## 状态管理策略

| 状态类型 | 管理方案 | 位置 |
|----------|----------|------|
| 服务端数据（城市、行程等） | TanStack Query | `features/*/hooks/` |
| 认证状态（用户、会话） | Zustand | `store/authStore.ts` |
| UI 状态（侧边栏、地图模式） | Zustand | `store/uiStore.ts` |
| Toast 通知 | Zustand | `store/toastStore.ts` |
| 表单状态 | React Hook Form | 各表单组件内部 |
| 地图视图状态 | 自定义 Hook | `hooks/useMapState.ts` |

## 全局错误处理

在 `App.tsx` 中通过 TanStack Query 的 `QueryCache` 和 `MutationCache` 统一拦截错误：

```
错误发生
  ├── 认证错误 → authErrorHandler → 自动登出 + 跳转登录页
  ├── 数据库错误 → dbErrorHandler → 错误码映射 → 显示友好 Toast
  ├── 网络错误 → 自动重试（最多 3 次，指数退避）
  └── 其他错误 → 通用 Toast 提示
```

## 路由结构

```
/                       # 首页（公开）
/auth/login             # 登录
/auth/register          # 注册
/app/                   # 应用主入口（受保护，需登录）
  ├── map               # 地图页面（默认）
  ├── cities            # 城市列表
  ├── cities/:cityId    # 城市详情
  ├── wishlist          # 愿望清单
  ├── trips             # 行程列表
  ├── trips/:tripId     # 行程详情
  ├── trips/new         # 新建行程
  ├── trips/:tripId/edit # 编辑行程
  ├── insights          # 数据统计
  └── profile           # 个人资料
/share/:slug            # 公开分享页面（待实现）
```

## 样式方案

- 全局 CSS 变量定义在 `src/index.css`
- 每个组件配套独立的 `.css` 文件（如 `CityCard.tsx` + `CityCard.css`）
- 使用语义化类名，不使用 CSS Modules（已统一迁移）
- 通用组件样式在 `components/common/` 下

## 文件命名约定

| 文件类型 | 命名规则 | 示例 |
|----------|----------|------|
| 组件 | PascalCase | `CityCard.tsx` |
| Hook | camelCase，use 前缀 | `useMapState.ts` |
| API 函数 | camelCase | `api.ts` |
| Schema | camelCase，Schema 后缀 | `authSchema.ts` |
| Store | camelCase，Store 后缀 | `authStore.ts` |
| 类型 | camelCase | `entities.ts` |
| 样式 | 与组件同名 | `CityCard.css` |
| 示例 | `.example.tsx` 后缀 | `CityCard.example.tsx` |
| 使用文档 | `.USAGE.md` 后缀 | `CityCard.USAGE.md` |
| 桶文件 | `index.ts` | `components/city/index.ts` |
