/**
 * 地图控制组件
 *
 * 提供地图缩放、定位等控制功能
 * 验证需求: 2.5 - 地图缩放和平移操作
 */

import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Locate, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import './MapControls.css';

interface MapControlsProps {
  /**
   * 默认缩放级别
   */
  defaultZoom?: number;

  /**
   * 默认中心点
   */
  defaultCenter?: [number, number];
}

/**
 * 地图控制组件
 *
 * 功能：
 * - 定位到当前位置
 * - 放大地图
 * - 缩小地图
 * - 重置视图到默认位置
 *
 * @example
 * ```tsx
 * <MapContainer>
 *   <MapControls defaultZoom={6} defaultCenter={[39.9, 116.4]} />
 * </MapContainer>
 * ```
 */
export function MapControls({ defaultZoom = 6, defaultCenter = [39.9, 116.4] }: MapControlsProps) {
  const map = useMap();
  const { isLoading, position, error, getPosition } = useGeolocation();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasMovedToPosition, setHasMovedToPosition] = useState(false);

  // 放大地图
  const handleZoomIn = () => {
    map.zoomIn();
  };

  // 缩小地图
  const handleZoomOut = () => {
    map.zoomOut();
  };

  // 重置视图
  const handleReset = () => {
    map.setView(defaultCenter, defaultZoom);
  };

  // 定位到当前位置
  const handleLocate = () => {
    setLocationError(null);
    setHasMovedToPosition(false);
    getPosition();
  };

  // 当获取到位置后，移动地图
  useEffect(() => {
    if (position && !isLoading && !hasMovedToPosition) {
      map.setView([position.lat, position.lng], 13);
      setHasMovedToPosition(true);
    }
  }, [position, isLoading, hasMovedToPosition, map]);

  // 处理定位错误
  useEffect(() => {
    if (error && !locationError) {
      setLocationError(error);
    }
  }, [error, locationError]);

  return (
    <div className="map-controls">
      {/* 定位按钮 */}
      <button
        className="map-control-btn"
        onClick={handleLocate}
        disabled={isLoading}
        title="定位到当前位置"
        aria-label="定位到当前位置"
      >
        <Locate className={isLoading ? 'spinning' : ''} size={20} />
      </button>

      {/* 放大按钮 */}
      <button className="map-control-btn" onClick={handleZoomIn} title="放大" aria-label="放大地图">
        <ZoomIn size={20} />
      </button>

      {/* 缩小按钮 */}
      <button
        className="map-control-btn"
        onClick={handleZoomOut}
        title="缩小"
        aria-label="缩小地图"
      >
        <ZoomOut size={20} />
      </button>

      {/* 重置视图按钮 */}
      <button
        className="map-control-btn"
        onClick={handleReset}
        title="重置视图"
        aria-label="重置地图视图"
      >
        <Maximize2 size={20} />
      </button>

      {/* 错误提示 */}
      {locationError && (
        <div className="map-control-error" role="alert">
          {locationError}
        </div>
      )}
    </div>
  );
}
