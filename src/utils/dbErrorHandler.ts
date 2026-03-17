/**
 * 数据库错误处理模块
 *
 * 将 Supabase / PostgreSQL 错误码映射为用户友好的中文消息，
 * 并统一处理唯一性约束、外键约束违反和 RLS 策略拒绝。
 *
 * 验证需求: 9.6
 */

import { toast } from '@/store/toastStore';
import { captureError, extractErrorCode, extractMessage } from '@/utils/errorLogger';

// ============================================================================
// PostgreSQL 错误码 → 用户消息映射
// 参考: https://www.postgresql.org/docs/current/errcodes-appendix.html
// ============================================================================

const PG_ERROR_MAP: Record<string, string> = {
  '23505': '该记录已存在，请勿重复添加',
  '23503': '操作失败：关联的数据不存在或已被删除',
  '23502': '必填字段不能为空',
  '23514': '输入的数据不符合要求，请检查后重试',
  '23001': '无法删除：该记录被其他数据引用',
  '22001': '输入内容过长，请缩短后重试',
  '22003': '输入的数值超出允许范围',
  '22P02': '输入的数据格式不正确',
  '22012': '计算错误：除数不能为零',
  '40001': '操作冲突，请稍后重试',
  '40P01': '服务器繁忙，请稍后重试',
  '42501': '权限不足，无法执行此操作',
  '42P01': '系统配置错误，请联系管理员',
  '42703': '系统配置错误，请联系管理员',
  '08000': '数据库连接失败，请检查网络后重试',
  '08003': '数据库连接已断开，请刷新页面重试',
  '08006': '数据库连接失败，请稍后重试',
};

// Supabase 特有的错误码
const SUPABASE_ERROR_MAP: Record<string, string> = {
  PGRST116: '未找到匹配的记录',
  PGRST204: '未找到匹配的记录',
  PGRST301: '登录已过期，请重新登录',
  PGRST102: '请求数据过大，请减少数据量',
};

// ============================================================================
// 错误类型判断（复用 errorLogger 的统一提取函数）
// ============================================================================

/** 从错误消息中检测 RLS 拒绝 */
function isRlsDenied(error: unknown): boolean {
  const msg = extractMessage(error).toLowerCase();
  return (
    msg.includes('row-level security') ||
    msg.includes('new row violates row-level security') ||
    msg.includes('rls') ||
    (msg.includes('policy') && msg.includes('permission'))
  );
}

/** 从错误消息中检测唯一性约束违反 */
function isUniqueViolation(error: unknown): boolean {
  const code = extractErrorCode(error);
  if (code === '23505') return true;
  const msg = extractMessage(error).toLowerCase();
  return msg.includes('duplicate key') || msg.includes('unique constraint');
}

/** 从错误消息中检测外键约束违反 */
function isForeignKeyViolation(error: unknown): boolean {
  const code = extractErrorCode(error);
  if (code === '23503' || code === '23001') return true;
  const msg = extractMessage(error).toLowerCase();
  return msg.includes('foreign key') || msg.includes('violates foreign key');
}

// ============================================================================
// 核心处理函数
// ============================================================================

export interface DbErrorResult {
  /** 用户友好的消息 */
  userMessage: string;
  /** 是否已被处理（已显示 toast） */
  handled: boolean;
  /** 错误分类 */
  category: 'unique' | 'foreign_key' | 'rls' | 'constraint' | 'connection' | 'not_found' | 'unknown';
}

/**
 * 将数据库错误转换为用户友好的消息
 *
 * 不显示 toast，仅返回映射结果。
 * 适用于需要自定义 UI 反馈的场景。
 */
export function mapDbError(error: unknown): DbErrorResult {
  const code = extractErrorCode(error);

  // 1. RLS 策略拒绝
  if (isRlsDenied(error) || code === '42501') {
    return { userMessage: '权限不足，无法执行此操作', handled: false, category: 'rls' };
  }

  // 2. 唯一性约束
  if (isUniqueViolation(error)) {
    return { userMessage: PG_ERROR_MAP['23505'], handled: false, category: 'unique' };
  }

  // 3. 外键约束
  if (isForeignKeyViolation(error)) {
    const msg = code === '23001'
      ? PG_ERROR_MAP['23001']
      : PG_ERROR_MAP['23503'];
    return { userMessage: msg, handled: false, category: 'foreign_key' };
  }

  // 4. 按 PostgreSQL 错误码查找
  if (code && PG_ERROR_MAP[code]) {
    const category = code.startsWith('08') ? 'connection' : 'constraint';
    return { userMessage: PG_ERROR_MAP[code], handled: false, category };
  }

  // 5. 按 Supabase 错误码查找
  if (code && SUPABASE_ERROR_MAP[code]) {
    const category = code === 'PGRST116' || code === 'PGRST204' ? 'not_found' : 'unknown';
    return { userMessage: SUPABASE_ERROR_MAP[code], handled: false, category };
  }

  // 6. 兜底
  return {
    userMessage: '操作失败，请稍后重试',
    handled: false,
    category: 'unknown',
  };
}

/**
 * 处理数据库错误：映射消息 + 显示 toast + 记录日志
 *
 * 返回 true 表示错误已被处理，调用方无需再处理。
 */
export function handleDbError(
  error: unknown,
  context?: Record<string, unknown>,
): boolean {
  const result = mapDbError(error);

  // 记录错误日志
  captureError('supabase', error, {
    ...context,
    dbCategory: result.category,
    userMessage: result.userMessage,
  });

  // 显示用户提示
  toast.error(result.userMessage);

  return true;
}

/**
 * 判断错误是否为数据库错误（非认证类）
 *
 * 用于在全局错误处理中区分数据库错误和认证错误
 */
export function isDbError(error: unknown): boolean {
  const code = extractErrorCode(error);
  if (!code) return false;

  // PostgreSQL 错误码格式：5 位字符
  if (/^\d{5}$/.test(code)) return true;

  // Supabase PostgREST 错误码
  if (code.startsWith('PGRST')) return true;

  return false;
}
