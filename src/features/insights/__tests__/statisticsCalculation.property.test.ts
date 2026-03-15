/**
 * 属性测试：统计数据计算
 *
 * 属性 21: 统计数据计算
 * 验证需求: 6.1, 6.2, 6.3, 6.7
 *
 * 对于任何城市记录集合，统计仪表板应该正确计算并显示：
 * 已访问城市总数、已访问国家总数（去重）、每个大洲的城市数量、
 * 大洲覆盖率百分比（已访问大洲数 / 7）
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.7**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateTravelStatistics,
  calculateCitiesByContinent,
  calculateContinentCoverage,
  calculateTopCities,
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
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }), { nil: undefined }),
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

describe('属性 21: 统计数据计算', () => {
  /**
   * 属性 21.1: totalCities 等于输入城市数组的长度
   *
   * 对于任何城市记录集合，calculateTravelStatistics 返回的 totalCities
   * 应该等于输入数组的 length
   *
   * **Validates: Requirements 6.1**
   */
  it('属性 21.1: totalCities 等于输入城市数组的长度', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const stats = calculateTravelStatistics(cities);
        expect(stats.totalCities).toBe(cities.length);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.2: totalCountries 等于唯一 country_name 的数量
   *
   * 对于任何城市记录集合，totalCountries 应该等于去重后的国家数量
   *
   * **Validates: Requirements 6.2**
   */
  it('属性 21.2: totalCountries 等于唯一 country_name 的数量', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const stats = calculateTravelStatistics(cities);
        const uniqueCountries = new Set(cities.map((c) => c.country_name));
        expect(stats.totalCountries).toBe(uniqueCountries.size);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.3: totalContinents 等于唯一 continent 值的数量
   *
   * 对于任何城市记录集合，totalContinents 应该等于去重后的大洲数量
   *
   * **Validates: Requirements 6.3**
   */
  it('属性 21.3: totalContinents 等于唯一 continent 值的数量', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const stats = calculateTravelStatistics(cities);
        const uniqueContinents = new Set(cities.map((c) => c.continent));
        expect(stats.totalContinents).toBe(uniqueContinents.size);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.4: continentCoverage = (唯一大洲数 / 7) * 100，四舍五入
   *
   * 对于任何城市记录集合，大洲覆盖率应该等于已访问大洲数除以 7 再乘以 100 并取整
   *
   * **Validates: Requirements 6.7**
   */
  it('属性 21.4: continentCoverage 等于 (唯一大洲数 / 7) * 100 四舍五入', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const stats = calculateTravelStatistics(cities);
        const uniqueContinents = new Set(cities.map((c) => c.continent));
        const expected = Math.round((uniqueContinents.size / 7) * 100);
        expect(stats.continentCoverage).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.5: citiesByContinent 各值之和等于 totalCities
   *
   * 对于任何城市记录集合，按大洲分组后的城市数量之和应该等于总城市数
   *
   * **Validates: Requirements 6.3**
   */
  it('属性 21.5: citiesByContinent 各值之和等于 totalCities', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const stats = calculateTravelStatistics(cities);
        const sum = Object.values(stats.citiesByContinent).reduce((a, b) => a + b, 0);
        expect(sum).toBe(stats.totalCities);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.6: topCities 按 visitCount 降序排列
   *
   * 对于任何城市记录集合，topCities 数组中每个元素的 visitCount
   * 应该大于等于下一个元素的 visitCount
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 21.6: topCities 按 visitCount 降序排列', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const topCities = calculateTopCities(cities);
        for (let i = 0; i < topCities.length - 1; i++) {
          expect(topCities[i].visitCount).toBeGreaterThanOrEqual(topCities[i + 1].visitCount);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.7: topCities 中每个城市的 visitCount >= 1
   *
   * 对于任何城市记录集合，topCities 中每个城市的访问次数至少为 1
   *
   * **Validates: Requirements 6.6**
   */
  it('属性 21.7: topCities 中每个城市的 visitCount >= 1', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const topCities = calculateTopCities(cities);
        for (const city of topCities) {
          expect(city.visitCount).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.8: calculateCitiesByContinent 与 calculateTravelStatistics 结果一致
   *
   * 对于任何城市记录集合，单独调用 calculateCitiesByContinent 的结果
   * 应该与 calculateTravelStatistics 中的 citiesByContinent 完全一致
   *
   * **Validates: Requirements 6.3**
   */
  it('属性 21.8: calculateCitiesByContinent 与主函数结果一致', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const standalone = calculateCitiesByContinent(cities);
        const fromMain = calculateTravelStatistics(cities).citiesByContinent;
        expect(standalone).toEqual(fromMain);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 21.9: calculateContinentCoverage 与主函数结果一致
   *
   * 对于任何城市记录集合，单独调用 calculateContinentCoverage 的结果
   * 应该与 calculateTravelStatistics 中的 continentCoverage 完全一致
   *
   * **Validates: Requirements 6.7**
   */
  it('属性 21.9: calculateContinentCoverage 与主函数结果一致', () => {
    fc.assert(
      fc.property(arbCities, (cities) => {
        const standalone = calculateContinentCoverage(cities);
        const fromMain = calculateTravelStatistics(cities).continentCoverage;
        expect(standalone).toBe(fromMain);
      }),
      { numRuns: 100 },
    );
  });
});
