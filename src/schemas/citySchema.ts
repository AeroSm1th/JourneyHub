/**
 * 城市记录表单验证 Schema
 *
 * 使用 Zod 定义城市记录的验证规则，确保数据完整性和类型安全
 */

import { z } from 'zod';
import { TripType, Continent } from '@/types/entities';

/**
 * 城市记录表单验证 Schema
 */
export const cityFormSchema = z.object({
  // 必填字段
  cityName: z.string().min(1, '城市名称不能为空').max(100, '城市名称不能超过 100 个字符').trim(),

  countryName: z.string().min(1, '国家名称不能为空').max(100, '国家名称不能超过 100 个字符').trim(),

  continent: z.enum(
    [
      Continent.Asia,
      Continent.Europe,
      Continent.Africa,
      Continent.NorthAmerica,
      Continent.SouthAmerica,
      Continent.Oceania,
      Continent.Antarctica,
    ] as const,
    {
      errorMap: () => ({ message: '请选择有效的大洲' }),
    }
  ),

  latitude: z
    .number({
      required_error: '纬度不能为空',
      invalid_type_error: '纬度必须是数字',
    })
    .min(-90, '纬度必须在 -90 到 90 之间')
    .max(90, '纬度必须在 -90 到 90 之间'),

  longitude: z
    .number({
      required_error: '经度不能为空',
      invalid_type_error: '经度必须是数字',
    })
    .min(-180, '经度必须在 -180 到 180 之间')
    .max(180, '经度必须在 -180 到 180 之间'),

  visitedAt: z
    .date({
      required_error: '访问日期不能为空',
      invalid_type_error: '访问日期格式不正确',
    })
    .max(new Date(), '访问日期不能是未来日期'),

  tripType: z.enum([TripType.Leisure, TripType.Business, TripType.Transit] as const, {
    errorMap: () => ({ message: '请选择有效的旅行类型' }),
  }),

  // 可选字段
  rating: z
    .number()
    .int('评分必须是整数')
    .min(1, '评分必须在 1 到 5 之间')
    .max(5, '评分必须在 1 到 5 之间')
    .optional(),

  notes: z.string().max(2000, '备注不能超过 2000 个字符').trim().optional(),

  tags: z
    .array(z.string().min(1, '标签不能为空').max(50, '标签不能超过 50 个字符'))
    .max(10, '最多只能添加 10 个标签')
    .optional(),

  coverImage: z
    .any()
    .refine(
      (val) => val === undefined || val === null || val instanceof File,
      '封面图片格式不正确'
    )
    .refine(
      (val) => !val || !(val instanceof File) || val.size <= 5 * 1024 * 1024,
      '图片大小不能超过 5MB'
    )
    .refine(
      (val) =>
        !val ||
        !(val instanceof File) ||
        ['image/jpeg', 'image/png', 'image/webp'].includes(val.type),
      '只支持 JPG、PNG、WebP 格式的图片'
    )
    .optional(),

  isFavorite: z.boolean().optional().default(false),
});

/**
 * 城市记录更新验证 Schema（所有字段可选）
 */
export const cityUpdateSchema = cityFormSchema.partial();

/**
 * 城市搜索参数验证 Schema
 */
export const citySearchSchema = z.object({
  query: z.string().max(100, '搜索关键词不能超过 100 个字符').optional(),
  continent: z.string().optional(),
  country: z.string().optional(),
  tripType: z.enum([TripType.Leisure, TripType.Business, TripType.Transit] as const).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * 愿望清单表单验证 Schema
 */
export const wishlistFormSchema = z.object({
  cityName: z.string().min(1, '城市名称不能为空').max(100, '城市名称不能超过 100 个字符').trim(),

  countryName: z.string().min(1, '国家名称不能为空').max(100, '国家名称不能超过 100 个字符').trim(),

  continent: z.enum(
    [
      Continent.Asia,
      Continent.Europe,
      Continent.Africa,
      Continent.NorthAmerica,
      Continent.SouthAmerica,
      Continent.Oceania,
      Continent.Antarctica,
    ] as const,
    {
      errorMap: () => ({ message: '请选择有效的大洲' }),
    }
  ),

  latitude: z
    .number({
      required_error: '纬度不能为空',
      invalid_type_error: '纬度必须是数字',
    })
    .min(-90, '纬度必须在 -90 到 90 之间')
    .max(90, '纬度必须在 -90 到 90 之间'),

  longitude: z
    .number({
      required_error: '经度不能为空',
      invalid_type_error: '经度必须是数字',
    })
    .min(-180, '经度必须在 -180 到 180 之间')
    .max(180, '经度必须在 -180 到 180 之间'),

  priority: z
    .number()
    .int('优先级必须是整数')
    .min(1, '优先级必须在 1 到 5 之间')
    .max(5, '优先级必须在 1 到 5 之间')
    .optional()
    .default(3),

  expectedSeason: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .enum(['spring', 'summer', 'autumn', 'winter'] as const, {
        errorMap: () => ({ message: '请选择有效的季节' }),
      })
      .optional(),
  ),

  notes: z.string().max(2000, '备注不能超过 2000 个字符').trim().optional(),
});

/**
 * 愿望清单更新验证 Schema
 */
export const wishlistUpdateSchema = wishlistFormSchema.partial();

/**
 * 类型导出
 */
export type CityFormInput = z.infer<typeof cityFormSchema>;
export type CityUpdateInput = z.infer<typeof cityUpdateSchema>;
export type CitySearchInput = z.infer<typeof citySearchSchema>;
export type WishlistFormInput = z.infer<typeof wishlistFormSchema>;
export type WishlistUpdateInput = z.infer<typeof wishlistUpdateSchema>;
