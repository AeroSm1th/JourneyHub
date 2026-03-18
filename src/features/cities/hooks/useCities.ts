/**
 * useCities Hook
 *
 * 获取所有城市记录的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
 * 验证需求: 11.2, 11.3 - 缓存服务器数据，未过期时直接使用缓存
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
  return useQuery<City[], Error>({
    queryKey: CITIES_QUERY_KEY,
    queryFn: citiesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜，未过期时直接使用缓存（需求 11.3）
    cacheTime: 10 * 60 * 1000, // 10 分钟后清除缓存
  });
};
