/**
 * 属性测试：愿望清单转换预填充
 *
 * 属性 17: 愿望清单转换预填充
 * 验证需求: 4.6
 *
 * 对于任何愿望清单项目，当用户选择转换为正式城市记录时，
 * 系统应该将该项目的城市信息预填充到创建表单中
 *
 * **Validates: Requirements 4.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { extractPrefilledData, type ConvertPrefilledData } from '../hooks/useConvertToCity';
import type { WishlistItem } from '@/types/database';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 有效的大洲值 */
const validContinents = [
  'Asia',
  'Europe',
  'Africa',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
] as const;

/** 生成有效的城市名称（非空字符串） */
const arbCityName = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

/** 生成有效的国家名称（非空字符串） */
const arbCountryName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的纬度（-90 ~ 90） */
const arbLatitude = fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true });

/** 生成有效的经度（-180 ~ 180） */
const arbLongitude = fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true });

/** 生成完整的 WishlistItem 数据 */
const arbWishlistItem: fc.Arbitrary<WishlistItem> = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  city_name: arbCityName,
  country_name: arbCountryName,
  continent: fc.constantFrom(...validContinents),
  latitude: arbLatitude,
  longitude: arbLongitude,
  priority: fc.integer({ min: 1, max: 5 }),
  expected_season: fc.option(fc.constantFrom('spring', 'summer', 'autumn', 'winter'), {
    nil: undefined,
  }),
  notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  created_at: fc
    .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map((ts) => new Date(ts).toISOString()),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 17: 愿望清单转换预填充', () => {
  /**
   * 属性 17.1: 预填充数据应包含所有必要的城市信息字段
   *
   * 对于任何 WishlistItem，extractPrefilledData 返回的对象
   * 必须包含 cityName、countryName、continent、latitude、longitude
   */
  it('属性 17.1: 预填充数据应包含 cityName、countryName、continent、latitude、longitude', () => {
    fc.assert(
      fc.property(arbWishlistItem, (item) => {
        const prefilled = extractPrefilledData(item);

        // 验证所有必要字段都存在
        expect(prefilled).toHaveProperty('cityName');
        expect(prefilled).toHaveProperty('countryName');
        expect(prefilled).toHaveProperty('continent');
        expect(prefilled).toHaveProperty('latitude');
        expect(prefilled).toHaveProperty('longitude');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 17.2: 预填充数据的值应与原始愿望清单项目完全一致
   *
   * 对于任何 WishlistItem，提取的预填充数据中每个字段的值
   * 必须与原始项目的对应字段值相等
   */
  it('属性 17.2: 预填充数据的值应与原始愿望清单项目的对应字段一致', () => {
    fc.assert(
      fc.property(arbWishlistItem, (item) => {
        const prefilled = extractPrefilledData(item);

        expect(prefilled.cityName).toBe(item.city_name);
        expect(prefilled.countryName).toBe(item.country_name);
        expect(prefilled.continent).toBe(item.continent);
        expect(prefilled.latitude).toBe(item.latitude);
        expect(prefilled.longitude).toBe(item.longitude);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 17.3: 预填充数据的结构应与 CityForm 的 initialData 兼容
   *
   * 对于任何 WishlistItem，提取的预填充数据应该可以直接作为
   * CityForm 组件的 initialData 使用（字段名和类型匹配）
   */
  it('属性 17.3: 预填充数据应可作为 CityForm 的 initialData 使用', () => {
    fc.assert(
      fc.property(arbWishlistItem, (item) => {
        const prefilled = extractPrefilledData(item);

        // 验证字段类型正确，可被 CityForm 使用
        expect(typeof prefilled.cityName).toBe('string');
        expect(typeof prefilled.countryName).toBe('string');
        expect(typeof prefilled.continent).toBe('string');
        expect(typeof prefilled.latitude).toBe('number');
        expect(typeof prefilled.longitude).toBe('number');

        // 验证坐标在有效范围内（与 cityFormSchema 的约束一致）
        expect(prefilled.latitude).toBeGreaterThanOrEqual(-90);
        expect(prefilled.latitude).toBeLessThanOrEqual(90);
        expect(prefilled.longitude).toBeGreaterThanOrEqual(-180);
        expect(prefilled.longitude).toBeLessThanOrEqual(180);

        // 验证字符串字段非空
        expect(prefilled.cityName.length).toBeGreaterThan(0);
        expect(prefilled.countryName.length).toBeGreaterThan(0);
        expect(prefilled.continent.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 17.4: 预填充数据不应包含愿望清单特有的字段
   *
   * 转换后的预填充数据只应包含城市表单需要的字段，
   * 不应泄漏 priority、expected_season 等愿望清单特有字段
   */
  it('属性 17.4: 预填充数据不应包含愿望清单特有字段（priority、expected_season 等）', () => {
    fc.assert(
      fc.property(arbWishlistItem, (item) => {
        const prefilled = extractPrefilledData(item);

        // 验证返回对象只包含 ConvertPrefilledData 定义的 5 个字段
        const keys = Object.keys(prefilled);
        expect(keys).toHaveLength(5);
        expect(keys).toContain('cityName');
        expect(keys).toContain('countryName');
        expect(keys).toContain('continent');
        expect(keys).toContain('latitude');
        expect(keys).toContain('longitude');

        // 验证不包含愿望清单特有字段
        expect(prefilled).not.toHaveProperty('priority');
        expect(prefilled).not.toHaveProperty('expected_season');
        expect(prefilled).not.toHaveProperty('notes');
        expect(prefilled).not.toHaveProperty('id');
        expect(prefilled).not.toHaveProperty('user_id');
        expect(prefilled).not.toHaveProperty('created_at');
      }),
      { numRuns: 100 }
    );
  });
});
