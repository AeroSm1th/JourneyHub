/**
 * 地图容器组件
 *
 * 基于 Leaflet 的交互式地图组件
 * 验证需求: 2.1, 2.5 - 地图展示和交互
 */

import { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapContainer.css';

// 修复 Leaflet 默认图标问题
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapContainerProps {
  /**
   * 地图中心点坐标 [纬度, 经度]
   */
  center?: [number, number];

  /**
   * 地图缩放级别 (1-18)
   */
  zoom?: number;

  /**
   * 地图点击事件处理
   */
  onMapClick?: (lat: number, lng: number) => void;

  /**
   * 子组件（标记、弹窗等）
   */
  children?: React.ReactNode;
}

/**
 * 地图事件处理组件
 */
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

/**
 * 地图容器组件
 *
 * 功能：
 * - 渲染 Leaflet 地图
 * - 支持缩放和平移操作
 * - 监听地图点击事件
 * - 配置地图初始中心点和缩放级别
 *
 * @example
 * ```tsx
 * <MapContainer
 *   center={[39.9, 116.4]}
 *   zoom={10}
 *   onMapClick={(lat, lng) => console.log(lat, lng)}
 * >
 *   <CityMarker position={[39.9, 116.4]} />
 * </MapContainer>
 * ```
 */
export function MapContainer({
  center = [39.9, 116.4], // 默认中心：北京
  zoom = 6,
  onMapClick,
  children,
}: MapContainerProps) {
  return (
    <div className="map-container">
      <LeafletMap center={center} zoom={zoom} scrollWheelZoom={true} className="leaflet-map">
        {/* OpenStreetMap 瓦片层 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 地图事件处理 */}
        <MapEvents onMapClick={onMapClick} />

        {/* 子组件（标记等） */}
        {children}
      </LeafletMap>
    </div>
  );
}
