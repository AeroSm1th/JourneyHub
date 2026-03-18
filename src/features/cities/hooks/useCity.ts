/**
 * useCity Hook
 *
 * 获取单个城市记录的查询 Hook
 * 验证需求: 11.2, 11.3 - 缓存服务器数据，未过期时直接使用缓存
 */

import { useQuery } from '@tanstack/react-query';
import { citiesApi } from '../api';
import type { City } from '@/types/database';

/**
 * 单个城市查询的缓存键工厂函数
 */
export const cityQueryKey = (id: string) => ['cities', id] as const;

/**
 * 获取单个城市记录
 *
 * @param id - 城市记录 ID
 * @param options - 查询选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function CityDetail({ cityId }: { cityId: string }) {
 *   const { data: city, isLoading } = useCity(cityId);
 *
 *   if (isLoading) return <Spinner />;
 *   if (!city) return <NotFound />;
 *
 *   return <div>{city.city_name}</div>;
 * }
 * ```
 */
export const useCity = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<City, Error>({
    queryKey: cityQueryKey(id),
    queryFn: () => citiesApi.getById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000,  // 5 分钟内数据视为新鲜，未过期时直接使用缓存（需求 11.3）
    cacheTime: 10 * 60 * 1000, // 10 分钟后清除缓存
  });
};
