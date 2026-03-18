/**
 * useUpdateTripDay Hook
 *
 * 更新行程日程的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripDaysApi } from '../api';
import { tripDaysQueryKey } from './useTripDays';
import { tripQueryKey } from './useTrip';
import type { TripDayUpdate, TripDay } from '@/types/database';

interface UpdateTripDayVariables {
  id: string;
  tripId: string;
  updates: TripDayUpdate;
}

/**
 * 更新行程日程
 *
 * @returns TanStack Query mutation 结果
 */
export const useUpdateTripDay = () => {
  const queryClient = useQueryClient();

  return useMutation<TripDay, Error, UpdateTripDayVariables>({
    mutationFn: ({ id, updates }) => tripDaysApi.update(id, updates),
    onSuccess: (updatedDay, variables) => {
      // 更新日程列表缓存
      queryClient.setQueryData<TripDay[]>(tripDaysQueryKey(variables.tripId), (oldDays) => {
        if (!oldDays) return [updatedDay];
        return oldDays.map((day) => (day.id === updatedDay.id ? updatedDay : day));
      });
      // 使行程详情缓存失效
      queryClient.invalidateQueries({ queryKey: tripQueryKey(variables.tripId), refetchType: 'all' });
    },
  });
};
