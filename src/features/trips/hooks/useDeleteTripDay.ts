/**
 * useDeleteTripDay Hook
 *
 * 删除行程日程的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripDaysApi } from '../api';
import { tripDaysQueryKey } from './useTripDays';
import { tripQueryKey } from './useTrip';
import type { TripDay } from '@/types/database';

interface DeleteTripDayVariables {
  id: string;
  tripId: string;
}

/**
 * 删除行程日程
 *
 * @returns TanStack Query mutation 结果
 */
export const useDeleteTripDay = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteTripDayVariables>({
    mutationFn: ({ id }) => tripDaysApi.delete(id),
    onSuccess: (_, variables) => {
      // 从日程列表缓存中移除
      queryClient.setQueryData<TripDay[]>(tripDaysQueryKey(variables.tripId), (oldDays) => {
        if (!oldDays) return [];
        return oldDays.filter((day) => day.id !== variables.id);
      });
      // 使行程详情缓存失效
      queryClient.invalidateQueries({ queryKey: tripQueryKey(variables.tripId), refetchType: 'all' });
    },
  });
};
