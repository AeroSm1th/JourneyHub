/**
 * useCreateCity Hook
 *
 * 创建城市记录的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesApi } from '../api';
import { CITIES_QUERY_KEY } from './useCities';
import type { CityInsert, City } from '@/types/database';

export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation<City, Error, CityInsert>({
    mutationFn: citiesApi.create,
    onMutate: async (newCityData) => {
      // 取消正在进行的 cities 查询，避免覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: CITIES_QUERY_KEY });

      // 保存当前缓存快照，用于回滚
      const previousCities = queryClient.getQueryData<City[]>(CITIES_QUERY_KEY);

      // 构造临时乐观数据（使用临时 ID）
      const optimisticCity: City = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newCityData,
      } as City;

      // 立即更新缓存，UI 无需等待服务器响应
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (old) => {
        if (!old) return [optimisticCity];
        return [optimisticCity, ...old];
      });

      // 返回快照供 onError 使用
      return { previousCities };
    },
    onError: (_error, _variables, context) => {
      // 请求失败时回滚到之前的缓存状态
      const ctx = context as { previousCities?: City[] } | undefined;
      if (ctx?.previousCities !== undefined) {
        queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, ctx.previousCities);
      }
    },
    onSuccess: (newCity) => {
      // 用服务器返回的真实数据替换乐观数据
      queryClient.setQueryData<City[]>(CITIES_QUERY_KEY, (old) => {
        if (!old) return [newCity];
        // 替换临时乐观条目（以 optimistic- 开头的 id）
        const withoutOptimistic = old.filter((c) => !c.id.startsWith('optimistic-'));
        return [newCity, ...withoutOptimistic];
      });
    },
    onSettled: () => {
      // refetchType: 'all' 确保即使 refetchOnMount: false 也会重新请求
      queryClient.invalidateQueries({ queryKey: CITIES_QUERY_KEY, refetchType: 'all' });
    },
  });
};
