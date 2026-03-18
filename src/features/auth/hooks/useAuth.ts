/**
 * 认证状态 Hook
 *
 * 提供当前用户的认证状态和会话信息
 * 验证需求: 1.4 - 登录成功生成令牌并存储在客户端
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';

/**
 * 认证状态 Hook
 *
 * 使用 Zustand store 的 initialized 字段追踪初始化状态，
 * 避免模块级变量在热重载后失效导致页面一直转圈的问题。
 */
export function useAuth() {
  const { user, session, initialized, setAuth, clearAuth, setInitialized } = useAuthStore();
  const queryClient = useQueryClient();
  // 用 ref 防止 StrictMode 下 useEffect 执行两次导致重复订阅
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    // 已经订阅过则跳过（StrictMode 会执行两次）
    if (subscriptionRef.current) return;

    // 初始化：获取当前会话
    const initAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setAuth(currentSession.user, currentSession);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        clearAuth();
      } finally {
        setInitialized();
      }
    };

    initAuth();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_IN' && currentSession?.user) {
        setAuth(currentSession.user, currentSession);
        setInitialized();
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
        setInitialized();
        // 清除所有查询缓存，防止切换账号时数据泄露
        queryClient.clear();
      } else if (event === 'TOKEN_REFRESHED' && currentSession) {
        setAuth(currentSession.user, currentSession);
      } else if (event === 'USER_UPDATED' && currentSession?.user) {
        setAuth(currentSession.user, currentSession);
      } else if (event === 'TOKEN_REFRESH_FAILED' as string) {
        // Refresh token 失效，静默清除状态并跳转登录页
        // 注：部分 SDK 版本此事件不在类型定义中，用 as string 兼容
        clearAuth();
        setInitialized();
        queryClient.clear();
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [setAuth, clearAuth, setInitialized, queryClient]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading: !initialized,
  };
}
