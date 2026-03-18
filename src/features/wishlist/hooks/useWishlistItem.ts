/**
 * useWishlistItem Hook
 *
 * 获取单个愿望清单项目的查询 Hook
 */

import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import type { WishlistItem } from '@/types/database';

/**
 * 单个愿望清单项目查询的缓存键工厂函数
 */
export const wishlistItemQueryKey = (id: string) => ['wishlist', id] as const;

/**
 * 获取单个愿望清单项目
 *
 * @param id - 愿望清单项目 ID
 * @param options - 查询选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function WishlistDetail({ itemId }: { itemId: string }) {
 *   const { data: item, isLoading } = useWishlistItem(itemId);
 *
 *   if (isLoading) return <Spinner />;
 *   if (!item) return <NotFound />;
 *
 *   return <div>{item.city_name}</div>;
 * }
 * ```
 */
export const useWishlistItem = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<WishlistItem, Error>({
    queryKey: wishlistItemQueryKey(id),
    queryFn: () => wishlistApi.getById(id),
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
