# useMapState Hook 使用指南

## 概述

`useMapState` 是一个用于管理地图状态的 React Hook，它使用 URL 参数来存储和同步地图的中心点（经纬度）和缩放级别。

## 功能特性

- ✅ 从 URL 参数读取地图状态（lat, lng, zoom）
- ✅ 自动同步地图状态到 URL
- ✅ 防抖处理，避免频繁更新 URL
- ✅ 支持浏览器前进/后退
- ✅ TypeScript 类型支持
- ✅ 提供立即更新和防抖更新两种方式

## 基本用法

```tsx
import { useMapState } from '@/hooks/useMapState';
import { MapContainer } from '@/components/map';

function MapPage() {
  const { mapState, setMapView } = useMapState();

  return (
    <MapContainer
      center={[mapState.lat, mapState.lng]}
      zoom={mapState.zoom}
      onMoveEnd={(lat, lng, zoom) => {
        // 地图移动结束时更新状态（带防抖）
        setMapView({ lat, lng, zoom });
      }}
    />
  );
}
```

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

### 方法说明

#### `setMapView(update)`

带防抖的状态更新方法，适用于频繁触发的场景（如地图拖动）。

- **防抖延迟**: 500ms
- **参数**: `{ lat?, lng?, zoom? }` - 可以部分更新
- **使用场景**: 地图拖动、缩放等频繁操作

```tsx
// 只更新中心点
setMapView({ lat: 39.9, lng: 116.4 });

// 只更新缩放级别
setMapView({ zoom: 10 });

// 同时更新所有参数
setMapView({ lat: 39.9, lng: 116.4, zoom: 10 });
```

#### `setMapViewImmediate(update)`

立即更新状态，不经过防抖处理。

- **无延迟**: 立即更新 URL
- **参数**: `{ lat?, lng?, zoom? }` - 可以部分更新
- **使用场景**: 点击城市标记、选择城市等需要立即响应的操作

```tsx
// 点击城市时立即跳转
const handleCityClick = (city: City) => {
  setMapViewImmediate({
    lat: city.latitude,
    lng: city.longitude,
    zoom: 12,
  });
};
```

## 使用场景

### 1. 地图拖动和缩放

```tsx
import { MapContainer as LeafletMap } from 'react-leaflet';
import { useMapState } from '@/hooks/useMapState';

function InteractiveMap() {
  const { mapState, setMapView } = useMapState();

  const handleMoveEnd = (map: L.Map) => {
    const center = map.getCenter();
    const zoom = map.getZoom();

    // 使用防抖更新，避免频繁修改 URL
    setMapView({
      lat: center.lat,
      lng: center.lng,
      zoom,
    });
  };

  return (
    <LeafletMap
      center={[mapState.lat, mapState.lng]}
      zoom={mapState.zoom}
      whenReady={(map) => {
        map.target.on('moveend', () => handleMoveEnd(map.target));
      }}
    />
  );
}
```

### 2. 点击城市跳转

```tsx
function CityList() {
  const { setMapViewImmediate } = useMapState();

  const handleCityClick = (city: City) => {
    // 立即跳转到城市位置
    setMapViewImmediate({
      lat: city.latitude,
      lng: city.longitude,
      zoom: 12,
    });
  };

  return (
    <ul>
      {cities.map((city) => (
        <li key={city.id} onClick={() => handleCityClick(city)}>
          {city.name}
        </li>
      ))}
    </ul>
  );
}
```

### 3. 与 useUrlPosition 配合使用

```tsx
import { useMapState } from '@/hooks/useMapState';
import { useUrlPosition } from '@/hooks/useUrlPosition';

function MapWithUrlSync() {
  const { mapState, setMapView } = useMapState();
  const [urlLat, urlLng] = useUrlPosition();

  // 当 URL 中有位置参数时，更新地图视图
  useEffect(() => {
    if (urlLat && urlLng) {
      setMapViewImmediate({
        lat: Number(urlLat),
        lng: Number(urlLng),
        zoom: 12,
      });
    }
  }, [urlLat, urlLng, setMapViewImmediate]);

  return <MapContainer center={[mapState.lat, mapState.lng]} zoom={mapState.zoom} />;
}
```

### 4. 读取初始地图状态

```tsx
function MapPage() {
  const { mapState } = useMapState();

  // URL: ?lat=39.9&lng=116.4&zoom=10
  console.log(mapState); // { lat: 39.9, lng: 116.4, zoom: 10 }

  // 如果 URL 中没有参数，使用默认值
  // 默认: { lat: 39.9, lng: 116.4, zoom: 6 }
}
```

## URL 参数格式

地图状态会自动同步到 URL 查询参数：

```
?lat=39.9042&lng=116.4074&zoom=10
```

- `lat`: 纬度，保留 4 位小数
- `lng`: 经度，保留 4 位小数
- `zoom`: 缩放级别，整数 (1-18)

## 默认值

如果 URL 中没有参数，使用以下默认值：

```typescript
{
  lat: 39.9,   // 北京纬度
  lng: 116.4,  // 北京经度
  zoom: 6,     // 中国全景视图
}
```

## 注意事项

1. **防抖延迟**: `setMapView` 有 500ms 的防抖延迟，适合频繁触发的场景
2. **立即更新**: 需要立即响应时使用 `setMapViewImmediate`
3. **部分更新**: 可以只更新部分参数，其他参数保持不变
4. **精度控制**: 经纬度自动保留 4 位小数，缩放级别自动取整
5. **浏览器历史**: 每次更新都会在浏览器历史中创建新记录，支持前进/后退

## 与其他 Hook 的配合

### useMapClick

```tsx
import { useMapState } from '@/hooks/useMapState';
import { useMapClick } from '@/hooks/useMapClick';

function MapWithClickHandler() {
  const { mapState, setMapView } = useMapState();
  const { handleMapClick } = useMapClick();

  const onMapClick = (lat: number, lng: number) => {
    // 处理点击逻辑
    handleMapClick(lat, lng);

    // 更新地图视图
    setMapViewImmediate({ lat, lng, zoom: 12 });
  };

  return (
    <MapContainer
      center={[mapState.lat, mapState.lng]}
      zoom={mapState.zoom}
      onMapClick={onMapClick}
    />
  );
}
```

## 验证需求

- ✅ **需求 2.6**: 地图状态同步到 URL 参数
- ✅ 支持浏览器前进/后退
- ✅ 防抖处理避免性能问题
- ✅ TypeScript 类型安全
