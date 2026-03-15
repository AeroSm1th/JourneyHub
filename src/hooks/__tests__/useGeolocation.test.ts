import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  // Mock Geolocation API
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // 创建新的 mock 实例
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // 设置 navigator.geolocation mock
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.coordinates).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.getCurrentPosition).toBe('function');
    });
  });

  describe('成功获取位置', () => {
    it('应该成功获取用户位置', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.coordinates).toEqual({
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      });
      expect(result.current.error).toBeNull();
    });

    it('应该在获取位置时设置 isLoading 为 true', () => {
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // 不调用回调，保持 loading 状态
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('应该处理包含所有坐标信息的位置', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 31.2304,
          longitude: 121.4737,
          accuracy: 5,
          altitude: 10,
          altitudeAccuracy: 2,
          heading: 90,
          speed: 5,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.coordinates).not.toBeNull();
      });

      expect(result.current.coordinates).toEqual({
        latitude: 31.2304,
        longitude: 121.4737,
        accuracy: 5,
        altitude: 10,
        altitudeAccuracy: 2,
        heading: 90,
        speed: 5,
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理权限拒绝错误', async () => {
      const mockError: GeolocationPositionError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual({
        code: 'PERMISSION_DENIED',
        message: '用户拒绝了地理位置权限请求',
      });
      expect(result.current.coordinates).toBeNull();
    });

    it('应该处理位置不可用错误', async () => {
      const mockError: GeolocationPositionError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error).toEqual({
        code: 'POSITION_UNAVAILABLE',
        message: '无法获取地理位置信息',
      });
    });

    it('应该处理超时错误', async () => {
      const mockError: GeolocationPositionError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.error).toEqual({
        code: 'TIMEOUT',
        message: '获取地理位置超时',
      });
    });

    it('应该处理浏览器不支持的情况', () => {
      // 移除 geolocation 支持
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(result.current.error).toEqual({
        code: 'NOT_SUPPORTED',
        message: '您的浏览器不支持地理位置功能',
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('应该在获取位置前清除之前的错误', async () => {
      // 第一次调用返回错误
      const mockError: GeolocationPositionError = {
        code: 1,
        message: 'Error',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // 第二次调用成功
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.coordinates).not.toBeNull();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('配置选项', () => {
    it('应该使用默认配置选项', () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    it('应该使用自定义配置选项', () => {
      const { result } = renderHook(() =>
        useGeolocation({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        })
      );

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    });

    it('应该在配置改变时使用新的配置', () => {
      const { result, rerender } = renderHook(({ options }) => useGeolocation(options), {
        initialProps: {
          options: { timeout: 5000 },
        },
      });

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenLastCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          timeout: 5000,
        })
      );

      // 更改配置
      rerender({ options: { timeout: 8000 } });

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenLastCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          timeout: 8000,
        })
      );
    });
  });

  describe('多次调用', () => {
    it('应该支持多次调用 getCurrentPosition', async () => {
      const mockPosition1: GeolocationPosition = {
        coords: {
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      const mockPosition2: GeolocationPosition = {
        coords: {
          latitude: 31.2304,
          longitude: 121.4737,
          accuracy: 5,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition
        .mockImplementationOnce((success) => success(mockPosition1))
        .mockImplementationOnce((success) => success(mockPosition2));

      const { result } = renderHook(() => useGeolocation());

      // 第一次调用
      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.coordinates?.latitude).toBe(39.9042);
      });

      // 第二次调用
      act(() => {
        result.current.getCurrentPosition();
      });

      await waitFor(() => {
        expect(result.current.coordinates?.latitude).toBe(31.2304);
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });
  });
});
