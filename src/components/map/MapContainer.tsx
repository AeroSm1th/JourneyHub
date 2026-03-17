/**
 * 地图容器组件
 *
 * 基于 Leaflet 的交互式地图组件
 * 验证需求: 2.1, 2.5 - 地图展示和交互
 */

import { useEffect, useRef } from 'react';
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
   * 视图变更标识，每次程序化跳转时递增
   * 只有 viewKey 变化时才会同步 center/zoom 到地图
   */
  viewKey?: number;

  /**
   * 地图点击事件处理
   */
  onMapClick?: (lat: number, lng: number) => void;

  /**
   * 地图移动/缩放结束后的回调，用于同步状态到 URL
   */
  onMoveEnd?: (lat: number, lng: number, zoom: number) => void;

  /**
   * 子组件（标记、弹窗等）
   */
  children?: React.ReactNode;
}

/**
 * 同步外部程序化的 center/zoom 变化到 Leaflet 实例
 * 只响应显式的 flyTo 请求（通过 viewKey 标识），不干预用户手动操作
 */
function ChangeView({
  center,
  zoom,
  viewKey,
}: {
  center: [number, number];
  zoom: number;
  viewKey?: number;
}) {
  const map = useMap();
  const prevKeyRef = useRef(viewKey);

  useEffect(() => {
    // 只在 viewKey 变化时才移动地图（说明是程序化跳转，比如点击城市列表）
    if (viewKey !== undefined && viewKey !== prevKeyRef.current) {
      map.setView(center, zoom);
      prevKeyRef.current = viewKey;
    }
  }, [center, zoom, viewKey, map]);

  return null;
}

/**
 * 地图事件处理组件
 */
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      // Leaflet 在地图水平循环滚动时 lng 可能超出 [-180, 180]，需要 wrap
      const wrapped = e.latlng.wrap();
      onMapClick(wrapped.lat, wrapped.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

/**
 * 地图状态同步组件
 * 监听 moveend 事件，将 Leaflet 实际位置同步回外部（URL 参数等）
 */
function MapSync({ onMoveEnd }: { onMoveEnd?: (lat: number, lng: number, zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMoveEnd) return;

    const handleMoveEnd = () => {
      const center = map.getCenter();
      onMoveEnd(center.lat, center.lng, map.getZoom());
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd]);

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
  center = [39.9, 116.4],
  zoom = 6,
  viewKey,
  onMapClick,
  onMoveEnd,
  children,
}: MapContainerProps) {
  return (
    <div className="map-container">
      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="leaflet-map"
      >
        {/* 只在程序化跳转时同步视图 */}
        <ChangeView center={center} zoom={zoom} viewKey={viewKey} />

        {/* OpenStreetMap 瓦片层 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 地图事件处理 */}
        <MapEvents onMapClick={onMapClick} />

        {/* 地图状态同步到 URL */}
        <MapSync onMoveEnd={onMoveEnd} />

        {/* 子组件（标记等） */}
        {children}
      </LeafletMap>
    </div>
  );
}
