/**
 * 认证错误处理模块
 *
 * 统一处理 401（未认证）和 403（权限不足）错误
 * - 401：清除令牌，重定向到登录页
 * - 403：显示权限不足提示
 * - 记录安全审计日志
 *
 * 验证需求: 1.5
 */

import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { captureError, isAuthError, extractMessage } from '@/utils/errorLogger';

// ============================================================================
// 安全审计日志
// ============================================================================

export type SecurityEvent =
  | 'AUTH_EXPIRED'        // 401 - 令牌过期或无效
  | 'ACCESS_DENIED'       // 403 - 权限不足
  | 'SESSION_CLEARED'     // 会话被清除
  | 'FORCED_LOGOUT';      // 强制登出

interface SecurityAuditEntry {
  event: SecurityEvent;
  timestamp: string;
  userId?: string;
  details?: Record<string, unknown>;
}

/**
 * 记录安全审计日志
 *
 * 在开发环境输出完整信息，生产环境输出精简信息
 */
export function logSecurityAudit(entry: SecurityAuditEntry): void {
  const prefix = '[JourneyHub][security-audit]';

  if (import.meta.env.DEV) {
    console.groupCollapsed(
      `%c${prefix} ${entry.event}`,
      'color: #e67e22; font-weight: bold',
    );
    console.log('时间:', entry.timestamp);
    console.log('事件:', entry.event);
    if (entry.userId) console.log('用户:', entry.userId);
    if (entry.details) console.log('详情:', entry.details);
    console.groupEnd();
  } else {
    console.warn(`${prefix} ${entry.event}`, entry.userId || '');
  }
}

// ============================================================================
// 错误类型判断（复用 errorLogger 的统一逻辑）
// ============================================================================

/**
 * 判断是否为 401 未认证错误
 *
 * 直接复用 errorLogger.isAuthError 的统一判断逻辑
 */
export const is401Error = isAuthError;

/**
 * 判断是否为 403 权限不足错误
 */
export function is403Error(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.status === 'number' && e.status === 403) return true;
    if (typeof e.code === 'string' && e.code === '403') return true;
  }
  const msg = extractMessage(error).toLowerCase();
  return msg.includes('permission denied') || msg.includes('row-level security');
}

// ============================================================================
// 防抖：避免多个并发请求同时触发登出
// ============================================================================

let _isHandling401 = false;

/**
 * 重置 401 处理状态（用于测试）
 */
export function _reset401State(): void {
  _isHandling401 = false;
}

// ============================================================================
// 核心处理函数
// ============================================================================

/**
 * 处理 401 未认证错误
 *
 * 1. 记录安全审计日志
 * 2. 清除本地认证状态
 * 3. 调用 Supabase signOut
 * 4. 重定向到登录页
 */
export function handle401Error(error: unknown, context?: Record<string, unknown>): void {
  // 防抖：避免多个请求同时触发
  if (_isHandling401) return;
  _isHandling401 = true;

  const userId = useAuthStore.getState().user?.id;

  // 记录安全审计日志
  logSecurityAudit({
    event: 'AUTH_EXPIRED',
    timestamp: new Date().toISOString(),
    userId,
    details: { ...context, error: error instanceof Error ? error.message : String(error) },
  });

  // 记录错误日志
  captureError('auth', error, { ...context, action: 'handle401' });

  // 清除本地认证状态
  useAuthStore.getState().clearAuth();

  logSecurityAudit({
    event: 'SESSION_CLEARED',
    timestamp: new Date().toISOString(),
    userId,
  });

  // 显示提示
  toast.warning('登录已过期，请重新登录', 4000);

  // 调用 Supabase signOut 清除远端会话，然后重定向
  supabase.auth.signOut().catch(() => {
    // signOut 失败时手动清除 localStorage
    window.localStorage.removeItem('journey-hub-auth');
  }).finally(() => {
    logSecurityAudit({
      event: 'FORCED_LOGOUT',
      timestamp: new Date().toISOString(),
      userId,
    });

    // 重定向到登录页（保存当前路径以便登录后返回）
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/auth')) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }

    // 延迟重置防抖状态
    setTimeout(() => { _isHandling401 = false; }, 2000);
  });
}

/**
 * 处理 403 权限不足错误
 *
 * 1. 记录安全审计日志
 * 2. 显示权限不足提示
 */
export function handle403Error(error: unknown, context?: Record<string, unknown>): void {
  const userId = useAuthStore.getState().user?.id;

  // 记录安全审计日志
  logSecurityAudit({
    event: 'ACCESS_DENIED',
    timestamp: new Date().toISOString(),
    userId,
    details: { ...context, error: error instanceof Error ? error.message : String(error) },
  });

  // 记录错误日志
  captureError('auth', error, { ...context, action: 'handle403' });

  // 显示权限不足提示
  toast.error('权限不足，无法执行此操作');
}

/**
 * 统一认证错误处理入口
 *
 * 自动判断错误类型并分发到对应处理函数
 * 返回 true 表示错误已被处理，调用方无需再处理
 */
export function handleAuthError(error: unknown, context?: Record<string, unknown>): boolean {
  if (is401Error(error)) {
    handle401Error(error, context);
    return true;
  }

  if (is403Error(error)) {
    handle403Error(error, context);
    return true;
  }

  return false;
}
