/**
 * useCreateCity Hook
 *
 * 创建城市记录的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api';
import { CITIES_QUERY_KEY } from './useCities';
import type { CityInsert } from '@/types/database';
import type { City } from '@/types/database';

/**
 * 创建城市记录
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function CreateCityForm() {
 *   const createCity = useCreateCity();
 *
 *   const handleSubmit = async (data: CityInsert) => {
 *     try {
 *       await createCity.mutateAsync(data);
 *       toast.success('城市创建成功');
 *     } catch (error) {
 *       toast.error('创建失败');
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation<City, Error, CityInsert>({
    mutationFn: citiesApi.create,
    onSuccess: (newCity) => {
      // 乐观更新：将新城市添加到缓存列表
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (oldCities) => {
        if (!oldCities) return [newCity];
        return [newCity, ...oldCities];
      });

      // 或者重新获取列表（更安全但会触发网络请求）
      // queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
  });
};
