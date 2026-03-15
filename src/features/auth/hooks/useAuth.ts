/**
 * 认证状态 Hook
 *
 * 提供当前用户的认证状态和会话信息
 * 验证需求: 1.4 - 登录成功生成令牌并存储在客户端
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';
import { getCurrentUser } from '../api';

/**
 * 认证状态 Hook
 *
 * 功能：
 * - 提供当前登录用户信息
 * - 提供会话信息
 * - 监听认证状态变化
 * - 自动同步 Supabase 认证状态到本地 Store
 *
 * @returns 认证状态对象
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, session, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return <div>欢迎, {user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const { user, session, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // 初始化：获取当前会话
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          // 获取完整用户信息
          const userData = await getCurrentUser();
          setAuth(currentSession.user, currentSession);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        clearAuth();
      }
    };

    initAuth();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('认证状态变化:', event);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        // 用户登录
        try {
          const userData = await getCurrentUser();
          setAuth(currentSession.user, currentSession);
        } catch (error) {
          console.error('获取用户信息失败:', error);
          setAuth(currentSession.user, currentSession);
        }
      } else if (event === 'SIGNED_OUT') {
        // 用户退出登录
        clearAuth();
      } else if (event === 'TOKEN_REFRESHED' && currentSession) {
        // 令牌刷新
        setAuth(currentSession.user, currentSession);
      } else if (event === 'USER_UPDATED' && currentSession?.user) {
        // 用户信息更新
        try {
          const userData = await getCurrentUser();
          setAuth(currentSession.user, currentSession);
        } catch (error) {
          console.error('更新用户信息失败:', error);
        }
      }
    });

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  return {
    /**
     * 当前登录用户
     * null 表示未登录
     */
    user,

    /**
     * Supabase 会话信息
     * 包含访问令牌、刷新令牌等
     */
    session,

    /**
     * 是否已登录
     */
    isAuthenticated: !!user,

    /**
     * 是否正在加载
     * 注意：这里简化处理，实际项目中可能需要额外的 loading 状态
     */
    isLoading: false,
  };
}
