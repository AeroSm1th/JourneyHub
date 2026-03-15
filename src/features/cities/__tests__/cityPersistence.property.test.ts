/**
 * 属性测试：城市记录持久化
 *
 * 属性 12: 城市记录持久化
 * 验证需求: 3.5
 *
 * 对于任何通过验证的城市记录，系统应该将其存储到数据库
 * 并关联到当前登录用户的 ID。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { citiesApi } from '../api';
import { supabase } from '@/services/supabase/client';
import type { City, CityInsert } from '@/types/database';

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

/** 有效的旅行类型 */
const validTripTypes = ['leisure', 'business', 'transit'] as const;

/** 生成有效的 UUID */
const arbUUID = fc.uuid();

/** 生成有效的用户 ID */
const arbUserId = arbUUID;

/** 生成有效的纬度 */
const arbLatitude = fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true });

/** 生成有效的经度 */
const arbLongitude = fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true });

/** 生成有效的城市名称 */
const arbCityName = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

/** 生成有效的国家名称 */
const arbCountryName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的访问日期字符串 (ISO date) */
const arbVisitedAt = fc
  .date({ min: new Date('1900-01-01'), max: new Date() })
  .filter((d) => !isNaN(d.getTime()))
  .map((d) => d.toISOString().split('T')[0]);

/** 生成有效的 CityInsert 数据 */
const arbCityInsert = fc.record({
  user_id: arbUserId,
  city_name: arbCityName,
  country_name: arbCountryName,
  continent: fc.constantFrom(...validContinents),
  latitude: arbLatitude,
  longitude: arbLongitude,
  visited_at: arbVisitedAt,
  trip_type: fc.constantFrom(...validTripTypes),
  is_favorite: fc.boolean(),
});

/** 将 CityInsert 转换为完整的 City（模拟数据库返回） */
const toCityRow = (insert: CityInsert): City => ({
  id: crypto.randomUUID(),
  ...insert,
  rating: undefined,
  notes: undefined,
  tags: undefined,
  cover_image: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// ============================================================================
// 辅助函数：配置 Supabase mock
// ============================================================================

/**
 * 配置 supabase.from('cities').insert(...).select().single() 的 mock 链
 */
const mockSupabaseInsert = (returnCity: City) => {
  const mockSingle = vi.fn().mockResolvedValue({ data: returnCity, error: null });
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

  vi.mocked(supabase.from).mockImplementation(mockFrom);

  return { mockFrom, mockInsert, mockSelect, mockSingle };
};

/**
 * 配置 supabase.from('cities').select('*').eq('id', ...).single() 的 mock 链
 */
const mockSupabaseGetById = (returnCity: City) => {
  const mockSingle = vi.fn().mockResolvedValue({ data: returnCity, error: null });
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  vi.mocked(supabase.from).mockImplementation(mockFrom);

  return { mockFrom, mockSelect, mockEq, mockSingle };
};

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 12: 城市记录持久化', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 属性 12.1: 任何有效的城市数据都应成功持久化到数据库
   *
   * 需求 3.5: 城市记录验证通过后，数据库应存储该记录
   */
  it('属性 12.1: 任何有效的城市数据都应成功调用数据库插入', async () => {
    await fc.assert(
      fc.asyncProperty(arbCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity = toCityRow(insertData);
        const { mockInsert } = mockSupabaseInsert(expectedCity);

        const result = await citiesApi.create(insertData);

        // 验证调用了 supabase.from('cities')
        expect(supabase.from).toHaveBeenCalledWith('cities');
        // 验证传入了正确的插入数据
        expect(mockInsert).toHaveBeenCalledWith(insertData);
        // 验证返回了城市记录
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 12.2: 持久化的记录必须关联到提供的 user_id
   *
   * 需求 3.5: 记录应关联到当前登录用户
   */
  it('属性 12.2: 持久化的记录必须包含正确的 user_id', async () => {
    await fc.assert(
      fc.asyncProperty(arbCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity = toCityRow(insertData);
        const { mockInsert } = mockSupabaseInsert(expectedCity);

        await citiesApi.create(insertData);

        // 验证插入数据中包含 user_id
        const calledWith = mockInsert.mock.calls[0][0] as CityInsert;
        expect(calledWith.user_id).toBe(insertData.user_id);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 12.3: 持久化后返回的记录应包含所有原始字段
   *
   * 需求 3.5: 数据库应完整存储城市记录
   */
  it('属性 12.3: 返回的记录应保留所有输入字段的值', async () => {
    await fc.assert(
      fc.asyncProperty(arbCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity = toCityRow(insertData);
        mockSupabaseInsert(expectedCity);

        const result = await citiesApi.create(insertData);

        // 验证返回记录保留了所有输入字段
        expect(result.user_id).toBe(insertData.user_id);
        expect(result.city_name).toBe(insertData.city_name);
        expect(result.country_name).toBe(insertData.country_name);
        expect(result.continent).toBe(insertData.continent);
        expect(result.latitude).toBe(insertData.latitude);
        expect(result.longitude).toBe(insertData.longitude);
        expect(result.visited_at).toBe(insertData.visited_at);
        expect(result.trip_type).toBe(insertData.trip_type);
        expect(result.is_favorite).toBe(insertData.is_favorite);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 12.4: 持久化后返回的记录应包含自动生成的字段
   *
   * 需求 3.5: 数据库应自动生成 id、created_at、updated_at
   */
  it('属性 12.4: 返回的记录应包含 id、created_at、updated_at', async () => {
    await fc.assert(
      fc.asyncProperty(arbCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity = toCityRow(insertData);
        mockSupabaseInsert(expectedCity);

        const result = await citiesApi.create(insertData);

        // 验证自动生成的字段存在
        expect(result.id).toBeTruthy();
        expect(typeof result.id).toBe('string');
        expect(result.created_at).toBeTruthy();
        expect(result.updated_at).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 12.5: 数据库错误应正确传播为异常
   *
   * 需求 3.5: 持久化失败时应抛出错误
   */
  it('属性 12.5: 数据库返回错误时应抛出异常', async () => {
    const arbErrorMessage = fc.string({ minLength: 1, maxLength: 200 });

    await fc.assert(
      fc.asyncProperty(arbCityInsert, arbErrorMessage, async (insertData, errorMsg) => {
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
        await expect(citiesApi.create(insertData)).rejects.toThrow();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 12.6: 创建后可通过 getById 查询到记录
   *
   * 需求 3.5: 记录应被持久化并可查询
   */
  it('属性 12.6: 创建的记录应可通过 ID 查询到', async () => {
    await fc.assert(
      fc.asyncProperty(arbCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity = toCityRow(insertData);

        // 第一次调用：create
        mockSupabaseInsert(expectedCity);
        const created = await citiesApi.create(insertData);

        // 第二次调用：getById
        mockSupabaseGetById(expectedCity);
        const fetched = await citiesApi.getById(created.id);

        // 验证查询到的记录与创建的一致
        expect(fetched.id).toBe(created.id);
        expect(fetched.user_id).toBe(insertData.user_id);
        expect(fetched.city_name).toBe(insertData.city_name);
        expect(fetched.country_name).toBe(insertData.country_name);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 12.7: 带可选字段的城市数据也应成功持久化
   *
   * 需求 3.5: 包含可选字段的完整记录也应正确存储
   */
  it('属性 12.7: 带可选字段（评分、备注、标签）的数据也应成功持久化', async () => {
    const arbRating = fc.integer({ min: 1, max: 5 });
    const arbNotes = fc.string({ maxLength: 2000 });
    const arbTag = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);
    const arbTags = fc.array(arbTag, { minLength: 1, maxLength: 10 });

    const arbFullCityInsert = fc.record({
      user_id: arbUserId,
      city_name: arbCityName,
      country_name: arbCountryName,
      continent: fc.constantFrom(...validContinents),
      latitude: arbLatitude,
      longitude: arbLongitude,
      visited_at: arbVisitedAt,
      trip_type: fc.constantFrom(...validTripTypes),
      is_favorite: fc.boolean(),
      rating: arbRating,
      notes: arbNotes,
      tags: arbTags,
    });

    await fc.assert(
      fc.asyncProperty(arbFullCityInsert, async (insertData) => {
        vi.clearAllMocks();

        const expectedCity: City = {
          id: crypto.randomUUID(),
          ...insertData,
          cover_image: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { mockInsert } = mockSupabaseInsert(expectedCity);

        const result = await citiesApi.create(insertData as CityInsert);

        // 验证可选字段也被传入
        const calledWith = mockInsert.mock.calls[0][0];
        expect(calledWith.rating).toBe(insertData.rating);
        expect(calledWith.notes).toBe(insertData.notes);
        expect(calledWith.tags).toEqual(insertData.tags);

        // 验证返回值包含可选字段
        expect(result.rating).toBe(insertData.rating);
        expect(result.notes).toBe(insertData.notes);
        expect(result.tags).toEqual(insertData.tags);
      }),
      { numRuns: 50 }
    );
  });
});
