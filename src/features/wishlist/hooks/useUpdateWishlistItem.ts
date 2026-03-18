/**
 * useUpdateWishlistItem Hook
 *
 * 更新愿望清单项目的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
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

// onMutate 返回的 context 类型，用于 onError 回滚
interface UpdateWishlistItemContext {
  previousItems?: WishlistItem[];
  previousItem?: WishlistItem;
}

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation<WishlistItem, Error, UpdateWishlistItemVariables, UpdateWishlistItemContext>({
    mutationFn: ({ id, updates }) => wishlistApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: wishlistItemQueryKey(id) });

      const previousItems = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY);
      const previousItem = queryClient.getQueryData<WishlistItem>(wishlistItemQueryKey(id));

      // 乐观更新列表
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
      });

      // 乐观更新单个项目
      if (previousItem) {
        queryClient.setQueryData<WishlistItem>(wishlistItemQueryKey(id), {
          ...previousItem,
          ...updates,
        });
      }

      return { previousItems, previousItem };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousItems !== undefined) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, context.previousItems);
      }
      if (context?.previousItem !== undefined) {
        queryClient.setQueryData<WishlistItem>(wishlistItemQueryKey(id), context.previousItem);
      }
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<WishlistItem>(wishlistItemQueryKey(updatedItem.id), updatedItem);
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return [updatedItem];
        return old.map((item) => (item.id === updatedItem.id ? updatedItem : item));
      });
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: wishlistItemQueryKey(id), refetchType: 'all' });
    },
  });
};
