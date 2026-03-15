# Sidebar 组件使用指南

## 概述

`Sidebar` 是一个响应式侧边栏组件，支持桌面端、平板端和移动端的不同展示方式。

## 功能特性

- ✅ 响应式设计（桌面/平板/移动端）
- ✅ 支持折叠/展开
- ✅ 移动端滑出式侧边栏
- ✅ 移动端遮罩层
- ✅ 无障碍支持（ARIA 属性）
- ✅ 自定义标题和内容
- ✅ 与 UI Store 集成

## 基础用法

```tsx
import { Sidebar } from '@/components/Sidebar';
import { CityList } from '@/components/city/CityList';

function MapPage() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar title="我的足迹">
        <CityList />
      </Sidebar>

      <main style={{ flex: 1 }}>{/* 地图内容 */}</main>
    </div>
  );
}
```

## Props

| 属性        | 类型        | 默认值       | 说明               |
| ----------- | ----------- | ------------ | ------------------ |
| `title`     | `string`    | `'我的足迹'` | 侧边栏标题         |
| `children`  | `ReactNode` | -            | 侧边栏内容（必填） |
| `className` | `string`    | `''`         | 自定义类名         |

## 响应式行为

### 桌面端（≥1024px）

- 固定宽度：400px
- 相对定位
- 折叠时宽度变为 0

### 平板端（768px-1023px）

- 固定宽度：320px
- 相对定位
- 折叠时宽度变为 0

### 移动端（<768px）

- 固定定位（覆盖在内容上方）
- 宽度：85%（最大 320px）
- 从左侧滑出
- 带半透明遮罩层
- 点击遮罩层关闭侧边栏

## 状态管理

侧边栏的开关状态由 `useUIStore` 管理：

```tsx
import { useUIStore } from '@/store/uiStore';

function MyComponent() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return <button onClick={toggleSidebar}>{sidebarOpen ? '关闭' : '打开'}侧边栏</button>;
}
```

## 自定义样式

可以通过 `className` 属性添加自定义样式：

```tsx
<Sidebar title="愿望清单" className="wishlist-sidebar">
  <WishlistContent />
</Sidebar>
```

```css
.wishlist-sidebar .sidebar-header {
  background-color: #fef3c7;
}

.wishlist-sidebar .sidebar-title {
  color: #92400e;
}
```

## 无障碍支持

- 切换按钮包含 `aria-label` 和 `aria-expanded` 属性
- 支持键盘导航（Tab 键）
- 支持高对比度模式
- 支持减少动画模式

## 注意事项

1. **布局要求**：父容器需要设置 `display: flex` 和 `height: 100vh`
2. **滚动处理**：侧边栏内容区域自动处理滚动
3. **移动端体验**：移动端点击遮罩层会关闭侧边栏
4. **打印样式**：打印时侧边栏会自动隐藏

## 相关组件

- `CityList` - 城市列表组件
- `useUIStore` - UI 状态管理 Store

## 验证需求

- 需求 10.3：响应式设计（桌面/平板/移动端）
