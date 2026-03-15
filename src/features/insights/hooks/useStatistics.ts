/**
 * useStatistics Hook
 *
 * 基于城市数据计算旅行统计信息
 * 使用 useMemo 优化性能，避免不必要的重复计算
 *
 * 验证需求: 6.1, 6.2, 6.3
 */

import { useMemo } from 'react';
import { useCities } from '@/features/cities/hooks/useCities';
import { calculateTravelStatistics } from '@/features/insights/utils/calculateStats';
import type { TravelStatistics } from '@/types/entities';

/**
 * useStatistics 返回值类型
 */
export interface UseStatisticsReturn {
  /** 完整的旅行统计数据 */
  statistics: TravelStatistics | undefined;
  /** 数据是否正在加载 */
  isLoading: boolean;
  /** 加载错误 */
  error: Error | null;
  /** 已访问城市总数 */
  totalCities: number;
  /** 已访问国家总数 */
  totalCountries: number;
  /** 已访问大洲总数 */
  totalContinents: number;
  /** 大洲覆盖率百分比 (0-100) */
  continentCoverage: number;
  /** 平均评分 */
  averageRating: number | undefined;
}

/**
 * 获取旅行统计数据
 *
 * @returns 统计数据、加载状态和便捷字段
 *
 * @example
 * ```tsx
 * function InsightsPage() {
 *   const { statistics, isLoading, totalCities, totalCountries } = useStatistics();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <p>城市: {totalCities}</p>
 *       <p>国家: {totalCountries}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useStatistics = (): UseStatisticsReturn => {
  const { data: cities, isLoading, error } = useCities();

  const statistics = useMemo<TravelStatistics | undefined>(() => {
    if (!cities || cities.length === 0) return undefined;
    return calculateTravelStatistics(cities);
  }, [cities]);

  return {
    statistics,
    isLoading,
    error: error ?? null,
    totalCities: statistics?.totalCities ?? 0,
    totalCountries: statistics?.totalCountries ?? 0,
    totalContinents: statistics?.totalContinents ?? 0,
    continentCoverage: statistics?.continentCoverage ?? 0,
    averageRating: statistics?.averageRating,
  };
};
