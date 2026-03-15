/**
 * useDeleteTrip Hook
 *
 * 删除行程的 Mutation Hook（级联删除关联的日程和待办事项）
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { TRIPS_QUERY_KEY } from './useTrips';
import { tripQueryKey } from './useTrip';
import type { Trip } from '@/types/database';

/**
 * 删除行程
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function DeleteTripButton({ tripId }: { tripId: string }) {
 *   const deleteTrip = useDeleteTrip();
 *
 *   const handleDelete = async () => {
 *     if (confirm('确定要删除这个行程吗？')) {
 *       await deleteTrip.mutateAsync(tripId);
 *       toast.success('删除成功');
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>删除</button>;
 * }
 * ```
 */
export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: tripsApi.delete,
    onSuccess: (_, deletedTripId) => {
      // 从行程列表缓存中移除
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (oldTrips) => {
        if (!oldTrips) return [];
        return oldTrips.filter((trip) => trip.id !== deletedTripId);
      });

      // 移除单个行程缓存
      queryClient.removeQueries({ queryKey: tripQueryKey(deletedTripId) });
    },
  });
};
