/**
 * useMapState Hook 使用示例
 */

import { useEffect } from 'react';
import { useMapState } from './useMapState';

/**
 * 示例 1: 基本用法 - 地图拖动和缩放
 */
export function BasicMapExample() {
  const { mapState, setMapView } = useMapState();

  const handleMapMove = (lat: number, lng: number, zoom: number) => {
    // 使用防抖更新，避免频繁修改 URL
    setMapView({ lat, lng, zoom });
  };

  return (
    <div>
      <h2>当前地图状态</h2>
      <p>纬度: {mapState.lat.toFixed(4)}</p>
      <p>经度: {mapState.lng.toFixed(4)}</p>
      <p>缩放: {mapState.zoom}</p>

      {/* 模拟地图移动 */}
      <button onClick={() => handleMapMove(39.9, 116.4, 10)}>移动到北京</button>
    </div>
  );
}

/**
 * 示例 2: 城市列表点击跳转
 */
interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export function CityListExample() {
  const { setMapViewImmediate } = useMapState();

  const cities: City[] = [
    { id: '1', name: '北京', latitude: 39.9042, longitude: 116.4074 },
    { id: '2', name: '上海', latitude: 31.2304, longitude: 121.4737 },
    { id: '3', name: '广州', latitude: 23.1291, longitude: 113.2644 },
  ];

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
        <li key={city.id}>
          <button onClick={() => handleCityClick(city)}>{city.name}</button>
        </li>
      ))}
    </ul>
  );
}

/**
 * 示例 3: 部分更新
 */
export function PartialUpdateExample() {
  const { mapState, setMapView, setMapViewImmediate } = useMapState();

  return (
    <div>
      <h2>部分更新示例</h2>

      {/* 只更新缩放级别 */}
      <button onClick={() => setMapView({ zoom: mapState.zoom + 1 })}>放大</button>
      <button onClick={() => setMapView({ zoom: mapState.zoom - 1 })}>缩小</button>

      {/* 只更新中心点 */}
      <button onClick={() => setMapViewImmediate({ lat: 39.9, lng: 116.4 })}>回到北京</button>
    </div>
  );
}

/**
 * 示例 4: 与 URL 参数同步
 */
export function UrlSyncExample() {
  const { mapState, setMapView } = useMapState();

  useEffect(() => {
    console.log('地图状态已更新:', mapState);
    console.log('URL 参数:', window.location.search);
  }, [mapState]);

  return (
    <div>
      <h2>URL 同步示例</h2>
      <p>当前 URL: {window.location.search}</p>
      <p>地图状态: {JSON.stringify(mapState)}</p>

      <button onClick={() => setMapView({ lat: 31.23, lng: 121.47, zoom: 11 })}>
        更新到上海（防抖）
      </button>
    </div>
  );
}

/**
 * 示例 5: 地图控制按钮
 */
export function MapControlsExample() {
  const { mapState, setMapView, setMapViewImmediate } = useMapState();

  const zoomIn = () => {
    setMapView({ zoom: Math.min(mapState.zoom + 1, 18) });
  };

  const zoomOut = () => {
    setMapView({ zoom: Math.max(mapState.zoom - 1, 1) });
  };

  const resetView = () => {
    setMapViewImmediate({ lat: 39.9, lng: 116.4, zoom: 6 });
  };

  return (
    <div className="map-controls">
      <button onClick={zoomIn}>+</button>
      <button onClick={zoomOut}>-</button>
      <button onClick={resetView}>重置</button>
      <div>缩放级别: {mapState.zoom}</div>
    </div>
  );
}

/**
 * 示例 6: 完整的地图页面
 */
export function CompleteMapPageExample() {
  const { mapState, setMapView, setMapViewImmediate } = useMapState();

  const cities: City[] = [
    { id: '1', name: '北京', latitude: 39.9042, longitude: 116.4074 },
    { id: '2', name: '上海', latitude: 31.2304, longitude: 121.4737 },
  ];

  const handleCityClick = (city: City) => {
    setMapViewImmediate({
      lat: city.latitude,
      lng: city.longitude,
      zoom: 12,
    });
  };

  const handleMapMove = (lat: number, lng: number, zoom: number) => {
    setMapView({ lat, lng, zoom });
  };

  return (
    <div className="map-page">
      {/* 侧边栏 - 城市列表 */}
      <aside className="sidebar">
        <h2>城市列表</h2>
        <ul>
          {cities.map((city) => (
            <li key={city.id}>
              <button onClick={() => handleCityClick(city)}>{city.name}</button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 地图区域 */}
      <main className="map-area">
        <div className="map-info">
          <p>
            中心: {mapState.lat.toFixed(4)}, {mapState.lng.toFixed(4)}
          </p>
          <p>缩放: {mapState.zoom}</p>
        </div>

        {/* 这里应该是实际的地图组件 */}
        <div
          className="map-placeholder"
          onClick={() => handleMapMove(mapState.lat + 0.1, mapState.lng + 0.1, mapState.zoom)}
        >
          点击模拟地图移动
        </div>
      </main>
    </div>
  );
}
