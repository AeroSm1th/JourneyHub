/**
 * useProfile Hook
 *
 * 获取用户个人资料的查询 Hook
 * 使用 TanStack Query 管理数据获取和缓存
 */

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/database';

/** 个人资料查询缓存键 */
export const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * 获取当前用户的个人资料
 *
 * @returns TanStack Query 查询结果
 */
export function useProfile() {
  const { user } = useAuthStore();

  return useQuery<User, Error, User, string[]>({
    queryKey: ['profile', user?.id ?? ''],
    queryFn: () => {
      if (!user?.id) throw new Error('用户未登录');
      return getProfile(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
