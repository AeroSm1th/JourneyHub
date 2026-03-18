/**
 * useDeleteTrip Hook
 *
 * 删除行程的 Mutation Hook（级联删除关联的日程和待办事项）
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { TRIPS_QUERY_KEY } from './useTrips';
import { tripQueryKey } from './useTrip';
import type { Trip } from '@/types/database';

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: tripsApi.delete,
    onMutate: async (deletedTripId) => {
      // 取消相关查询，避免覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

      // 保存快照用于回滚
      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);

      // 乐观从列表中移除
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return [];
        return old.filter((trip) => trip.id !== deletedTripId);
      });

      return { previousTrips };
    },
    onError: (_error, _deletedTripId, context) => {
      // 请求失败时回滚
      const ctx = context as { previousTrips?: Trip[] } | undefined;
      if (ctx?.previousTrips !== undefined) {
        queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, ctx.previousTrips);
      }
    },
    onSuccess: (_, deletedTripId) => {
      // 移除单个行程缓存
      queryClient.removeQueries({ queryKey: tripQueryKey(deletedTripId) });
    },
    onSettled: () => {
      // 最终同步列表缓存
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
};
