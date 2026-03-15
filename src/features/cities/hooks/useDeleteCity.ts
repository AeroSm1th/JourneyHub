/**
 * useDeleteCity Hook
 *
 * 删除城市记录的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api';
import { CITIES_QUERY_KEY } from './useCities';
import { cityQueryKey } from './useCity';
import type { City } from '@/types/database';

/**
 * 删除城市记录
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function DeleteCityButton({ cityId }: { cityId: string }) {
 *   const deleteCity = useDeleteCity();
 *
 *   const handleDelete = async () => {
 *     if (confirm('确定要删除这个城市吗？')) {
 *       await deleteCity.mutateAsync(cityId);
 *       toast.success('删除成功');
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>删除</button>;
 * }
 * ```
 */
export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: citiesApi.delete,
    onSuccess: (_, deletedCityId) => {
      // 从城市列表缓存中移除
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (oldCities) => {
        if (!oldCities) return [];
        return oldCities.filter((city) => city.id !== deletedCityId);
      });

      // 移除单个城市缓存
      queryClient.removeQueries({ queryKey: cityQueryKey(deletedCityId) });
    },
  });
};
