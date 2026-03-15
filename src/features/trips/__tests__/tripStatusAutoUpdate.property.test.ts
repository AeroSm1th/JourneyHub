/**
 * 属性测试：行程状态自动更新
 *
 * 属性 20: 行程状态自动更新
 * 验证需求: 5.9
 *
 * 对于任何行程，当当前日期超过结束日期时，系统应该在列表中将其标记为已完成状态。
 * computeTripStatus 根据日期自动判断行程状态：
 * - start_date > today → Planning
 * - start_date <= today <= end_date → Ongoing
 * - end_date < today → Completed
 *
 * **Validates: Requirements 5.9**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeTripStatus } from '@/components/trip/TripList';
import { TripStatus } from '@/types/entities';
import type { Trip } from '@/types/database';

// ============================================================================
// 辅助工具
// ============================================================================

/** 格式化日期为 YYYY-MM-DD 字符串 */
const formatDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** 获取今天的日期（零时） */
const getToday = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

/** 构建一个最小化的 Trip 对象用于测试 computeTripStatus */
const buildTrip = (startDate: string, endDate: string): Trip => ({
  id: '00000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000002',
  title: 'Test Trip',
  start_date: startDate,
  end_date: endDate,
  status: 'planning',
  share_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// ============================================================================
// 日期生成器
// ============================================================================

/** 生成未来的日期（start_date > today），偏移 1~365 天 */
const arbFutureDateStr = fc.integer({ min: 1, max: 365 }).map((offset) => {
  const d = getToday();
  d.setDate(d.getDate() + offset);
  return formatDate(d);
});

/** 生成过去的日期（end_date < today），偏移 1~365 天 */
const arbPastDateStr = fc.integer({ min: 1, max: 365 }).map((offset) => {
  const d = getToday();
  d.setDate(d.getDate() - offset);
  return formatDate(d);
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 20: 行程状态自动更新', () => {
  /**
   * 属性 20.1: 未来开始的行程应为 Planning 状态
   *
   * 对于任何 start_date 在未来的行程，computeTripStatus 应返回 Planning
   */
  it('属性 20.1: start_date 在未来的行程应返回 Planning 状态', () => {
    fc.assert(
      fc.property(
        arbFutureDateStr,
        fc.integer({ min: 0, max: 365 }),
        (startDateStr, extraDays) => {
          // end_date >= start_date
          const startDate = new Date(startDateStr);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + extraDays);
          const endDateStr = formatDate(endDate);

          const trip = buildTrip(startDateStr, endDateStr);
          const status = computeTripStatus(trip);
          expect(status).toBe(TripStatus.Planning);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 20.2: 结束日期已过的行程应为 Completed 状态
   *
   * 对于任何 end_date 在过去的行程，computeTripStatus 应返回 Completed
   */
  it('属性 20.2: end_date 在过去的行程应返回 Completed 状态', () => {
    fc.assert(
      fc.property(
        arbPastDateStr,
        fc.integer({ min: 0, max: 365 }),
        (endDateStr, extraDays) => {
          // start_date <= end_date，且都在过去
          const endDate = new Date(endDateStr);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - extraDays);
          const startDateStr = formatDate(startDate);

          const trip = buildTrip(startDateStr, endDateStr);
          const status = computeTripStatus(trip);
          expect(status).toBe(TripStatus.Completed);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 20.3: 今天在 start_date 和 end_date 之间的行程应为 Ongoing 状态
   *
   * 对于任何 start_date <= today <= end_date 的行程，computeTripStatus 应返回 Ongoing
   */
  it('属性 20.3: today 在 start_date 和 end_date 之间（含）的行程应返回 Ongoing 状态', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 365 }),
        fc.integer({ min: 0, max: 365 }),
        (pastOffset, futureOffset) => {
          // start_date = today - pastOffset, end_date = today + futureOffset
          const today = getToday();
          const startDate = new Date(today);
          startDate.setDate(startDate.getDate() - pastOffset);
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() + futureOffset);

          const trip = buildTrip(formatDate(startDate), formatDate(endDate));
          const status = computeTripStatus(trip);
          expect(status).toBe(TripStatus.Ongoing);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 20.4: computeTripStatus 始终返回三种有效状态之一
   *
   * 对于任何有效的行程日期组合，返回值必须是 Planning、Ongoing 或 Completed
   */
  it('属性 20.4: computeTripStatus 始终返回有效的 TripStatus 值', () => {
    const validStatuses = [TripStatus.Planning, TripStatus.Ongoing, TripStatus.Completed];

    fc.assert(
      fc.property(
        fc.integer({ min: -730, max: 730 }),
        fc.integer({ min: 0, max: 365 }),
        (startOffset, duration) => {
          const today = getToday();
          const startDate = new Date(today);
          startDate.setDate(startDate.getDate() + startOffset);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + duration);

          const trip = buildTrip(formatDate(startDate), formatDate(endDate));
          const status = computeTripStatus(trip);
          expect(validStatuses).toContain(status);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * 属性 20.5: computeTripStatus 是确定性的——相同行程始终产生相同状态
   *
   * 对于任何行程，多次调用 computeTripStatus 应返回相同的结果
   */
  it('属性 20.5: 相同行程多次调用 computeTripStatus 应返回相同状态', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -730, max: 730 }),
        fc.integer({ min: 0, max: 365 }),
        (startOffset, duration) => {
          const today = getToday();
          const startDate = new Date(today);
          startDate.setDate(startDate.getDate() + startOffset);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + duration);

          const trip = buildTrip(formatDate(startDate), formatDate(endDate));

          const status1 = computeTripStatus(trip);
          const status2 = computeTripStatus(trip);
          const status3 = computeTripStatus(trip);

          expect(status1).toBe(status2);
          expect(status2).toBe(status3);
        },
      ),
      { numRuns: 100 },
    );
  });
});
