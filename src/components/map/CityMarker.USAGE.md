# CityMarker 组件使用指南

## 概述

`CityMarker` 是一个用于在 Leaflet 地图上显示城市标记的 React 组件。它支持自定义图标样式、点击交互和详情弹窗显示。

## 功能特性

- ✅ 在地图上显示城市位置标记
- ✅ 根据城市属性使用不同颜色的图标（收藏、评分）
- ✅ 点击标记显示城市详情弹窗
- ✅ 支持移动端触摸操作
- ✅ 响应式设计，适配不同屏幕尺寸

## 图标颜色规则

组件会根据城市的属性自动选择图标颜色：

| 条件                 | 颜色              | 说明         |
| -------------------- | ----------------- | ------------ |
| `is_favorite = true` | 🔴 红色 (#ef4444) | 收藏的城市   |
| `rating >= 4`        | 🟢 绿色 (#10b981) | 高评分城市   |
| `rating >= 3`        | 🟠 橙色 (#f59e0b) | 中等评分城市 |
| `rating < 3`         | ⚫ 灰色 (#6b7280) | 低评分城市   |
| 默认                 | 🔵 蓝色 (#3b82f6) | 普通城市     |

## 基本用法

```tsx
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { CityMarker } from '@/components/map/CityMarker';
import type { City } from '@/types/entities';

function MyMap() {
  const city: City = {
    id: '1',
    user_id: 'user-1',
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9042,
    longitude: 116.4074,
    visited_at: '2024-01-15',
    trip_type: 'leisure',
    rating: 5,
    is_favorite: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  };

  const handleMarkerClick = (cityId: string) => {
    console.log('Clicked city:', cityId);
    // 处理点击事件，例如导航到城市详情页
  };

  return (
    <LeafletMap center={[39.9, 116.4]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CityMarker city={city} onClick={handleMarkerClick} />
    </LeafletMap>
  );
}
```

## 显示多个城市标记

```tsx
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { CityMarker } from '@/components/map/CityMarker';
import type { City } from '@/types/entities';

function CitiesMap({ cities }: { cities: City[] }) {
  const handleMarkerClick = (cityId: string) => {
    // 处理点击事件
    console.log('Clicked city:', cityId);
  };

  return (
    <LeafletMap center={[39.9, 116.4]} zoom={6}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {cities.map((city) => (
        <CityMarker key={city.id} city={city} onClick={handleMarkerClick} />
      ))}
    </LeafletMap>
  );
}
```

## 与 MapContainer 组件集成

```tsx
import { MapContainer } from '@/components/map/MapContainer';
import { CityMarker } from '@/components/map/CityMarker';
import { useCities } from '@/features/cities/hooks/useCities';

function MapPage() {
  const { data: cities, isLoading } = useCities();

  const handleMarkerClick = (cityId: string) => {
    // 导航到城市详情页
    navigate(`/app/map/cities/${cityId}`);
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <MapContainer center={[39.9, 116.4]} zoom={6}>
      {cities?.map((city) => (
        <CityMarker key={city.id} city={city} onClick={handleMarkerClick} />
      ))}
    </MapContainer>
  );
}
```

## Props 说明

### CityMarkerProps

| 属性      | 类型                       | 必填 | 说明                 |
| --------- | -------------------------- | ---- | -------------------- |
| `city`    | `City`                     | ✅   | 城市数据对象         |
| `onClick` | `(cityId: string) => void` | ❌   | 点击标记时的回调函数 |

### City 类型

```typescript
interface City {
  id: string;
  user_id: string;
  city_name: string;
  country_name: string;
  continent: string;
  latitude: number;
  longitude: number;
  visited_at: string;
  trip_type: 'leisure' | 'business' | 'transit';
  rating?: number;
  notes?: string;
  tags?: string[];
  cover_image?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
```

## 弹窗内容

点击标记后会显示包含以下信息的弹窗：

- 城市名称（标题）
- 国家名称
- 访问日期（格式化为中文日期）
- 评分（如果有）
- 收藏标记（如果是收藏的城市）

## 样式自定义

如果需要自定义样式，可以覆盖以下 CSS 类：

```css
/* 标记图标 */
.city-marker {
  /* 自定义标记样式 */
}

/* 弹窗容器 */
.city-popup {
  /* 自定义弹窗样式 */
}

/* 弹窗标题 */
.city-popup-title {
  /* 自定义标题样式 */
}
```

## 移动端优化

组件已针对移动端进行优化：

- 触摸区域至少 44x44px（符合 WCAG 可访问性标准）
- 标记在移动端会自动放大以便点击
- 弹窗内容在小屏幕上自动调整字体大小

## 注意事项

1. **必须在 MapContainer 内使用**：`CityMarker` 必须作为 `react-leaflet` 的 `MapContainer` 的子组件使用
2. **坐标有效性**：确保 `latitude` 和 `longitude` 是有效的数值
3. **唯一 key**：在渲染多个标记时，务必为每个 `CityMarker` 提供唯一的 `key` 属性
4. **性能考虑**：如果需要显示大量标记（>100），建议使用标记聚合（marker clustering）

## 相关组件

- `MapContainer` - 地图容器组件
- `WishlistMarker` - 愿望清单标记组件（待实现）
- `MapControls` - 地图控制组件（待实现）

## 验证需求

该组件验证以下需求：

- **需求 2.2**：在地图上标记所有已访问城市的位置
- **需求 2.4**：点击地图上的城市标记显示该城市的详细信息
- **需求 2.7**：使用不同颜色或图标区分已访问城市和愿望清单城市
