/**
 * 地图状态管理 Hook
 *
 * 使用 URL 参数管理地图的中心点和缩放级别
 * 验证需求: 2.6 - 地图状态同步
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * 地图状态接口
 */
export interface MapState {
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 缩放级别 (1-18) */
  zoom: number;
}

/**
 * 地图状态更新参数（部分更新）
 */
export interface MapStateUpdate {
  lat?: number;
  lng?: number;
  zoom?: number;
}

/**
 * Hook 返回值
 */
export interface UseMapStateReturn {
  /** 当前地图状态 */
  mapState: MapState;
  /** 更新地图状态（带防抖） */
  setMapView: (update: MapStateUpdate) => void;
  /** 立即更新地图状态（不防抖） */
  setMapViewImmediate: (update: MapStateUpdate) => void;
}

/**
 * 默认地图配置
 */
const DEFAULT_MAP_STATE: MapState = {
  lat: 39.9, // 北京纬度
  lng: 116.4, // 北京经度
  zoom: 6, // 默认缩放级别
};

/**
 * 防抖延迟时间（毫秒）
 */
const DEBOUNCE_DELAY = 500;

/**
 * 地图状态管理 Hook
 *
 * 功能：
 * - 从 URL 参数读取地图状态（lat, lng, zoom）
 * - 提供更新地图状态的方法
 * - 自动同步状态到 URL 参数
 * - 防抖处理避免频繁更新 URL
 * - 支持浏览器前进/后退
 *
 * @example
 * ```tsx
 * function MapPage() {
 *   const { mapState, setMapView } = useMapState();
 *
 *   return (
 *     <MapContainer
 *       center={[mapState.lat, mapState.lng]}
 *       zoom={mapState.zoom}
 *       onMoveEnd={(lat, lng, zoom) => {
 *         setMapView({ lat, lng, zoom });
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useMapState(): UseMapStateReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 从 URL 参数读取地图状态
  // 使用 parseFloat + isNaN 避免 0 值被 || 运算符误判为 falsy
  const mapState: MapState = {
    lat:
      searchParams.has('lat') && !isNaN(Number(searchParams.get('lat')))
        ? Number(searchParams.get('lat'))
        : DEFAULT_MAP_STATE.lat,
    lng:
      searchParams.has('lng') && !isNaN(Number(searchParams.get('lng')))
        ? Number(searchParams.get('lng'))
        : DEFAULT_MAP_STATE.lng,
    zoom:
      searchParams.has('zoom') && !isNaN(Number(searchParams.get('zoom')))
        ? Number(searchParams.get('zoom'))
        : DEFAULT_MAP_STATE.zoom,
  };

  /**
   * 更新 URL 参数
   */
  const updateUrlParams = useCallback(
    (update: MapStateUpdate) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);

        // 更新提供的参数
        if (update.lat !== undefined) {
          params.set('lat', update.lat.toFixed(4)); // 保留 4 位小数
        }
        if (update.lng !== undefined) {
          params.set('lng', update.lng.toFixed(4));
        }
        if (update.zoom !== undefined) {
          params.set('zoom', String(Math.round(update.zoom))); // 缩放级别取整
        }

        return params;
      });
    },
    [setSearchParams]
  );

  /**
   * 立即更新地图状态（不防抖）
   */
  const setMapViewImmediate = useCallback(
    (update: MapStateUpdate) => {
      // 清除待处理的防抖更新
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      updateUrlParams(update);
    },
    [updateUrlParams]
  );

  /**
   * 更新地图状态（带防抖）
   */
  const setMapView = useCallback(
    (update: MapStateUpdate) => {
      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的防抖定时器
      debounceTimerRef.current = setTimeout(() => {
        updateUrlParams(update);
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
    },
    [updateUrlParams]
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    mapState,
    setMapView,
    setMapViewImmediate,
  };
}
