/**
 * useCreateTrip Hook
 *
 * 创建行程的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { TRIPS_QUERY_KEY } from './useTrips';
import type { TripInsert, Trip } from '@/types/database';

/**
 * 创建新行程
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function CreateTripForm() {
 *   const createTrip = useCreateTrip();
 *
 *   const handleSubmit = async (data: TripInsert) => {
 *     try {
 *       await createTrip.mutateAsync(data);
 *       toast.success('行程创建成功');
 *     } catch (error) {
 *       toast.error('创建失败');
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation<Trip, Error, TripInsert>({
    mutationFn: tripsApi.create,
    onSuccess: (newTrip) => {
      // 乐观更新：将新行程添加到缓存列表头部
      queryClient.setQueryData<Trip[]>(TRIPS_QUERY_KEY, (oldTrips) => {
        if (!oldTrips) return [newTrip];
        return [newTrip, ...oldTrips];
      });
    },
  });
};
