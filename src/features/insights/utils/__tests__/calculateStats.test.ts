/**
 * 统计工具函数单元测试
 *
 * 测试所有统计计算函数，包括：
 * - 空数组输入
 * - 单条记录输入
 * - 多条记录（含各种数据组合）
 * - 边界条件（全部同大洲、全部同年份等）
 *
 * 验证需求: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7
 */

import { describe, it, expect } from 'vitest';
import type { City } from '@/types/database';
import {
  calculateTravelStatistics,
  calculateCitiesByContinent,
  calculateCitiesByYear,
  calculateTopCities,
  calculateContinentCoverage,
  calculateCountryStatistics,
  calculateContinentStatistics,
  calculateYearlyStatistics,
  calculateTripTypeDistribution,
  calculateRatingDistribution,
  calculateAverageRating,
} from '../calculateStats';

// ============================================================================
// 辅助工厂函数
// ============================================================================

/** 创建测试用城市记录的工厂函数 */
function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'id-1',
    user_id: 'user-1',
    city_name: 'Tokyo',
    country_name: 'Japan',
    continent: 'Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    visited_at: '2024-03-15',
    trip_type: 'leisure',
    rating: 4,
    is_favorite: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ============================================================================
// 测试数据
// ============================================================================

/** 多条城市记录样本数据 */
const sampleCities: City[] = [
  makeCity({
    id: '1',
    city_name: 'Tokyo',
    country_name: 'Japan',
    continent: 'Asia',
    visited_at: '2024-03-15',
    trip_type: 'leisure',
    rating: 5,
  }),
  makeCity({
    id: '2',
    city_name: 'Paris',
    country_name: 'France',
    continent: 'Europe',
    visited_at: '2024-06-20',
    trip_type: 'leisure',
    rating: 4,
  }),
  makeCity({
    id: '3',
    city_name: 'New York',
    country_name: 'USA',
    continent: 'North America',
    visited_at: '2023-12-01',
    trip_type: 'business',
    rating: 3,
  }),
  makeCity({
    id: '4',
    city_name: 'Tokyo',
    country_name: 'Japan',
    continent: 'Asia',
    visited_at: '2023-05-10',
    trip_type: 'transit',
    rating: 5,
  }),
  makeCity({
    id: '5',
    city_name: 'Sydney',
    country_name: 'Australia',
    continent: 'Oceania',
    visited_at: '2024-01-05',
    trip_type: 'leisure',
    rating: undefined,
  }),
];

/** 单条城市记录 */
const singleCity: City[] = [
  makeCity({ id: 's1', city_name: 'Berlin', country_name: 'Germany', continent: 'Europe' }),
];

/** 全部同大洲的城市记录 */
const sameContinentCities: City[] = [
  makeCity({
    id: 'sc1',
    city_name: 'Tokyo',
    country_name: 'Japan',
    continent: 'Asia',
    visited_at: '2024-01-01',
  }),
  makeCity({
    id: 'sc2',
    city_name: 'Seoul',
    country_name: 'South Korea',
    continent: 'Asia',
    visited_at: '2024-02-01',
  }),
  makeCity({
    id: 'sc3',
    city_name: 'Bangkok',
    country_name: 'Thailand',
    continent: 'Asia',
    visited_at: '2023-06-01',
  }),
];

/** 全部同年份的城市记录 */
const sameYearCities: City[] = [
  makeCity({
    id: 'sy1',
    city_name: 'Tokyo',
    country_name: 'Japan',
    continent: 'Asia',
    visited_at: '2024-01-15',
  }),
  makeCity({
    id: 'sy2',
    city_name: 'Paris',
    country_name: 'France',
    continent: 'Europe',
    visited_at: '2024-06-20',
  }),
  makeCity({
    id: 'sy3',
    city_name: 'Cairo',
    country_name: 'Egypt',
    continent: 'Africa',
    visited_at: '2024-11-05',
  }),
];

// ============================================================================
// calculateCitiesByContinent 测试
// ============================================================================

describe('calculateCitiesByContinent', () => {
  it('空数组返回空对象', () => {
    expect(calculateCitiesByContinent([])).toEqual({});
  });

  it('单条记录返回该大洲计数为 1', () => {
    const result = calculateCitiesByContinent(singleCity);
    expect(result).toEqual({ Europe: 1 });
  });

  it('多条记录正确统计每个大洲的城市数量', () => {
    const result = calculateCitiesByContinent(sampleCities);
    expect(result).toEqual({ Asia: 2, Europe: 1, 'North America': 1, Oceania: 1 });
  });

  it('全部同大洲时只有一个键', () => {
    const result = calculateCitiesByContinent(sameContinentCities);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['Asia']).toBe(3);
  });

  it('所有值之和等于输入数组长度', () => {
    const result = calculateCitiesByContinent(sampleCities);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBe(sampleCities.length);
  });
});

// ============================================================================
// calculateCitiesByYear 测试
// ============================================================================

describe('calculateCitiesByYear', () => {
  it('空数组返回空对象', () => {
    expect(calculateCitiesByYear([])).toEqual({});
  });

  it('单条记录返回该年份计数为 1', () => {
    const result = calculateCitiesByYear(singleCity);
    expect(result).toEqual({ '2024': 1 });
  });

  it('多条记录正确统计每年的城市数量', () => {
    const result = calculateCitiesByYear(sampleCities);
    expect(result).toEqual({ '2024': 3, '2023': 2 });
  });

  it('全部同年份时只有一个键', () => {
    const result = calculateCitiesByYear(sameYearCities);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['2024']).toBe(3);
  });

  it('所有值之和等于输入数组长度', () => {
    const result = calculateCitiesByYear(sampleCities);
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBe(sampleCities.length);
  });
});

// ============================================================================
// calculateTopCities 测试
// ============================================================================

describe('calculateTopCities', () => {
  it('空数组返回空数组', () => {
    expect(calculateTopCities([])).toEqual([]);
  });

  it('单条记录返回一个元素，visitCount 为 1', () => {
    const result = calculateTopCities(singleCity);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ cityName: 'Berlin', countryName: 'Germany', visitCount: 1 });
  });

  it('多条记录按访问次数降序排列', () => {
    const result = calculateTopCities(sampleCities);
    expect(result[0]).toEqual({ cityName: 'Tokyo', countryName: 'Japan', visitCount: 2 });
    // 其余城市各访问 1 次
    for (let i = 1; i < result.length; i++) {
      expect(result[i].visitCount).toBe(1);
    }
  });

  it('limit 参数限制返回数量', () => {
    const result = calculateTopCities(sampleCities, 2);
    expect(result).toHaveLength(2);
  });

  it('limit 大于实际城市数时返回全部', () => {
    const result = calculateTopCities(sampleCities, 100);
    expect(result).toHaveLength(4); // 4 个不同城市
  });

  it('同名城市不同国家视为不同城市', () => {
    const cities: City[] = [
      makeCity({ id: 'tc1', city_name: 'Springfield', country_name: 'USA' }),
      makeCity({ id: 'tc2', city_name: 'Springfield', country_name: 'UK' }),
    ];
    const result = calculateTopCities(cities);
    expect(result).toHaveLength(2);
  });

  it('每个城市的 visitCount 至少为 1', () => {
    const result = calculateTopCities(sampleCities);
    for (const city of result) {
      expect(city.visitCount).toBeGreaterThanOrEqual(1);
    }
  });
});

// ============================================================================
// calculateContinentCoverage 测试
// ============================================================================

describe('calculateContinentCoverage', () => {
  it('空数组返回 0', () => {
    expect(calculateContinentCoverage([])).toBe(0);
  });

  it('单条记录返回 1/7 的百分比', () => {
    const result = calculateContinentCoverage(singleCity);
    expect(result).toBe(Math.round((1 / 7) * 100)); // 14
  });

  it('多条记录正确计算覆盖率', () => {
    // sampleCities 覆盖 4 个大洲: Asia, Europe, North America, Oceania
    const result = calculateContinentCoverage(sampleCities);
    expect(result).toBe(Math.round((4 / 7) * 100)); // 57
  });

  it('覆盖全部 7 大洲时返回 100', () => {
    const allContinents: City[] = [
      makeCity({ continent: 'Asia' }),
      makeCity({ continent: 'Europe' }),
      makeCity({ continent: 'Africa' }),
      makeCity({ continent: 'North America' }),
      makeCity({ continent: 'South America' }),
      makeCity({ continent: 'Oceania' }),
      makeCity({ continent: 'Antarctica' }),
    ];
    expect(calculateContinentCoverage(allContinents)).toBe(100);
  });

  it('全部同大洲时返回 1/7 的百分比', () => {
    const result = calculateContinentCoverage(sameContinentCities);
    expect(result).toBe(Math.round((1 / 7) * 100)); // 14
  });
});

// ============================================================================
// calculateCountryStatistics 测试
// ============================================================================

describe('calculateCountryStatistics', () => {
  it('空数组返回空数组', () => {
    expect(calculateCountryStatistics([])).toEqual([]);
  });

  it('单条记录返回一个国家统计', () => {
    const result = calculateCountryStatistics(singleCity);
    expect(result).toHaveLength(1);
    expect(result[0].countryName).toBe('Germany');
    expect(result[0].cityCount).toBe(1);
    expect(result[0].continent).toBe('Europe');
    expect(result[0].cities).toHaveLength(1);
  });

  it('多条记录正确统计每个国家的城市信息', () => {
    const result = calculateCountryStatistics(sampleCities);
    const japan = result.find((r) => r.countryName === 'Japan');
    expect(japan).toBeDefined();
    expect(japan!.cityCount).toBe(2);
    expect(japan!.continent).toBe('Asia');
    expect(japan!.cities).toHaveLength(2);
  });

  it('每个国家的 cityCount 等于其 cities 数组长度', () => {
    const result = calculateCountryStatistics(sampleCities);
    for (const country of result) {
      expect(country.cityCount).toBe(country.cities.length);
    }
  });

  it('所有国家的 cityCount 之和等于输入数组长度', () => {
    const result = calculateCountryStatistics(sampleCities);
    const totalCities = result.reduce((sum, c) => sum + c.cityCount, 0);
    expect(totalCities).toBe(sampleCities.length);
  });
});

// ============================================================================
// calculateContinentStatistics 测试
// ============================================================================

describe('calculateContinentStatistics', () => {
  it('空数组返回空数组', () => {
    expect(calculateContinentStatistics([])).toEqual([]);
  });

  it('单条记录返回一个大洲统计', () => {
    const result = calculateContinentStatistics(singleCity);
    expect(result).toHaveLength(1);
    expect(result[0].continent).toBe('Europe');
    expect(result[0].cityCount).toBe(1);
    expect(result[0].countryCount).toBe(1);
    expect(result[0].countries).toContain('Germany');
  });

  it('多条记录正确统计每个大洲的国家和城市数量', () => {
    const result = calculateContinentStatistics(sampleCities);
    const asia = result.find((r) => r.continent === 'Asia');
    expect(asia).toBeDefined();
    expect(asia!.cityCount).toBe(2);
    expect(asia!.countryCount).toBe(1);
    expect(asia!.countries).toContain('Japan');
  });

  it('全部同大洲但不同国家时 countryCount 正确', () => {
    const result = calculateContinentStatistics(sameContinentCities);
    expect(result).toHaveLength(1);
    expect(result[0].continent).toBe('Asia');
    expect(result[0].cityCount).toBe(3);
    expect(result[0].countryCount).toBe(3); // Japan, South Korea, Thailand
  });

  it('同大洲同国家的重复记录不会重复计算国家数', () => {
    const cities: City[] = [
      makeCity({ id: 'cs1', city_name: 'Tokyo', country_name: 'Japan', continent: 'Asia' }),
      makeCity({ id: 'cs2', city_name: 'Osaka', country_name: 'Japan', continent: 'Asia' }),
    ];
    const result = calculateContinentStatistics(cities);
    expect(result[0].countryCount).toBe(1);
    expect(result[0].cityCount).toBe(2);
  });
});

// ============================================================================
// calculateYearlyStatistics 测试
// ============================================================================

describe('calculateYearlyStatistics', () => {
  it('空数组返回空数组', () => {
    expect(calculateYearlyStatistics([])).toEqual([]);
  });

  it('单条记录返回一个年度统计', () => {
    const result = calculateYearlyStatistics(singleCity);
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2024);
    expect(result[0].cityCount).toBe(1);
    expect(result[0].countryCount).toBe(1);
    expect(result[0].tripCount).toBe(1);
  });

  it('多条记录按年份升序排列', () => {
    const result = calculateYearlyStatistics(sampleCities);
    expect(result[0].year).toBe(2023);
    expect(result[1].year).toBe(2024);
  });

  it('正确统计每年的国家数量（去重）', () => {
    const result = calculateYearlyStatistics(sampleCities);
    const year2024 = result.find((r) => r.year === 2024);
    expect(year2024!.cityCount).toBe(3);
    // 2024: Japan, France, Australia = 3 个国家
    expect(year2024!.countryCount).toBe(3);
  });

  it('全部同年份时只有一个年度统计', () => {
    const result = calculateYearlyStatistics(sameYearCities);
    expect(result).toHaveLength(1);
    expect(result[0].year).toBe(2024);
    expect(result[0].cityCount).toBe(3);
  });

  it('tripCount 等于 cityCount（每条记录视为一次旅行）', () => {
    const result = calculateYearlyStatistics(sampleCities);
    for (const yearly of result) {
      expect(yearly.tripCount).toBe(yearly.cityCount);
    }
  });

  it('每个年度的 cities 数组长度等于 cityCount', () => {
    const result = calculateYearlyStatistics(sampleCities);
    for (const yearly of result) {
      expect(yearly.cities).toHaveLength(yearly.cityCount);
    }
  });
});

// ============================================================================
// calculateTripTypeDistribution 测试
// ============================================================================

describe('calculateTripTypeDistribution', () => {
  it('空数组返回全零分布', () => {
    const result = calculateTripTypeDistribution([]);
    expect(result.leisure).toBe(0);
    expect(result.business).toBe(0);
    expect(result.transit).toBe(0);
  });

  it('单条记录只有对应类型计数为 1', () => {
    const result = calculateTripTypeDistribution(singleCity);
    expect(result.leisure).toBe(1);
    expect(result.business).toBe(0);
    expect(result.transit).toBe(0);
  });

  it('多条记录正确统计每种旅行类型的数量', () => {
    const result = calculateTripTypeDistribution(sampleCities);
    expect(result.leisure).toBe(3);
    expect(result.business).toBe(1);
    expect(result.transit).toBe(1);
  });

  it('所有类型计数之和等于输入数组长度', () => {
    const result = calculateTripTypeDistribution(sampleCities);
    const sum = result.leisure + result.business + result.transit;
    expect(sum).toBe(sampleCities.length);
  });

  it('全部同类型时只有该类型有值', () => {
    const allBusiness: City[] = [
      makeCity({ id: 'b1', trip_type: 'business' }),
      makeCity({ id: 'b2', trip_type: 'business' }),
    ];
    const result = calculateTripTypeDistribution(allBusiness);
    expect(result.business).toBe(2);
    expect(result.leisure).toBe(0);
    expect(result.transit).toBe(0);
  });
});

// ============================================================================
// calculateRatingDistribution 测试
// ============================================================================

describe('calculateRatingDistribution', () => {
  it('空数组返回全零分布', () => {
    const result = calculateRatingDistribution([]);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('单条有评分记录正确统计', () => {
    const city = [makeCity({ rating: 3 })];
    const result = calculateRatingDistribution(city);
    expect(result[3]).toBe(1);
    expect(result[1]).toBe(0);
    expect(result[5]).toBe(0);
  });

  it('多条记录正确统计每个评分的数量', () => {
    const result = calculateRatingDistribution(sampleCities);
    expect(result[5]).toBe(2);
    expect(result[4]).toBe(1);
    expect(result[3]).toBe(1);
    expect(result[2]).toBe(0);
    expect(result[1]).toBe(0);
  });

  it('忽略无评分的记录', () => {
    const result = calculateRatingDistribution(sampleCities);
    // sampleCities 有 5 条记录，其中 1 条无评分
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    expect(total).toBe(4);
  });

  it('全部无评分时返回全零', () => {
    const noRatings: City[] = [
      makeCity({ id: 'nr1', rating: undefined }),
      makeCity({ id: 'nr2', rating: undefined }),
    ];
    const result = calculateRatingDistribution(noRatings);
    expect(result).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });
});

// ============================================================================
// calculateAverageRating 测试
// ============================================================================

describe('calculateAverageRating', () => {
  it('空数组返回 undefined', () => {
    expect(calculateAverageRating([])).toBeUndefined();
  });

  it('全部无评分时返回 undefined', () => {
    const noRating = [
      makeCity({ id: 'ar1', rating: undefined }),
      makeCity({ id: 'ar2', rating: undefined }),
    ];
    expect(calculateAverageRating(noRating)).toBeUndefined();
  });

  it('单条有评分记录返回该评分', () => {
    const city = [makeCity({ rating: 3 })];
    expect(calculateAverageRating(city)).toBe(3);
  });

  it('多条记录正确计算平均评分（保留一位小数）', () => {
    // 有评分的: 5, 4, 3, 5 => 平均 4.25 => 四舍五入到一位小数 = 4.3
    const result = calculateAverageRating(sampleCities);
    expect(result).toBe(4.3);
  });

  it('全部相同评分时平均值等于该评分', () => {
    const allFive: City[] = [
      makeCity({ id: 'af1', rating: 5 }),
      makeCity({ id: 'af2', rating: 5 }),
      makeCity({ id: 'af3', rating: 5 }),
    ];
    expect(calculateAverageRating(allFive)).toBe(5);
  });

  it('混合有评分和无评分记录时只计算有评分的', () => {
    const mixed: City[] = [
      makeCity({ id: 'mx1', rating: 2 }),
      makeCity({ id: 'mx2', rating: undefined }),
      makeCity({ id: 'mx3', rating: 4 }),
    ];
    // (2 + 4) / 2 = 3.0
    expect(calculateAverageRating(mixed)).toBe(3);
  });
});

// ============================================================================
// calculateTravelStatistics 主函数测试
// ============================================================================

describe('calculateTravelStatistics', () => {
  it('空数组返回零值统计', () => {
    const result = calculateTravelStatistics([]);
    expect(result.totalCities).toBe(0);
    expect(result.totalCountries).toBe(0);
    expect(result.totalContinents).toBe(0);
    expect(result.continentCoverage).toBe(0);
    expect(result.topCities).toEqual([]);
    expect(result.averageRating).toBeUndefined();
    expect(result.citiesByContinent).toEqual({});
    expect(result.citiesByYear).toEqual({});
    expect(result.tripTypeDistribution.leisure).toBe(0);
    expect(result.tripTypeDistribution.business).toBe(0);
    expect(result.tripTypeDistribution.transit).toBe(0);
    expect(result.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('单条记录返回正确的统计数据', () => {
    const result = calculateTravelStatistics(singleCity);
    expect(result.totalCities).toBe(1);
    expect(result.totalCountries).toBe(1);
    expect(result.totalContinents).toBe(1);
    expect(result.continentCoverage).toBe(Math.round((1 / 7) * 100));
    expect(result.topCities).toHaveLength(1);
    expect(result.averageRating).toBe(4);
  });

  it('多条记录返回完整的统计数据', () => {
    const result = calculateTravelStatistics(sampleCities);
    expect(result.totalCities).toBe(5);
    expect(result.totalCountries).toBe(4); // Japan, France, USA, Australia
    expect(result.totalContinents).toBe(4); // Asia, Europe, North America, Oceania
    expect(result.continentCoverage).toBe(57);
    expect(result.topCities[0].cityName).toBe('Tokyo');
    expect(result.averageRating).toBe(4.3);
  });

  it('citiesByContinent 与独立函数结果一致', () => {
    const standalone = calculateCitiesByContinent(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).citiesByContinent;
    expect(standalone).toEqual(fromMain);
  });

  it('citiesByYear 与独立函数结果一致', () => {
    const standalone = calculateCitiesByYear(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).citiesByYear;
    expect(standalone).toEqual(fromMain);
  });

  it('continentCoverage 与独立函数结果一致', () => {
    const standalone = calculateContinentCoverage(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).continentCoverage;
    expect(standalone).toBe(fromMain);
  });

  it('topCities 与独立函数结果一致', () => {
    const standalone = calculateTopCities(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).topCities;
    expect(standalone).toEqual(fromMain);
  });

  it('tripTypeDistribution 与独立函数结果一致', () => {
    const standalone = calculateTripTypeDistribution(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).tripTypeDistribution;
    expect(standalone).toEqual(fromMain);
  });

  it('ratingDistribution 与独立函数结果一致', () => {
    const standalone = calculateRatingDistribution(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).ratingDistribution;
    expect(standalone).toEqual(fromMain);
  });

  it('averageRating 与独立函数结果一致', () => {
    const standalone = calculateAverageRating(sampleCities);
    const fromMain = calculateTravelStatistics(sampleCities).averageRating;
    expect(standalone).toBe(fromMain);
  });
});
