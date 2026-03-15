/**
 * useMapState Hook 集成示例
 *
 * 展示如何在实际的地图页面中使用 useMapState
 */

import { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap } from 'react-leaflet';
import { useMapState } from './useMapState';
import { useMapClick } from './useMapClick';

/**
 * 地图视图同步组件
 * 当 mapState 变化时，自动更新地图视图
 */
function MapViewSync({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom]);

  return null;
}

/**
 * 地图移动事件处理组件
 * 当地图移动结束时，更新 URL 参数
 */
function MapMoveHandler({
  onMoveEnd,
}: {
  onMoveEnd: (lat: number, lng: number, zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMoveEnd(center.lat, center.lng, zoom);
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd]);

  return null;
}

/**
 * 完整的地图页面示例
 * 集成了 useMapState 和 useMapClick
 */
export function MapPageIntegrationExample() {
  const { mapState, setMapView, setMapViewImmediate } = useMapState();
  const { coordinates, handleMapClick, clearCoordinates } = useMapClick();

  // 模拟城市数据
  const cities = [
    { id: '1', name: '北京', latitude: 39.9042, longitude: 116.4074 },
    { id: '2', name: '上海', latitude: 31.2304, longitude: 121.4737 },
    { id: '3', name: '广州', latitude: 23.1291, longitude: 113.2644 },
  ];

  // 点击城市时立即跳转
  const handleCityClick = (city: (typeof cities)[0]) => {
    setMapViewImmediate({
      lat: city.latitude,
      lng: city.longitude,
      zoom: 12,
    });
  };

  // 地图移动结束时更新 URL（带防抖）
  const handleMapMoveEnd = (lat: number, lng: number, zoom: number) => {
    setMapView({ lat, lng, zoom });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 侧边栏 - 城市列表 */}
      <aside style={{ width: '300px', padding: '20px', overflowY: 'auto' }}>
        <h2>城市列表</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cities.map((city) => (
            <li key={city.id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => handleCityClick(city)}
                style={{
                  width: '100%',
                  padding: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {city.name}
              </button>
            </li>
          ))}
        </ul>

        {/* 当前地图状态 */}
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <h3>当前地图状态</h3>
          <p>纬度: {mapState.lat.toFixed(4)}</p>
          <p>经度: {mapState.lng.toFixed(4)}</p>
          <p>缩放: {mapState.zoom}</p>
        </div>

        {/* 点击坐标 */}
        {coordinates && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e9' }}>
            <h3>点击位置</h3>
            <p>纬度: {coordinates.lat.toFixed(4)}</p>
            <p>经度: {coordinates.lng.toFixed(4)}</p>
            <button onClick={clearCoordinates}>清除</button>
          </div>
        )}
      </aside>

      {/* 地图区域 */}
      <main style={{ flex: 1 }}>
        <LeafletMap
          center={[mapState.lat, mapState.lng]}
          zoom={mapState.zoom}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 同步地图视图 */}
          <MapViewSync lat={mapState.lat} lng={mapState.lng} zoom={mapState.zoom} />

          {/* 处理地图移动事件 */}
          <MapMoveHandler onMoveEnd={handleMapMoveEnd} />

          {/* 城市标记 */}
          {cities.map((city) => (
            <Marker
              key={city.id}
              position={[city.latitude, city.longitude]}
              eventHandlers={{
                click: () => handleCityClick(city),
              }}
            />
          ))}

          {/* 点击位置标记 */}
          {coordinates && (
            <Marker
              position={[coordinates.lat, coordinates.lng]}
              eventHandlers={{
                click: clearCoordinates,
              }}
            />
          )}
        </LeafletMap>
      </main>
    </div>
  );
}

/**
 * 简化版示例 - 只使用 useMapState
 */
export function SimpleMapExample() {
  const { mapState, setMapView } = useMapState();

  return (
    <div>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <p>
          当前位置: {mapState.lat.toFixed(4)}, {mapState.lng.toFixed(4)}
        </p>
        <p>缩放级别: {mapState.zoom}</p>
      </div>

      <LeafletMap
        center={[mapState.lat, mapState.lng]}
        zoom={mapState.zoom}
        style={{ width: '100%', height: '500px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapMoveHandler onMoveEnd={(lat, lng, zoom) => setMapView({ lat, lng, zoom })} />
      </LeafletMap>
    </div>
  );
}
