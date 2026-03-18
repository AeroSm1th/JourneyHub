/**
 * useCreateTripDay Hook
 *
 * 创建行程日程的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripDaysApi } from '../api';
import { tripDaysQueryKey } from './useTripDays';
import { tripQueryKey } from './useTrip';
import type { TripDayInsert, TripDay } from '@/types/database';

/**
 * 创建行程日程
 *
 * @returns TanStack Query mutation 结果
 */
export const useCreateTripDay = () => {
  const queryClient = useQueryClient();

  return useMutation<TripDay, Error, TripDayInsert>({
    mutationFn: tripDaysApi.create,
    onSuccess: (newDay) => {
      // 更新日程列表缓存
      queryClient.setQueryData<TripDay[]>(tripDaysQueryKey(newDay.trip_id), (oldDays) => {
        if (!oldDays) return [newDay];
        return [...oldDays, newDay].sort((a, b) => a.day_index - b.day_index);
      });
      // 使行程详情缓存失效以刷新关联数据
      queryClient.invalidateQueries({ queryKey: tripQueryKey(newDay.trip_id), refetchType: 'all' });
    },
  });
};
