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

## 架构现状问题与改进建议（待持续更新）

本章节用于记录当前代码与架构原则（“pages 负责组装、components 纯 UI、features 承担业务核心”）之间的偏差点，以及建议的改进方向。内容以“可维护性、可复用性、可测试性、长期演进成本”为主要评估维度。

### 1. 模块边界：`pages/`、`components/`、`features/` 的职责有走样风险

**现象**

- 部分页面组件（典型如地图页）同时承担：多业务域数据拉取、交互流程编排、复杂 UI 状态管理、外部服务调用（地理编码）等，组件体积偏大、关注点过多。
- 部分表单组件内部直接拉取依赖数据（例如在表单内部调用列表查询 hook），使“表单渲染”与“数据获取”耦合。

**影响**

- 复用困难：表单/面板组件难以在其他页面或 Modal 场景复用。
- 测试成本高：单测需要 mock Query/Supabase/Store，而不是只测 UI/表单逻辑。
- 重构风险高：页面越大，改动一次触发连锁影响的概率越高。

**建议**

- 页面采用“容器组件 + 展示组件（Presentational）+ 页面级 hooks”的拆分方式：
  - 页面容器负责组合 `features/*/hooks`，处理加载/错误/路由参数。
  - 展示组件只接收 props，禁止直接调用 `features/`。
  - 复杂交互流程抽为页面级自定义 hooks（例如地图交互、选中态管理、反向地理编码流程）。
- 表单组件尽量“纯表单”：依赖数据（下拉选项等）由上层容器传入，表单只关心校验与提交。

### 2. TanStack Query 策略分散，重复配置与错误处理规范不统一

**现象**

- 多个查询 hooks 中重复出现 `staleTime` / `cacheTime` 等配置，且需要全局调整时难以统一变更。
- API 层常以 `throw new Error('中文提示: ' + error.message)` 的方式抛错，和全局错误处理（`dbErrorHandler` / `authErrorHandler` / `errorLogger`）之间的职责边界容易模糊。

**影响**

- 缓存策略与错误提示策略难以“集中治理”，长期维护成本高。
- 错误信息来源不一致：有时是业务中文包装，有时是 Supabase 原始信息拼接。

**建议**

- 尽量将通用 Query 行为收敛到 `QueryClient` 默认配置（重试、缓存、错误回调），各 hooks 只在必要时覆盖。
- 统一“错误在何处转成用户可见提示”的策略：
  - 推荐在 Query 全局 `onError` 与关键 mutation 的错误处理链路中统一调用 `dbErrorHandler`/`authErrorHandler`，组件侧减少重复 toast/console 处理。
  - API 层优先抛出结构化的原始错误（保留 code/status），避免过早把错误“翻译成字符串”导致信息丢失。

### 3. Zustand 与本地 state 的归属规则需要更明确

**现象**

- 同一类 UI 状态可能在 store 与页面本地 state 中并存（例如“选中态/视图模式/侧边栏状态”的一部分在 `uiStore`，另一部分在页面内部）。

**影响**

- 后续容易出现“字段含义接近但来源不同”的维护困惑（尤其在跨组件协作、跨路由跳转场景）。

**建议**

- 建议建立简单规则并逐步对齐：
  - 与“跨路由/多组件协作/需要被其他模块感知/需要持久化或 URL 同步”的状态放在 store 或 URL 同步 hook。
  - 仅影响当前组件内部渲染的临时状态保留在本地 state。

### 4. 文档与现实存在不一致点，需定期对齐

**现象**

- 目录说明、README、USAGE 文档中存在“待实现/计划中”的描述，但对应功能在代码中已经实现或部分实现。
- 示例文件（`.example.tsx`）与生产代码共处源码目录，通过 `tsconfig exclude` 避免编译影响，但在结构上仍会造成噪音。

**影响**

- 新人理解成本上升，且容易误以为某些模块不可用或尚未完成。
- 示例/实验代码长期累积后，会降低“代码库的信噪比”。

**建议**

- 定期做“文档-实现对齐”清理：将过时的“待实现”改为“已实现/待优化”或删除。
- 建议将示例文件集中到 `examples/`（仓库级）或 `*/examples/`（模块级），明确与生产代码边界。

### 5. 数据类型维护成本：手写 `database.ts` 存在与 Supabase Schema 漂移风险

**现象**

- `src/types/database.ts` 手写维护表结构与 `Database` 泛型定义，依赖人工同步。

**影响**

- 一旦 Supabase schema 变更，类型可能滞后，导致运行时错误或类型误导。

**建议**

- 中长期建议接入 Supabase 类型生成流程（以 DB schema 为单一事实来源）。
- 若暂不引入生成流程，建议在 `src/types/README.md` 中明确“schema 变更后同步更新”的约束与检查清单。

### 6. 建议的推进顺序（优先级）

- **高优先级**：拆分超大页面（容器/展示/hooks）、统一 Query 全局策略、统一错误处理链路规范。
- **中优先级**：表单组件去耦数据加载、梳理 store 与本地 state 的归属、清理过时文档描述。
- **低优先级**：示例代码目录化、引入 Supabase 类型生成、逐步完善 hooks 与关键组件的单测覆盖。

## 重构清单（Backlog）

本清单将上面的问题转成可执行的改造任务。每项包含目标、影响范围、验收标准和风险/回滚点，便于逐条推进与评审。

### A. 高优先级（建议优先在 1-2 个迭代内完成）

#### A1. 拆分“大页面”到容器/展示/hooks

- **目标**
  - 降低页面组件复杂度（体积、分支、状态数量），将复杂交互流程抽到可复用 hooks。
- **影响范围**
  - `src/pages/map/MapPage.tsx`（优先）
  - 视情况扩展到：`src/pages/trips/TripPlannerPage.tsx`、`src/pages/cities/*` 等
  - 相关 UI 组件目录：`src/components/map/`、`src/components/city/`、`src/components/wishlist/`
- **验收标准**
  - 页面层只做“组装”：主要是组合 hooks、处理路由参数/跳转、分发 props
  - 展示组件不直接调用 `features/*` 的 hooks（只接收 props/回调）
  - 页面中与业务无关的 UI 状态与交互逻辑有对应的自定义 hooks（例如地图交互、选中态）
- **风险与回滚点**
  - 交互链路回归风险高（地图点击、侧边栏联动、详情面板切换）
  - 回滚点：保持原页面实现可随时恢复（拆分时以“提取组件/提取 hooks”为主，避免一次性重写）

#### A2. 统一 TanStack Query 的全局默认策略（缓存/重试/错误）

- **目标**
  - 收敛重复配置，确保查询/变更在错误处理与缓存行为上保持一致。
- **影响范围**
  - `src/App.tsx`（`QueryClient`、`QueryCache`、`MutationCache` 默认策略）
  - `src/features/**/hooks/*.ts`（移除或最小化重复 `staleTime/cacheTime` 配置）
- **验收标准**
  - 通用配置集中在 `QueryClient` 默认项中
  - 各业务 hooks 仅在“确有必要”时覆盖默认策略（并说明原因）
  - 错误提示策略一致（避免同一错误在多个层重复 toast/console）
- **风险与回滚点**
  - 全局策略变更可能影响“数据刷新时机/重试次数”
  - 回滚点：先从单一 domain（如 `cities`）试点，再推广到其他 features

#### A3. 明确并统一“错误处理链路”（API 抛错 vs Query 全局处理 vs UI 提示）

- **目标**
  - 统一错误来源与用户提示策略，减少“字符串化错误”导致的信息丢失与重复处理。
- **影响范围**
  - `src/features/**/api.ts`
  - `src/utils/authErrorHandler.ts`、`src/utils/dbErrorHandler.ts`、`src/utils/errorLogger.ts`
  - `src/App.tsx`（全局 Query 错误拦截）
- **验收标准**
  - API 层对错误的处理方式统一（保留 `code/status` 信息，避免早期拼接 message）
  - 用户可见提示（toast）出现位置明确且一致（全局/局部二选一或有清晰规则）
  - 关键错误能带上下文记录（action、feature、关键参数）
- **风险与回滚点**
  - UI 可能出现“无提示/重复提示”
  - 回滚点：保留旧提示逻辑一段时间，通过 feature 开关或逐个 mutation 迁移

### B. 中优先级（建议在高优先级稳定后推进）

#### B1. 表单组件去耦“依赖数据加载”

- **目标**
  - 让表单组件更可复用、更易测试：表单只负责校验与提交。
- **影响范围**
  - `src/components/trip/TripForm.tsx`（优先）
  - 其他含下拉依赖数据的表单（如城市/愿望清单相关表单）
- **验收标准**
  - 表单组件不直接调用 `useCities/useWishlist` 等数据查询 hooks
  - 上层容器负责加载数据并以 props 注入
  - 表单组件可以在“无 Query 环境”下以纯 props 方式被 Story/Example/测试驱动
- **风险与回滚点**
  - 表单初始值与异步数据到达时机可能产生边界问题
  - 回滚点：先新增 `TripFormContainer` 逐步迁移调用处

#### B2. 统一“store 与本地 state”归属规则并做一次对齐

- **目标**
  - 减少同义状态分散在多处导致的维护困惑。
- **影响范围**
  - `src/store/uiStore.ts`
  - 典型页面：`src/pages/map/MapPage.tsx`、`src/pages/cities/*` 等
- **验收标准**
  - 文档化归属规则（可在 `ARCHITECTURE.md` 或 `src/store/README.md` 中补充）
  - 清理重复或语义重叠的状态来源（store/local 二选一）
- **风险与回滚点**
  - 可能影响跨组件联动与导航后的状态保留
  - 回滚点：先只规范新增字段，存量字段逐步迁移

#### B3. 文档与实现对齐（消除“待实现”过时描述）

- **目标**
  - 保持文档可信度，降低新成员理解成本。
- **影响范围**
  - `src/app/router/index.tsx` 注释
  - `src/store/README.md`、`src/hooks/README.md`、`src/pages/*/*.md`、`src/components/*/*.USAGE.md`
- **验收标准**
  - “待实现”仅在确实未实现的功能上出现
  - README/USAGE 与当前代码一致
- **风险与回滚点**
  - 低风险（主要是文档变更）

### C. 低优先级（长期演进/体验优化）

#### C1. 示例/实验代码目录化（提升信噪比）

- **目标**
  - 让生产代码与示例代码边界清晰，减少误引用与目录噪音。
- **影响范围**
  - `src/**/*.example.*`，以及对应的示例入口/引用（如存在）
- **验收标准**
  - 示例文件迁移到统一目录（如 `src/examples/` 或模块内 `examples/`）
  - `tsconfig` 的 `exclude` 规则与实际目录结构一致
- **风险与回滚点**
  - 需要注意示例文件是否被文档链接引用
  - 回滚点：保留迁移前路径映射/文档链接更新记录

#### C2. 引入 Supabase 类型生成，减少 `database.ts` 手写维护成本

- **目标**
  - 以 DB schema 为单一事实来源，避免类型漂移。
- **影响范围**
  - `src/types/database.ts`（可能由生成文件替代或变为薄封装）
  - `src/services/supabase/client.ts`（`createClient<Database>` 仍保留）
- **验收标准**
  - 类型变更可通过生成流程再现，而不是手改
  - 关键 feature API 仍能得到正确的类型推导
- **风险与回滚点**
  - 生成类型可能与现有手写类型存在差异，短期需要迁移适配
  - 回滚点：先并行保留旧类型（以别名/单独文件），逐步切换引用点

#### C3. 逐步补齐关键 hooks/组件的测试覆盖

- **目标**
  - 用测试锁住重构后的行为，降低回归风险。
- **影响范围**
  - `src/features/**/hooks/*`
  - `src/hooks/*`
  - `src/components/common/*`（可选）
- **验收标准**
  - 对“高风险交互链路”优先补测试（地图交互、创建/更新流程、认证态切换）
  - 测试能覆盖关键边界（错误/加载/空态）
- **风险与回滚点**
  - 低风险，但需要投入时间与 mock 策略统一
