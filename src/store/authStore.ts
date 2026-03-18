/**
 * 认证状态管理 Store
 *
 * 使用 Zustand 管理用户认证状态，包括：
 * - 当前登录用户信息
 * - Supabase 会话信息
 * - 认证状态的设置和清除方法
 *
 * 需求: 1.4 - 登录成功生成令牌并存储在客户端
 */

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

/**
 * 认证状态接口
 */
interface AuthState {
  /**
   * 当前登录用户
   * null 表示未登录
   */
  user: User | null;

  /**
   * Supabase 会话信息
   * 包含访问令牌、刷新令牌等
   */
  session: Session | null;

  /**
   * 设置认证状态
   * @param user - 用户信息
   * @param session - 会话信息
   */
  setAuth: (user: User | null, session: Session | null) => void;

  /**
   * 清除认证状态
   * 用于退出登录时清除所有认证信息
   */
  clearAuth: () => void;
}

/**
 * 认证状态 Store
 *
 * 使用示例：
 * ```typescript
 * const { user, session, setAuth, clearAuth } = useAuthStore();
 *
 * // 登录成功后设置认证状态
 * setAuth(userData, sessionData);
 *
 * // 退出登录时清除认证状态
 * clearAuth();
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,

  setAuth: (user, session) => set({ user, session }),

  clearAuth: () => set({ user: null, session: null }),
}));
