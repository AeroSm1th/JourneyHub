# 地图组件模块

本模块包含 JourneyHub 应用的地图相关组件，基于 Leaflet 和 React Leaflet 构建。

## 组件列表

### ✅ MapContainer

地图容器组件，提供基础的地图渲染和交互功能。

**文件**: `MapContainer.tsx`

**功能**:

- 渲染 Leaflet 地图
- 支持缩放和平移操作
- 监听地图点击事件
- 配置地图初始中心点和缩放级别

**验证需求**: 2.1, 2.5

### ✅ CityMarker

城市标记组件，在地图上显示城市位置标记。

**文件**: `CityMarker.tsx`

**功能**:

- 在地图上显示城市位置标记
- 使用自定义图标区分不同类型的城市（收藏、高评分等）
- 点击标记显示城市详情弹窗
- 支持移动端触摸操作

**验证需求**: 2.2, 2.4, 2.7

### 🚧 WishlistMarker (待实现)

愿望清单标记组件，在地图上显示愿望清单城市。

**计划功能**:

- 使用不同样式的标记区分愿望清单城市
- 点击标记显示愿望清单详情
- 支持转换为正式城市记录

### ✅ MapControls

地图控制组件，提供地图操作按钮。

**文件**: `MapControls.tsx`

**功能**:

- 定位到当前位置按钮
- 放大/缩小地图按钮
- 重置视图按钮
- 加载状态和错误处理
- 移动端友好设计（最小 44x44px 触摸目标）

**验证需求**: 2.5

## 使用示例

### 基本地图显示

```tsx
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { MapControls } from '@/components/map/MapControls';

function MapPage() {
  const cities = [
    {
      id: '1',
      city_name: '北京',
      latitude: 39.9042,
      longitude: 116.4074,
      // ... 其他字段
    },
  ];

  return (
    <MapContainer center={[39.9, 116.4]} zoom={6}>
      <MapControls />
      {cities.map((city) => (
        <CityMarker key={city.id} city={city} />
      ))}
    </MapContainer>
  );
}
```

### 带点击事件的地图

```tsx
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { MapControls } from '@/components/map/MapControls';

function InteractiveMap() {
  const handleMapClick = (lat: number, lng: number) => {
    console.log('Map clicked at:', lat, lng);
    // 显示创建城市表单
  };

  const handleMarkerClick = (cityId: string) => {
    console.log('Marker clicked:', cityId);
    // 导航到城市详情页
  };

  return (
    <MapContainer center={[39.9, 116.4]} zoom={6} onMapClick={handleMapClick}>
      <MapControls defaultZoom={6} defaultCenter={[39.9, 116.4]} />
      {cities.map((city) => (
        <CityMarker key={city.id} city={city} onClick={handleMarkerClick} />
      ))}
    </MapContainer>
  );
}
```

## 样式文件

- `MapContainer.css` - 地图容器样式
- `CityMarker.css` - 城市标记样式
- `MapControls.css` - 地图控制按钮样式

## 测试

所有组件都有对应的单元测试：

- `__tests__/CityMarker.test.tsx` - CityMarker 组件测试
- `__tests__/MapControls.test.tsx` - MapControls 组件测试

运行测试：

```bash
npm run test -- src/components/map/__tests__
```

## 依赖

- `leaflet` - 地图库
- `react-leaflet` - React 封装的 Leaflet 组件
- `@types/leaflet` - Leaflet TypeScript 类型定义

## 相关文档

- [MapContainer 使用指南](./MapContainer.tsx)
- [CityMarker 使用指南](./CityMarker.USAGE.md)
- [MapControls 使用指南](./MapControls.USAGE.md)
- [Leaflet 官方文档](https://leafletjs.com/)
- [React Leaflet 文档](https://react-leaflet.js.org/)

## 开发计划

- [x] MapContainer 基础组件
- [x] CityMarker 城市标记
- [x] MapControls 地图控制
- [ ] WishlistMarker 愿望清单标记
- [ ] 标记聚合（Marker Clustering）
- [ ] 地图状态管理 Hook
