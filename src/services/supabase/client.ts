// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { captureError } from '@/utils/errorLogger';
import { logSecurityAudit } from '@/utils/authErrorHandler';

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * 自定义 fetch 包装器
 *
 * 拦截所有 Supabase 请求，对非 2xx 响应记录错误日志。
 * 认证过期（401）时自动触发登出。
 */
const interceptedFetch: typeof fetch = async (input, init) => {
  try {
    const response = await fetch(input, init);

    // 对非 2xx 响应记录日志
    if (!response.ok) {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
      captureError('supabase', { status: response.status, message: response.statusText }, {
        url,
        method: init?.method || 'GET',
      });

      // 401/403 认证相关错误：记录安全审计日志
      // 注意：实际的登出和重定向由 App.tsx 的全局错误处理统一执行，
      // 这里只做审计日志记录，避免在 fetch 层和 query 层重复处理
      if (response.status === 401) {
        logSecurityAudit({
          event: 'AUTH_EXPIRED',
          timestamp: new Date().toISOString(),
          details: { url, method: init?.method || 'GET', layer: 'fetch-interceptor' },
        });
      } else if (response.status === 403) {
        logSecurityAudit({
          event: 'ACCESS_DENIED',
          timestamp: new Date().toISOString(),
          details: { url, method: init?.method || 'GET', layer: 'fetch-interceptor' },
        });
      }
    }

    return response;
  } catch (error) {
    // 网络错误（断网、DNS 失败等）
    captureError('network', error, {
      url: typeof input === 'string' ? input : '',
    });
    throw error;
  }
};

// 创建 Supabase 客户端实例
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 认证持久化配置
    persistSession: true, // 持久化会话到 localStorage
    autoRefreshToken: true, // 自动刷新令牌
    detectSessionInUrl: true, // 从 URL 中检测会话（用于邮箱确认等）
    storage: window.localStorage, // 使用 localStorage 存储会话
    storageKey: 'journey-hub-auth', // 自定义存储键名
  },
  db: {
    schema: 'public', // 使用 public schema
  },
  global: {
    headers: {
      'x-application-name': 'journey-hub', // 自定义请求头，用于标识应用
    },
    fetch: interceptedFetch, // 使用自定义 fetch 拦截器
  },
  realtime: {
    // 实时订阅配置（可选）
    params: {
      eventsPerSecond: 10, // 每秒最多接收 10 个事件
    },
  },
});

// 导出类型化的 Supabase 客户端
export type SupabaseClient = typeof supabase;
