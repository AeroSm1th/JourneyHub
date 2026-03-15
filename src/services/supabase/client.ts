// Supabase 客户端配置
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

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
