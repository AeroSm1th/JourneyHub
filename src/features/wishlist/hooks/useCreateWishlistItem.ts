/**
 * useCreateWishlistItem Hook
 *
 * 创建愿望清单项目的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import { WISHLIST_QUERY_KEY } from './useWishlist';
import type { WishlistItemInsert, WishlistItem } from '@/types/database';

/**
 * 创建愿望清单项目
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function AddWishlistForm() {
 *   const createItem = useCreateWishlistItem();
 *
 *   const handleSubmit = async (data: WishlistItemInsert) => {
 *     try {
 *       await createItem.mutateAsync(data);
 *       toast.success('已添加到愿望清单');
 *     } catch (error) {
 *       toast.error('添加失败');
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useCreateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation<WishlistItem, Error, WishlistItemInsert>({
    mutationFn: wishlistApi.create,
    onSuccess: (newItem) => {
      // 乐观更新：将新项目添加到缓存列表
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (oldItems) => {
        if (!oldItems) return [newItem];
        return [newItem, ...oldItems];
      });
    },
  });
};
