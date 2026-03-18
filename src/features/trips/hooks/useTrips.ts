/**
 * useTrips Hook
 *
 * 获取所有行程记录的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
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
    staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜
    gcTime: 10 * 60 * 1000, // 10 分钟后清除缓存
  });
};
