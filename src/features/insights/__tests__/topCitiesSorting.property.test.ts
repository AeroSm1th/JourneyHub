/**
 * 属性测试：热门城市排序
 *
 * 属性 23: 热门城市排序
 * 验证需求: 6.6
 *
 * 对于任何城市记录集合，系统应该按访问次数降序排序并返回前 10 个城市。
 * calculateTopCities(cities, limit) 返回 Array<{ cityName, countryName, visitCount }>
 *
 * **Validates: Requirements 6.6**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateTopCities } from '@/features/insights/utils/calculateStats';
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

describe('属性 23: 热门城市排序', () => {
  /**
   * 属性 23.1: 结果长度不超过 limit（默认 10）
   *
   * 对于任何城市记录集合，calculateTopCities 返回的数组长度
   * 应该不超过 limit 参数（默认为 10）
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.1: 结果长度不超过 limit（默认 10）', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        // 默认 limit=10
        const result = calculateTopCities(cities);
        expect(result.length).toBeLessThanOrEqual(10);

        // 自定义 limit
        const resultLimit5 = calculateTopCities(cities, 5);
        expect(resultLimit5.length).toBeLessThanOrEqual(5);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 23.2: 结果按 visitCount 降序排列
   *
   * 对于任何城市记录集合，返回的数组中每个元素的 visitCount
   * 应该大于等于下一个元素的 visitCount
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.2: 结果按 visitCount 降序排列', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const result = calculateTopCities(cities);
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].visitCount).toBeGreaterThanOrEqual(result[i + 1].visitCount);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 23.3: 每个 visitCount >= 1
   *
   * 对于任何城市记录集合，返回结果中每个城市的访问次数至少为 1
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.3: 每个 visitCount >= 1', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const result = calculateTopCities(cities);
        for (const city of result) {
          expect(city.visitCount).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 23.4: 所有 visitCount 之和 <= 输入城市总数
   *
   * 因为同一 city_name+country_name 可以出现多次，
   * 所有结果的 visitCount 之和不应超过输入城市数组的长度
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.4: 所有 visitCount 之和 <= 输入城市总数', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const result = calculateTopCities(cities);
        const totalVisitCount = result.reduce((sum, c) => sum + c.visitCount, 0);
        expect(totalVisitCount).toBeLessThanOrEqual(cities.length);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 23.5: 结果中无重复的 city+country 组合
   *
   * 对于任何城市记录集合，返回结果中不应有重复的 cityName+countryName 组合
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.5: 结果中无重复的 city+country 组合', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const result = calculateTopCities(cities);
        const keys = result.map((c) => `${c.cityName}|${c.countryName}`);
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(keys.length);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 23.6: limit=1 时只返回访问次数最多的城市
   *
   * 对于任何城市记录集合，当 limit=1 时，返回的唯一城市
   * 的 visitCount 应该是所有城市中最大的
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 23.6: limit=1 时只返回访问次数最多的城市', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const resultAll = calculateTopCities(cities, cities.length);
        const resultOne = calculateTopCities(cities, 1);

        expect(resultOne.length).toBe(1);

        // limit=1 返回的城市的 visitCount 应该等于全部结果中的最大值
        const maxVisitCount = Math.max(...resultAll.map((c) => c.visitCount));
        expect(resultOne[0].visitCount).toBe(maxVisitCount);
      }),
      { numRuns: 100 },
    );
  });
});
