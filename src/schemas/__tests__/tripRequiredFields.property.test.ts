/**
 * 属性测试：行程必填字段
 *
 * 属性 18: 行程必填字段
 * 验证需求: 5.2
 *
 * 对于任何行程创建表单，系统应该要求用户输入行程名称、开始日期和结束日期，
 * 并拒绝缺少这些字段的提交。
 *
 * **Validates: Requirements 5.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { tripFormSchema } from '../tripSchema';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成有效的行程名称（1-200 字符，非空白） */
const arbTitle = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的开始日期 */
const arbStartDate = fc.date({
  min: new Date('2000-01-01'),
  max: new Date('2099-12-31'),
}).filter((d) => !isNaN(d.getTime()));

/**
 * 生成有效的 startDate + endDate 对
 * endDate >= startDate 且间隔 <= 365 天
 */
const arbValidDatePair = arbStartDate.chain((startDate) => {
  const maxEnd = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  return fc
    .date({ min: startDate, max: maxEnd })
    .filter((d) => !isNaN(d.getTime()))
    .map((endDate) => ({ startDate, endDate }));
});

/** 生成完整有效的行程表单数据 */
const arbValidTripForm = fc.record({
  title: arbTitle,
}).chain((base) =>
  arbValidDatePair.map((dates) => ({
    ...base,
    ...dates,
  }))
);

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 18: 行程必填字段', () => {
  /**
   * 属性 18.1: 有效的必填字段组合总是通过验证
   *
   * 需求 5.2: 创建行程时要求输入行程名称、开始日期和结束日期
   */
  it('属性 18.1: 任何有效的必填字段组合都应通过验证', () => {
    fc.assert(
      fc.property(arbValidTripForm, (formData) => {
        const result = tripFormSchema.safeParse(formData);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 18.2: 空行程名称应导致验证失败
   *
   * 需求 5.2: 行程名称为必填字段
   */
  it('属性 18.2: 空行程名称应导致验证失败', () => {
    fc.assert(
      fc.property(arbValidDatePair, ({ startDate, endDate }) => {
        const result = tripFormSchema.safeParse({
          title: '',
          startDate,
          endDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const titleError = result.error.issues.find((issue) =>
            issue.path.includes('title')
          );
          expect(titleError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 18.3: 缺少开始日期应导致验证失败
   *
   * 需求 5.2: 开始日期为必填字段
   */
  it('属性 18.3: 缺少开始日期应导致验证失败', () => {
    fc.assert(
      fc.property(arbTitle, arbStartDate, (title, endDate) => {
        const result = tripFormSchema.safeParse({
          title,
          endDate,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 18.4: 缺少结束日期应导致验证失败
   *
   * 需求 5.2: 结束日期为必填字段
   */
  it('属性 18.4: 缺少结束日期应导致验证失败', () => {
    fc.assert(
      fc.property(arbTitle, arbStartDate, (title, startDate) => {
        const result = tripFormSchema.safeParse({
          title,
          startDate,
        });
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 18.5: 结束日期早于开始日期应导致验证失败
   *
   * 需求 5.2: 结束日期不能早于开始日期
   */
  it('属性 18.5: 结束日期早于开始日期应导致验证失败', () => {
    // 生成 startDate 在 endDate 之后的日期对
    const arbInvalidDatePair = arbStartDate
      .filter((d) => d.getTime() > new Date('2000-01-02').getTime())
      .chain((startDate) => {
        const dayBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        return fc
          .date({
            min: new Date('2000-01-01'),
            max: dayBefore,
          })
          .filter((d) => !isNaN(d.getTime()))
          .map((endDate) => ({ startDate, endDate }));
      });

    fc.assert(
      fc.property(arbTitle, arbInvalidDatePair, (title, { startDate, endDate }) => {
        const result = tripFormSchema.safeParse({
          title,
          startDate,
          endDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const dateError = result.error.issues.find(
            (issue) => issue.path[0] === 'endDate'
          );
          expect(dateError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 18.6: 行程时长超过 365 天应导致验证失败
   *
   * 需求 5.2: 行程时长不能超过 365 天
   */
  it('属性 18.6: 行程时长超过 365 天应导致验证失败', () => {
    // 生成间隔 > 365 天的日期对
    const arbLongDurationPair = arbStartDate.chain((startDate) => {
      const minEnd = new Date(startDate.getTime() + 366 * 24 * 60 * 60 * 1000);
      const maxEnd = new Date(startDate.getTime() + 730 * 24 * 60 * 60 * 1000);
      // 确保 maxEnd 不超过合理范围
      if (minEnd > new Date('2100-12-31')) {
        return fc.constant({ startDate, endDate: minEnd });
      }
      const clampedMax = maxEnd > new Date('2100-12-31') ? new Date('2100-12-31') : maxEnd;
      return fc
        .date({ min: minEnd, max: clampedMax })
        .filter((d) => !isNaN(d.getTime()))
        .map((endDate) => ({ startDate, endDate }));
    });

    fc.assert(
      fc.property(arbTitle, arbLongDurationPair, (title, { startDate, endDate }) => {
        const result = tripFormSchema.safeParse({
          title,
          startDate,
          endDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const durationError = result.error.issues.find(
            (issue) => issue.path[0] === 'endDate'
          );
          expect(durationError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });
});
