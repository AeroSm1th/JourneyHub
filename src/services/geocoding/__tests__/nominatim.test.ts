/**
 * Nominatim 反向地理编码服务单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reverseGeocode, getContinent } from '../nominatim';

describe('getContinent', () => {
  it('应该返回正确的亚洲国家大洲', () => {
    expect(getContinent('cn')).toBe('Asia');
    expect(getContinent('CN')).toBe('Asia');
    expect(getContinent('jp')).toBe('Asia');
    expect(getContinent('kr')).toBe('Asia');
    expect(getContinent('in')).toBe('Asia');
  });

  it('应该返回正确的欧洲国家大洲', () => {
    expect(getContinent('gb')).toBe('Europe');
    expect(getContinent('fr')).toBe('Europe');
    expect(getContinent('de')).toBe('Europe');
    expect(getContinent('it')).toBe('Europe');
  });

  it('应该返回正确的北美洲国家大洲', () => {
    expect(getContinent('us')).toBe('North America');
    expect(getContinent('ca')).toBe('North America');
    expect(getContinent('mx')).toBe('North America');
  });

  it('应该返回正确的南美洲国家大洲', () => {
    expect(getContinent('br')).toBe('South America');
    expect(getContinent('ar')).toBe('South America');
    expect(getContinent('cl')).toBe('South America');
  });

  it('应该返回正确的非洲国家大洲', () => {
    expect(getContinent('eg')).toBe('Africa');
    expect(getContinent('za')).toBe('Africa');
    expect(getContinent('ng')).toBe('Africa');
  });

  it('应该返回正确的大洋洲国家大洲', () => {
    expect(getContinent('au')).toBe('Oceania');
    expect(getContinent('nz')).toBe('Oceania');
  });

  it('应该返回正确的南极洲大洲', () => {
    expect(getContinent('aq')).toBe('Antarctica');
  });

  it('应该对未知国家代码返回 Unknown', () => {
    expect(getContinent('xx')).toBe('Unknown');
    expect(getContinent('')).toBe('Unknown');
    expect(getContinent('unknown')).toBe('Unknown');
  });

  it('应该处理大小写混合的国家代码', () => {
    expect(getContinent('Cn')).toBe('Asia');
    expect(getContinent('Us')).toBe('North America');
    expect(getContinent('GB')).toBe('Europe');
  });
});

describe('reverseGeocode', () => {
  beforeEach(() => {
    // 清除所有 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复所有 mock
    vi.restoreAllMocks();
  });

  it('应该验证纬度范围', async () => {
    await expect(reverseGeocode(91, 0)).rejects.toThrow('纬度必须在 -90 到 90 之间');
    await expect(reverseGeocode(-91, 0)).rejects.toThrow('纬度必须在 -90 到 90 之间');
  });

  it('应该验证经度范围', async () => {
    await expect(reverseGeocode(0, 181)).rejects.toThrow('经度必须在 -180 到 180 之间');
    await expect(reverseGeocode(0, -181)).rejects.toThrow('经度必须在 -180 到 180 之间');
  });

  it('应该成功解析北京的坐标', async () => {
    // Mock fetch 响应
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: '北京市',
          country: '中国',
          country_code: 'cn',
        },
        display_name: '北京市, 中国',
      }),
    });

    const result = await reverseGeocode(39.9042, 116.4074);

    expect(result).toEqual({
      cityName: '北京市',
      countryName: '中国',
      continent: 'Asia',
      latitude: 39.9042,
      longitude: 116.4074,
    });

    // 验证 fetch 调用
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://nominatim.openstreetmap.org/reverse'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('JourneyHub'),
        }),
      })
    );
  });

  it('应该成功解析纽约的坐标', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: 'New York',
          country: 'United States',
          country_code: 'us',
        },
        display_name: 'New York, United States',
      }),
    });

    const result = await reverseGeocode(40.7128, -74.006);

    expect(result).toEqual({
      cityName: 'New York',
      countryName: 'United States',
      continent: 'North America',
      latitude: 40.7128,
      longitude: -74.006,
    });
  });

  it('应该处理没有 city 字段的响应（使用 town）', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          town: '小镇',
          country: '中国',
          country_code: 'cn',
        },
        display_name: '小镇, 中国',
      }),
    });

    const result = await reverseGeocode(30.0, 120.0);

    expect(result.cityName).toBe('小镇');
  });

  it('应该处理没有 city 和 town 字段的响应（使用 village）', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          village: '村庄',
          country: '中国',
          country_code: 'cn',
        },
        display_name: '村庄, 中国',
      }),
    });

    const result = await reverseGeocode(30.0, 120.0);

    expect(result.cityName).toBe('村庄');
  });

  it('应该处理缺少城市信息的响应', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          country: '中国',
          country_code: 'cn',
        },
        display_name: '中国',
      }),
    });

    const result = await reverseGeocode(30.0, 120.0);

    expect(result.cityName).toBe('未知城市');
    expect(result.countryName).toBe('中国');
  });

  it('应该处理未知国家代码', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: '某城市',
          country: '未知国家',
          country_code: 'xx',
        },
        display_name: '某城市, 未知国家',
      }),
    });

    const result = await reverseGeocode(0, 0);

    expect(result.continent).toBe('Unknown');
  });

  it('应该处理 API 错误响应', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        error: 'Unable to geocode',
      }),
    });

    await expect(reverseGeocode(0, 0)).rejects.toThrow('Nominatim API 错误');
  });

  it('应该处理 HTTP 错误状态', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(reverseGeocode(0, 0)).rejects.toThrow('Nominatim API 请求失败: 500');
  });

  it('应该处理网络错误', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(reverseGeocode(0, 0)).rejects.toThrow('Network error');
  });

  it('应该处理超时错误', async () => {
    const timeoutError = new Error('Timeout');
    timeoutError.name = 'TimeoutError';
    global.fetch = vi.fn().mockRejectedValue(timeoutError);

    await expect(reverseGeocode(0, 0)).rejects.toThrow('反向地理编码请求超时');
  });

  it('应该处理 AbortError', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    global.fetch = vi.fn().mockRejectedValue(abortError);

    await expect(reverseGeocode(0, 0)).rejects.toThrow('反向地理编码请求超时');
  });

  it('应该处理缺少 address 字段的响应', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: '某地',
      }),
    });

    await expect(reverseGeocode(0, 0)).rejects.toThrow('无法获取地址信息');
  });

  it('应该在 URL 中包含正确的参数', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: '测试城市',
          country: '测试国家',
          country_code: 'cn',
        },
      }),
    });

    await reverseGeocode(39.9042, 116.4074);

    const fetchCall = (global.fetch as any).mock.calls[0][0];
    expect(fetchCall).toContain('format=json');
    expect(fetchCall).toContain('lat=39.9042');
    expect(fetchCall).toContain('lon=116.4074');
    expect(fetchCall).toContain('accept-language=zh-CN');
    expect(fetchCall).toContain('zoom=10');
  });

  it('应该设置正确的 User-Agent 头', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: '测试城市',
          country: '测试国家',
          country_code: 'cn',
        },
      }),
    });

    await reverseGeocode(39.9042, 116.4074);

    const fetchCall = (global.fetch as any).mock.calls[0][1];
    expect(fetchCall.headers['User-Agent']).toContain('JourneyHub');
  });

  it('应该处理边界坐标值', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: '边界城市',
          country: '边界国家',
          country_code: 'cn',
        },
      }),
    });

    // 测试最大最小值
    await expect(reverseGeocode(90, 180)).resolves.toBeDefined();
    await expect(reverseGeocode(-90, -180)).resolves.toBeDefined();
    await expect(reverseGeocode(0, 0)).resolves.toBeDefined();
  });
});
