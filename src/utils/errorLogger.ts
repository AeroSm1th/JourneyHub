/**
 * 错误日志记录工具
 *
 * 提供统一的错误日志记录函数，支持分级别记录和结构化输出。
 * 同时导出通用的错误信息提取函数，供 authErrorHandler / dbErrorHandler 复用。
 *
 * 验证需求: 9.7 - 记录错误日志到控制台以便调试
 */

// 错误级别
export type ErrorLevel = 'warn' | 'error' | 'fatal';

// 错误来源
export type ErrorSource =
  | 'query'      // TanStack Query 查询错误
  | 'mutation'   // TanStack Query 变更错误
  | 'supabase'   // Supabase 客户端错误
  | 'auth'       // 认证相关错误
  | 'network'    // 网络错误
  | 'render'     // React 渲染错误
  | 'unknown';   // 未知来源

export interface ErrorLogEntry {
  level: ErrorLevel;
  source: ErrorSource;
  message: string;
  code?: string;
  timestamp: string;
  context?: Record<string, unknown>;
  originalError?: unknown;
}

// ============================================================================
// 通用错误信息提取（供其他模块复用）
// ============================================================================

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  return false;
}

/**
 * 从错误对象中提取错误码（字符串形式）
 *
 * 支持 Supabase 错误的 code 字段和 status 数字字段
 */
export function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.code === 'string') return e.code;
    if (typeof e.status === 'number') return String(e.status);
  }
  return undefined;
}

/**
 * 从错误对象中提取消息文本
 */
export function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.msg === 'string') return e.msg;
  }
  if (typeof error === 'string') return error;
  return '未知错误';
}

// ============================================================================
// 日志记录
// ============================================================================

/**
 * 记录错误日志到控制台
 *
 * 在开发环境下输出完整的结构化日志，
 * 在生产环境下输出精简信息。
 */
export function logError(entry: ErrorLogEntry): void {
  const prefix = `[JourneyHub][${entry.source}]`;

  if (import.meta.env.DEV) {
    const style = entry.level === 'fatal'
      ? 'color: #ff0000; font-weight: bold'
      : entry.level === 'error'
        ? 'color: #e74c3c'
        : 'color: #f39c12';

    console.groupCollapsed(`%c${prefix} ${entry.message}`, style);
    console.log('时间:', entry.timestamp);
    console.log('级别:', entry.level);
    console.log('来源:', entry.source);
    if (entry.code) console.log('错误码:', entry.code);
    if (entry.context) console.log('上下文:', entry.context);
    if (entry.originalError) console.error('原始错误:', entry.originalError);
    console.groupEnd();
  } else {
    if (entry.level === 'fatal') {
      console.error(`${prefix} ${entry.message}`, entry.code || '');
    } else {
      console.warn(`${prefix} ${entry.message}`, entry.code || '');
    }
  }
}

/**
 * 创建并记录一条错误日志
 *
 * 便捷函数，自动从 error 对象中提取信息
 */
export function captureError(
  source: ErrorSource,
  error: unknown,
  context?: Record<string, unknown>,
): ErrorLogEntry {
  const code = extractErrorCode(error);
  const message = extractMessage(error);
  const level: ErrorLevel = isNetworkError(error) ? 'warn' : 'error';

  const entry: ErrorLogEntry = {
    level,
    source,
    message,
    code,
    timestamp: new Date().toISOString(),
    context,
    originalError: error,
  };

  logError(entry);
  return entry;
}

// ============================================================================
// 认证错误判断（统一逻辑，供全局使用）
// ============================================================================

/**
 * 判断错误是否为认证过期（401）
 *
 * 统一检查 status 数字字段、code 字符串字段和 message 内容
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.status === 'number' && e.status === 401) return true;
  }
  const code = extractErrorCode(error);
  if (code === '401' || code === 'PGRST301') return true;
  const msg = extractMessage(error).toLowerCase();
  return msg.includes('jwt expired') || msg.includes('not authenticated') || msg.includes('invalid token');
}
