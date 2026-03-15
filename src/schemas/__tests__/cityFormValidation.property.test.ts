/**
 * 属性测试：表单验证
 *
 * 属性 11: 表单验证
 * 验证需求: 3.4, 9.2, 9.3, 9.5
 *
 * 对于任何表单提交，系统应该验证所有必填字段，
 * 如果验证失败则在对应字段下方显示错误消息，
 * 并禁用提交按钮直到所有字段有效。
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { cityFormSchema } from '../citySchema';
import { TripType, Continent } from '@/types/entities';

// ============================================================================
// 辅助生成器
// ============================================================================

/** 所有有效的大洲值 */
const validContinents = [
  Continent.Asia,
  Continent.Europe,
  Continent.Africa,
  Continent.NorthAmerica,
  Continent.SouthAmerica,
  Continent.Oceania,
  Continent.Antarctica,
] as const;

/** 所有有效的旅行类型 */
const validTripTypes = [TripType.Leisure, TripType.Business, TripType.Transit] as const;

/** 生成有效的纬度 */
const arbLatitude = fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true });

/** 生成有效的经度 */
const arbLongitude = fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true });

/** 生成有效的过去日期（至少比当前时间早 1 天，避免边界竞态） */
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);

const arbPastDate = fc
  .date({
    min: new Date('1900-01-01'),
    max: yesterday,
  })
  .filter((d) => !isNaN(d.getTime()));

/** 生成有效的大洲 */
const arbContinent = fc.constantFrom(...validContinents);

/** 生成有效的旅行类型 */
const arbTripType = fc.constantFrom(...validTripTypes);

/** 生成有效的城市名称（1-100 字符，非空白） */
const arbCityName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的国家名称 */
const arbCountryName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

/** 生成一个完整有效的城市表单数据 */
const arbValidCityForm = fc.record({
  cityName: arbCityName,
  countryName: arbCountryName,
  continent: arbContinent,
  latitude: arbLatitude,
  longitude: arbLongitude,
  visitedAt: arbPastDate,
  tripType: arbTripType,
});

/** 生成有效的评分 (1-5 整数) */
const arbRating = fc.integer({ min: 1, max: 5 });

/** 生成有效的备注 (最多 2000 字符) */
const arbNotes = fc.string({ maxLength: 2000 });

/** 生成有效的标签 (1-50 字符，非空) */
const arbTag = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0);

/** 生成有效的标签数组 (最多 10 个) */
const arbTags = fc.array(arbTag, { minLength: 1, maxLength: 10 });

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 11: 表单验证', () => {
  /**
   * 属性 11.1: 有效的必填字段组合总是通过验证
   *
   * 需求 3.4: 提交城市记录表单时验证必填字段
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.1: 任何有效的必填字段组合都应通过验证', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        const result = cityFormSchema.safeParse(formData);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.2: 缺少任何必填字段都应导致验证失败
   *
   * 需求 3.4: 提交城市记录表单时验证必填字段
   * 需求 9.3: 验证失败时在对应字段下方显示错误消息
   */
  it('属性 11.2: 缺少任何一个必填字段都应导致验证失败', () => {
    const requiredFields = [
      'cityName',
      'countryName',
      'continent',
      'latitude',
      'longitude',
      'visitedAt',
      'tripType',
    ] as const;

    fc.assert(
      fc.property(
        arbValidCityForm,
        fc.constantFrom(...requiredFields),
        (formData, fieldToRemove) => {
          // 移除一个必填字段
          const incomplete = { ...formData } as Record<string, unknown>;
          delete incomplete[fieldToRemove];

          const result = cityFormSchema.safeParse(incomplete);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.3: 验证失败时应产生与无效字段对应的错误消息
   *
   * 需求 9.3: 验证失败时在对应字段下方显示错误消息
   */
  it('属性 11.3: 空城市名称应产生包含字段路径的错误', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        const invalid = { ...formData, cityName: '' };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          // 错误应该指向 cityName 字段
          const cityNameError = result.error.issues.find((issue) =>
            issue.path.includes('cityName')
          );
          expect(cityNameError).toBeDefined();
          expect(cityNameError!.message).toBeTruthy();
        }
      }),
      { numRuns: 50 }
    );
  });

  it('属性 11.3b: 空国家名称应产生包含字段路径的错误', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        const invalid = { ...formData, countryName: '' };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const countryError = result.error.issues.find((issue) =>
            issue.path.includes('countryName')
          );
          expect(countryError).toBeDefined();
          expect(countryError!.message).toBeTruthy();
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 11.4: 纬度超出范围 [-90, 90] 应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.4: 超出范围的纬度应验证失败', () => {
    // 生成超出范围的纬度
    const arbInvalidLat = fc.oneof(
      fc.double({ min: 90.001, max: 1000, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -1000, max: -90.001, noNaN: true, noDefaultInfinity: true })
    );

    fc.assert(
      fc.property(arbValidCityForm, arbInvalidLat, (formData, badLat) => {
        const invalid = { ...formData, latitude: badLat };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const latError = result.error.issues.find((issue) => issue.path.includes('latitude'));
          expect(latError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.5: 经度超出范围 [-180, 180] 应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.5: 超出范围的经度应验证失败', () => {
    const arbInvalidLng = fc.oneof(
      fc.double({ min: 180.001, max: 1000, noNaN: true, noDefaultInfinity: true }),
      fc.double({ min: -1000, max: -180.001, noNaN: true, noDefaultInfinity: true })
    );

    fc.assert(
      fc.property(arbValidCityForm, arbInvalidLng, (formData, badLng) => {
        const invalid = { ...formData, longitude: badLng };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const lngError = result.error.issues.find((issue) => issue.path.includes('longitude'));
          expect(lngError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.6: 未来日期应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.6: 未来的访问日期应验证失败', () => {
    // 生成未来日期（明天到 10 年后）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 10);

    const arbFutureDate = fc.date({ min: tomorrow, max: farFuture });

    fc.assert(
      fc.property(arbValidCityForm, arbFutureDate, (formData, futureDate) => {
        const invalid = { ...formData, visitedAt: futureDate };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const dateError = result.error.issues.find((issue) => issue.path.includes('visitedAt'));
          expect(dateError).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.7: 无效的大洲值应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.7: 无效的大洲值应验证失败', () => {
    const arbInvalidContinent = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => !validContinents.includes(s as Continent));

    fc.assert(
      fc.property(arbValidCityForm, arbInvalidContinent, (formData, badContinent) => {
        const invalid = { ...formData, continent: badContinent };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.8: 无效的旅行类型应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.8: 无效的旅行类型应验证失败', () => {
    const arbInvalidTripType = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => !validTripTypes.includes(s as TripType));

    fc.assert(
      fc.property(arbValidCityForm, arbInvalidTripType, (formData, badType) => {
        const invalid = { ...formData, tripType: badType };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.9: 有效的可选字段不应导致验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.9: 添加有效的可选字段不应破坏验证', () => {
    fc.assert(
      fc.property(
        arbValidCityForm,
        fc.option(arbRating, { nil: undefined }),
        fc.option(arbNotes, { nil: undefined }),
        fc.option(arbTags, { nil: undefined }),
        fc.option(fc.boolean(), { nil: undefined }),
        (formData, rating, notes, tags, isFavorite) => {
          const withOptionals = {
            ...formData,
            ...(rating !== undefined && { rating }),
            ...(notes !== undefined && { notes }),
            ...(tags !== undefined && { tags }),
            ...(isFavorite !== undefined && { isFavorite }),
          };

          const result = cityFormSchema.safeParse(withOptionals);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.10: 超出范围的评分应验证失败
   *
   * 需求 9.5: 禁用提交按钮直到所有必填字段有效
   * （无效的可选字段也应阻止提交）
   */
  it('属性 11.10: 超出范围的评分 (非 1-5 整数) 应验证失败', () => {
    const arbInvalidRating = fc.oneof(
      fc.integer({ min: 6, max: 100 }),
      fc.integer({ min: -100, max: 0 }),
      // 非整数
      fc.double({ min: 1.01, max: 4.99, noNaN: true, noDefaultInfinity: true }).filter(
        (n) => !Number.isInteger(n)
      )
    );

    fc.assert(
      fc.property(arbValidCityForm, arbInvalidRating, (formData, badRating) => {
        const invalid = { ...formData, rating: badRating };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.11: 超长备注应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.11: 超过 2000 字符的备注应验证失败', () => {
    const arbLongNotes = fc.string({ minLength: 2001, maxLength: 5000 });

    fc.assert(
      fc.property(arbValidCityForm, arbLongNotes, (formData, longNotes) => {
        const invalid = { ...formData, notes: longNotes };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const notesError = result.error.issues.find((issue) => issue.path.includes('notes'));
          expect(notesError).toBeDefined();
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 11.12: 超过 10 个标签应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.12: 超过 10 个标签应验证失败', () => {
    const arbTooManyTags = fc.array(arbTag, { minLength: 11, maxLength: 20 });

    fc.assert(
      fc.property(arbValidCityForm, arbTooManyTags, (formData, tooManyTags) => {
        const invalid = { ...formData, tags: tooManyTags };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 11.13: 城市名称超过 100 字符应验证失败
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.13: 超过 100 字符的城市名称应验证失败', () => {
    const arbLongName = fc.string({ minLength: 101, maxLength: 500 });

    fc.assert(
      fc.property(arbValidCityForm, arbLongName, (formData, longName) => {
        const invalid = { ...formData, cityName: longName };
        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find((issue) => issue.path.includes('cityName'));
          expect(nameError).toBeDefined();
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 11.14: 验证通过后数据应被正确解析（trim 等转换）
   *
   * 需求 9.2: 提交表单时验证所有字段
   */
  it('属性 11.14: 验证通过后字符串字段应被 trim', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        // 在名称前后添加空格
        const withSpaces = {
          ...formData,
          cityName: `  ${formData.cityName}  `,
          countryName: `  ${formData.countryName}  `,
        };

        const result = cityFormSchema.safeParse(withSpaces);

        if (result.success) {
          // 验证 trim 生效
          expect(result.data.cityName).toBe(formData.cityName.trim());
          expect(result.data.countryName).toBe(formData.countryName.trim());
          // trim 后不应有前后空格
          expect(result.data.cityName).toBe(result.data.cityName.trim());
          expect(result.data.countryName).toBe(result.data.countryName.trim());
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * 属性 11.15: 多个字段同时无效时应报告所有错误
   *
   * 需求 9.3: 验证失败时在对应字段下方显示错误消息
   */
  it('属性 11.15: 多个字段同时无效时应报告多个错误', () => {
    fc.assert(
      fc.property(arbPastDate, arbTripType, arbContinent, (date, tripType, continent) => {
        // 同时让城市名称和国家名称无效
        const invalid = {
          cityName: '',
          countryName: '',
          continent,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: date,
          tripType,
        };

        const result = cityFormSchema.safeParse(invalid);

        expect(result.success).toBe(false);
        if (!result.success) {
          // 应该至少有 2 个错误（cityName 和 countryName）
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);

          const errorPaths = result.error.issues.map((issue) => issue.path[0]);
          expect(errorPaths).toContain('cityName');
          expect(errorPaths).toContain('countryName');
        }
      }),
      { numRuns: 50 }
    );
  });
});
