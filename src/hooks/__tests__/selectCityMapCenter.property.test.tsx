/**
 * 属性测试：选择城市移动地图中心
 *
 * 属性 8: 选择城市移动地图中心
 * 验证需求: 2.6
 *
 * 对于任何城市记录，当用户在列表中选择该城市时，
 * 地图应该将中心移动到该城市的坐标位置。
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fc from 'fast-check';
import { useMapState } from '../useMapState';

// ============================================================================
// 辅助函数
// ============================================================================

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 8: 选择城市移动地图中心', () => {
  /**
   * 属性 8.1: setMapViewImmediate 应更新地图中心
   */
  it('属性 8.1: 选择城市后地图中心应更新为该城市坐标', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapState(), { wrapper });

          act(() => {
            result.current.setMapViewImmediate({ lat, lng });
          });

          // URL 参数中的坐标保留 4 位小数
          const expectedLat = Number(lat.toFixed(4));
          const expectedLng = Number(lng.toFixed(4));

          expect(result.current.mapState.lat).toBeCloseTo(expectedLat, 3);
          expect(result.current.mapState.lng).toBeCloseTo(expectedLng, 3);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 8.2: 缩放级别也应可更新
   */
  it('属性 8.2: 更新缩放级别应正确反映', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 18 }), (zoom) => {
        const { result } = renderHook(() => useMapState(), { wrapper });

        act(() => {
          result.current.setMapViewImmediate({ zoom });
        });

        expect(result.current.mapState.zoom).toBe(zoom);
      }),
      { numRuns: 18 }
    );
  });

  /**
   * 属性 8.3: 同时更新中心和缩放
   */
  it('属性 8.3: 同时更新中心坐标和缩放级别', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 1, max: 18 }),
        (lat, lng, zoom) => {
          const { result } = renderHook(() => useMapState(), { wrapper });

          act(() => {
            result.current.setMapViewImmediate({ lat, lng, zoom });
          });

          expect(result.current.mapState.zoom).toBe(zoom);
          expect(result.current.mapState.lat).toBeCloseTo(Number(lat.toFixed(4)), 3);
          expect(result.current.mapState.lng).toBeCloseTo(Number(lng.toFixed(4)), 3);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 8.4: 默认值应为北京坐标
   */
  it('属性 8.4: 未设置参数时应使用默认值', () => {
    const { result } = renderHook(() => useMapState(), { wrapper });

    expect(result.current.mapState.lat).toBe(39.9);
    expect(result.current.mapState.lng).toBe(116.4);
    expect(result.current.mapState.zoom).toBe(6);
  });
});
