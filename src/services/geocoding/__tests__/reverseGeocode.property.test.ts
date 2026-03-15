/**
 * 属性测试：反向地理编码
 *
 * 属性 10: 反向地理编码
 * 验证需求: 3.2
 *
 * 对于任何有效的经纬度坐标，系统应该通过反向地理编码 API
 * 获取城市名称、国家名称和大洲信息。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { reverseGeocode, getContinent } from '../nominatim';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ============================================================================
// 辅助函数
// ============================================================================

/** 创建模拟的 Nominatim API 响应 */
const createMockResponse = (overrides: Record<string, any> = {}) => ({
  ok: true,
  json: () =>
    Promise.resolve({
      address: {
        city: '北京市',
        country: '中国',
        country_code: 'cn',
        ...overrides,
      },
      display_name: '北京市, 中国',
    }),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 10: 反向地理编码', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 属性 10.1: 有效坐标应返回包含城市名称的结果
   */
  it('属性 10.1: 对于任何有效坐标，应返回包含 cityName 的结果', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        async (lat, lng) => {
          mockFetch.mockResolvedValueOnce(createMockResponse());

          const result = await reverseGeocode(lat, lng);

          expect(result.cityName).toBeDefined();
          expect(typeof result.cityName).toBe('string');
          expect(result.cityName.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.2: 结果应包含国家名称
   */
  it('属性 10.2: 结果应包含 countryName', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        async (lat, lng) => {
          mockFetch.mockResolvedValueOnce(createMockResponse());

          const result = await reverseGeocode(lat, lng);

          expect(result.countryName).toBeDefined();
          expect(typeof result.countryName).toBe('string');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.3: 结果应包含大洲信息
   */
  it('属性 10.3: 结果应包含 continent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        async (lat, lng) => {
          mockFetch.mockResolvedValueOnce(createMockResponse());

          const result = await reverseGeocode(lat, lng);

          expect(result.continent).toBeDefined();
          expect(typeof result.continent).toBe('string');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.4: 结果应保留原始坐标
   */
  it('属性 10.4: 返回结果应包含原始经纬度坐标', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        async (lat, lng) => {
          mockFetch.mockResolvedValueOnce(createMockResponse());

          const result = await reverseGeocode(lat, lng);

          expect(result.latitude).toBe(lat);
          expect(result.longitude).toBe(lng);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.5: 超出范围的纬度应抛出错误
   */
  it('属性 10.5: 超出范围的纬度应抛出错误', async () => {
    const arbInvalidLat = fc.oneof(
      fc.double({ min: 90.001, max: 1000, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -1000, max: -90.001, noNaN: true, noDefaultInfinity: true })
    );

    await fc.assert(
      fc.asyncProperty(arbInvalidLat, async (lat) => {
        await expect(reverseGeocode(lat, 0)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.6: 超出范围的经度应抛出错误
   */
  it('属性 10.6: 超出范围的经度应抛出错误', async () => {
    const arbInvalidLng = fc.oneof(
      fc.double({ min: 180.001, max: 1000, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -1000, max: -180.001, noNaN: true, noDefaultInfinity: true })
    );

    await fc.assert(
      fc.asyncProperty(arbInvalidLng, async (lng) => {
        await expect(reverseGeocode(0, lng)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 10.7: API 失败应抛出错误
   */
  it('属性 10.7: API 请求失败时应抛出错误', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(reverseGeocode(39.9, 116.4)).rejects.toThrow();
  });
});
