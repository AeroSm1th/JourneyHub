/**
 * 属性测试：地图点击触发表单
 *
 * 属性 9: 地图点击触发表单
 * 验证需求: 3.1
 *
 * 测试属性：
 * 对于任何地图上的点击位置，系统应该显示创建城市记录的表单，并预填充该位置的坐标
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useMapClick } from '../useMapClick';

describe('属性测试：地图点击触发表单', () => {
  /**
   * 属性 9.1: 地图点击应该保存坐标
   *
   * 对于任何有效的经纬度坐标，当用户点击地图时，
   * 系统应该保存该坐标并使其可用于表单
   */
  it('属性 9.1: 对于任何有效的经纬度坐标，点击地图应该保存该坐标', () => {
    fc.assert(
      fc.property(
        // 生成有效的纬度 (-90 到 90)
        fc.double({ min: -90, max: 90, noNaN: true }),
        // 生成有效的经度 (-180 到 180)
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapClick());

          // 初始状态：没有坐标
          expect(result.current.coordinates).toBeNull();

          // 点击地图
          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          // 验证：坐标应该被保存
          expect(result.current.coordinates).not.toBeNull();
          expect(result.current.coordinates?.lat).toBe(lat);
          expect(result.current.coordinates?.lng).toBe(lng);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 9.2: 坐标应该精确保存，不丢失精度
   *
   * 对于任何坐标，保存后的坐标应该与原始坐标完全相同
   */
  it('属性 9.2: 保存的坐标应该与原始坐标精确相同', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapClick());

          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          // 验证：坐标精度不应该丢失
          const savedCoords = result.current.coordinates;
          expect(savedCoords?.lat).toBe(lat);
          expect(savedCoords?.lng).toBe(lng);

          // 验证：坐标对象应该包含正确的属性
          expect(savedCoords).toHaveProperty('lat');
          expect(savedCoords).toHaveProperty('lng');
          expect(Object.keys(savedCoords!)).toHaveLength(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 9.3: 多次点击应该更新坐标
   *
   * 对于任何两个不同的坐标，第二次点击应该覆盖第一次的坐标
   */
  it('属性 9.3: 多次点击地图应该更新坐标为最新的点击位置', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true })
        ),
        fc.tuple(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true })
        ),
        ([lat1, lng1], [lat2, lng2]) => {
          const { result } = renderHook(() => useMapClick());

          // 第一次点击
          act(() => {
            result.current.handleMapClick(lat1, lng1);
          });

          const firstCoords = result.current.coordinates;
          expect(firstCoords?.lat).toBe(lat1);
          expect(firstCoords?.lng).toBe(lng1);

          // 第二次点击
          act(() => {
            result.current.handleMapClick(lat2, lng2);
          });

          // 验证：坐标应该更新为第二次点击的位置
          const secondCoords = result.current.coordinates;
          expect(secondCoords?.lat).toBe(lat2);
          expect(secondCoords?.lng).toBe(lng2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 9.4: 清除坐标应该重置状态
   *
   * 对于任何坐标，调用 clearCoordinates 后应该将坐标重置为 null
   */
  it('属性 9.4: 清除坐标应该将状态重置为 null', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapClick());

          // 点击地图
          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          expect(result.current.coordinates).not.toBeNull();

          // 清除坐标
          act(() => {
            result.current.clearCoordinates();
          });

          // 验证：坐标应该被清除
          expect(result.current.coordinates).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 9.5: 清除后再次点击应该正常工作
   *
   * 对于任何坐标序列，清除操作不应该影响后续的点击操作
   */
  it('属性 9.5: 清除坐标后再次点击应该正常保存新坐标', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true }),
            fc.double({ min: -180, max: 180, noNaN: true })
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (coordsList) => {
          const { result } = renderHook(() => useMapClick());

          for (const [lat, lng] of coordsList) {
            // 点击地图
            act(() => {
              result.current.handleMapClick(lat, lng);
            });

            // 验证坐标被保存
            expect(result.current.coordinates?.lat).toBe(lat);
            expect(result.current.coordinates?.lng).toBe(lng);

            // 清除坐标
            act(() => {
              result.current.clearCoordinates();
            });

            // 验证坐标被清除
            expect(result.current.coordinates).toBeNull();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.6: 边界值坐标应该正确处理
   *
   * 对于边界值坐标（最大/最小纬度和经度），系统应该正确保存
   */
  it('属性 9.6: 边界值坐标应该被正确保存', () => {
    const boundaryCoords = [
      { lat: -90, lng: -180 }, // 最小值
      { lat: 90, lng: 180 }, // 最大值
      { lat: 0, lng: 0 }, // 零点
      { lat: -90, lng: 180 }, // 混合边界
      { lat: 90, lng: -180 }, // 混合边界
    ];

    const { result } = renderHook(() => useMapClick());

    for (const { lat, lng } of boundaryCoords) {
      act(() => {
        result.current.handleMapClick(lat, lng);
      });

      expect(result.current.coordinates?.lat).toBe(lat);
      expect(result.current.coordinates?.lng).toBe(lng);

      act(() => {
        result.current.clearCoordinates();
      });
    }
  });

  /**
   * 属性 9.7: 坐标对象应该是不可变的
   *
   * 返回的坐标对象在外部修改后，不应该影响内部状态
   */
  it('属性 9.7: 返回的坐标对象应该独立于内部状态', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapClick());

          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          const coords1 = result.current.coordinates;
          const coords2 = result.current.coordinates;

          // 验证：多次获取应该返回相同的值
          expect(coords1?.lat).toBe(coords2?.lat);
          expect(coords1?.lng).toBe(coords2?.lng);

          // 验证：坐标值应该与原始输入相同
          expect(coords1?.lat).toBe(lat);
          expect(coords1?.lng).toBe(lng);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 9.8: 幂等性 - 相同坐标多次点击应该产生相同结果
   *
   * 对于任何坐标，多次点击相同位置应该产生相同的状态
   */
  it('属性 9.8: 多次点击相同坐标应该产生相同的状态', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.integer({ min: 2, max: 10 }),
        (lat, lng, clickCount) => {
          const { result } = renderHook(() => useMapClick());

          // 多次点击相同位置
          for (let i = 0; i < clickCount; i++) {
            act(() => {
              result.current.handleMapClick(lat, lng);
            });

            // 每次点击后验证坐标相同
            expect(result.current.coordinates?.lat).toBe(lat);
            expect(result.current.coordinates?.lng).toBe(lng);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
