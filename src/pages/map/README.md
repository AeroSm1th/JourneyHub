# Map Page 模块

## 概述

地图页面是 JourneyHub 的核心功能模块，提供交互式地图展示和城市足迹管理。

## 文件结构

```
src/pages/map/
├── MapPage.tsx           # 地图主页面组件
├── MapPage.css           # 页面样式
├── MapPage.USAGE.md      # 使用文档
├── __tests__/
│   └── MapPage.test.tsx  # 组件测试
└── README.md             # 本文件
```

## 核心功能

### 1. 地图展示（需求 2.1, 2.2）

- 使用 Leaflet 渲染交互式世界地图
- 在地图上标记所有已访问城市
- 支持缩放、平移等地图操作

### 2. 地图和列表联动（需求 2.6）

- 点击侧边栏城市列表项 → 地图中心移动到对应城市
- 点击地图标记 → 侧边栏高亮对应列表项
- URL 参数同步地图状态

### 3. 响应式布局

- 桌面端：固定侧边栏 + 地图
- 平板端：较窄侧边栏 + 地图
- 移动端：可折叠侧边栏（从左侧滑出）

## 依赖组件

### 地图组件

- `MapContainer`: 地图容器
- `CityMarker`: 城市标记
- `MapControls`: 地图控制按钮

### 列表组件

- `CityList`: 城市列表

### Hooks

- `useCities`: 获取城市数据
- `useMapState`: 管理地图状态（URL 同步）
- `useUIStore`: 管理 UI 状态（侧边栏、选中项）

## 状态管理

### 服务器状态（TanStack Query）

```tsx
const { data: cities, isLoading, error } = useCities();
```

### 地图状态（URL 参数）

```tsx
const { mapState, setMapViewImmediate } = useMapState();
// mapState: { lat, lng, zoom }
```

### UI 状态（Zustand）

```tsx
const {
  sidebarOpen, // 侧边栏开关
  selectedCityId, // 选中的城市
  toggleSidebar, // 切换侧边栏
  selectCity, // 选择城市
} = useUIStore();
```

## 交互流程

### 场景 1：用户点击城市列表项

```
1. 用户点击列表中的"北京"
2. handleCityClick(city) 被调用
3. selectCity(city.id) - 更新选中状态
4. setMapViewImmediate({ lat, lng, zoom: 12 }) - 移动地图中心
5. 地图平滑移动到北京，缩放到城市级别
```

### 场景 2：用户点击地图标记

```
1. 用户点击地图上的标记
2. handleMarkerClick(cityId) 被调用
3. selectCity(cityId) - 更新选中状态
4. 侧边栏中对应的列表项高亮显示
```

### 场景 3：用户点击地图空白区域

```
1. 用户点击地图空白处
2. handleMapClick(lat, lng) 被调用
3. selectCity(null) - 取消选中
4. 侧边栏列表项取消高亮
5. TODO: 显示创建城市表单
```

## 样式设计

### 布局

- 使用 Flexbox 实现侧边栏 + 地图的布局
- 侧边栏固定宽度，地图占据剩余空间

### 响应式断点

- 桌面端：`≥1024px` - 侧边栏 400px
- 平板端：`768-1023px` - 侧边栏 320px
- 移动端：`<768px` - 侧边栏可折叠

### 动画效果

- 侧边栏展开/收起：`transition: width 0.3s ease`
- 移动端侧边栏滑出：`transform: translateX(-100%)`

## 性能优化

1. **useCallback 优化**
   - 所有事件处理函数使用 `useCallback` 包裹
   - 避免子组件不必要的重渲染

2. **地图状态防抖**
   - `useMapState` 内置 500ms 防抖
   - 避免频繁更新 URL 参数

3. **条件渲染**
   - 侧边栏关闭时不渲染列表内容
   - 减少 DOM 节点数量

## 可访问性

- ✅ 所有按钮都有 `aria-label`
- ✅ 支持键盘导航
- ✅ 触摸屏友好（按钮最小 48x48px）
- ✅ 语义化 HTML 标签（`<aside>`, `<main>`, `<nav>`）

## 测试覆盖

- ✅ 组件渲染测试
- ✅ 城市列表显示测试
- ✅ 侧边栏切换测试
- ✅ 加载状态测试
- ✅ 错误状态测试
- ✅ 空状态测试

## 后续开发计划

### Phase 1 剩余任务

- [ ] 集成城市创建表单（任务 8.3）
- [ ] 实现删除确认对话框（任务 8.7）

### Phase 2 扩展功能

- [ ] 支持愿望清单视图切换
- [ ] 支持行程视图切换
- [ ] 添加搜索和筛选功能

### Phase 3 高级功能

- [ ] 地图标记聚合（大量数据时）
- [ ] 离线地图缓存
- [ ] 自定义地图主题

## 相关文档

- [MapContainer 使用文档](../../components/map/README.md)
- [CityList 使用文档](../../components/city/CityList.USAGE.md)
- [useMapState 使用文档](../../hooks/useMapState.USAGE.md)
- [设计文档](../../../.kiro/specs/journey-hub-platform/design.md)
