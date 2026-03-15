# useGeolocation Hook 使用指南

## 概述

`useGeolocation` 是一个用于获取用户地理位置的 React Hook，封装了浏览器的 Geolocation API，提供了完善的错误处理和加载状态管理。

## 功能特性

- ✅ 获取用户当前地理位置（经纬度）
- ✅ 支持高精度定位
- ✅ 完善的错误处理（权限拒绝、超时、不支持等）
- ✅ 加载状态管理
- ✅ 可配置的超时和缓存策略
- ✅ TypeScript 类型安全

## 基础用法

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function LocationButton() {
  const { coordinates, error, isLoading, getCurrentPosition } = useGeolocation();

  return (
    <div>
      <button onClick={getCurrentPosition} disabled={isLoading}>
        {isLoading ? '获取中...' : '获取我的位置'}
      </button>

      {error && <div className="error">错误: {error.message}</div>}

      {coordinates && (
        <div className="coordinates">
          <p>纬度: {coordinates.latitude.toFixed(6)}</p>
          <p>经度: {coordinates.longitude.toFixed(6)}</p>
          <p>精度: {coordinates.accuracy.toFixed(2)} 米</p>
        </div>
      )}
    </div>
  );
}
```

## 配置选项

### enableHighAccuracy

是否启用高精度定位（默认：`true`）

```tsx
const { getCurrentPosition } = useGeolocation({
  enableHighAccuracy: true, // 使用 GPS 等高精度定位
});
```

### timeout

获取位置的超时时间，单位毫秒（默认：`10000`）

```tsx
const { getCurrentPosition } = useGeolocation({
  timeout: 5000, // 5 秒超时
});
```

### maximumAge

允许使用缓存位置的最大时间，单位毫秒（默认：`0`）

```tsx
const { getCurrentPosition } = useGeolocation({
  maximumAge: 60000, // 允许使用 1 分钟内的缓存位置
});
```

## 完整配置示例

```tsx
const { coordinates, error, isLoading, getCurrentPosition } = useGeolocation({
  enableHighAccuracy: true, // 高精度定位
  timeout: 10000, // 10 秒超时
  maximumAge: 0, // 不使用缓存
});
```

## 错误处理

Hook 会捕获并转换所有地理位置错误：

```tsx
function LocationComponent() {
  const { error, getCurrentPosition } = useGeolocation();

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  // 根据错误类型显示不同的提示
  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.code) {
      case 'PERMISSION_DENIED':
        return '请在浏览器设置中允许访问位置信息';
      case 'POSITION_UNAVAILABLE':
        return '无法获取位置信息，请检查网络连接';
      case 'TIMEOUT':
        return '获取位置超时，请重试';
      case 'NOT_SUPPORTED':
        return '您的浏览器不支持地理位置功能';
      default:
        return error.message;
    }
  };

  return (
    <div>
      <button onClick={handleGetLocation}>获取位置</button>
      {error && <p className="error">{getErrorMessage()}</p>}
    </div>
  );
}
```

## 与地图集成

在地图组件中使用，定位到用户当前位置：

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapContainer } from '@/components/map/MapContainer';

function MapWithLocation() {
  const { coordinates, isLoading, getCurrentPosition } = useGeolocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.9, 116.4]);

  const handleLocateMe = () => {
    getCurrentPosition();
  };

  // 当获取到坐标后，更新地图中心
  useEffect(() => {
    if (coordinates) {
      setMapCenter([coordinates.latitude, coordinates.longitude]);
    }
  }, [coordinates]);

  return (
    <div>
      <button onClick={handleLocateMe} disabled={isLoading}>
        📍 定位到我的位置
      </button>
      <MapContainer center={mapCenter} zoom={13} />
    </div>
  );
}
```

## 与反向地理编码结合

获取位置后，自动获取城市名称：

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';
import { reverseGeocode } from '@/services/geocoding/nominatim';

function LocationWithCity() {
  const { coordinates, getCurrentPosition } = useGeolocation();
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    if (coordinates) {
      reverseGeocode(coordinates.latitude, coordinates.longitude)
        .then((result) => {
          setCityName(result.cityName);
        })
        .catch((error) => {
          console.error('反向地理编码失败:', error);
        });
    }
  }, [coordinates]);

  return (
    <div>
      <button onClick={getCurrentPosition}>获取我的位置</button>
      {coordinates && (
        <div>
          <p>当前位置: {cityName || '获取中...'}</p>
          <p>
            坐标: {coordinates.latitude}, {coordinates.longitude}
          </p>
        </div>
      )}
    </div>
  );
}
```

## 在城市表单中使用

点击"使用我的位置"按钮，自动填充坐标：

```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function CityForm() {
  const { coordinates, isLoading, getCurrentPosition } = useGeolocation();
  const [formData, setFormData] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (coordinates) {
      setFormData({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
    }
  }, [coordinates]);

  return (
    <form>
      <button type="button" onClick={getCurrentPosition} disabled={isLoading}>
        {isLoading ? '定位中...' : '📍 使用我的位置'}
      </button>

      <input
        type="number"
        value={formData.latitude}
        onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
        placeholder="纬度"
      />

      <input
        type="number"
        value={formData.longitude}
        onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
        placeholder="经度"
      />
    </form>
  );
}
```

## 返回值说明

### coordinates

用户的地理位置坐标对象，包含：

- `latitude`: 纬度
- `longitude`: 经度
- `accuracy`: 精度（米）
- `altitude`: 海拔高度（可能为 null）
- `altitudeAccuracy`: 海拔精度（可能为 null）
- `heading`: 方向（可能为 null）
- `speed`: 速度（可能为 null）

### error

错误对象，包含：

- `code`: 错误代码（`PERMISSION_DENIED` | `POSITION_UNAVAILABLE` | `TIMEOUT` | `NOT_SUPPORTED`）
- `message`: 错误消息

### isLoading

布尔值，表示是否正在获取位置

### getCurrentPosition

函数，调用后开始获取用户位置

## 注意事项

1. **HTTPS 要求**: 地理位置 API 只能在 HTTPS 或 localhost 环境下使用
2. **用户权限**: 首次使用时浏览器会请求用户授权
3. **精度差异**: `enableHighAccuracy: true` 会使用 GPS，但可能更耗电和耗时
4. **隐私保护**: 不要在未经用户同意的情况下自动获取位置
5. **错误处理**: 务必处理所有可能的错误情况，提供友好的用户提示

## 浏览器兼容性

- ✅ Chrome 5+
- ✅ Firefox 3.5+
- ✅ Safari 5+
- ✅ Edge 12+
- ✅ iOS Safari 3.2+
- ✅ Android Browser 2.1+

## 相关资源

- [MDN - Geolocation API](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation_API)
- [W3C Geolocation API Specification](https://www.w3.org/TR/geolocation-API/)
