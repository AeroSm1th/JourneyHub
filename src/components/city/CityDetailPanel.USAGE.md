# CityDetailPanel 使用文档

## 概述

`CityDetailPanel` 是城市详情面板组件，用于显示完整的城市信息，并提供编辑和删除功能。

## 功能特性

- ✅ 显示完整的城市信息（基本信息、评分、标签、备注等）
- ✅ 显示城市封面图
- ✅ 提供编辑按钮
- ✅ 提供删除按钮（带确认对话框）
- ✅ 响应式设计（桌面端、平板端、移动端）
- ✅ 触摸屏优化

## 验证需求

- **需求 3.7**: 显示城市记录的详细信息
- **需求 3.8**: 提供编辑城市记录的功能
- **需求 3.9**: 提供删除城市记录的功能

## Props

```typescript
interface CityDetailPanelProps {
  /**
   * 城市数据
   */
  city: City;

  /**
   * 编辑回调
   */
  onEdit?: (city: City) => void;

  /**
   * 删除成功回调
   */
  onDeleteSuccess?: () => void;

  /**
   * 关闭面板回调
   */
  onClose?: () => void;
}
```

## 基本用法

```tsx
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { City } from '@/types/database';

function MapPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  return (
    <div>
      {selectedCity && (
        <CityDetailPanel
          city={selectedCity}
          onEdit={(city) => {
            // 打开编辑表单
            console.log('Edit city:', city);
          }}
          onDeleteSuccess={() => {
            // 删除成功后关闭面板
            setSelectedCity(null);
            console.log('City deleted');
          }}
          onClose={() => {
            // 关闭面板
            setSelectedCity(null);
          }}
        />
      )}
    </div>
  );
}
```

## 在侧边栏中使用

```tsx
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { CityList } from '@/components/city/CityList';

function Sidebar() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <aside className="sidebar">
      {!selectedCity ? (
        <CityList onCityClick={(city) => setSelectedCity(city)} selectedCityId={selectedCity?.id} />
      ) : (
        <CityDetailPanel
          city={selectedCity}
          onEdit={(city) => {
            setIsEditing(true);
            // 打开编辑表单
          }}
          onDeleteSuccess={() => {
            setSelectedCity(null);
            // 可选：显示成功提示
            toast.success('删除成功');
          }}
          onClose={() => {
            setSelectedCity(null);
          }}
        />
      )}
    </aside>
  );
}
```

## 在模态框中使用

```tsx
import { CityDetailPanel } from '@/components/city/CityDetailPanel';
import { Modal } from '@/components/common/Modal';

function CityDetailModal({ city, isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <CityDetailPanel
        city={city}
        onEdit={(city) => {
          // 关闭详情模态框，打开编辑模态框
          onClose();
          openEditModal(city);
        }}
        onDeleteSuccess={() => {
          onClose();
          toast.success('删除成功');
        }}
      />
    </Modal>
  );
}
```

## 样式定制

组件使用 CSS 类名，可以通过覆盖样式进行定制：

```css
/* 自定义头部背景色 */
.city-detail-header {
  background-color: #f9fafb;
}

/* 自定义标题颜色 */
.city-detail-title {
  color: #3b82f6;
}

/* 自定义标签样式 */
.city-detail-tag {
  background-color: #dbeafe;
  color: #1e40af;
}
```

## 响应式行为

### 桌面端 (≥1024px)

- 完整显示所有信息
- 按钮横向排列

### 平板端 (768px - 1023px)

- 调整内边距
- 保持横向按钮布局

### 移动端 (<768px)

- 减小内边距和字体大小
- 信息项垂直排列
- 按钮垂直排列
- 触摸目标增大

## 删除确认流程

1. 用户点击"删除"按钮
2. 显示确认对话框
3. 用户确认后执行删除
4. 删除成功后调用 `onDeleteSuccess` 回调
5. 删除失败显示错误提示

## 注意事项

1. **必需的 Props**: `city` 是必需的
2. **删除操作**: 删除操作不可撤销，确保用户理解
3. **回调处理**: 建议在 `onDeleteSuccess` 中关闭面板或导航到其他页面
4. **错误处理**: 删除失败时会显示 alert，建议替换为更友好的提示方式
5. **加载状态**: 删除过程中按钮会显示加载状态并禁用

## 可访问性

- ✅ 使用语义化 HTML 标签（`<article>`, `<dl>`, `<dt>`, `<dd>`）
- ✅ 关闭按钮有 `aria-label`
- ✅ 日期使用 `<time>` 标签和 `dateTime` 属性
- ✅ 键盘导航支持（ESC 关闭模态框）
- ✅ 触摸屏优化（按钮尺寸）

## 相关组件

- `CityCard` - 城市卡片组件
- `CityList` - 城市列表组件
- `CityForm` - 城市表单组件
- `Button` - 通用按钮组件
- `Modal` - 通用模态框组件
