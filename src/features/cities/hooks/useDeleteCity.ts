/**
 * useDeleteCity Hook
 *
 * 删除城市记录的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api';
import { CITIES_QUERY_KEY } from './useCities';
import { cityQueryKey } from './useCity';
import type { City } from '@/types/database';

export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: citiesApi.delete,
    onMutate: async (deletedCityId) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: CITIES_QUERY_KEY });

      // 保存快照
      const previousCities = queryClient.getQueryData<City[]>(CITIES_QUERY_KEY);

      // 乐观从列表中移除
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (old) => {
        if (!old) return [];
        return old.filter((city) => city.id !== deletedCityId);
      });

      return { previousCities };
    },
    onError: (_error, _deletedCityId, context) => {
      // 回滚列表缓存
      const ctx = context as { previousCities?: City[] } | undefined;
      if (ctx?.previousCities !== undefined) {
        queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, ctx.previousCities);
      }
    },
    onSuccess: (_, deletedCityId) => {
      // 移除单个城市缓存
      queryClient.removeQueries({ queryKey: cityQueryKey(deletedCityId) });
    },
    onSettled: () => {
      // 最终同步列表缓存
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY });
    },
  });
};
