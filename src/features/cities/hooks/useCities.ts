/**
 * useCities Hook
 *
 * 获取所有城市记录的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
 */

import { useQuery } from '@tanstack/react-query';
import { citiesApi } from '../api';
import type { City } from '@/types/database';

/**
 * 城市查询的缓存键
 */
export const CITIES_QUERY_KEY = ['cities'] as const;

/**
 * 获取所有城市记录
 *
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function CityList() {
 *   const { data: cities, isLoading, error } = useCities();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ul>
 *       {cities?.map(city => (
 *         <li key={city.id}>{city.city_name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const useCities = () => {
  return useQuery<City[], Error>(
    CITIES_QUERY_KEY,
    citiesApi.getAll,
    {
      staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
      cacheTime: 10 * 60 * 1000, // 10 分钟后清除缓存
    },
  );
};
