/**
 * useCity Hook
 *
 * 获取单个城市记录的查询 Hook
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
  return useQuery<City, Error>(
    cityQueryKey(id),
    () => citiesApi.getById(id),
    {
      enabled: options?.enabled ?? !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  );
};
