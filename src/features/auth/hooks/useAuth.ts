/**
 * 认证状态 Hook
 *
 * 提供当前用户的认证状态和会话信息
 * 验证需求: 1.4 - 登录成功生成令牌并存储在客户端
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';

/**
 * 全局初始化标记，确保只初始化一次
 */
let _authInitialized = false;
let _authInitializing = false;

/**
 * 认证状态 Hook
 *
 * 直接使用 Supabase auth 的会话信息，不额外查询 users 表
 * 使用全局标记避免多个组件实例重复初始化
 */
export function useAuth() {
  const { user, session, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 如果已经初始化过，跳过
    if (_authInitialized || _authInitializing) return;
    _authInitializing = true;

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
        _authInitialized = true;
        _authInitializing = false;
      }
    };

    initAuth();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_IN' && currentSession?.user) {
        setAuth(currentSession.user, currentSession);
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
        // 清除所有查询缓存，防止切换账号时数据泄露
        queryClient.clear();
      } else if (event === 'TOKEN_REFRESHED' && currentSession) {
        setAuth(currentSession.user, currentSession);
      } else if (event === 'USER_UPDATED' && currentSession?.user) {
        setAuth(currentSession.user, currentSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    // 只有在首次初始化且 store 里还没有 user 时才算 loading
    // 如果 store 里已经有 user（比如从 login 页面 navigate 过来），直接返回 false
    isLoading: !_authInitialized && !user,
  };
}
