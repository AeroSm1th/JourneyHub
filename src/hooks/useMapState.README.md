# useMapState Hook

## 概述

`useMapState` 是一个用于管理地图状态的 React Hook，它使用 URL 参数来存储和同步地图的中心点（经纬度）和缩放级别。

## 验证需求

- ✅ **需求 2.6**: 地图状态同步到 URL 参数
- ✅ 支持浏览器前进/后退
- ✅ 防抖处理避免性能问题
- ✅ TypeScript 类型安全

## 文件结构

```
src/hooks/
├── useMapState.ts                      # Hook 实现
├── useMapState.USAGE.md                # 详细使用文档
├── useMapState.example.tsx             # 基础示例
├── useMapState.integration.example.tsx # 集成示例
├── useMapState.README.md               # 本文件
└── __tests__/
    └── useMapState.test.ts             # 单元测试
```

## 核心功能

### 1. URL 参数管理

地图状态自动同步到 URL 查询参数：

```
?lat=39.9042&lng=116.4074&zoom=10
```

- `lat`: 纬度，保留 4 位小数
- `lng`: 经度，保留 4 位小数
- `zoom`: 缩放级别，整数 (1-18)

### 2. 防抖机制

`setMapView` 方法使用 500ms 的防抖延迟，避免在地图拖动时频繁更新 URL。

### 3. 立即更新

`setMapViewImmediate` 方法提供无延迟的立即更新，适用于需要快速响应的场景（如点击城市跳转）。

### 4. 浏览器历史支持

每次状态更新都会在浏览器历史中创建新记录，支持前进/后退操作。

## API 参考

### 返回值

```typescript
interface UseMapStateReturn {
  mapState: MapState; // 当前地图状态
  setMapView: (update) => void; // 更新状态（带防抖）
  setMapViewImmediate: (update) => void; // 立即更新状态
}

interface MapState {
  lat: number; // 纬度
  lng: number; // 经度
  zoom: number; // 缩放级别 (1-18)
}
```

## 快速开始

### 基础用法

```typescript
import { useMapState } from '@/hooks/useMapState';

function MapPage() {
  const { mapState, setMapView } = useMapState();

  return (
    <MapContainer
      center={[mapState.lat, mapState.lng]}
      zoom={mapState.zoom}
      onMoveEnd={(lat, lng, zoom) => {
        setMapView({ lat, lng, zoom });
      }}
    />
  );
}
```

### 点击城市跳转

```typescript
const { setMapViewImmediate } = useMapState();

const handleCityClick = (city: City) => {
  setMapViewImmediate({
    lat: city.latitude,
    lng: city.longitude,
    zoom: 12,
  });
};
```

## 使用场景

1. **地图拖动和缩放** - 使用 `setMapView` 带防抖更新
2. **点击城市跳转** - 使用 `setMapViewImmediate` 立即响应
3. **URL 分享** - 地图状态保存在 URL 中，可以直接分享
4. **浏览器导航** - 支持前进/后退按钮

## 默认值

如果 URL 中没有参数，使用以下默认值：

```typescript
{
  lat: 39.9,   // 北京纬度
  lng: 116.4,  // 北京经度
  zoom: 6,     // 中国全景视图
}
```

## 测试覆盖

- ✅ 初始状态读取
- ✅ URL 参数解析
- ✅ 防抖机制
- ✅ 立即更新
- ✅ 部分更新
- ✅ 边界情况
- ✅ 类型安全

测试文件: `src/hooks/__tests__/useMapState.test.ts`

## 性能优化

1. **防抖处理**: 避免频繁更新 URL
2. **useCallback**: 优化函数引用稳定性
3. **精度控制**: 经纬度保留 4 位小数，减少 URL 长度
4. **清理机制**: 组件卸载时清理定时器

## 注意事项

1. 必须在 `BrowserRouter` 或 `MemoryRouter` 上下文中使用
2. 防抖延迟为 500ms，不可配置
3. 经纬度自动保留 4 位小数
4. 缩放级别自动取整
5. 每次更新都会创建新的浏览器历史记录

## 相关 Hooks

- `useUrlPosition` - 简单的 URL 位置读取
- `useMapClick` - 地图点击事件处理
- `useGeolocation` - 获取用户当前位置

## 更多文档

- [详细使用指南](./useMapState.USAGE.md)
- [基础示例](./useMapState.example.tsx)
- [集成示例](./useMapState.integration.example.tsx)
- [单元测试](./useMapState.test.ts)

## 技术栈

- React 18+
- React Router v6+
- TypeScript 5+
- Vitest (测试)

## 维护者

- 创建日期: 2024
- 最后更新: 2024
- 状态: ✅ 稳定
