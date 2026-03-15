# Hooks 目录

本目录包含 JourneyHub 项目中的自定义 React Hooks。

## 可用的 Hooks

### useMapState

管理地图状态（中心点和缩放级别）的 Hook，使用 URL 参数进行状态同步。

**功能**:

- 从 URL 参数读取地图状态（lat, lng, zoom）
- 自动同步地图状态到 URL
- 防抖处理避免频繁更新 URL
- 支持浏览器前进/后退
- 提供立即更新和防抖更新两种方式

**使用场景**:

- 地图拖动和缩放
- 点击城市跳转到地图位置
- 保持地图状态在 URL 中
- 分享带有地图位置的链接

**文档**: [useMapState.USAGE.md](./useMapState.USAGE.md)

**示例**:

```typescript
import { useMapState } from '@/hooks/useMapState';

function MapPage() {
  const { mapState, setMapView, setMapViewImmediate } = useMapState();

  return (
    <MapContainer
      center={[mapState.lat, mapState.lng]}
      zoom={mapState.zoom}
      onMoveEnd={(lat, lng, zoom) => {
        setMapView({ lat, lng, zoom }); // 防抖更新
      }}
    />
  );
}
```

### useMapClick

处理地图点击事件的 Hook，用于管理点击坐标状态。

**功能**:

- 保存用户点击地图的坐标
- 提供清除坐标的方法
- 触发创建城市表单

**使用场景**:

- 在地图上添加新城市
- 选择地理位置
- 地图交互操作

**文档**: [useMapClick.USAGE.md](./useMapClick.USAGE.md)

**示例**:

```typescript
import { useMapClick } from '@/hooks/useMapClick';

function MapPage() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <MapContainer onMapClick={handleMapClick}>
      {coordinates && <CityForm coordinates={coordinates} onCancel={clearCoordinates} />}
    </MapContainer>
  );
}
```

### useGeolocation

获取用户当前地理位置的 Hook。

**功能**:

- 使用浏览器 Geolocation API
- 处理位置权限请求
- 提供加载和错误状态

### useUrlPosition

从 URL 查询参数中读取和更新地图位置的 Hook。

**功能**:

- 读取 URL 中的 lat、lng、zoom 参数
- 更新 URL 参数而不刷新页面
- 支持浏览器前进/后退

## Hook 开发规范

### 命名规范

- Hook 名称必须以 `use` 开头
- 使用驼峰命名法（camelCase）
- 名称应该清晰描述 Hook 的功能

### 文件结构

```
hooks/
├── useHookName.ts          # Hook 实现
├── useHookName.USAGE.md    # 使用文档
└── __tests__/
    └── useHookName.test.ts # 单元测试
```

### 类型定义

- 所有 Hook 必须使用 TypeScript
- 导出清晰的类型定义
- 为返回值定义接口

### 测试要求

- 每个 Hook 必须有单元测试
- 测试覆盖率 ≥ 80%
- 测试边界情况和错误处理

### 文档要求

- 提供 JSDoc 注释
- 创建 USAGE.md 文档
- 包含使用示例

## 最佳实践

### 1. 使用 useCallback 和 useMemo

对于返回的函数和复杂对象，使用 `useCallback` 和 `useMemo` 优化性能：

```typescript
export const useExample = () => {
  const handleClick = useCallback(() => {
    // 处理逻辑
  }, []);

  const computedValue = useMemo(() => {
    // 计算逻辑
  }, [dependency]);

  return { handleClick, computedValue };
};
```

### 2. 清理副作用

在 `useEffect` 中返回清理函数：

```typescript
useEffect(() => {
  const subscription = api.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 3. 错误处理

提供清晰的错误状态和错误消息：

```typescript
const [error, setError] = useState<Error | null>(null);

try {
  // 操作
} catch (err) {
  setError(err instanceof Error ? err : new Error('Unknown error'));
}
```

### 4. 加载状态

对于异步操作，提供加载状态：

```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    // 获取数据
  } finally {
    setIsLoading(false);
  }
};
```

## 相关资源

- [React Hooks 官方文档](https://react.dev/reference/react)
- [自定义 Hook 最佳实践](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [项目设计文档](../../.kiro/specs/journey-hub-platform/design.md)
