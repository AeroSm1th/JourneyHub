/**
 * 属性测试：账户删除数据清理
 *
 * 属性 39: 账户删除数据清理
 * 验证需求: 12.4
 *
 * 对于任何用户账户删除操作，系统应该级联删除该用户的所有关联数据
 * （城市记录、愿望清单、行程、分享链接）
 *
 * **Validates: Requirements 12.4**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { deleteAccount } from '../api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase 客户端
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ============================================================================
// 生成器
// ============================================================================

/** 生成有效的用户 ID */
const arbUserId = fc.uuid();

/** 生成行程 ID 列表（模拟用户拥有的行程） */
const arbTripIds = fc.array(fc.uuid(), { minLength: 0, maxLength: 10 });

// ============================================================================
// 辅助函数：记录 supabase 调用顺序
// ============================================================================

interface CallRecord {
  table: string;
  operation: 'select' | 'delete';
  filterType: 'eq' | 'in';
  filterColumn: string;
  filterValue: unknown;
}

/**
 * 创建一个完整的 supabase mock，记录所有调用顺序
 * 支持 deleteAccount 中的所有链式调用模式
 */
function createOrderedMock(tripIds: string[]) {
  const callLog: CallRecord[] = [];

  vi.mocked(supabase.from).mockImplementation((table: string) => {
    const chainBuilder = {
      select: (columns?: string) => {
        const selectChain = {
          eq: (col: string, val: unknown) => {
            callLog.push({ table, operation: 'select', filterType: 'eq', filterColumn: col, filterValue: val });
            // trips 表的 select('id').eq('user_id', userId) 返回行程列表
            if (table === 'trips' && columns === 'id') {
              return Promise.resolve({
                data: tripIds.map((id) => ({ id })),
                error: null,
              });
            }
            return Promise.resolve({ data: [], error: null });
          },
        };
        return selectChain;
      },
      delete: () => {
        const deleteChain = {
          eq: (col: string, val: unknown) => {
            callLog.push({ table, operation: 'delete', filterType: 'eq', filterColumn: col, filterValue: val });
            return Promise.resolve({ data: null, error: null });
          },
          in: (col: string, val: unknown) => {
            callLog.push({ table, operation: 'delete', filterType: 'in', filterColumn: col, filterValue: val });
            return Promise.resolve({ data: null, error: null });
          },
        };
        return deleteChain;
      },
    };
    return chainBuilder as any;
  });

  return callLog;
}

/**
 * 创建一个在指定表删除时返回错误的 mock
 */
function createErrorMock(tripIds: string[], errorTable: string, errorMessage: string) {
  vi.mocked(supabase.from).mockImplementation((table: string) => {
    const chainBuilder = {
      select: (columns?: string) => ({
        eq: (_col: string, _val: unknown) => {
          if (table === 'trips' && columns === 'id') {
            return Promise.resolve({
              data: tripIds.map((id) => ({ id })),
              error: null,
            });
          }
          return Promise.resolve({ data: [], error: null });
        },
      }),
      delete: () => ({
        eq: (_col: string, _val: unknown) => {
          if (table === errorTable) {
            return Promise.resolve({ data: null, error: { message: errorMessage } });
          }
          return Promise.resolve({ data: null, error: null });
        },
        in: (_col: string, _val: unknown) => {
          if (table === errorTable) {
            return Promise.resolve({ data: null, error: { message: errorMessage } });
          }
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };
    return chainBuilder as any;
  });
}

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 39: 账户删除数据清理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 属性 39.1: 对于任何用户，deleteAccount 应删除所有关联表的数据
   *
   * 对于任何用户 ID 和任意数量的行程，deleteAccount 应该调用所有相关表的删除操作，
   * 包括：trip_tasks, trip_days, trips, shares, wishlist_items, cities, users
   *
   * **Validates: Requirements 12.4**
   */
  it('属性 39.1: deleteAccount 应删除所有关联表的数据', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, arbTripIds, async (userId, tripIds) => {
        vi.clearAllMocks();

        const callLog = createOrderedMock(tripIds);

        await deleteAccount(userId);

        // 提取所有被删除的表名
        const deletedTables = callLog
          .filter((c) => c.operation === 'delete')
          .map((c) => c.table);

        // 无论行程数量如何，trips, shares, wishlist_items, cities, users 都应被删除
        expect(deletedTables).toContain('trips');
        expect(deletedTables).toContain('shares');
        expect(deletedTables).toContain('wishlist_items');
        expect(deletedTables).toContain('cities');
        expect(deletedTables).toContain('users');

        // 如果有行程，还应删除 trip_tasks 和 trip_days
        if (tripIds.length > 0) {
          expect(deletedTables).toContain('trip_tasks');
          expect(deletedTables).toContain('trip_days');
        }
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 39.2: 删除顺序应正确（子记录在父记录之前）
   *
   * 删除顺序必须是：trip_tasks → trip_days → trips → shares → wishlist_items → cities → users
   * 确保子记录在父记录之前被删除，避免外键约束冲突
   *
   * **Validates: Requirements 12.4**
   */
  it('属性 39.2: 删除顺序应正确（子记录在父记录之前）', async () => {
    // 使用至少有一个行程的场景，以验证完整的删除顺序
    const arbNonEmptyTripIds = fc.array(fc.uuid(), { minLength: 1, maxLength: 10 });

    await fc.assert(
      fc.asyncProperty(arbUserId, arbNonEmptyTripIds, async (userId, tripIds) => {
        vi.clearAllMocks();

        const callLog = createOrderedMock(tripIds);

        await deleteAccount(userId);

        // 提取删除操作的表名顺序
        const deleteOrder = callLog
          .filter((c) => c.operation === 'delete')
          .map((c) => c.table);

        // 定义期望的完整删除顺序
        const expectedOrder = [
          'trip_tasks',
          'trip_days',
          'trips',
          'shares',
          'wishlist_items',
          'cities',
          'users',
        ];

        // 验证实际删除顺序与期望一致
        expect(deleteOrder).toEqual(expectedOrder);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 39.3: 任何删除步骤失败时应抛出描述性错误
   *
   * 如果任何一个表的删除操作失败，deleteAccount 应该抛出包含描述性消息的错误
   *
   * **Validates: Requirements 12.4**
   */
  it('属性 39.3: 任何删除步骤失败时应抛出描述性错误', async () => {
    // 可能失败的表（有行程时的完整列表）
    const failableTables = [
      'trip_tasks',
      'trip_days',
      'trips',
      'shares',
      'wishlist_items',
      'cities',
      'users',
    ] as const;

    const arbErrorTable = fc.constantFrom(...failableTables);
    const arbErrorMsg = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);
    // 至少一个行程，确保 trip_tasks 和 trip_days 的删除路径被触发
    const arbNonEmptyTripIds = fc.array(fc.uuid(), { minLength: 1, maxLength: 5 });

    await fc.assert(
      fc.asyncProperty(
        arbUserId,
        arbNonEmptyTripIds,
        arbErrorTable,
        arbErrorMsg,
        async (userId, tripIds, errorTable, errorMsg) => {
          vi.clearAllMocks();

          createErrorMock(tripIds, errorTable, errorMsg);

          // 应该抛出错误
          await expect(deleteAccount(userId)).rejects.toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 39.4: 用户没有数据时（空表）也应正常完成删除
   *
   * 当用户没有任何行程时，deleteAccount 仍应成功执行，
   * 跳过 trip_tasks 和 trip_days 的删除，但仍删除其他表
   *
   * **Validates: Requirements 12.4**
   */
  it('属性 39.4: 用户没有行程数据时也应正常完成删除', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, async (userId) => {
        vi.clearAllMocks();

        // 空行程列表
        const callLog = createOrderedMock([]);

        // 不应抛出错误
        await deleteAccount(userId);

        // 提取删除操作
        const deleteOps = callLog.filter((c) => c.operation === 'delete');
        const deletedTables = deleteOps.map((c) => c.table);

        // 不应删除 trip_tasks 和 trip_days（因为没有行程）
        expect(deletedTables).not.toContain('trip_tasks');
        expect(deletedTables).not.toContain('trip_days');

        // 但应删除其他表
        expect(deletedTables).toContain('trips');
        expect(deletedTables).toContain('shares');
        expect(deletedTables).toContain('wishlist_items');
        expect(deletedTables).toContain('cities');
        expect(deletedTables).toContain('users');
      }),
      { numRuns: 100 },
    );
  });
});
