# CityList 组件使用文档

## 概述

`CityList` 是一个城市列表组件，用于显示用户的所有城市记录。组件支持点击查看详情、选中状态高亮，并按访问日期降序排序。

## 功能特性

- ✅ 显示所有城市记录（需求 3.6）
- ✅ 支持点击查看详情（需求 3.7）
- ✅ 按访问日期降序排序
- ✅ 显示城市名称、国家、访问日期
- ✅ 显示评分和标签
- ✅ 显示封面图片
- ✅ 收藏标记
- ✅ 选中状态高亮
- ✅ 加载、错误、空状态处理
- ✅ 响应式设计（桌面端、平板端、移动端）
- ✅ 触摸屏友好（需求 10.4）

## 基础用法

```tsx
import { CityList } from '@/components/city';

function Sidebar() {
  return (
    <div style={{ height: '100vh' }}>
      <CityList />
    </div>
  );
}
```

## Props

| 属性             | 类型                   | 默认值      | 说明              |
| ---------------- | ---------------------- | ----------- | ----------------- |
| `onCityClick`    | `(city: City) => void` | `undefined` | 城市点击回调函数  |
| `selectedCityId` | `string`               | `undefined` | 当前选中的城市 ID |

## 使用场景

### 1. 基础列表显示

```tsx
import { CityList } from '@/components/city';

function CitiesPage() {
  return (
    <div className="container">
      <CityList />
    </div>
  );
}
```

### 2. 带点击事件

```tsx
import { CityList } from '@/components/city';
import { City } from '@/types/database';

function MapPage() {
  const handleCityClick = (city: City) => {
    // 移动地图中心到该城市
    console.log('移动到:', city.latitude, city.longitude);
  };

  return (
    <div className="map-layout">
      <aside className="sidebar">
        <CityList onCityClick={handleCityClick} />
      </aside>
      <main className="map-container">{/* 地图组件 */}</main>
    </div>
  );
}
```

### 3. 带选中状态

```tsx
import { useState } from 'react';
import { CityList } from '@/components/city';
import { City } from '@/types/database';

function MapPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>();

  const handleCityClick = (city: City) => {
    setSelectedCityId(city.id);
    // 其他操作...
  };

  return <CityList onCityClick={handleCityClick} selectedCityId={selectedCityId} />;
}
```

### 4. 与地图联动

```tsx
import { useState } from 'react';
import { CityList } from '@/components/city';
import { MapContainer } from '@/components/map';
import { City } from '@/types/database';

function MapPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-96 border-r">
        <CityList onCityClick={handleCityClick} selectedCityId={selectedCity?.id} />
      </aside>
      <main className="flex-1">
        <MapContainer
          center={selectedCity ? [selectedCity.latitude, selectedCity.longitude] : undefined}
        />
      </main>
    </div>
  );
}
```

## 数据结构

组件使用 `useCities` hook 获取数据，返回的城市对象结构：

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

## 状态处理

### 加载状态

组件自动显示加载动画：

```tsx
<div className="city-list-loading">
  <Spinner size="md" centered />
</div>
```

### 错误状态

当数据加载失败时，显示错误信息：

```tsx
<div className="city-list-error">
  <p className="city-list-error-message">加载城市列表失败</p>
  <p className="city-list-error-detail">{error.message}</p>
</div>
```

### 空状态

当没有城市记录时，显示提示信息：

```tsx
<div className="city-list-empty">
  <p className="city-list-empty-message">还没有城市记录</p>
  <p className="city-list-empty-hint">在地图上点击添加你的第一个城市</p>
</div>
```

## 排序规则

城市列表按访问日期降序排序（最近访问的在前）：

```typescript
const sortedCities = [...cities].sort((a, b) => {
  return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
});
```

## 样式定制

### CSS 类名

组件提供以下 CSS 类名用于样式定制：

- `.city-list-container` - 容器
- `.city-list-header` - 头部
- `.city-list-title` - 标题
- `.city-list-count` - 数量标签
- `.city-list` - 列表
- `.city-list-item` - 列表项
- `.city-list-item-active` - 选中状态
- `.city-list-item-content` - 内容区域
- `.city-list-item-name` - 城市名称
- `.city-list-item-country` - 国家名称
- `.city-list-item-date` - 访问日期
- `.city-list-item-rating` - 评分
- `.city-list-item-tags` - 标签容器
- `.city-list-item-tag` - 单个标签
- `.city-list-item-image` - 图片容器
- `.city-list-item-favorite` - 收藏图标

### 自定义样式示例

```css
/* 修改选中状态颜色 */
.city-list-item-active {
  background-color: #fef3c7;
  border-left-color: #f59e0b;
}

/* 修改悬停效果 */
.city-list-item:hover {
  background-color: #fef9e7;
}

/* 修改标题样式 */
.city-list-title {
  color: #1e40af;
  font-size: 1.5rem;
}
```

## 响应式设计

组件支持三种屏幕尺寸：

### 桌面端 (≥1024px)

- 完整的侧边栏布局
- 悬停时图片放大效果
- 所有信息完整显示

### 平板端 (768px-1023px)

- 调整内边距
- 缩小图片尺寸（70px）
- 保持主要信息显示

### 移动端 (<768px)

- 紧凑的布局
- 更小的图片尺寸（60px）
- 减小字体大小
- 优化触摸交互

## 性能优化

### 1. 虚拟滚动（未来优化）

当城市数量超过 100 个时，建议使用虚拟滚动：

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// 实现虚拟滚动逻辑
```

### 2. 图片懒加载

封面图片使用懒加载：

```tsx
<img src={city.cover_image} alt={city.city_name} loading="lazy" />
```

### 3. 缓存策略

组件使用 TanStack Query 的缓存机制：

- `staleTime`: 5 分钟
- `gcTime`: 10 分钟

## 可访问性

### 键盘导航

支持键盘操作：

- `Tab` - 在列表项之间导航
- `Enter` - 选择城市
- `Escape` - 取消选择

### 屏幕阅读器

为屏幕阅读器提供语义化标签：

```tsx
<time className="city-list-item-date">{formatDate(city.visited_at)}</time>
```

## 测试

### 单元测试示例

```tsx
import { render, screen } from '@testing-library/react';
import { CityList } from './CityList';

describe('CityList', () => {
  it('应该显示城市列表', () => {
    render(<CityList />);
    expect(screen.getByText('我的足迹')).toBeInTheDocument();
  });

  it('应该按访问日期降序排序', () => {
    // 测试排序逻辑
  });

  it('应该处理点击事件', () => {
    const handleClick = jest.fn();
    render(<CityList onCityClick={handleClick} />);
    // 测试点击
  });
});
```

## 常见问题

### Q: 如何自定义空状态提示？

A: 目前空状态提示是硬编码的。如果需要自定义，可以通过 props 传入：

```tsx
interface CityListProps {
  emptyMessage?: string;
  emptyHint?: string;
}
```

### Q: 如何添加搜索功能？

A: 在父组件中实现搜索逻辑，然后传入过滤后的城市列表：

```tsx
const [searchQuery, setSearchQuery] = useState('');
const filteredCities = cities?.filter((city) => city.city_name.includes(searchQuery));
```

### Q: 如何实现多选功能？

A: 修改组件以支持多选：

```tsx
interface CityListProps {
  selectedCityIds?: string[];
  onCitySelect?: (cityIds: string[]) => void;
}
```

## 相关组件

- `CityForm` - 城市表单组件
- `CityCard` - 城市卡片组件
- `MapContainer` - 地图容器组件
- `CityMarker` - 城市标记组件

## 更新日志

### v1.0.0 (2024-01-15)

- ✅ 初始版本
- ✅ 基础列表显示
- ✅ 点击事件支持
- ✅ 选中状态高亮
- ✅ 响应式设计
- ✅ 状态处理（加载、错误、空）
