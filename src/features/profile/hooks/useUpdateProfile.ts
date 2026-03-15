/**
 * useUpdateProfile Hook
 *
 * 更新用户个人资料的 mutation Hook
 * 成功后自动刷新资料缓存
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api';
import { useAuthStore } from '@/store/authStore';
import { PROFILE_QUERY_KEY } from './useProfile';
import type { User } from '@/types/database';

/**
 * 更新用户昵称等资料
 *
 * @returns TanStack Query mutation 结果
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation<User, Error, { nickname?: string }>({
    mutationFn: (data) => {
      if (!user?.id) throw new Error('用户未登录');
      return updateProfile(user.id, data);
    },
    onSuccess: () => {
      // 更新成功后刷新资料缓存
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
