/**
 * 属性测试：年度统计计算
 *
 * 属性 22: 年度统计计算
 * 验证需求: 6.5
 *
 * 对于任何城市记录集合，系统应该按访问年份分组统计旅行次数。
 * 测试 calculateCitiesByYear 和 calculateYearlyStatistics 两个函数的正确性。
 *
 * **Validates: Requirements 6.5**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateCitiesByYear,
  calculateYearlyStatistics,
} from '@/features/insights/utils/calculateStats';
import type { City } from '@/types/database';

// ============================================================================
// 常量与生成器
// ============================================================================

/** 全部 7 大洲 */
const ALL_CONTINENTS = [
  'Asia',
  'Europe',
  'Africa',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
] as const;

/** 旅行类型 */
const TRIP_TYPES = ['leisure', 'business', 'transit'] as const;

/** 生成有效的大洲值 */
const arbContinent = fc.constantFrom(...ALL_CONTINENTS);

/** 生成有效的旅行类型 */
const arbTripType = fc.constantFrom(...TRIP_TYPES);

/** 生成一个有效的 City 对象 */
const arbCity: fc.Arbitrary<City> = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  city_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  country_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  continent: arbContinent as fc.Arbitrary<string>,
  latitude: fc.double({ min: -90, max: 90, noNaN: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true }),
  visited_at: fc
    .integer({ min: new Date('2000-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map((ts) => new Date(ts).toISOString()),
  trip_type: arbTripType as fc.Arbitrary<'leisure' | 'business' | 'transit'>,
  rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  notes: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), {
    nil: undefined,
  }),
  cover_image: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  is_favorite: fc.boolean(),
  created_at: fc.constant(new Date().toISOString()),
  updated_at: fc.constant(new Date().toISOString()),
});

/** 生成非空城市数组 */
const arbCities = fc.array(arbCity, { minLength: 1, maxLength: 50 });

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 22: 年度统计计算', () => {
  /**
   * 属性 22.1: citiesByYear 各值之和等于城市总数
   *
   * 对于任何城市记录集合，calculateCitiesByYear 返回的各年份城市数量之和
   * 应该等于输入数组的长度
   *
   * **Validates: Requirements 6.5**
   */
  it('属性 22.1: citiesByYear 各值之和等于城市总数', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const citiesByYear = calculateCitiesByYear(cities);
        const sum = Object.values(citiesByYear).reduce((a, b) => a + b, 0);
        expect(sum).toBe(cities.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 22.2: citiesByYear 的每个键都是有效的 4 位年份字符串
   *
   * 对于任何城市记录集合，calculateCitiesByYear 返回的 Record 中
   * 每个键都应该是一个有效的 4 位数字年份字符串
   *
   * **Validates: Requirements 6.5**
   */
  it('属性 22.2: citiesByYear 的每个键都是有效的 4 位年份字符串', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const citiesByYear = calculateCitiesByYear(cities);
        for (const yearKey of Object.keys(citiesByYear)) {
          // 验证是 4 位数字字符串
          expect(yearKey).toMatch(/^\d{4}$/);
          // 验证是合理的年份范围
          const yearNum = Number(yearKey);
          expect(yearNum).toBeGreaterThanOrEqual(2000);
          expect(yearNum).toBeLessThanOrEqual(2030);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 22.3: calculateYearlyStatistics 结果按年份升序排列
   *
   * 对于任何城市记录集合，calculateYearlyStatistics 返回的数组
   * 应该按 year 字段升序排列
   *
   * **Validates: Requirements 6.5**
   */
  it('属性 22.3: calculateYearlyStatistics 结果按年份升序排列', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const yearlyStats = calculateYearlyStatistics(cities);
        for (let i = 0; i < yearlyStats.length - 1; i++) {
          expect(yearlyStats[i].year).toBeLessThan(yearlyStats[i + 1].year);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 22.4: 每个 YearlyStatistics 的 cityCount 等于该年份的城市数量
   *
   * 对于任何城市记录集合，calculateYearlyStatistics 返回的每个条目中
   * cityCount 应该等于 cities 数组的长度
   *
   * **Validates: Requirements 6.5**
   */
  it('属性 22.4: 每个 YearlyStatistics 的 cityCount 等于该年份的城市数量', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const yearlyStats = calculateYearlyStatistics(cities);
        for (const stat of yearlyStats) {
          expect(stat.cityCount).toBe(stat.cities.length);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 22.5: 每个 YearlyStatistics 的 countryCount <= cityCount
   *
   * 对于任何城市记录集合，每个年份的国家数量不可能超过城市数量
   * （因为每个城市至少属于一个国家，但多个城市可以属于同一个国家）
   *
   * **Validates: Requirements 6.5**
   */
  it('属性 22.5: 每个 YearlyStatistics 的 countryCount <= cityCount', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const yearlyStats = calculateYearlyStatistics(cities);
        for (const stat of yearlyStats) {
          expect(stat.countryCount).toBeLessThanOrEqual(stat.cityCount);
        }
      }),
      { numRuns: 100 }
    );
  });
});
