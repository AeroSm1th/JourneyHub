/**
 * useDeleteTripTask Hook
 *
 * 删除行程待办事项的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripTasksApi } from '../api';
import { tripTasksQueryKey } from './useTripTasks';
import { tripQueryKey } from './useTrip';
import type { TripTask } from '@/types/database';

interface DeleteTripTaskVariables {
  id: string;
  tripId: string;
}

/**
 * 删除行程待办事项
 *
 * @returns TanStack Query mutation 结果
 */
export const useDeleteTripTask = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteTripTaskVariables>({
    mutationFn: ({ id }) => tripTasksApi.delete(id),
    onSuccess: (_, variables) => {
      // 从待办事项列表缓存中移除
      queryClient.setQueryData<TripTask[]>(tripTasksQueryKey(variables.tripId), (oldTasks) => {
        if (!oldTasks) return [];
        return oldTasks.filter((task) => task.id !== variables.id);
      });
      // 使行程详情缓存失效
      queryClient.invalidateQueries({ queryKey: tripQueryKey(variables.tripId) });
    },
  });
};
