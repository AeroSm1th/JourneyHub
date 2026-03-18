/**
 * useTripTasks Hook
 *
 * 获取指定行程的所有待办事项
 * 使用 TanStack Query 管理数据获取和缓存
 */

import { useQuery } from '@tanstack/react-query';
import { tripTasksApi } from '../api';
import type { TripTask } from '@/types/database';

/**
 * 行程待办事项查询的缓存键工厂函数
 */
export const tripTasksQueryKey = (tripId: string) => ['tripTasks', tripId] as const;

/**
 * 获取指定行程的所有待办事项
 *
 * @param tripId - 行程 ID
 * @returns TanStack Query 查询结果
 */
export const useTripTasks = (tripId: string) => {
  return useQuery<TripTask[], Error>({
    queryKey: tripTasksQueryKey(tripId),
    queryFn: () => tripTasksApi.getByTripId(tripId),
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
