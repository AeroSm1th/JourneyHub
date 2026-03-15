/**
 * 旅行统计计算工具函数
 *
 * 纯函数集合，用于从城市记录数据中计算各类统计信息。
 * 所有函数无副作用，可安全用于 useMemo 等场景。
 */

import type { City } from '@/types/database';
import type {
  TravelStatistics,
  CountryStatistics,
  ContinentStatistics,
  YearlyStatistics,
} from '@/types/entities';
import { TripType, Continent } from '@/types/entities';

/** 全部 7 大洲 */
const ALL_CONTINENTS: string[] = Object.values(Continent);
const TOTAL_CONTINENTS = ALL_CONTINENTS.length; // 7

/**
 * 计算每个大洲的城市数量
 */
export function calculateCitiesByContinent(cities: City[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const city of cities) {
    result[city.continent] = (result[city.continent] ?? 0) + 1;
  }
  return result;
}

/**
 * 计算每年的城市数量（基于 visited_at）
 */
export function calculateCitiesByYear(cities: City[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const city of cities) {
    const year = new Date(city.visited_at).getFullYear().toString();
    result[year] = (result[year] ?? 0) + 1;
  }
  return result;
}

/**
 * 计算热门城市排行（按访问次数降序）
 * 同一城市名 + 国家名视为同一城市
 */
export function calculateTopCities(
  cities: City[],
  limit = 10
): Array<{ cityName: string; countryName: string; visitCount: number }> {
  const countMap = new Map<string, { cityName: string; countryName: string; visitCount: number }>();

  for (const city of cities) {
    const key = `${city.city_name}|${city.country_name}`;
    const existing = countMap.get(key);
    if (existing) {
      existing.visitCount += 1;
    } else {
      countMap.set(key, {
        cityName: city.city_name,
        countryName: city.country_name,
        visitCount: 1,
      });
    }
  }

  return Array.from(countMap.values())
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, limit);
}

/**
 * 计算大洲覆盖率（0-100）
 * 已访问大洲数 / 7 大洲 * 100
 */
export function calculateContinentCoverage(cities: City[]): number {
  const visitedContinents = new Set(cities.map((c) => c.continent));
  return Math.round((visitedContinents.size / TOTAL_CONTINENTS) * 100);
}

/**
 * 计算每个国家的统计信息
 */
export function calculateCountryStatistics(cities: City[]): CountryStatistics[] {
  const countryMap = new Map<
    string,
    {
      countryName: string;
      continent: string;
      cities: Array<{ cityName: string; visitedAt: string }>;
    }
  >();

  for (const city of cities) {
    const existing = countryMap.get(city.country_name);
    if (existing) {
      existing.cities.push({ cityName: city.city_name, visitedAt: city.visited_at });
    } else {
      countryMap.set(city.country_name, {
        countryName: city.country_name,
        continent: city.continent,
        cities: [{ cityName: city.city_name, visitedAt: city.visited_at }],
      });
    }
  }

  return Array.from(countryMap.values()).map((entry) => ({
    countryName: entry.countryName,
    continent: entry.continent,
    cityCount: entry.cities.length,
    cities: entry.cities,
  }));
}

/**
 * 计算每个大洲的统计信息
 */
export function calculateContinentStatistics(cities: City[]): ContinentStatistics[] {
  const continentMap = new Map<string, Set<string>>();

  for (const city of cities) {
    if (!continentMap.has(city.continent)) {
      continentMap.set(city.continent, new Set());
    }
    const countries = continentMap.get(city.continent);
    if (countries) {
      countries.add(city.country_name);
    }
  }

  const citiesByContinent = calculateCitiesByContinent(cities);

  return Array.from(continentMap.entries()).map(([continent, countries]) => ({
    continent,
    cityCount: citiesByContinent[continent] ?? 0,
    countryCount: countries.size,
    countries: Array.from(countries),
  }));
}

/**
 * 计算每年的详细统计信息
 */
export function calculateYearlyStatistics(cities: City[]): YearlyStatistics[] {
  const yearMap = new Map<
    number,
    {
      countries: Set<string>;
      cities: Array<{ cityName: string; countryName: string; visitedAt: string }>;
    }
  >();

  for (const city of cities) {
    const year = new Date(city.visited_at).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, { countries: new Set(), cities: [] });
    }
    const entry = yearMap.get(year);
    if (entry) {
      entry.countries.add(city.country_name);
      entry.cities.push({
        cityName: city.city_name,
        countryName: city.country_name,
        visitedAt: city.visited_at,
      });
    }
  }

  return Array.from(yearMap.entries())
    .map(([year, data]) => ({
      year,
      cityCount: data.cities.length,
      countryCount: data.countries.size,
      tripCount: data.cities.length, // 每条城市记录视为一次旅行
      cities: data.cities,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * 计算旅行类型分布
 */
export function calculateTripTypeDistribution(cities: City[]): Record<TripType, number> {
  const result: Record<TripType, number> = {
    [TripType.Leisure]: 0,
    [TripType.Business]: 0,
    [TripType.Transit]: 0,
  };

  for (const city of cities) {
    const tripType = city.trip_type as TripType;
    if (tripType in result) {
      result[tripType] += 1;
    }
  }

  return result;
}

/**
 * 计算评分分布（1-5 星）
 */
export function calculateRatingDistribution(cities: City[]): Record<number, number> {
  const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const city of cities) {
    if (city.rating != null && city.rating >= 1 && city.rating <= 5) {
      result[city.rating] += 1;
    }
  }

  return result;
}

/**
 * 计算平均评分，无评分数据时返回 undefined
 */
export function calculateAverageRating(cities: City[]): number | undefined {
  const rated = cities.filter((c) => c.rating != null && c.rating >= 1 && c.rating <= 5);
  if (rated.length === 0) return undefined;

  const sum = rated.reduce((acc, c) => acc + (c.rating ?? 0), 0);
  return Math.round((sum / rated.length) * 10) / 10; // 保留一位小数
}

/**
 * 主函数：计算完整的旅行统计数据
 */
export function calculateTravelStatistics(cities: City[]): TravelStatistics {
  const uniqueCountries = new Set(cities.map((c) => c.country_name));
  const uniqueContinents = new Set(cities.map((c) => c.continent));

  return {
    totalCities: cities.length,
    totalCountries: uniqueCountries.size,
    totalContinents: uniqueContinents.size,
    continentCoverage: calculateContinentCoverage(cities),
    citiesByContinent: calculateCitiesByContinent(cities),
    citiesByYear: calculateCitiesByYear(cities),
    topCities: calculateTopCities(cities),
    tripTypeDistribution: calculateTripTypeDistribution(cities),
    averageRating: calculateAverageRating(cities),
    ratingDistribution: calculateRatingDistribution(cities),
  };
}
