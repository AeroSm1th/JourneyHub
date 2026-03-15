/**
 * useMapState Hook 单元测试
 *
 * 验证需求: 2.6 - 地图状态同步
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { createElement } from 'react';
import { useMapState } from '../useMapState';

// 包装器组件，提供 Router 上下文
const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(BrowserRouter, null, children);

describe('useMapState', () => {
  beforeEach(() => {
    // 清理 URL 参数
    window.history.pushState({}, '', '/');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('初始状态', () => {
    it('应该返回默认地图状态', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.mapState).toEqual({
        lat: 39.9,
        lng: 116.4,
        zoom: 6,
      });
    });

    it('应该从 URL 参数读取初始状态', () => {
      window.history.pushState({}, '', '/?lat=31.23&lng=121.47&zoom=10');

      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.mapState).toEqual({
        lat: 31.23,
        lng: 121.47,
        zoom: 10,
      });
    });

    it('应该处理部分 URL 参数', () => {
      window.history.pushState({}, '', '/?lat=31.23');

      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.mapState).toEqual({
        lat: 31.23,
        lng: 116.4, // 默认值
        zoom: 6, // 默认值
      });
    });

    it('应该处理无效的 URL 参数', () => {
      window.history.pushState({}, '', '/?lat=invalid&lng=abc&zoom=xyz');

      const { result } = renderHook(() => useMapState(), { wrapper });

      // 无效参数应该使用默认值
      expect(result.current.mapState).toEqual({
        lat: 39.9,
        lng: 116.4,
        zoom: 6,
      });
    });
  });

  describe('API 接口', () => {
    it('应该提供 mapState 对象', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.mapState).toBeDefined();
      expect(result.current.mapState).toHaveProperty('lat');
      expect(result.current.mapState).toHaveProperty('lng');
      expect(result.current.mapState).toHaveProperty('zoom');
    });

    it('应该提供 setMapView 方法', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.setMapView).toBeDefined();
      expect(typeof result.current.setMapView).toBe('function');
    });

    it('应该提供 setMapViewImmediate 方法', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(result.current.setMapViewImmediate).toBeDefined();
      expect(typeof result.current.setMapViewImmediate).toBe('function');
    });
  });

  describe('setMapView (防抖更新)', () => {
    it('应该接受部分更新参数', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      // 不应该抛出错误
      expect(() => {
        act(() => {
          result.current.setMapView({ lat: 31.23 });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setMapView({ lng: 121.47 });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setMapView({ zoom: 10 });
        });
      }).not.toThrow();
    });

    it('应该接受完整更新参数', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapView({ lat: 31.23, lng: 121.47, zoom: 10 });
        });
      }).not.toThrow();
    });

    it('应该使用防抖机制', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      act(() => {
        result.current.setMapView({ lat: 31.23 });
      });

      // 立即检查，URL 不应该更新
      expect(window.location.search).toBe('');

      // 快进时间但不到防抖延迟
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // 仍然不应该更新
      expect(window.location.search).toBe('');
    });
  });

  describe('setMapViewImmediate (立即更新)', () => {
    it('应该接受部分更新参数', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ zoom: 12 });
        });
      }).not.toThrow();
    });

    it('应该接受完整更新参数', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ lat: 39.9, lng: 116.4, zoom: 10 });
        });
      }).not.toThrow();
    });
  });

  describe('清理', () => {
    it('应该在卸载时清理防抖定时器', () => {
      const { result, unmount } = renderHook(() => useMapState(), { wrapper });

      act(() => {
        result.current.setMapView({ lat: 31.23 });
      });

      // 卸载组件
      unmount();

      // 快进时间
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // URL 不应该更新
      expect(window.location.search).toBe('');
    });
  });

  describe('边界情况', () => {
    it('应该处理极端经纬度值', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ lat: -90, lng: -180 });
        });
      }).not.toThrow();
    });

    it('应该处理极端缩放级别', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ zoom: 1 });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ zoom: 18 });
        });
      }).not.toThrow();
    });

    it('应该处理零值', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setMapViewImmediate({ lat: 0, lng: 0, zoom: 0 });
        });
      }).not.toThrow();
    });
  });

  describe('类型安全', () => {
    it('mapState 应该包含正确的类型', () => {
      const { result } = renderHook(() => useMapState(), { wrapper });

      expect(typeof result.current.mapState.lat).toBe('number');
      expect(typeof result.current.mapState.lng).toBe('number');
      expect(typeof result.current.mapState.zoom).toBe('number');
    });
  });
});
