/**
 * useWishlist Hook
 *
 * 获取所有愿望清单项目的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
 * 验证需求: 11.2, 11.3 - 缓存服务器数据，未过期时直接使用缓存
 */

import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import type { WishlistItem } from '@/types/database';

/**
 * 愿望清单查询的缓存键
 */
export const WISHLIST_QUERY_KEY = ['wishlist'] as const;

/**
 * 获取所有愿望清单项目
 *
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * function WishlistView() {
 *   const { data: items, isLoading, error } = useWishlist();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ul>
 *       {items?.map(item => (
 *         <li key={item.id}>{item.city_name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const useWishlist = () => {
  return useQuery<WishlistItem[], Error>({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: wishlistApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 分钟内数据视为新鲜，未过期时直接使用缓存（需求 11.3）
    cacheTime: 10 * 60 * 1000, // 10 分钟后清除缓存
  });
};
