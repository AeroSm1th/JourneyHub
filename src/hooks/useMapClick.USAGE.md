# useMapClick Hook 使用指南

## 概述

`useMapClick` 是一个用于处理地图点击事件的自定义 Hook。它管理用户点击地图时的坐标状态，并提供清除坐标的方法，通常用于触发创建城市表单。

## 基本用法

### 1. 简单的地图点击处理

```typescript
import { useMapClick } from '@/hooks/useMapClick';
import { MapContainer } from '@/components/map/MapContainer';

function MapPage() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <div>
      <MapContainer onMapClick={handleMapClick}>
        {/* 地图标记等子组件 */}
      </MapContainer>

      {coordinates && (
        <div>
          <p>点击位置：</p>
          <p>纬度: {coordinates.lat}</p>
          <p>经度: {coordinates.lng}</p>
          <button onClick={clearCoordinates}>清除</button>
        </div>
      )}
    </div>
  );
}
```

### 2. 与城市表单集成

```typescript
import { useMapClick } from '@/hooks/useMapClick';
import { MapContainer } from '@/components/map/MapContainer';
import { CityForm } from '@/components/city/CityForm';

function MapPage() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  const handleFormSubmit = async (data) => {
    // 提交表单数据
    await createCity(data);
    // 清除坐标，关闭表单
    clearCoordinates();
  };

  return (
    <div>
      <MapContainer onMapClick={handleMapClick}>
        {/* 地图标记 */}
      </MapContainer>

      {coordinates && (
        <CityForm
          coordinates={coordinates}
          onSubmit={handleFormSubmit}
          onCancel={clearCoordinates}
        />
      )}
    </div>
  );
}
```

### 3. 与 Modal 组件集成

```typescript
import { useMapClick } from '@/hooks/useMapClick';
import { MapContainer } from '@/components/map/MapContainer';
import { Modal } from '@/components/common/Modal';
import { CityForm } from '@/components/city/CityForm';

function MapPage() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <div>
      <MapContainer onMapClick={handleMapClick}>
        {/* 地图标记 */}
      </MapContainer>

      <Modal isOpen={!!coordinates} onClose={clearCoordinates} title="添加城市">
        {coordinates && (
          <CityForm
            coordinates={coordinates}
            onSubmit={async (data) => {
              await createCity(data);
              clearCoordinates();
            }}
            onCancel={clearCoordinates}
          />
        )}
      </Modal>
    </div>
  );
}
```

### 4. 显示点击位置的临时标记

```typescript
import { useMapClick } from '@/hooks/useMapClick';
import { MapContainer } from '@/components/map/MapContainer';
import { Marker } from 'react-leaflet';

function MapPage() {
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  return (
    <MapContainer onMapClick={handleMapClick}>
      {/* 已有的城市标记 */}
      {cities.map((city) => (
        <CityMarker key={city.id} city={city} />
      ))}

      {/* 临时标记显示点击位置 */}
      {coordinates && (
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <div>
              <p>新位置</p>
              <button onClick={clearCoordinates}>取消</button>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
```

## API 参考

### 返回值

```typescript
interface UseMapClickReturn {
  coordinates: Coordinates | null;
  handleMapClick: (lat: number, lng: number) => void;
  clearCoordinates: () => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}
```

#### `coordinates`

- **类型**: `Coordinates | null`
- **描述**: 当前点击的坐标，`null` 表示没有点击或已清除

#### `handleMapClick`

- **类型**: `(lat: number, lng: number) => void`
- **描述**: 处理地图点击事件，保存点击位置的坐标
- **参数**:
  - `lat`: 纬度
  - `lng`: 经度

#### `clearCoordinates`

- **类型**: `() => void`
- **描述**: 清除坐标，用于关闭表单或取消操作

## 使用场景

### 1. 创建城市记录

用户点击地图上的某个位置，触发创建城市记录的表单，表单预填充该位置的坐标。

### 2. 添加愿望清单

用户点击地图标记想去的地方，打开愿望清单表单。

### 3. 规划行程路线

用户点击多个位置，规划旅行路线。

### 4. 地理位置选择器

在任何需要用户选择地理位置的场景中使用。

## 注意事项

1. **函数引用稳定性**: `handleMapClick` 和 `clearCoordinates` 使用 `useCallback` 包裹，引用稳定，可以安全地作为依赖项传递。

2. **坐标验证**: Hook 本身不验证坐标的有效性，应该在使用坐标的地方进行验证（例如在表单提交时）。

3. **状态清理**: 记得在表单提交成功或取消时调用 `clearCoordinates()` 清理状态。

4. **与其他状态管理的集成**: 如果需要在多个组件间共享点击状态，可以考虑将坐标状态提升到 Zustand store 中。

## 相关组件

- `MapContainer`: 地图容器组件，接受 `onMapClick` 回调
- `CityForm`: 城市表单组件，接受 `coordinates` 属性
- `Modal`: 模态框组件，用于显示表单

## 测试

Hook 包含完整的单元测试，覆盖以下场景：

- 初始状态
- 点击保存坐标
- 清除坐标
- 多次点击更新坐标
- 函数引用稳定性
- 边界情况（负数坐标、零坐标）

运行测试：

```bash
npm test -- src/hooks/__tests__/useMapClick.test.ts
```
