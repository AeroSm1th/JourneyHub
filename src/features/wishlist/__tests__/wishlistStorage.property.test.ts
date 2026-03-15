/**
 * 属性测试：愿望清单数据存储
 *
 * 属性 16: 愿望清单数据存储
 * 验证需求: 4.2
 *
 * 对于任何添加到愿望清单的城市，系统应该记录城市名称、国家和坐标
 *
 * **Validates: Requirements 4.2**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { wishlistApi } from '../api';
import { wishlistFormSchema } from '@/schemas/citySchema';
import { supabase } from '@/services/supabase/client';
import type { WishlistItem, WishlistItemInsert } from '@/types/database';

// Mock Supabase 客户端
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ============================================================================
// 辅助生成器
// ============================================================================

/** 有效的大洲值 */
const validContinents = [
  'Asia',
  'Europe',
  'Africa',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
] as const;

/** 有效的季节值 */
const validSeasons = ['spring', 'summer', 'autumn', 'winter'] as const;

/** 生成有效的 UUID */
const arbUUID = fc.uuid();

/** 生成有效的纬度（-90 ~ 90） */
const arbLatitude = fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true });

/** 生成有效的经度（-180 ~ 180） */
const arbLongitude = fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true });

/** 生成有效的城市名称 */
const arbCityName = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

/** 生成有效的国家名称 */
const arbCountryName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的优先级（1-5） */
const arbPriority = fc.integer({ min: 1, max: 5 });

/** 生成有效的 WishlistItemInsert 数据 */
const arbWishlistInsert = fc.record({
  user_id: arbUUID,
  city_name: arbCityName,
  country_name: arbCountryName,
  continent: fc.constantFrom(...validContinents),
  latitude: arbLatitude,
  longitude: arbLongitude,
  priority: arbPriority,
});

/** 生成愿望清单表单数据（用于 schema 验证） */
const arbWishlistFormData = fc.record({
  cityName: arbCityName,
  countryName: arbCountryName,
  continent: fc.constantFrom(...validContinents),
  latitude: arbLatitude,
  longitude: arbLongitude,
  priority: arbPriority,
  expectedSeason: fc.constantFrom(...validSeasons),
  notes: fc.string({ maxLength: 2000 }),
});

/** 将 WishlistItemInsert 转换为完整的 WishlistItem（模拟数据库返回） */
const toWishlistRow = (insert: WishlistItemInsert): WishlistItem => ({
  id: crypto.randomUUID(),
  ...insert,
  expected_season: undefined,
  notes: undefined,
  created_at: new Date().toISOString(),
});

// ============================================================================
// 辅助函数：配置 Supabase mock
// ============================================================================

/**
 * 配置 supabase.from('wishlist_items').insert(...).select().single() 的 mock 链
 */
const mockSupabaseInsert = (returnItem: WishlistItem) => {
  const mockSingle = vi.fn().mockResolvedValue({ data: returnItem, error: null });
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

  vi.mocked(supabase.from).mockImplementation(mockFrom);

  return { mockFrom, mockInsert, mockSelect, mockSingle };
};

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 16: 愿望清单数据存储', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 属性 16.1: 通过 wishlistFormSchema 验证的数据包含所有必要字段
   *
   * 需求 4.2: 系统应该记录城市名称、国家和坐标
   */
  it('属性 16.1: 有效的愿望清单表单数据应包含 cityName、countryName、latitude、longitude、continent', async () => {
    await fc.assert(
      fc.asyncProperty(arbWishlistFormData, async (formData) => {
        const result = wishlistFormSchema.safeParse(formData);

        // 验证数据通过 schema 验证
        expect(result.success).toBe(true);

        if (result.success) {
          // 验证必要字段存在
          expect(result.data.cityName).toBeDefined();
          expect(result.data.countryName).toBeDefined();
          expect(result.data.latitude).toBeDefined();
          expect(result.data.longitude).toBeDefined();
          expect(result.data.continent).toBeDefined();

          // 验证字段值与输入一致
          expect(result.data.cityName).toBe(formData.cityName.trim());
          expect(result.data.countryName).toBe(formData.countryName.trim());
          expect(result.data.continent).toBe(formData.continent);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 16.2: 优先级必须在 1-5 范围内
   *
   * 需求 4.2: 愿望清单数据完整性
   */
  it('属性 16.2: 验证通过的优先级必须在 1 到 5 之间', async () => {
    await fc.assert(
      fc.asyncProperty(arbWishlistFormData, async (formData) => {
        const result = wishlistFormSchema.safeParse(formData);

        expect(result.success).toBe(true);
        if (result.success && result.data.priority !== undefined) {
          expect(result.data.priority).toBeGreaterThanOrEqual(1);
          expect(result.data.priority).toBeLessThanOrEqual(5);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 16.3: 坐标必须在有效范围内
   *
   * 需求 4.2: 坐标数据有效性
   */
  it('属性 16.3: 验证通过的坐标必须在有效范围内（纬度 -90~90，经度 -180~180）', async () => {
    await fc.assert(
      fc.asyncProperty(arbWishlistFormData, async (formData) => {
        const result = wishlistFormSchema.safeParse(formData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.latitude).toBeGreaterThanOrEqual(-90);
          expect(result.data.latitude).toBeLessThanOrEqual(90);
          expect(result.data.longitude).toBeGreaterThanOrEqual(-180);
          expect(result.data.longitude).toBeLessThanOrEqual(180);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 16.4: API 层正确传递愿望清单数据到 Supabase
   *
   * 需求 4.2: 系统应该记录城市名称、国家和坐标
   */
  it('属性 16.4: 创建愿望清单时应正确传递所有字段到数据库', async () => {
    await fc.assert(
      fc.asyncProperty(arbWishlistInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedItem = toWishlistRow(insertData);
        const { mockInsert } = mockSupabaseInsert(expectedItem);

        const result = await wishlistApi.create(insertData);

        // 验证调用了 supabase.from('wishlist_items')
        expect(supabase.from).toHaveBeenCalledWith('wishlist_items');

        // 验证传入了正确的插入数据
        expect(mockInsert).toHaveBeenCalledWith(insertData);

        // 验证插入数据包含必要字段
        const calledWith = mockInsert.mock.calls[0][0] as WishlistItemInsert;
        expect(calledWith.city_name).toBe(insertData.city_name);
        expect(calledWith.country_name).toBe(insertData.country_name);
        expect(calledWith.latitude).toBe(insertData.latitude);
        expect(calledWith.longitude).toBe(insertData.longitude);
        expect(calledWith.continent).toBe(insertData.continent);

        // 验证返回了愿望清单项目
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 16.5: 持久化后返回的记录应保留所有输入字段
   *
   * 需求 4.2: 数据库应完整存储愿望清单记录
   */
  it('属性 16.5: 返回的记录应保留所有输入字段的值', async () => {
    await fc.assert(
      fc.asyncProperty(arbWishlistInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedItem = toWishlistRow(insertData);
        mockSupabaseInsert(expectedItem);

        const result = await wishlistApi.create(insertData);

        // 验证返回记录保留了所有输入字段
        expect(result.user_id).toBe(insertData.user_id);
        expect(result.city_name).toBe(insertData.city_name);
        expect(result.country_name).toBe(insertData.country_name);
        expect(result.continent).toBe(insertData.continent);
        expect(result.latitude).toBe(insertData.latitude);
        expect(result.longitude).toBe(insertData.longitude);
        expect(result.priority).toBe(insertData.priority);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 16.6: 数据库错误应正确传播为异常
   *
   * 需求 4.2: 持久化失败时应抛出错误
   */
  it('属性 16.6: 数据库返回错误时应抛出异常', async () => {
    const arbErrorMessage = fc.string({ minLength: 1, maxLength: 200 });

    await fc.assert(
      fc.asyncProperty(arbWishlistInsert, arbErrorMessage, async (insertData, errorMsg) => {
        vi.clearAllMocks();

        // 模拟数据库错误
        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: { message: errorMsg },
        });
        const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

        // 验证抛出异常
        await expect(wishlistApi.create(insertData)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });
});
