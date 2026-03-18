/**
 * useTrips Hook
 *
 * 获取所有行程记录的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
 * 验证需求: 11.2, 11.3 - 缓存服务器数据，未过期时直接使用缓存
 */

import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api';
import type { Trip } from '@/types/database';

/**
 * 行程列表查询的缓存键
 */
export const TRIPS_QUERY_KEY = ['trips'] as const;

/**
 * 获取当前用户的所有行程
 *
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function TripList() {
 *   const { data: trips, isLoading, error } = useTrips();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ul>
 *       {trips?.map(trip => (
 *         <li key={trip.id}>{trip.title}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const useTrips = () => {
  return useQuery<Trip[], Error>({
    queryKey: TRIPS_QUERY_KEY,
    queryFn: tripsApi.getAll,
    staleTime: 3 * 60 * 1000, // 3 分钟（行程数据变化较频繁），未过期时直接使用缓存（需求 11.3）
    cacheTime: 8 * 60 * 1000, // 8 分钟后清除缓存
  });
};
