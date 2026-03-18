/**
 * useUpdateCity Hook
 *
 * 更新城市记录的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api';
import { CITIES_QUERY_KEY } from './useCities';
import { cityQueryKey } from './useCity';
import type { CityInsert, City } from '@/types/database';

interface UpdateCityVariables {
  id: string;
  updates: Partial<CityInsert>;
}

/**
 * 更新城市记录
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function EditCityForm({ cityId }: { cityId: string }) {
 *   const updateCity = useUpdateCity();
 *
 *   const handleSubmit = async (updates: Partial<CityInsert>) => {
 *     await updateCity.mutateAsync({ id: cityId, updates });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation<City, Error, UpdateCityVariables>({
    mutationFn: ({ id, updates }) => citiesApi.update(id, updates),
    onSuccess: (updatedCity) => {
      // 更新单个城市缓存
      queryClient.setQueryData<City>(cityQueryKey(updatedCity.id), updatedCity);

      // 更新城市列表缓存
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (oldCities) => {
        if (!oldCities) return [updatedCity];
        return oldCities.map((city) => (city.id === updatedCity.id ? updatedCity : city));
      });
    },
  });
};
