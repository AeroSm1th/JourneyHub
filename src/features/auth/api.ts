/**
 * 认证 API 封装
 *
 * 封装 Supabase 认证方法，提供类型安全的认证操作
 * 验证需求: 1.1（注册）, 1.2（登录）, 1.6（退出登录）
 */

import { supabase } from '@/services/supabase/client';
import type { User } from '@/types/database';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 认证响应类型
 */
export interface AuthResponse {
  user: User | null;
  error?: AuthError;
}

/**
 * 认证错误类型
 */
export interface AuthError {
  message: string;
  code?: string;
}

// ============================================================================
// 认证 API 函数
// ============================================================================

/**
 * 用户注册
 *
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 注册成功返回用户信息，失败抛出错误
 *
 * @example
 * ```ts
 * const user = await signUp('user@example.com', 'password123');
 * ```
 */
export async function signUp(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('注册失败：未返回用户信息');
  }

  // 注意：users 表记录应该通过数据库触发器自动创建
  // 如果需要手动创建，可以在这里添加逻辑
  // 这里我们返回一个基础的 User 对象
  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    created_at: new Date().toISOString(),
  };

  return user;
}

/**
 * 用户登录
 *
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 登录成功返回用户信息，失败抛出错误
 *
 * @example
 * ```ts
 * const user = await signIn('user@example.com', 'password123');
 * ```
 */
export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('登录失败：未返回用户信息');
  }

  // 直接使用 Supabase auth 返回的用户信息
  const user: User = {
    id: data.user.id,
    email: data.user.email!,
    created_at: data.user.created_at,
  };

  return user;
}

/**
 * 退出登录
 *
 * @returns 退出成功返回 void，失败抛出错误
 *
 * @example
 * ```ts
 * await signOut();
 * ```
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * 获取当前登录用户
 *
 * @returns 返回当前登录用户信息，未登录返回 null
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('当前用户:', user.email);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  // 获取当前会话
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.user) {
    return null;
  }

  // 直接使用 Supabase auth 的用户信息
  return {
    id: session.user.id,
    email: session.user.email!,
    created_at: session.user.created_at,
  };
}
