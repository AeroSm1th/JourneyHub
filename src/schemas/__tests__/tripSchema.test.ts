/**
 * 行程表单验证 Schema 单元测试
 *
 * 测试所有行程相关的 Zod schema 验证规则、边界条件和错误消息
 */

import { describe, it, expect } from 'vitest';
import {
  tripFormSchema,
  tripUpdateSchema,
  tripDayFormSchema,
  tripDayUpdateSchema,
  tripTaskFormSchema,
  tripTaskUpdateSchema,
  tripFilterSchema,
  createShareSchema,
} from '../tripSchema';
import { TripStatus } from '@/types/entities';

describe('tripFormSchema', () => {
  describe('必填字段验证', () => {
    it('应该接受有效的行程表单', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-06-10');

      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate,
        endDate,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝空的行程名称', () => {
      const result = tripFormSchema.safeParse({
        title: '',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('行程名称不能为空');
      }
    });

    it('应该拒绝超过 200 字符的行程名称', () => {
      const longTitle = 'a'.repeat(201);
      const result = tripFormSchema.safeParse({
        title: longTitle,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('行程名称不能超过 200 个字符');
      }
    });

    it('应该自动去除行程名称的首尾空格', () => {
      const result = tripFormSchema.safeParse({
        title: '  日本之旅  ',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('日本之旅');
      }
    });
  });

  describe('日期验证', () => {
    it('应该接受结束日期等于开始日期', () => {
      const date = new Date('2024-06-01');
      const result = tripFormSchema.safeParse({
        title: '一日游',
        startDate: date,
        endDate: date,
      });

      expect(result.success).toBe(true);
    });

    it('应该接受结束日期晚于开始日期', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝结束日期早于开始日期', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-01'),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const dateError = result.error.issues.find((issue) => issue.path[0] === 'endDate');
        expect(dateError?.message).toBe('结束日期不能早于开始日期');
      }
    });

    it('应该拒绝超过 365 天的行程', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-01-02'); // 366 天

      const result = tripFormSchema.safeParse({
        title: '超长旅行',
        startDate,
        endDate,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const durationError = result.error.issues.find((issue) => issue.path[0] === 'endDate');
        expect(durationError?.message).toBe('行程时长不能超过 365 天');
      }
    });

    it('应该接受正好 365 天的行程', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31'); // 正好 365 天（2024 是闰年，所以用 12-31）

      const result = tripFormSchema.safeParse({
        title: '环球旅行',
        startDate,
        endDate,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('可选字段验证', () => {
    it('应该接受有效的 UUID 格式的城市 ID', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        relatedCityId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的 UUID 格式', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        relatedCityId: 'invalid-uuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('城市 ID 格式不正确');
      }
    });

    it('应该接受有效的预算金额', () => {
      const validBudgets = [100, 1000.5, 999999999.99];

      validBudgets.forEach((budget) => {
        const result = tripFormSchema.safeParse({
          title: '日本之旅',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          budget,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝负数或零的预算', () => {
      const invalidBudgets = [0, -100, -0.01];

      invalidBudgets.forEach((budget) => {
        const result = tripFormSchema.safeParse({
          title: '日本之旅',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          budget,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('预算必须大于 0');
        }
      });
    });

    it('应该拒绝超过最大值的预算', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        budget: 1000000000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('预算金额过大');
      }
    });

    it('应该接受 3 位货币代码并转换为大写', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        currency: 'usd',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });

    it('应该拒绝非 3 位的货币代码', () => {
      const invalidCurrencies = ['US', 'USDD', ''];

      invalidCurrencies.forEach((currency) => {
        const result = tripFormSchema.safeParse({
          title: '日本之旅',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-10'),
          currency,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('货币代码必须是 3 个字符');
        }
      });
    });

    it('应该为货币设置默认值 CNY', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('CNY');
      }
    });

    it('应该接受有效的交通方式和住宿信息', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        transportation: '飞机 + 地铁',
        accommodation: '酒店',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝超过 200 字符的交通方式', () => {
      const longTransportation = 'a'.repeat(201);
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        transportation: longTransportation,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('交通方式不能超过 200 个字符');
      }
    });

    it('应该接受有效的备注 (最多 5000 字符)', () => {
      const validNotes = 'a'.repeat(5000);
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        notes: validNotes,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝超过 5000 字符的备注', () => {
      const longNotes = 'a'.repeat(5001);
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        notes: longNotes,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('备注不能超过 5000 个字符');
      }
    });

    it('应该为分享启用设置默认值 false', () => {
      const result = tripFormSchema.safeParse({
        title: '日本之旅',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shareEnabled).toBe(false);
      }
    });
  });
});

describe('tripUpdateSchema', () => {
  it('应该允许部分更新（所有字段可选）', () => {
    const result = tripUpdateSchema.safeParse({
      title: '更新后的行程名称',
    });

    expect(result.success).toBe(true);
  });

  it('应该验证提供的日期字段', () => {
    const result = tripUpdateSchema.safeParse({
      startDate: new Date('2024-06-10'),
      endDate: new Date('2024-06-01'),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((issue) => issue.path[0] === 'endDate');
      expect(dateError?.message).toBe('结束日期不能早于开始日期');
    }
  });

  it('应该允许只更新开始日期', () => {
    const result = tripUpdateSchema.safeParse({
      startDate: new Date('2024-06-01'),
    });

    expect(result.success).toBe(true);
  });
});

describe('tripDayFormSchema', () => {
  describe('日程索引验证', () => {
    it('应该接受有效的日程索引 (从 1 开始)', () => {
      const validIndices = [1, 2, 10, 100];

      validIndices.forEach((dayIndex) => {
        const result = tripDayFormSchema.safeParse({
          dayIndex,
          date: new Date('2024-06-01'),
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝小于 1 的日程索引', () => {
      const invalidIndices = [0, -1, -10];

      invalidIndices.forEach((dayIndex) => {
        const result = tripDayFormSchema.safeParse({
          dayIndex,
          date: new Date('2024-06-01'),
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('日程索引必须从 1 开始');
        }
      });
    });

    it('应该拒绝非整数的日程索引', () => {
      const result = tripDayFormSchema.safeParse({
        dayIndex: 1.5,
        date: new Date('2024-06-01'),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('日程索引必须是整数');
      }
    });
  });

  describe('可选字段验证', () => {
    it('应该接受有效的标题和备注', () => {
      const result = tripDayFormSchema.safeParse({
        dayIndex: 1,
        date: new Date('2024-06-01'),
        title: '第一天：东京观光',
        notes: '参观浅草寺、晴空塔',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝超过 200 字符的标题', () => {
      const longTitle = 'a'.repeat(201);
      const result = tripDayFormSchema.safeParse({
        dayIndex: 1,
        date: new Date('2024-06-01'),
        title: longTitle,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('标题不能超过 200 个字符');
      }
    });

    it('应该拒绝超过 2000 字符的备注', () => {
      const longNotes = 'a'.repeat(2001);
      const result = tripDayFormSchema.safeParse({
        dayIndex: 1,
        date: new Date('2024-06-01'),
        notes: longNotes,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('备注不能超过 2000 个字符');
      }
    });
  });
});

describe('tripTaskFormSchema', () => {
  describe('待办事项内容验证', () => {
    it('应该接受有效的待办事项内容', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '预订酒店',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝空的待办事项内容', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('待办事项内容不能为空');
      }
    });

    it('应该拒绝超过 500 字符的待办事项内容', () => {
      const longContent = 'a'.repeat(501);
      const result = tripTaskFormSchema.safeParse({
        content: longContent,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('待办事项内容不能超过 500 个字符');
      }
    });

    it('应该自动去除内容的首尾空格', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '  预订酒店  ',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.content).toBe('预订酒店');
      }
    });
  });

  describe('可选字段验证', () => {
    it('应该接受有效的日程 ID', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '预订酒店',
        dayId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的日程 ID 格式', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '预订酒店',
        dayId: 'invalid-uuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('日程 ID 格式不正确');
      }
    });

    it('应该为完成状态设置默认值 false', () => {
      const result = tripTaskFormSchema.safeParse({
        content: '预订酒店',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDone).toBe(false);
      }
    });
  });
});

describe('tripFilterSchema', () => {
  describe('状态筛选验证', () => {
    it('应该接受有效的行程状态', () => {
      const validStatuses = [TripStatus.Planning, TripStatus.Ongoing, TripStatus.Completed];

      validStatuses.forEach((status) => {
        const result = tripFilterSchema.safeParse({
          status,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的行程状态', () => {
      const result = tripFilterSchema.safeParse({
        status: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('预算筛选验证', () => {
    it('应该接受有效的预算范围', () => {
      const result = tripFilterSchema.safeParse({
        minBudget: 1000,
        maxBudget: 5000,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝最大预算小于最小预算', () => {
      const result = tripFilterSchema.safeParse({
        minBudget: 5000,
        maxBudget: 1000,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const budgetError = result.error.issues.find((issue) => issue.path[0] === 'maxBudget');
        expect(budgetError?.message).toBe('最大预算不能小于最小预算');
      }
    });

    it('应该接受最大预算等于最小预算', () => {
      const result = tripFilterSchema.safeParse({
        minBudget: 1000,
        maxBudget: 1000,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝负数或零的预算', () => {
      const result = tripFilterSchema.safeParse({
        minBudget: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('最小预算必须大于 0');
      }
    });
  });

  describe('日期筛选验证', () => {
    it('应该接受有效的日期时间字符串', () => {
      const result = tripFilterSchema.safeParse({
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-06-10T00:00:00Z',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('createShareSchema', () => {
  describe('分享类型验证', () => {
    it('应该接受有效的分享类型', () => {
      const validTypes = ['all', 'trip'];

      validTypes.forEach((type) => {
        const result = createShareSchema.safeParse({
          type,
          relatedTripId: type === 'trip' ? '123e4567-e89b-12d3-a456-426614174000' : undefined,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的分享类型', () => {
      const result = createShareSchema.safeParse({
        type: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 的枚举错误消息格式
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });
  });

  describe('行程 ID 验证', () => {
    it('应该在分享类型为 trip 时要求提供行程 ID', () => {
      const result = createShareSchema.safeParse({
        type: 'trip',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const tripIdError = result.error.issues.find((issue) => issue.path[0] === 'relatedTripId');
        expect(tripIdError?.message).toBe('分享单个行程时必须提供行程 ID');
      }
    });

    it('应该在分享类型为 trip 时接受有效的行程 ID', () => {
      const result = createShareSchema.safeParse({
        type: 'trip',
        relatedTripId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('应该在分享类型为 all 时不要求行程 ID', () => {
      const result = createShareSchema.safeParse({
        type: 'all',
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的行程 ID 格式', () => {
      const result = createShareSchema.safeParse({
        type: 'trip',
        relatedTripId: 'invalid-uuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('行程 ID 格式不正确');
      }
    });
  });
});
