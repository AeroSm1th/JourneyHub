/**
 * useCreateTripTask Hook
 *
 * 创建行程待办事项的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripTasksApi } from '../api';
import { tripTasksQueryKey } from './useTripTasks';
import { tripQueryKey } from './useTrip';
import type { TripTaskInsert, TripTask } from '@/types/database';

/**
 * 创建行程待办事项
 *
 * @returns TanStack Query mutation 结果
 */
export const useCreateTripTask = () => {
  const queryClient = useQueryClient();

  return useMutation<TripTask, Error, TripTaskInsert>({
    mutationFn: tripTasksApi.create,
    onSuccess: (newTask) => {
      // 更新待办事项列表缓存
      queryClient.setQueryData<TripTask[]>(tripTasksQueryKey(newTask.trip_id), (oldTasks) => {
        if (!oldTasks) return [newTask];
        return [...oldTasks, newTask];
      });
      // 使行程详情缓存失效
      queryClient.invalidateQueries({ queryKey: tripQueryKey(newTask.trip_id), refetchType: 'all' });
    },
  });
};
