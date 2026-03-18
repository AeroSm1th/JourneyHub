/**
 * usePrefetch Hook
 *
 * 预取关键数据，减少页面切换时的加载等待
 * 验证需求: 11.2, 11.3
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { citiesApi } from '@/features/cities/api';
import { wishlistApi } from '@/features/wishlist/api';
import { tripsApi } from '@/features/trips/api';
import { CITIES_QUERY_KEY } from '@/features/cities/hooks/useCities';
import { cityQueryKey } from '@/features/cities/hooks/useCity';
import { WISHLIST_QUERY_KEY } from '@/features/wishlist/hooks/useWishlist';
import { TRIPS_QUERY_KEY } from '@/features/trips/hooks/useTrips';

/**
 * 在应用布局挂载时预取核心数据（cities、wishlist、trips）
 * 使用 staleTime 避免重复请求已缓存的新鲜数据
 */
export const usePrefetchCoreData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 并行预取三类核心数据，staleTime 与各 hook 保持一致
    queryClient.prefetchQuery({
      queryKey: CITIES_QUERY_KEY,
      queryFn: citiesApi.getAll,
      staleTime: 5 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: WISHLIST_QUERY_KEY,
      queryFn: wishlistApi.getAll,
      staleTime: 5 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: TRIPS_QUERY_KEY,
      queryFn: tripsApi.getAll,
      staleTime: 3 * 60 * 1000,
    });
  }, [queryClient]);
};

/**
 * 返回一个函数，用于在 hover 城市列表项时预取城市详情
 * 避免点击后才开始加载详情数据
 *
 * @example
 * ```tsx
 * function CityListItem({ city }: { city: City }) {
 *   const prefetchCity = usePrefetchCity();
 *
 *   return (
 *     <div onMouseEnter={() => prefetchCity(city.id)}>
 *       {city.city_name}
 *     </div>
 *   );
 * }
 * ```
 */
export const usePrefetchCity = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (cityId: string) => {
      queryClient.prefetchQuery({
        queryKey: cityQueryKey(cityId),
        queryFn: () => citiesApi.getById(cityId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
};
