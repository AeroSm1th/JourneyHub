# JourneyHub 🌍

一个基于 React + TypeScript + Supabase 的个人旅行足迹追踪平台，帮助你记录去过的城市、规划未来行程、可视化旅行数据。

## 功能概览

🗺️ **交互式地图** — 在世界地图上标记去过的城市和愿望清单城市，点击地图快速添加记录，支持缩放、平移和地图控件

🏙️ **城市管理** — 记录城市名称、国家、大洲、访问日期、评分、旅行类型、标签、照片等详细信息，支持搜索、编辑和删除

⭐ **愿望清单** — 收藏想去的城市，设置优先级和期望季节，一键转换为已访问记录

✈️ **行程规划** — 创建行程计划，管理每日日程和待办事项，跟踪预算，查看时间线，自动标记已完成行程

📊 **数据洞察** — 世界热力图、年度统计柱状图、大洲分布饼图、热门城市排行榜、城市/国家/大洲统计卡片

👤 **个人资料** — 编辑昵称、上传头像、导出数据（JSON）、删除账户

🔐 **用户认证** — 基于 Supabase Auth 的邮箱/密码注册登录，路由守卫保护

🌐 **地理编码** — 基于 Nominatim (OpenStreetMap) 的反向地理编码，点击地图自动识别城市和国家

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 路由 | React Router v6 |
| 状态管理 | Zustand + TanStack Query v4 |
| 表单验证 | React Hook Form + Zod |
| 地图 | Leaflet + React Leaflet |
| 图表 | Apache ECharts + echarts-for-react |
| 虚拟滚动 | TanStack Virtual |
| 后端 | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 测试 | Vitest + React Testing Library + fast-check |
| 地理编码 | Nominatim (OpenStreetMap) |
| 样式 | Tailwind CSS v4 |
| 图标 | Lucide React |
| 代码质量 | ESLint + Prettier + Husky + lint-staged |

## 快速开始

### 前置条件

- Node.js >= 18
- npm >= 9
- 一个 [Supabase](https://supabase.com) 项目

### 安装

```bash
git clone https://github.com/AeroSm1th/JourneyHub.git
cd JourneyHub
npm install
```

### 环境变量

复制 `.env.example` 创建 `.env` 文件：

```bash
cp .env.example .env
```

填入你的 Supabase 项目凭据：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase 数据库配置

在 Supabase SQL Editor 中执行建表和 RLS 策略脚本（参考 `.kiro/specs/journey-hub-platform/rls-policies.sql`）。

需要创建的数据库表：

| 表名 | 说明 |
|------|------|
| `users` | 用户信息 |
| `cities` | 城市旅行记录 |
| `wishlist_items` | 愿望清单 |
| `trips` | 行程计划 |
| `trip_days` | 行程日程 |
| `trip_tasks` | 行程待办事项 |
| `shares` | 分享记录 |

同时需要在 Supabase Storage 中创建 `avatars` bucket 用于头像上传。

详细的存储配置请参考 `.kiro/specs/journey-hub-platform/storage-setup-guide.md`。

### 启动开发服务器

```bash
npm run dev
```

### 运行测试

```bash
npm run test:run
```

### 构建

```bash
npm run build
```

## 项目结构

```
src/
├── app/                  # 应用入口、路由配置、Provider、布局
│   ├── layouts/          # AppLayout, AuthLayout
│   ├── providers/        # QueryProvider, AuthProvider
│   └── router/           # 路由配置与路由守卫
├── components/           # UI 组件
│   ├── charts/           # 图表组件 (WorldHeatmap, YearlyChart, ContinentPie, TopCitiesRanking, StatCard)
│   ├── city/             # 城市组件 (CityList, CityCard, CityForm, CityDetailPanel)
│   ├── common/           # 通用组件 (Button, Input, Modal, Spinner, ConfirmDialog, ErrorBoundary, VirtualList)
│   ├── forms/            # 表单组件 (ImageUpload)
│   ├── map/              # 地图组件 (MapContainer, CityMarker, WishlistMarker, MapControls, MapLegend)
│   ├── trip/             # 行程组件 (TripList, TripCard, TripForm, TripTimeline, TripDayEditor, TripTaskList)
│   └── wishlist/         # 愿望清单组件 (WishlistList, WishlistCard, WishlistForm, WishlistDetailPanel)
├── features/             # 业务逻辑层 (API + Hooks + Utils)
│   ├── auth/             # 认证 (登录、注册、会话管理)
│   ├── cities/           # 城市 CRUD
│   ├── insights/         # 统计分析与数据计算
│   ├── profile/          # 个人资料 (头像上传、数据导出、账户删除)
│   ├── trips/            # 行程管理
│   └── wishlist/         # 愿望清单 (含转换为城市记录)
├── hooks/                # 通用 Hooks (useMapState, useMapClick, useGeolocation)
├── integration/          # 集成测试
├── pages/                # 页面组件
│   ├── auth/             # LoginPage, RegisterPage
│   ├── cities/           # CitiesPage, CityDetailPage
│   ├── insights/         # InsightsPage (统计仪表板)
│   ├── map/              # MapPage (地图主页)
│   ├── profile/          # ProfilePage
│   ├── trips/            # TripsPage, TripDetailPage, TripPlannerPage
│   └── wishlist/         # WishlistPage
├── schemas/              # Zod 验证 Schema (citySchema, tripSchema, authSchema)
├── services/             # 外部服务封装
│   ├── geocoding/        # Nominatim 反向地理编码
│   └── supabase/         # Supabase 客户端配置
├── store/                # Zustand 状态管理 (authStore, uiStore, draftStore)
├── styles/               # 全局样式
└── types/                # TypeScript 类型定义 (database, entities)
```

## 开发脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行测试 (watch 模式) |
| `npm run test:run` | 运行测试 (单次) |
| `npm run test:ui` | 运行测试 (UI 界面) |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 |

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | HomePage | 首页 |
| `/auth/login` | LoginPage | 登录 |
| `/auth/register` | RegisterPage | 注册 |
| `/app/map` | MapPage | 交互式地图（主页面） |
| `/app/cities` | CitiesPage | 城市列表 |
| `/app/cities/:id` | CityDetailPage | 城市详情 |
| `/app/wishlist` | WishlistPage | 愿望清单 |
| `/app/trips` | TripsPage | 行程列表 |
| `/app/trips/:id` | TripDetailPage | 行程详情 |
| `/app/trips/new` | TripPlannerPage | 创建行程 |
| `/app/insights` | InsightsPage | 数据洞察仪表板 |
| `/app/profile` | ProfilePage | 个人资料 |
| `/share/:slug` | SharePage | 公开分享页面 |

## License

MIT
