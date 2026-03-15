/**
 * 地图点击事件处理 Hook
 *
 * 管理地图点击状态，包括：
 * - 点击位置的经纬度坐标
 * - 清除坐标的方法
 * - 触发创建城市表单的操作
 *
 * 需求: 2.3 - 监听地图点击事件并获取坐标
 */

import { useState, useCallback } from 'react';

/**
 * 坐标类型
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * useMapClick Hook 返回值
 */
interface UseMapClickReturn {
  /**
   * 当前点击的坐标
   * null 表示没有点击或已清除
   */
  coordinates: Coordinates | null;

  /**
   * 处理地图点击事件
   * @param lat - 纬度
   * @param lng - 经度
   */
  handleMapClick: (lat: number, lng: number) => void;

  /**
   * 清除坐标
   * 用于关闭表单或取消操作时重置状态
   */
  clearCoordinates: () => void;
}

/**
 * 地图点击事件处理 Hook
 *
 * 功能：
 * - 保存用户点击地图的坐标
 * - 提供清除坐标的方法
 * - 可用于触发创建城市表单
 *
 * 使用示例：
 * ```typescript
 * const { coordinates, handleMapClick, clearCoordinates } = useMapClick();
 *
 * // 在 MapContainer 中使用
 * <MapContainer onMapClick={handleMapClick}>
 *   ...
 * </MapContainer>
 *
 * // 当有坐标时显示表单
 * {coordinates && (
 *   <CityForm
 *     coordinates={coordinates}
 *     onCancel={clearCoordinates}
 *   />
 * )}
 * ```
 */
export const useMapClick = (): UseMapClickReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  /**
   * 处理地图点击事件
   * 保存点击位置的坐标
   */
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  }, []);

  /**
   * 清除坐标
   * 用于关闭表单或取消操作
   */
  const clearCoordinates = useCallback(() => {
    setCoordinates(null);
  }, []);

  return {
    coordinates,
    handleMapClick,
    clearCoordinates,
  };
};
