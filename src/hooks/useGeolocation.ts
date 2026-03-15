import { useState, useCallback } from 'react';

/**
 * 地理位置坐标
 */
export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

/**
 * 地理位置错误类型
 */
export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED';

/**
 * 地理位置错误
 */
export interface GeolocationError {
  code: GeolocationErrorCode;
  message: string;
}

/**
 * useGeolocation Hook 返回值
 */
export interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  error: GeolocationError | null;
  isLoading: boolean;
  getCurrentPosition: () => void;
}

/**
 * useGeolocation Hook 配置选项
 */
export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * 将浏览器 GeolocationPositionError 转换为自定义错误格式
 */
const mapGeolocationError = (error: GeolocationPositionError): GeolocationError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: 'PERMISSION_DENIED',
        message: '用户拒绝了地理位置权限请求',
      };
    case error.POSITION_UNAVAILABLE:
      return {
        code: 'POSITION_UNAVAILABLE',
        message: '无法获取地理位置信息',
      };
    case error.TIMEOUT:
      return {
        code: 'TIMEOUT',
        message: '获取地理位置超时',
      };
    default:
      return {
        code: 'POSITION_UNAVAILABLE',
        message: error.message || '未知错误',
      };
  }
};

/**
 * 获取用户地理位置的 Hook
 *
 * @description
 * 使用浏览器 Geolocation API 获取用户当前位置
 * 处理权限拒绝、超时和其他错误情况
 *
 * @example
 * ```tsx
 * const { coordinates, error, isLoading, getCurrentPosition } = useGeolocation({
 *   enableHighAccuracy: true,
 *   timeout: 10000,
 * });
 *
 * return (
 *   <div>
 *     <button onClick={getCurrentPosition} disabled={isLoading}>
 *       获取我的位置
 *     </button>
 *     {isLoading && <p>正在获取位置...</p>}
 *     {error && <p>错误: {error.message}</p>}
 *     {coordinates && (
 *       <p>
 *         纬度: {coordinates.latitude}, 经度: {coordinates.longitude}
 *       </p>
 *     )}
 *   </div>
 * );
 * ```
 *
 * @param options - 配置选项
 * @returns Hook 返回值，包含坐标、错误、加载状态和获取位置函数
 */
export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options;

  const getCurrentPosition = useCallback(() => {
    // 检查浏览器是否支持 Geolocation API
    if (!navigator.geolocation) {
      setError({
        code: 'NOT_SUPPORTED',
        message: '您的浏览器不支持地理位置功能',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(mapGeolocationError(err));
        setIsLoading(false);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  return {
    coordinates,
    error,
    isLoading,
    getCurrentPosition,
  };
};
