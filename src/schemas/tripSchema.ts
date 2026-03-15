/**
 * 行程表单验证 Schema
 *
 * 使用 Zod 定义行程相关的验证规则，确保数据完整性和业务逻辑正确性
 */

import { z } from 'zod';
import { TripStatus } from '@/types/entities';

/**
 * 行程表单验证 Schema
 */
export const tripFormSchema = z
  .object({
    // 必填字段
    title: z
      .string({
        required_error: '行程名称不能为空',
      })
      .min(1, '行程名称不能为空')
      .max(200, '行程名称不能超过 200 个字符')
      .trim(),

    startDate: z.date({
      required_error: '开始日期不能为空',
      invalid_type_error: '开始日期格式不正确',
    }),

    endDate: z.date({
      required_error: '结束日期不能为空',
      invalid_type_error: '结束日期格式不正确',
    }),

    // 可选字段
    relatedCityId: z.string().uuid('城市 ID 格式不正确').optional(),

    relatedWishlistId: z.string().uuid('愿望清单 ID 格式不正确').optional(),

    budget: z
      .number({
        invalid_type_error: '预算必须是数字',
      })
      .positive('预算必须大于 0')
      .max(999999999.99, '预算金额过大')
      .optional(),

    currency: z
      .string()
      .length(3, '货币代码必须是 3 个字符')
      .toUpperCase()
      .optional()
      .default('CNY'),

    transportation: z.string().max(200, '交通方式不能超过 200 个字符').trim().optional(),

    accommodation: z.string().max(200, '住宿信息不能超过 200 个字符').trim().optional(),

    notes: z.string().max(5000, '备注不能超过 5000 个字符').trim().optional(),

    shareEnabled: z.boolean().optional().default(false),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: '结束日期不能早于开始日期',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      // 行程时长不能超过 365 天
      const diffTime = data.endDate.getTime() - data.startDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 365;
    },
    {
      message: '行程时长不能超过 365 天',
      path: ['endDate'],
    }
  );

/**
 * 行程更新验证 Schema（所有字段可选）
 */
export const tripUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, '行程名称不能为空')
      .max(200, '行程名称不能超过 200 个字符')
      .trim()
      .optional(),

    startDate: z.date().optional(),
    endDate: z.date().optional(),
    relatedCityId: z.string().uuid('城市 ID 格式不正确').optional(),
    relatedWishlistId: z.string().uuid('愿望清单 ID 格式不正确').optional(),
    budget: z.number().positive('预算必须大于 0').max(999999999.99, '预算金额过大').optional(),
    currency: z.string().length(3, '货币代码必须是 3 个字符').toUpperCase().optional(),
    transportation: z.string().max(200, '交通方式不能超过 200 个字符').trim().optional(),
    accommodation: z.string().max(200, '住宿信息不能超过 200 个字符').trim().optional(),
    notes: z.string().max(5000, '备注不能超过 5000 个字符').trim().optional(),
    shareEnabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // 如果同时提供了开始和结束日期，验证结束日期不能早于开始日期
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: '结束日期不能早于开始日期',
      path: ['endDate'],
    }
  );

/**
 * 行程日程表单验证 Schema
 */
export const tripDayFormSchema = z.object({
  dayIndex: z
    .number({
      required_error: '日程索引不能为空',
      invalid_type_error: '日程索引必须是数字',
    })
    .int('日程索引必须是整数')
    .min(1, '日程索引必须从 1 开始'),

  date: z.date({
    required_error: '日期不能为空',
    invalid_type_error: '日期格式不正确',
  }),

  title: z.string().max(200, '标题不能超过 200 个字符').trim().optional(),

  notes: z.string().max(2000, '备注不能超过 2000 个字符').trim().optional(),
});

/**
 * 行程日程更新验证 Schema
 */
export const tripDayUpdateSchema = tripDayFormSchema.partial();

/**
 * 行程待办事项表单验证 Schema
 */
export const tripTaskFormSchema = z.object({
  dayId: z.string().uuid('日程 ID 格式不正确').optional(),

  content: z
    .string({
      required_error: '待办事项内容不能为空',
    })
    .min(1, '待办事项内容不能为空')
    .max(500, '待办事项内容不能超过 500 个字符')
    .trim(),

  isDone: z.boolean().optional().default(false),
});

/**
 * 行程待办事项更新验证 Schema
 */
export const tripTaskUpdateSchema = tripTaskFormSchema.partial();

/**
 * 行程筛选参数验证 Schema
 */
export const tripFilterSchema = z
  .object({
    status: z
      .enum([TripStatus.Planning, TripStatus.Ongoing, TripStatus.Completed] as const)
      .optional(),

    startDate: z.string().datetime().optional(),

    endDate: z.string().datetime().optional(),

    minBudget: z.number().positive('最小预算必须大于 0').optional(),

    maxBudget: z.number().positive('最大预算必须大于 0').optional(),
  })
  .refine(
    (data) => {
      // 如果同时提供了最小和最大预算，验证最大预算不能小于最小预算
      if (data.minBudget && data.maxBudget) {
        return data.maxBudget >= data.minBudget;
      }
      return true;
    },
    {
      message: '最大预算不能小于最小预算',
      path: ['maxBudget'],
    }
  );

/**
 * 分享链接创建验证 Schema
 */
export const createShareSchema = z
  .object({
    type: z.enum(['all', 'trip'] as const, {
      errorMap: () => ({ message: '请选择有效的分享类型' }),
    }),

    relatedTripId: z.string().uuid('行程 ID 格式不正确').optional(),
  })
  .refine(
    (data) => {
      // 如果分享类型是 'trip'，必须提供 relatedTripId
      if (data.type === 'trip') {
        return !!data.relatedTripId;
      }
      return true;
    },
    {
      message: '分享单个行程时必须提供行程 ID',
      path: ['relatedTripId'],
    }
  );

/**
 * 类型导出
 */
export type TripFormInput = z.infer<typeof tripFormSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;
export type TripDayFormInput = z.infer<typeof tripDayFormSchema>;
export type TripDayUpdateInput = z.infer<typeof tripDayUpdateSchema>;
export type TripTaskFormInput = z.infer<typeof tripTaskFormSchema>;
export type TripTaskUpdateInput = z.infer<typeof tripTaskUpdateSchema>;
export type TripFilterInput = z.infer<typeof tripFilterSchema>;
export type CreateShareInput = z.infer<typeof createShareSchema>;
