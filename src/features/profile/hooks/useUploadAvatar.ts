/**
 * useUploadAvatar Hook
 *
 * 上传用户头像的 mutation Hook
 * 先上传文件到 Storage，再更新用户头像 URL
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar, updateAvatar } from '../api';
import { useAuthStore } from '@/store/authStore';
import { PROFILE_QUERY_KEY } from './useProfile';
import type { User } from '@/types/database';

/**
 * 上传并更新用户头像
 *
 * @returns TanStack Query mutation 结果
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation<User, Error, File>({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('用户未登录');
      // 先上传文件获取 URL
      const avatarUrl = await uploadAvatar(user.id, file);
      // 再更新用户记录中的头像 URL
      return updateAvatar(user.id, avatarUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
