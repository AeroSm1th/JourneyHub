/**
 * useUpdateTrip Hook
 *
 * 更新行程的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { TRIPS_QUERY_KEY } from './useTrips';
import { tripQueryKey } from './useTrip';
import type { TripUpdate, Trip } from '@/types/database';

interface UpdateTripVariables {
  id: string;
  updates: TripUpdate;
}

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, UpdateTripVariables>({
    mutationFn: ({ id, updates }) => tripsApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: tripQueryKey(id) });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);
      const previousTrip = queryClient.getQueryData(tripQueryKey(id));

      // 乐观更新列表
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((trip) =>
          trip.id === id ? { ...trip, ...updates, updated_at: new Date().toISOString() } : trip
        );
      });

      // 乐观更新单个行程（保留关联数据）
      if (previousTrip && typeof previousTrip === 'object') {
        queryClient.setQueryData(tripQueryKey(id), {
          ...previousTrip,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousTrips, previousTrip };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousTrips !== undefined) {
        queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, context.previousTrips);
      }
      if (context?.previousTrip !== undefined) {
        queryClient.setQueryData(tripQueryKey(id), context.previousTrip);
      }
    },
    onSuccess: (updatedTrip) => {
      // 用服务器数据更新缓存（保留关联的 trip_days/trip_tasks）
      queryClient.setQueryData(tripQueryKey(updatedTrip.id), (oldData: unknown) => {
        if (oldData && typeof oldData === 'object') {
          return { ...oldData, ...updatedTrip };
        }
        return updatedTrip;
      });
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return [updatedTrip];
        return old.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip));
      });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: tripQueryKey(id), refetchType: 'all' });
    },
  });
};
