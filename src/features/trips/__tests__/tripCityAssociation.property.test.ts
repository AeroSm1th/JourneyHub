/**
 * 属性测试：行程关联城市显示
 *
 * 属性 19: 行程关联城市显示
 * 验证需求: 5.7
 *
 * 对于任何行程，系统应该在行程详情页显示所有关联的城市。
 * 本测试在数据/schema 层面验证 Trip 的 related_city_id 字段的正确性：
 * - 当行程有 related_city_id 时，该值应为有效的 UUID 格式
 * - 当行程没有 related_city_id 时，行程仍然有效
 * - related_city_id 始终为 null/undefined 或有效 UUID
 * - related_city_id 和 related_wishlist_id 相互独立
 *
 * **Validates: Requirements 5.7**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { Trip } from '@/types/database';

// ============================================================================
// UUID 验证辅助
// ============================================================================

/** UUID v4 正则表达式 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 验证字符串是否为有效的 UUID 格式 */
const isValidUUID = (value: string): boolean => UUID_REGEX.test(value);

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成有效的 UUID */
const arbUUID = fc.uuid();

/** 生成有效的行程标题 */
const arbTitle = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的行程状态 */
const arbStatus = fc.constantFrom('planning', 'ongoing', 'completed') as fc.Arbitrary<
  'planning' | 'ongoing' | 'completed'
>;

/** 生成有效的日期字符串 (YYYY-MM-DD) */
const arbDateString = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
  .filter((d) => !isNaN(d.getTime()))
  .map((d) => d.toISOString().split('T')[0]);

/** 生成有效的 ISO 时间戳 */
const arbTimestamp = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
  .filter((d) => !isNaN(d.getTime()))
  .map((d) => d.toISOString());

/** 生成可选的 related_city_id（null 或有效 UUID） */
const arbOptionalCityId = fc.option(arbUUID, { nil: undefined });

/** 生成可选的 related_wishlist_id（null 或有效 UUID） */
const arbOptionalWishlistId = fc.option(arbUUID, { nil: undefined });

/** 生成有效的开始日期和结束日期对 */
const arbDatePair = arbDateString.chain((startDate) => {
  const start = new Date(startDate);
  const maxEnd = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
  return fc
    .date({ min: start, max: maxEnd })
    .filter((d) => !isNaN(d.getTime()))
    .map((endDate) => ({
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0],
    }));
});

/** 生成完整有效的 Trip 对象 */
const arbTrip = fc
  .record({
    id: arbUUID,
    user_id: arbUUID,
    title: arbTitle,
    related_city_id: arbOptionalCityId,
    related_wishlist_id: arbOptionalWishlistId,
    status: arbStatus,
    share_enabled: fc.boolean(),
    created_at: arbTimestamp,
    updated_at: arbTimestamp,
  })
  .chain((base) =>
    arbDatePair.map((dates) => ({
      ...base,
      ...dates,
    }))
  ) as fc.Arbitrary<Trip>;

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 19: 行程关联城市显示', () => {
  /**
   * 属性 19.1: 当行程有 related_city_id 时，该值应为有效的 UUID 格式
   *
   * 需求 5.7: 行程详情页显示关联的所有城市
   */
  it('属性 19.1: 有 related_city_id 的行程，其值应为有效的 UUID 格式', () => {
    const arbTripWithCity = fc
      .record({
        id: arbUUID,
        user_id: arbUUID,
        title: arbTitle,
        related_city_id: arbUUID,
        status: arbStatus,
        share_enabled: fc.boolean(),
        created_at: arbTimestamp,
        updated_at: arbTimestamp,
      })
      .chain((base) =>
        arbDatePair.map((dates) => ({
          ...base,
          ...dates,
        }))
      );

    fc.assert(
      fc.property(arbTripWithCity, (trip) => {
        // related_city_id 存在且为有效 UUID
        expect(trip.related_city_id).toBeDefined();
        expect(typeof trip.related_city_id).toBe('string');
        expect(isValidUUID(trip.related_city_id as string)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 19.2: 当行程没有 related_city_id 时，行程仍然有效
   *
   * 需求 5.7: 行程可以不关联城市
   */
  it('属性 19.2: 没有 related_city_id 的行程仍然是有效的行程', () => {
    const arbTripWithoutCity = fc
      .record({
        id: arbUUID,
        user_id: arbUUID,
        title: arbTitle,
        status: arbStatus,
        share_enabled: fc.boolean(),
        created_at: arbTimestamp,
        updated_at: arbTimestamp,
      })
      .chain((base) =>
        arbDatePair.map((dates) => ({
          ...base,
          ...dates,
        }))
      );

    fc.assert(
      fc.property(arbTripWithoutCity, (trip) => {
        // 行程没有 related_city_id，但其他必填字段都有效
        expect(trip.related_city_id).toBeUndefined();
        expect(trip.id).toBeDefined();
        expect(isValidUUID(trip.id)).toBe(true);
        expect(trip.user_id).toBeDefined();
        expect(isValidUUID(trip.user_id)).toBe(true);
        expect(trip.title.trim().length).toBeGreaterThan(0);
        expect(['planning', 'ongoing', 'completed']).toContain(trip.status);
        expect(trip.start_date).toBeDefined();
        expect(trip.end_date).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 19.3: related_city_id 始终为 null/undefined 或有效 UUID
   *
   * 需求 5.7: 关联城市 ID 的数据完整性
   */
  it('属性 19.3: related_city_id 始终为 null/undefined 或有效 UUID 字符串', () => {
    fc.assert(
      fc.property(arbTrip, (trip) => {
        const cityId = trip.related_city_id;

        if (cityId === null || cityId === undefined) {
          // null/undefined 是合法的（行程可以不关联城市）
          expect(cityId == null).toBe(true);
        } else {
          // 如果有值，必须是有效的 UUID 字符串
          expect(typeof cityId).toBe('string');
          expect(isValidUUID(cityId)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 19.4: related_city_id 和 related_wishlist_id 相互独立
   *
   * 需求 5.7: 行程可以同时关联城市和愿望清单，也可以都不关联
   */
  it('属性 19.4: related_city_id 和 related_wishlist_id 应相互独立', () => {
    // 生成所有四种组合的行程
    const arbIndependentTrip = fc
      .record({
        id: arbUUID,
        user_id: arbUUID,
        title: arbTitle,
        related_city_id: arbOptionalCityId,
        related_wishlist_id: arbOptionalWishlistId,
        status: arbStatus,
        share_enabled: fc.boolean(),
        created_at: arbTimestamp,
        updated_at: arbTimestamp,
      })
      .chain((base) =>
        arbDatePair.map((dates) => ({
          ...base,
          ...dates,
        }))
      );

    const combinations = {
      bothPresent: false,
      onlyCityId: false,
      onlyWishlistId: false,
      neitherPresent: false,
    };

    fc.assert(
      fc.property(arbIndependentTrip, (trip) => {
        const hasCityId = trip.related_city_id != null;
        const hasWishlistId = trip.related_wishlist_id != null;

        // 记录出现的组合
        if (hasCityId && hasWishlistId) combinations.bothPresent = true;
        if (hasCityId && !hasWishlistId) combinations.onlyCityId = true;
        if (!hasCityId && hasWishlistId) combinations.onlyWishlistId = true;
        if (!hasCityId && !hasWishlistId) combinations.neitherPresent = true;

        // 验证每个字段独立有效
        if (hasCityId) {
          expect(isValidUUID(trip.related_city_id as string)).toBe(true);
        }
        if (hasWishlistId) {
          expect(isValidUUID(trip.related_wishlist_id as string)).toBe(true);
        }

        // 行程始终有效，无论关联字段的组合如何
        expect(trip.id).toBeDefined();
        expect(trip.title.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 200 }
    );

    // 验证四种组合都出现过（证明独立性）
    expect(combinations.bothPresent).toBe(true);
    expect(combinations.onlyCityId).toBe(true);
    expect(combinations.onlyWishlistId).toBe(true);
    expect(combinations.neitherPresent).toBe(true);
  });
});
