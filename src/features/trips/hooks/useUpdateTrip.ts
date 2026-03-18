/**
 * useUpdateTrip Hook
 *
 * 更新行程的 Mutation Hook
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

/**
 * 更新行程信息
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function EditTripForm({ tripId }: { tripId: string }) {
 *   const updateTrip = useUpdateTrip();
 *
 *   const handleSubmit = async (updates: TripUpdate) => {
 *     await updateTrip.mutateAsync({ id: tripId, updates });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, UpdateTripVariables>({
    mutationFn: ({ id, updates }) => tripsApi.update(id, updates),
    onSuccess: (updatedTrip) => {
      // 更新单个行程缓存
      queryClient.setQueryData(tripQueryKey(updatedTrip.id), (oldData: unknown) => {
        // 保留关联的 trip_days 和 trip_tasks 数据
        if (oldData && typeof oldData === 'object') {
          return { ...oldData, ...updatedTrip };
        }
        return updatedTrip;
      });

      // 更新行程列表缓存
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (oldTrips) => {
        if (!oldTrips) return [updatedTrip];
        return oldTrips.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip));
      });
    },
  });
};
