# MapPage 使用文档

## 概述

地图主页面是 JourneyHub 的核心页面，集成了交互式地图、城市标记和侧边栏列表。

## 功能特性

### 1. 地图展示（需求 2.1）

- 使用 Leaflet 渲染世界地图
- 支持缩放和平移操作
- 显示所有城市标记

### 2. 城市标记（需求 2.2）

- 在地图上标记所有已访问城市
- 使用不同颜色区分城市类型（收藏、高评分等）
- 点击标记显示城市详情弹窗

### 3. 地图和列表联动（需求 2.6）

- 点击侧边栏城市列表项时，地图中心移动到对应城市
- 点击地图标记时，侧边栏高亮对应列表项
- URL 参数同步地图状态，支持浏览器前进/后退

### 4. 响应式布局

- **桌面端（≥1024px）**：侧边栏固定宽度 400px
- **平板端（768-1023px）**：侧边栏宽度 320px
- **移动端（<768px）**：侧边栏可折叠，从左侧滑出

## 使用示例

### 基本使用

```tsx
import { MapPage } from '@/pages/map/MapPage';

function App() {
  return <MapPage />;
}
```

### 路由配置

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { MapPage } from '@/pages/map/MapPage';

const router = createBrowserRouter([
  {
    path: '/app/map',
    element: <MapPage />,
  },
]);
```

## 状态管理

### URL 参数

地图状态通过 URL 参数管理：

- `lat`: 地图中心纬度
- `lng`: 地图中心经度
- `zoom`: 缩放级别

示例：`/app/map?lat=39.9&lng=116.4&zoom=10`

### UI Store

使用 Zustand 管理 UI 状态：

```tsx
const {
  sidebarOpen, // 侧边栏是否打开
  selectedCityId, // 当前选中的城市 ID
  toggleSidebar, // 切换侧边栏
  selectCity, // 选择城市
} = useUIStore();
```

## 交互流程

### 1. 选择城市

```
用户点击列表项
  ↓
selectCity(cityId)
  ↓
setMapViewImmediate({ lat, lng, zoom: 12 })
  ↓
地图中心移动到城市位置
```

### 2. 点击地图标记

```
用户点击标记
  ↓
handleMarkerClick(cityId)
  ↓
selectCity(cityId)
  ↓
侧边栏高亮对应列表项
```

### 3. 点击地图空白区域

```
用户点击地图
  ↓
handleMapClick(lat, lng)
  ↓
selectCity(null)
  ↓
取消选中状态
```

## 性能优化

1. **useCallback 优化**：所有事件处理函数使用 `useCallback` 避免不必要的重渲染
2. **地图状态防抖**：`useMapState` 内置防抖机制，避免频繁更新 URL
3. **条件渲染**：侧边栏关闭时不渲染城市列表内容

## 可访问性

- 所有交互按钮都有 `aria-label` 属性
- 支持键盘导航
- 触摸屏友好的按钮尺寸（最小 48x48px）

## 后续扩展

- [ ] 集成城市创建表单（点击地图空白区域）
- [ ] 支持愿望清单视图切换
- [ ] 支持行程视图切换
- [ ] 添加搜索和筛选功能
