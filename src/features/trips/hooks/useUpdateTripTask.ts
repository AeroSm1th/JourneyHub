/**
 * useUpdateTripTask Hook
 *
 * 更新行程待办事项的 Mutation Hook（含标记完成/未完成）
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripTasksApi } from '../api';
import { tripTasksQueryKey } from './useTripTasks';
import { tripQueryKey } from './useTrip';
import type { TripTaskUpdate, TripTask } from '@/types/database';

interface UpdateTripTaskVariables {
  id: string;
  tripId: string;
  updates: TripTaskUpdate;
}

/**
 * 更新行程待办事项
 *
 * @returns TanStack Query mutation 结果
 */
export const useUpdateTripTask = () => {
  const queryClient = useQueryClient();

  return useMutation<TripTask, Error, UpdateTripTaskVariables>({
    mutationFn: ({ id, updates }) => tripTasksApi.update(id, updates),
    onSuccess: (updatedTask, variables) => {
      // 更新待办事项列表缓存
      queryClient.setQueryData<TripTask[]>(tripTasksQueryKey(variables.tripId), (oldTasks) => {
        if (!oldTasks) return [updatedTask];
        return oldTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      });
      // 使行程详情缓存失效
      queryClient.invalidateQueries({ queryKey: tripQueryKey(variables.tripId), refetchType: 'all' });
    },
  });
};
