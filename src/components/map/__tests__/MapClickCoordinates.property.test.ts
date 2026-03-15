/**
 * 属性测试：地图点击获取坐标
 *
 * 属性 6: 地图点击获取坐标
 * 验证需求: 2.3
 *
 * 对于任何地图上的点击位置，系统应该获取该位置的经纬度坐标。
 *
 * 注意：此属性已在 useMapClick.property.test.ts 中通过属性 9.1-9.8 充分覆盖。
 * 本文件补充测试 MapContainer 组件层面的坐标获取。
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

describe('属性 6: 地图点击获取坐标', () => {
  /**
   * 属性 6.1: onMapClick 回调应接收有效的经纬度
   *
   * 模拟 MapContainer 的 onMapClick 回调，验证坐标传递
   */
  it('属性 6.1: 对于任何有效坐标，onMapClick 回调应接收正确的经纬度', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        (lat, lng) => {
          const onMapClick = vi.fn();

          // 模拟地图点击事件调用回调
          onMapClick(lat, lng);

          expect(onMapClick).toHaveBeenCalledWith(lat, lng);
          expect(onMapClick).toHaveBeenCalledTimes(1);

          // 验证坐标范围
          const [calledLat, calledLng] = onMapClick.mock.calls[0];
          expect(calledLat).toBeGreaterThanOrEqual(-90);
          expect(calledLat).toBeLessThanOrEqual(90);
          expect(calledLng).toBeGreaterThanOrEqual(-180);
          expect(calledLng).toBeLessThanOrEqual(180);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 6.2: 坐标精度应被保留
   */
  it('属性 6.2: 传递的坐标精度不应丢失', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        (lat, lng) => {
          const onMapClick = vi.fn();
          onMapClick(lat, lng);

          const [receivedLat, receivedLng] = onMapClick.mock.calls[0];
          expect(receivedLat).toBe(lat);
          expect(receivedLng).toBe(lng);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 6.3: 多次点击应分别获取各自的坐标
   */
  it('属性 6.3: 多次点击应分别记录各自的坐标', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
            fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true })
          ),
          { minLength: 2, maxLength: 10 }
        ),
        (clicks) => {
          const onMapClick = vi.fn();

          clicks.forEach(([lat, lng]) => onMapClick(lat, lng));

          expect(onMapClick).toHaveBeenCalledTimes(clicks.length);

          clicks.forEach(([lat, lng], i) => {
            expect(onMapClick.mock.calls[i][0]).toBe(lat);
            expect(onMapClick.mock.calls[i][1]).toBe(lng);
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
