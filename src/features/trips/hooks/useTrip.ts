/**
 * useTrip Hook
 *
 * 获取单个行程详情的查询 Hook（含关联的日程和待办事项）
 * 验证需求: 11.2, 11.3 - 缓存服务器数据，未过期时直接使用缓存
 */

import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api';
import type { TripWithRelations } from '../api';

/**
 * 单个行程查询的缓存键工厂函数
 */
export const tripQueryKey = (id: string) => ['trips', id] as const;

/**
 * 获取单个行程详情（含 trip_days 和 trip_tasks）
 *
 * @param id - 行程 ID
 * @param options - 查询选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function TripDetail({ tripId }: { tripId: string }) {
 *   const { data: trip, isLoading } = useTrip(tripId);
 *
 *   if (isLoading) return <Spinner />;
 *   if (!trip) return <NotFound />;
 *
 *   return (
 *     <div>
 *       <h1>{trip.title}</h1>
 *       <p>日程数: {trip.trip_days.length}</p>
 *       <p>待办数: {trip.trip_tasks.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTrip = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<TripWithRelations, Error>({
    queryKey: tripQueryKey(id),
    queryFn: () => tripsApi.getById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 3 * 60 * 1000, // 3 分钟（与列表保持一致），未过期时直接使用缓存（需求 11.3）
    cacheTime: 8 * 60 * 1000, // 8 分钟后清除缓存
  });
};
