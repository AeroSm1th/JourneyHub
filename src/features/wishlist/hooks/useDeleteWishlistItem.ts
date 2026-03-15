/**
 * useDeleteWishlistItem Hook
 *
 * 删除愿望清单项目的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import { WISHLIST_QUERY_KEY } from './useWishlist';
import { wishlistItemQueryKey } from './useWishlistItem';
import type { WishlistItem } from '@/types/database';

/**
 * 删除愿望清单项目
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function DeleteWishlistButton({ itemId }: { itemId: string }) {
 *   const deleteItem = useDeleteWishlistItem();
 *
 *   const handleDelete = async () => {
 *     if (confirm('确定要从愿望清单中移除吗？')) {
 *       await deleteItem.mutateAsync(itemId);
 *       toast.success('已从愿望清单移除');
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>移除</button>;
 * }
 * ```
 */
export const useDeleteWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: wishlistApi.delete,
    onSuccess: (_, deletedItemId) => {
      // 从列表缓存中移除
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (oldItems) => {
        if (!oldItems) return [];
        return oldItems.filter((item) => item.id !== deletedItemId);
      });

      // 移除单个项目缓存
      queryClient.removeQueries({ queryKey: wishlistItemQueryKey(deletedItemId) });
    },
  });
};
