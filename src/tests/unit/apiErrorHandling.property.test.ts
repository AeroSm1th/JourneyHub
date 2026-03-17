/**
 * 属性 35: API 错误处理
 *
 * 验证需求 9.6: WHEN API 请求失败，THE System SHALL 显示用户友好的错误提示
 * 验证需求 9.7: THE System SHALL 记录错误日志到控制台以便调试
 *
 * 核心属性：
 * - 对于任意 PostgreSQL 错误码，mapDbError 应返回非空的用户友好消息（非原始错误码）
 * - 对于任意 Supabase 错误码，mapDbError 应返回非空的用户友好消息
 * - 对于任意 401/403 错误，认证错误处理器应正确识别并分类
 * - captureError 对于任意错误输入都应返回结构化的日志条目
 * - 全局 QueryClient 的 retry 策略应对认证/数据库错误返回 false
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { mapDbError, isDbError, type DbErrorResult } from '@/utils/dbErrorHandler';
import { is401Error, is403Error } from '@/utils/authErrorHandler';
import { captureError, type ErrorLogEntry } from '@/utils/errorLogger';

// ============================================================================
// 已知错误码生成器
// ============================================================================

/** 已知的 PostgreSQL 错误码 */
const knownPgCodes = [
  '23505',
  '23503',
  '23502',
  '23514',
  '23001',
  '22001',
  '22003',
  '22P02',
  '22012',
  '40001',
  '40P01',
  '42501',
  '42P01',
  '42703',
  '08000',
  '08003',
  '08006',
];

/** 已知的 Supabase PostgREST 错误码 */
const knownSupabaseCodes = ['PGRST116', 'PGRST204', 'PGRST301', 'PGRST102'];

/** 生成带有 code 字段的错误对象 */
const errorWithCode = (code: string) => ({ code, message: `Error with code ${code}` });

/** 生成随机的未知错误码（不在已知映射中） */
const unknownPgCode = fc.stringMatching(/^[0-9]{5}$/).filter((c) => !knownPgCodes.includes(c));

// ============================================================================
// 静默 console 输出（避免测试日志污染）
// ============================================================================

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 35: API 错误处理', () => {
  // --------------------------------------------------------------------------
  // 9.6: 用户友好的错误提示
  // --------------------------------------------------------------------------

  describe('mapDbError: PostgreSQL 错误码映射', () => {
    it('对于任意已知 PG 错误码，应返回非空的中文用户消息', () => {
      fc.assert(
        fc.property(fc.constantFrom(...knownPgCodes), (code) => {
          const result: DbErrorResult = mapDbError(errorWithCode(code));

          // 消息非空
          expect(result.userMessage).toBeTruthy();
          // 消息不应是原始错误码
          expect(result.userMessage).not.toBe(code);
          // 消息不应包含英文技术术语（应为中文友好消息）
          expect(result.userMessage).not.toMatch(/^Error/i);
          // category 应为有效值
          expect([
            'unique',
            'foreign_key',
            'rls',
            'constraint',
            'connection',
            'not_found',
            'unknown',
          ]).toContain(result.category);
        })
      );
    });

    it('对于任意已知 Supabase 错误码，应返回非空的中文用户消息', () => {
      fc.assert(
        fc.property(fc.constantFrom(...knownSupabaseCodes), (code) => {
          const result: DbErrorResult = mapDbError(errorWithCode(code));

          expect(result.userMessage).toBeTruthy();
          expect(result.userMessage).not.toBe(code);
          expect(result.userMessage).not.toMatch(/^Error/i);
        })
      );
    });

    it('对于任意未知错误码，应返回兜底消息而非抛出异常', () => {
      fc.assert(
        fc.property(unknownPgCode, (code) => {
          const result: DbErrorResult = mapDbError(errorWithCode(code));

          // 不应抛出异常，应返回有效结果
          expect(result.userMessage).toBeTruthy();
          expect(result.category).toBeDefined();
        })
      );
    });

    it('对于任意字符串错误消息，mapDbError 不应抛出异常', () => {
      fc.assert(
        fc.property(fc.string(), (msg) => {
          const result: DbErrorResult = mapDbError(msg);

          expect(result.userMessage).toBeTruthy();
          expect(result.category).toBe('unknown');
        })
      );
    });

    it('对于 null/undefined/数字等非标准输入，mapDbError 不应抛出异常', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.constant(null), fc.constant(undefined), fc.integer(), fc.boolean()),
          (input) => {
            const result: DbErrorResult = mapDbError(input);

            expect(result.userMessage).toBeTruthy();
            expect(result.category).toBe('unknown');
          }
        )
      );
    });
  });

  describe('mapDbError: 错误分类正确性', () => {
    it('唯一性约束错误（23505）应分类为 unique', () => {
      const result = mapDbError(errorWithCode('23505'));
      expect(result.category).toBe('unique');
    });

    it('外键约束错误（23503）应分类为 foreign_key', () => {
      const result = mapDbError(errorWithCode('23503'));
      expect(result.category).toBe('foreign_key');
    });

    it('RLS 权限错误（42501）应分类为 rls', () => {
      const result = mapDbError(errorWithCode('42501'));
      expect(result.category).toBe('rls');
    });

    it('连接错误（08xxx）应分类为 connection', () => {
      fc.assert(
        fc.property(fc.constantFrom('08000', '08003', '08006'), (code) => {
          const result = mapDbError(errorWithCode(code));
          expect(result.category).toBe('connection');
        })
      );
    });

    it('PGRST116/PGRST204 应分类为 not_found', () => {
      fc.assert(
        fc.property(fc.constantFrom('PGRST116', 'PGRST204'), (code) => {
          const result = mapDbError(errorWithCode(code));
          expect(result.category).toBe('not_found');
        })
      );
    });

    it('包含 RLS 关键词的错误消息应分类为 rls', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'new row violates row-level security policy',
            'row-level security violation'
          ),
          (msg) => {
            const result = mapDbError(new Error(msg));
            expect(result.category).toBe('rls');
          }
        )
      );
    });

    it('包含 duplicate key 的错误消息应分类为 unique', () => {
      const result = mapDbError(new Error('duplicate key value violates unique constraint'));
      expect(result.category).toBe('unique');
    });

    it('包含 foreign key 的错误消息应分类为 foreign_key', () => {
      const result = mapDbError(new Error('violates foreign key constraint'));
      expect(result.category).toBe('foreign_key');
    });
  });

  describe('isDbError: 数据库错误识别', () => {
    it('对于任意 5 位数字错误码，应识别为数据库错误', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^[0-9]{5}$/), (code) => {
          expect(isDbError({ code })).toBe(true);
        })
      );
    });

    it('对于任意 PGRST 前缀错误码，应识别为数据库错误', () => {
      fc.assert(
        fc.property(fc.constantFrom(...knownSupabaseCodes), (code) => {
          expect(isDbError({ code })).toBe(true);
        })
      );
    });

    it('对于无 code 字段的对象，不应识别为数据库错误', () => {
      fc.assert(
        fc.property(fc.string(), (msg) => {
          expect(isDbError({ message: msg })).toBe(false);
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // 认证错误识别
  // --------------------------------------------------------------------------

  describe('is401Error / is403Error: 认证错误识别', () => {
    it('status=401 的对象应被 is401Error 识别', () => {
      fc.assert(
        fc.property(fc.string(), (msg) => {
          expect(is401Error({ status: 401, message: msg })).toBe(true);
        })
      );
    });

    it('status=403 的对象应被 is403Error 识别', () => {
      fc.assert(
        fc.property(fc.string(), (msg) => {
          expect(is403Error({ status: 403, message: msg })).toBe(true);
        })
      );
    });

    it('包含 JWT expired 的 Error 应被 is401Error 识别', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('JWT expired', 'not authenticated', 'invalid token'),
          (keyword) => {
            expect(is401Error(new Error(keyword))).toBe(true);
          }
        )
      );
    });

    it('包含 permission denied 的 Error 应被 is403Error 识别', () => {
      fc.assert(
        fc.property(fc.constantFrom('permission denied', 'row-level security'), (keyword) => {
          expect(is403Error(new Error(keyword))).toBe(true);
        })
      );
    });

    it('对于任意非 401/403 状态码，两者都应返回 false', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 599 }).filter((s) => s !== 401 && s !== 403),
          (status) => {
            const err = { status, message: 'some error' };
            expect(is401Error(err)).toBe(false);
            expect(is403Error(err)).toBe(false);
          }
        )
      );
    });

    it('is401Error 和 is403Error 对同一错误应互斥', () => {
      fc.assert(
        fc.property(fc.constantFrom(401, 403), (status) => {
          const err = { status, message: 'error' };
          // 不应同时为 true
          expect(is401Error(err) && is403Error(err)).toBe(false);
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // 9.7: 错误日志记录
  // --------------------------------------------------------------------------

  describe('captureError: 结构化日志记录', () => {
    it('对于任意 Error 对象，应返回包含 message 的日志条目', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (msg) => {
          const entry: ErrorLogEntry = captureError('unknown', new Error(msg));

          expect(entry.message).toBe(msg);
          expect(entry.source).toBe('unknown');
          expect(entry.level).toBeDefined();
          expect(entry.timestamp).toBeTruthy();
          // timestamp 应为有效的 ISO 日期
          expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
        })
      );
    });

    it('对于任意错误来源，应正确设置 source 字段', () => {
      const validSources = [
        'query',
        'mutation',
        'supabase',
        'auth',
        'network',
        'render',
        'unknown',
      ] as const;

      fc.assert(
        fc.property(fc.constantFrom(...validSources), (source) => {
          const entry = captureError(source, new Error('test'));
          expect(entry.source).toBe(source);
        })
      );
    });

    it('对于任意上下文对象，应在日志条目中保留', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
            fc.oneof(fc.string(), fc.integer(), fc.boolean())
          ),
          (context) => {
            const entry = captureError('unknown', new Error('test'), context);
            expect(entry.context).toEqual(context);
          }
        )
      );
    });

    it('网络错误（Failed to fetch）应标记为 warn 级别', () => {
      const entry = captureError('network', new TypeError('Failed to fetch'));
      expect(entry.level).toBe('warn');
    });

    it('非网络错误应标记为 error 级别', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s !== 'Failed to fetch'),
          (msg) => {
            const entry = captureError('unknown', new Error(msg));
            expect(entry.level).toBe('error');
          }
        )
      );
    });

    it('带有 code 字段的错误对象应提取错误码', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^[0-9A-Z]{3,10}$/), (code) => {
          const entry = captureError('supabase', { code, message: 'db error' });
          expect(entry.code).toBe(code);
        })
      );
    });

    it('带有 status 数字字段的错误对象应提取为错误码', () => {
      fc.assert(
        fc.property(fc.integer({ min: 100, max: 599 }), (status) => {
          const entry = captureError('supabase', { status, message: 'http error' });
          expect(entry.code).toBe(String(status));
        })
      );
    });

    it('对于字符串类型的错误，应直接作为 message', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (msg) => {
          const entry = captureError('unknown', msg);
          expect(entry.message).toBe(msg);
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // 综合属性：错误处理链的一致性
  // --------------------------------------------------------------------------

  describe('错误处理链一致性', () => {
    it('mapDbError 的返回值结构对于任意输入都应完整', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.record({ code: fc.string(), message: fc.string() }),
            fc.string(),
            fc.constant(new Error('test')),
            fc.constant(null)
          ),
          (error) => {
            const result = mapDbError(error);

            // 结构完整性
            expect(result).toHaveProperty('userMessage');
            expect(result).toHaveProperty('handled');
            expect(result).toHaveProperty('category');
            expect(typeof result.userMessage).toBe('string');
            expect(typeof result.handled).toBe('boolean');
            expect(typeof result.category).toBe('string');
          }
        )
      );
    });

    it('captureError 的返回值结构对于任意输入都应完整', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(new Error('test')),
            fc.string(),
            fc.constant({ code: '23505', message: 'dup' }),
            fc.constant(null),
            fc.integer()
          ),
          (error) => {
            const entry = captureError('unknown', error);

            expect(entry).toHaveProperty('level');
            expect(entry).toHaveProperty('source');
            expect(entry).toHaveProperty('message');
            expect(entry).toHaveProperty('timestamp');
            expect(['warn', 'error', 'fatal']).toContain(entry.level);
          }
        )
      );
    });
  });
});
