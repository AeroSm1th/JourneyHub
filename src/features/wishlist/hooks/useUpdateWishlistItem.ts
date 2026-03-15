/**
 * useUpdateWishlistItem Hook
 *
 * 更新愿望清单项目的 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import { WISHLIST_QUERY_KEY } from './useWishlist';
import { wishlistItemQueryKey } from './useWishlistItem';
import type { WishlistItemUpdate, WishlistItem } from '@/types/database';

interface UpdateWishlistItemVariables {
  id: string;
  updates: WishlistItemUpdate;
}

/**
 * 更新愿望清单项目
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```tsx
 * function EditWishlistItem({ itemId }: { itemId: string }) {
 *   const updateItem = useUpdateWishlistItem();
 *
 *   const handleSubmit = async (updates: WishlistItemUpdate) => {
 *     await updateItem.mutateAsync({ id: itemId, updates });
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation<WishlistItem, Error, UpdateWishlistItemVariables>({
    mutationFn: ({ id, updates }) => wishlistApi.update(id, updates),
    onSuccess: (updatedItem) => {
      // 更新单个项目缓存
      queryClient.setQueryData<WishlistItem>(
        wishlistItemQueryKey(updatedItem.id),
        updatedItem
      );

      // 更新列表缓存
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (oldItems) => {
        if (!oldItems) return [updatedItem];
        return oldItems.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      });
    },
  });
};
