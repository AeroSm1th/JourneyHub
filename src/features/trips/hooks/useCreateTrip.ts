/**
 * useCreateTrip Hook
 *
 * 创建行程的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { TRIPS_QUERY_KEY } from './useTrips';
import type { TripInsert, Trip } from '@/types/database';

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, TripInsert>({
    mutationFn: tripsApi.create,
    onMutate: async (newTripData) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_QUERY_KEY);

      const optimisticTrip: Trip = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newTripData,
      } as Trip;

      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return [optimisticTrip];
        return [optimisticTrip, ...old];
      });

      return { previousTrips };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTrips !== undefined) {
        queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, context.previousTrips);
      }
    },
    onSuccess: (newTrip) => {
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (old) => {
        if (!old) return [newTrip];
        const withoutOptimistic = old.filter((t) => !t.id.startsWith('optimistic-'));
        return [newTrip, ...withoutOptimistic];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
};
