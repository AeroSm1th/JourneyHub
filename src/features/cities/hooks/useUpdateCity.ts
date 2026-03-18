/**
 * useUpdateCity Hook
 *
 * 更新城市记录的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
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

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation<City, Error, UpdateCityVariables>({
    mutationFn: ({ id, updates }) => citiesApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // 取消相关查询，避免覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: CITIES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: cityQueryKey(id) });

      // 保存快照
      const previousCities = queryClient.getQueryData<City[]>(CITIES_QUERY_KEY);
      const previousCity = queryClient.getQueryData<City>(cityQueryKey(id));

      // 乐观更新列表缓存
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((city) =>
          city.id === id ? { ...city, ...updates, updated_at: new Date().toISOString() } : city
        );
      });

      // 乐观更新单个城市缓存
      if (previousCity) {
        queryClient.setQueryData<City>(cityQueryKey(id), {
          ...previousCity,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousCities, previousCity };
    },
    onError: (_error, { id }, context) => {
      const ctx = context as { previousCities?: City[]; previousCity?: City } | undefined;
      // 回滚列表缓存
      if (ctx?.previousCities !== undefined) {
        queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, ctx.previousCities);
      }
      // 回滚单个城市缓存
      if (ctx?.previousCity !== undefined) {
        queryClient.setQueryData<City>(cityQueryKey(id), ctx.previousCity);
      }
    },
    onSuccess: (updatedCity) => {
      // 用服务器返回的真实数据更新缓存
      queryClient.setQueryData<City>(cityQueryKey(updatedCity.id), updatedCity);
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (old) => {
        if (!old) return [updatedCity];
        return old.map((city) => (city.id === updatedCity.id ? updatedCity : city));
      });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: cityQueryKey(id), refetchType: 'all' });
    },
  });
};
