/**
 * useTripDays Hook
 *
 * 获取指定行程的所有日程记录
 * 使用 TanStack Query 管理数据获取和缓存
 */

import { useQuery } from '@tanstack/react-query';
import { tripDaysApi } from '../api';
import type { TripDay } from '@/types/database';

/**
 * 行程日程查询的缓存键工厂函数
 */
export const tripDaysQueryKey = (tripId: string) => ['tripDays', tripId] as const;

/**
 * 获取指定行程的所有日程
 *
 * @param tripId - 行程 ID
 * @returns TanStack Query 查询结果
 */
export const useTripDays = (tripId: string) => {
  return useQuery<TripDay[], Error>({
    queryKey: tripDaysQueryKey(tripId),
    queryFn: () => tripDaysApi.getByTripId(tripId),
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
