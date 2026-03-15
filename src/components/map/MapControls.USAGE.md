# MapControls 使用指南

## 概述

`MapControls` 是一个地图控制组件，提供缩放、定位等地图操作功能。

## 功能特性

- ✅ 定位到当前位置（使用浏览器地理定位 API）
- ✅ 放大/缩小地图
- ✅ 重置视图到默认位置
- ✅ 加载状态指示
- ✅ 错误处理和提示
- ✅ 移动端友好（最小 44x44px 触摸目标）
- ✅ 无障碍支持（aria-label）

## 基础用法

```tsx
import { MapContainer } from './MapContainer';
import { MapControls } from './MapControls';

function MyMap() {
  return (
    <MapContainer center={[39.9, 116.4]} zoom={6}>
      <MapControls />
    </MapContainer>
  );
}
```

## 自定义默认位置

```tsx
<MapContainer center={[31.2, 121.5]} zoom={10}>
  <MapControls defaultZoom={10} defaultCenter={[31.2, 121.5]} />
</MapContainer>
```

## Props

| 属性            | 类型               | 默认值          | 描述                                |
| --------------- | ------------------ | --------------- | ----------------------------------- |
| `defaultZoom`   | `number`           | `6`             | 重置视图时的默认缩放级别            |
| `defaultCenter` | `[number, number]` | `[39.9, 116.4]` | 重置视图时的默认中心点 [纬度, 经度] |

## 按钮说明

1. **定位按钮**（Locate 图标）
   - 点击获取用户当前位置
   - 加载时图标会旋转
   - 成功后地图会移动到当前位置（缩放级别 13）
   - 如果浏览器不支持或用户拒绝授权，会显示错误提示

2. **放大按钮**（ZoomIn 图标）
   - 点击放大地图一级

3. **缩小按钮**（ZoomOut 图标）
   - 点击缩小地图一级

4. **重置按钮**（Maximize2 图标）
   - 点击重置地图到默认中心点和缩放级别

## 错误处理

组件会自动处理以下错误情况：

- 浏览器不支持地理定位 API
- 用户拒绝位置授权
- 定位超时或其他错误

错误信息会显示在控制按钮下方的红色提示框中。

## 样式定制

如需自定义样式，可以覆盖以下 CSS 类：

```css
.map-controls {
  /* 控制面板容器 */
}
.map-control-btn {
  /* 控制按钮 */
}
.map-control-error {
  /* 错误提示 */
}
```

## 注意事项

1. **必须在 MapContainer 内使用**：MapControls 使用 `useMap()` hook，必须作为 MapContainer 的子组件
2. **地理定位权限**：首次使用定位功能时，浏览器会请求用户授权
3. **HTTPS 要求**：地理定位 API 在非 HTTPS 环境下可能不可用（localhost 除外）
4. **移动端优化**：按钮尺寸在移动端会自动调整为 48x48px 以符合触摸目标最佳实践

## 相关组件

- `MapContainer` - 地图容器组件
- `CityMarker` - 城市标记组件
- `useGeolocation` - 地理定位 Hook
