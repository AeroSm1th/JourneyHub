/**
 * MapControls 使用示例
 */

import { MapContainer } from './MapContainer';
import { MapControls } from './MapControls';
import { CityMarker } from './CityMarker';

// 示例 1: 基本用法
export function BasicMapControlsExample() {
  return (
    <MapContainer center={[39.9, 116.4]} zoom={6}>
      <MapControls />
    </MapContainer>
  );
}

// 示例 2: 自定义默认位置
export function CustomDefaultExample() {
  return (
    <MapContainer center={[31.2, 121.5]} zoom={10}>
      <MapControls defaultZoom={10} defaultCenter={[31.2, 121.5]} />
    </MapContainer>
  );
}

// 示例 3: 完整的地图应用
export function FullMapExample() {
  const cities = [
    {
      id: '1',
      city_name: '北京',
      country: '中国',
      latitude: 39.9042,
      longitude: 116.4074,
      visit_date: '2024-01-15',
      notes: '长城很壮观',
      emoji: '🏯',
      user_id: 'user-1',
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      city_name: '上海',
      country: '中国',
      latitude: 31.2304,
      longitude: 121.4737,
      visit_date: '2024-02-20',
      notes: '外滩夜景很美',
      emoji: '🌃',
      user_id: 'user-1',
      created_at: '2024-02-20T00:00:00Z',
    },
  ];

  return (
    <MapContainer center={[35.0, 110.0]} zoom={5}>
      {/* 地图控制按钮 */}
      <MapControls defaultZoom={5} defaultCenter={[35.0, 110.0]} />

      {/* 城市标记 */}
      {cities.map((city) => (
        <CityMarker key={city.id} city={city} />
      ))}
    </MapContainer>
  );
}
