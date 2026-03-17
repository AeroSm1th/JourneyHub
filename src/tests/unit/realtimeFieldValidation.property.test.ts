/**
 * 属性 34: 实时字段验证
 *
 * 验证需求 9.4: THE System SHALL 在用户输入时实时验证字段
 *
 * 核心属性：
 * - 对于任意无效的单字段输入，Zod schema 的逐字段验证应返回对应的错误消息
 * - 对于任意有效的单字段输入，Zod schema 的逐字段验证不应返回错误
 * - 当所有必填字段有效时，整体验证应通过；任一必填字段无效时，整体验证应失败
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import { cityFormSchema } from '@/schemas/citySchema';
import { loginSchema, registerSchema } from '@/schemas/authSchema';
import { tripFormSchema } from '@/schemas/tripSchema';
import { Continent, TripType } from '@/types/entities';

// ============================================================================
// 有效值生成器
// ============================================================================

const validContinents = Object.values(Continent);
const validTripTypes = Object.values(TripType);

const validCityName = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);
const validLatitude = fc.double({ min: -90, max: 90, noNaN: true });
const validLongitude = fc.double({ min: -180, max: 180, noNaN: true });
// 使用昨天的日期（截断时间部分）避免与 schema 的 .max(new Date()) 产生竞态
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);
const validPastDate = fc
  .date({ min: new Date('1900-01-01'), max: yesterday })
  .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()));

const validEmail = fc
  .tuple(fc.stringMatching(/^[a-z][a-z0-9]{1,10}$/), fc.stringMatching(/^[a-z]{2,6}$/))
  .map(([local, domain]) => `${local}@${domain}.com`);

const validPassword = fc.string({ minLength: 8, maxLength: 128 }).filter((s) => s.length >= 8);

// 从 tripFormSchema 的 shape 中提取单字段 schema（绕过 Zod v4 refine 限制）
const tripShape = (
  tripFormSchema as unknown as {
    def: { shape: Record<string, z.ZodType> };
  }
).def.shape;
const tripTitleSchema = z.object({ title: tripShape.title });
const tripBudgetSchema = z.object({ budget: tripShape.budget });
const tripNotesSchema = z.object({ notes: tripShape.notes });

describe('属性 34: 实时字段验证', () => {
  // 城市表单逐字段验证
  describe('城市表单 (cityFormSchema) 逐字段验证', () => {
    it('cityName: 空字符串应返回错误', () => {
      fc.assert(
        fc.property(fc.constant(''), (emptyName) => {
          const result = cityFormSchema.pick({ cityName: true }).safeParse({ cityName: emptyName });
          expect(result.success).toBe(false);
        })
      );
    });

    it('cityName: 任意非空字符串（≤100字符）应通过验证', () => {
      fc.assert(
        fc.property(validCityName, (name) => {
          const result = cityFormSchema.pick({ cityName: true }).safeParse({ cityName: name });
          expect(result.success).toBe(true);
        })
      );
    });

    it('cityName: 超过 100 字符应返回错误', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 101, maxLength: 200 }), (longName) => {
          const result = cityFormSchema.pick({ cityName: true }).safeParse({ cityName: longName });
          expect(result.success).toBe(false);
        })
      );
    });

    it('latitude: 范围外的值应返回错误', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.double({ min: 90.001, max: 1000, noNaN: true }),
            fc.double({ min: -1000, max: -90.001, noNaN: true })
          ),
          (invalidLat) => {
            const result = cityFormSchema
              .pick({ latitude: true })
              .safeParse({ latitude: invalidLat });
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('latitude: [-90, 90] 范围内的值应通过验证', () => {
      fc.assert(
        fc.property(validLatitude, (lat) => {
          const result = cityFormSchema.pick({ latitude: true }).safeParse({ latitude: lat });
          expect(result.success).toBe(true);
        })
      );
    });

    it('longitude: [-180, 180] 范围内的值应通过验证', () => {
      fc.assert(
        fc.property(validLongitude, (lng) => {
          const result = cityFormSchema.pick({ longitude: true }).safeParse({ longitude: lng });
          expect(result.success).toBe(true);
        })
      );
    });

    it('continent: 无效大洲值应返回错误', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !validContinents.includes(s as Continent)),
          (invalidContinent) => {
            const result = cityFormSchema
              .pick({ continent: true })
              .safeParse({ continent: invalidContinent });
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('continent: 有效大洲值应通过验证', () => {
      fc.assert(
        fc.property(fc.constantFrom(...validContinents), (continent) => {
          const result = cityFormSchema.pick({ continent: true }).safeParse({ continent });
          expect(result.success).toBe(true);
        })
      );
    });

    it('rating: 1-5 范围内的整数应通过验证', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (rating) => {
          const result = cityFormSchema.pick({ rating: true }).safeParse({ rating });
          expect(result.success).toBe(true);
        })
      );
    });

    it('rating: 范围外的整数应返回错误', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.integer({ min: 6, max: 100 }), fc.integer({ min: -100, max: 0 })),
          (invalidRating) => {
            const result = cityFormSchema
              .pick({ rating: true })
              .safeParse({ rating: invalidRating });
            expect(result.success).toBe(false);
          }
        )
      );
    });
  });

  // 认证表单逐字段验证
  describe('认证表单 (loginSchema / registerSchema) 逐字段验证', () => {
    it('email: 不含 @ 的字符串应返回错误', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes('@')),
          (invalidEmail) => {
            const result = loginSchema.pick({ email: true }).safeParse({ email: invalidEmail });
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('email: 有效邮箱应通过验证', () => {
      fc.assert(
        fc.property(validEmail, (email) => {
          const result = loginSchema.pick({ email: true }).safeParse({ email });
          expect(result.success).toBe(true);
        })
      );
    });

    it('password: 少于 8 个字符应返回错误', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 7 }), (shortPassword) => {
          const result = loginSchema
            .pick({ password: true })
            .safeParse({ password: shortPassword });
          expect(result.success).toBe(false);
        })
      );
    });

    it('password: 8-128 个字符应通过验证', () => {
      fc.assert(
        fc.property(validPassword, (password) => {
          const result = loginSchema.pick({ password: true }).safeParse({ password });
          expect(result.success).toBe(true);
        })
      );
    });

    it('password: 超过 128 个字符应返回错误', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 129, maxLength: 200 }), (longPassword) => {
          const result = loginSchema.pick({ password: true }).safeParse({ password: longPassword });
          expect(result.success).toBe(false);
        })
      );
    });
  });

  // 行程表单逐字段验证
  describe('行程表单 (tripFormSchema) 逐字段验证', () => {
    it('title: 空字符串应返回错误', () => {
      fc.assert(
        fc.property(fc.constant(''), (emptyTitle) => {
          const result = tripTitleSchema.safeParse({ title: emptyTitle });
          expect(result.success).toBe(false);
        })
      );
    });

    it('title: 任意非空字符串（≤200字符）应通过验证', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
          (title) => {
            const result = tripTitleSchema.safeParse({ title });
            expect(result.success).toBe(true);
          }
        )
      );
    });

    it('budget: 正数应通过验证', () => {
      fc.assert(
        fc.property(fc.double({ min: 0.01, max: 999999999.99, noNaN: true }), (budget) => {
          const result = tripBudgetSchema.safeParse({ budget });
          expect(result.success).toBe(true);
        })
      );
    });

    it('budget: 零或负数应返回错误', () => {
      fc.assert(
        fc.property(fc.double({ min: -10000, max: 0, noNaN: true }), (invalidBudget) => {
          const result = tripBudgetSchema.safeParse({ budget: invalidBudget });
          expect(result.success).toBe(false);
        })
      );
    });

    it('notes: 超过 5000 字符应返回错误', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 5001, maxLength: 5100 }), (longNotes) => {
          const result = tripNotesSchema.safeParse({ notes: longNotes });
          expect(result.success).toBe(false);
        })
      );
    });
  });

  // 整体验证一致性
  describe('整体验证一致性', () => {
    it('城市表单：所有必填字段有效时整体验证应通过', () => {
      fc.assert(
        fc.property(
          validCityName,
          validCityName,
          fc.constantFrom(...validContinents),
          validLatitude,
          validLongitude,
          validPastDate,
          fc.constantFrom(...validTripTypes),
          (cityName, countryName, continent, lat, lng, visitedAt, tripType) => {
            const result = cityFormSchema.safeParse({
              cityName,
              countryName,
              continent,
              latitude: lat,
              longitude: lng,
              visitedAt,
              tripType,
            });
            expect(result.success).toBe(true);
          }
        )
      );
    });

    it('城市表单：任一必填字段缺失时整体验证应失败', () => {
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
          validCityName,
          validCityName,
          fc.constantFrom(...validContinents),
          validLatitude,
          validLongitude,
          validPastDate,
          fc.constantFrom(...validTripTypes),
          fc.constantFrom(...requiredFields),
          (cityName, countryName, continent, lat, lng, visitedAt, tripType, fieldToRemove) => {
            const validData: Record<string, unknown> = {
              cityName,
              countryName,
              continent,
              latitude: lat,
              longitude: lng,
              visitedAt,
              tripType,
            };
            delete validData[fieldToRemove];
            const result = cityFormSchema.safeParse(validData);
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('登录表单：有效邮箱和密码应通过验证', () => {
      fc.assert(
        fc.property(validEmail, validPassword, (email, password) => {
          const result = loginSchema.safeParse({ email, password });
          expect(result.success).toBe(true);
        })
      );
    });

    it('登录表单：无效邮箱或短密码应失败', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes('@')),
          fc.string({ minLength: 1, maxLength: 7 }),
          (badEmail, shortPwd) => {
            const result = loginSchema.safeParse({
              email: badEmail,
              password: shortPwd,
            });
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('注册表单：密码不一致时应失败', () => {
      fc.assert(
        fc.property(
          validEmail,
          validPassword,
          validPassword.filter((p) => p.length >= 8),
          (email, password, confirmPassword) => {
            fc.pre(password !== confirmPassword);
            const result = registerSchema.safeParse({
              email,
              password,
              confirmPassword,
            });
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it('注册表单：密码一致时应通过验证', () => {
      fc.assert(
        fc.property(validEmail, validPassword, (email, password) => {
          const result = registerSchema.safeParse({
            email,
            password,
            confirmPassword: password,
          });
          expect(result.success).toBe(true);
        })
      );
    });
  });
});
