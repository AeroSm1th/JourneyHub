/**
 * useCreateWishlistItem Hook
 *
 * 创建愿望清单项目的 Mutation Hook
 * 使用完整乐观更新策略：onMutate 预更新 + onError 回滚 + onSettled 同步
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import { WISHLIST_QUERY_KEY } from './useWishlist';
import type { WishlistItemInsert, WishlistItem } from '@/types/database';

export const useCreateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation<WishlistItem, Error, WishlistItemInsert>({
    mutationFn: wishlistApi.create,
    onMutate: async (newItemData) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousItems = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY);

      const optimisticItem: WishlistItem = {
        id: `optimistic-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newItemData,
      } as WishlistItem;

      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return [optimisticItem];
        return [optimisticItem, ...old];
      });

      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      const ctx = context as { previousItems?: WishlistItem[] } | undefined;
      if (ctx?.previousItems !== undefined) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, ctx.previousItems);
      }
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, (old) => {
        if (!old) return [newItem];
        const withoutOptimistic = old.filter((i) => !i.id.startsWith('optimistic-'));
        return [newItem, ...withoutOptimistic];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
};
