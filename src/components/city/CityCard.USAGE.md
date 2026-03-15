# CityCard 组件使用指南

## 概述

`CityCard` 是一个城市卡片组件，用于以卡片形式展示城市旅行记录。组件包含城市名称、国家、访问日期、封面图、评分和标签等信息。

## 功能特性

- ✅ 显示城市名称和国家
- ✅ 显示访问日期（格式化为中文）
- ✅ 显示封面图（支持懒加载）
- ✅ 显示评分（1-5 星）
- ✅ 显示标签（最多显示 3 个，超出显示 +N）
- ✅ 收藏标记（星标）
- ✅ 选中状态高亮
- ✅ 悬停效果和动画
- ✅ 键盘导航支持（Enter/Space）
- ✅ 无障碍支持（ARIA 标签）
- ✅ 响应式设计
- ✅ 触摸设备优化
- ✅ 暗色模式支持

## 基础用法

```tsx
import { CityCard } from '@/components/city/CityCard';
import { City } from '@/types/database';

function MyCityGrid() {
  const city: City = {
    id: '123',
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9042,
    longitude: 116.4074,
    visited_at: '2024-03-15',
    trip_type: 'leisure',
    rating: 5,
    tags: ['历史', '文化', '美食'],
    cover_image: 'https://example.com/beijing.jpg',
    is_favorite: true,
    // ... 其他字段
  };

  return <CityCard city={city} onClick={(city) => console.log('Clicked:', city.city_name)} />;
}
```

## Props

| 属性         | 类型                   | 必需 | 默认值  | 说明               |
| ------------ | ---------------------- | ---- | ------- | ------------------ |
| `city`       | `City`                 | ✅   | -       | 城市数据对象       |
| `onClick`    | `(city: City) => void` | ❌   | -       | 点击回调函数       |
| `isSelected` | `boolean`              | ❌   | `false` | 是否显示为选中状态 |

## 使用场景

### 1. 网格布局

```tsx
function CityGrid({ cities }: { cities: City[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities.map((city) => (
        <CityCard key={city.id} city={city} onClick={(city) => navigateTo(`/cities/${city.id}`)} />
      ))}
    </div>
  );
}
```

### 2. 可选择的卡片列表

```tsx
function SelectableCityGrid() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: cities } = useCities();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cities?.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onClick={(city) => setSelectedId(city.id)}
          isSelected={selectedId === city.id}
        />
      ))}
    </div>
  );
}
```

### 3. 与路由集成

```tsx
import { useNavigate } from 'react-router-dom';

function CityGallery() {
  const navigate = useNavigate();
  const { data: cities } = useCities();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {cities?.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          onClick={(city) => navigate(`/app/cities/${city.id}`)}
        />
      ))}
    </div>
  );
}
```

### 4. 响应式网格

```tsx
function ResponsiveCityGrid() {
  const { data: cities } = useCities();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        padding: '20px',
      }}
    >
      {cities?.map((city) => (
        <CityCard key={city.id} city={city} onClick={(city) => console.log(city)} />
      ))}
    </div>
  );
}
```

## 样式定制

### 自定义卡片宽度

```tsx
<div style={{ maxWidth: '320px' }}>
  <CityCard city={city} />
</div>
```

### 自定义网格布局

```css
.custom-city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

@media (max-width: 768px) {
  .custom-city-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
```

## 无障碍支持

组件已内置无障碍支持：

- ✅ 使用语义化的 `<article>` 标签
- ✅ 支持键盘导航（Tab、Enter、Space）
- ✅ 提供 ARIA 标签（`role="button"`, `aria-label`）
- ✅ 使用 `<time>` 标签标记日期
- ✅ 图片提供 `alt` 属性
- ✅ 焦点可见样式（`:focus-visible`）

## 性能优化

- ✅ 图片懒加载（`loading="lazy"`）
- ✅ CSS 动画使用 `transform` 和 `opacity`（GPU 加速）
- ✅ 避免不必要的重渲染（使用 `React.memo` 如果需要）

## 注意事项

1. **图片处理**：如果 `cover_image` 为空，会显示占位符图标
2. **标签限制**：最多显示 3 个标签，超出部分显示 "+N"
3. **评分显示**：只有当 `rating` 存在时才显示星级
4. **收藏标记**：只有当 `is_favorite` 为 `true` 时才显示
5. **日期格式**：自动格式化为中文日期格式（如：2024年3月15日）

## 相关组件

- `CityList` - 列表形式展示城市
- `CityForm` - 城市表单组件
- `CityMarker` - 地图标记组件

## 验证需求

- ✅ 需求 3.7：显示城市记录详细信息

## 示例代码

查看 `CityCard.example.tsx` 获取更多使用示例。
