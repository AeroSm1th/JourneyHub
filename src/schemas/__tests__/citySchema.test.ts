/**
 * 城市记录表单验证 Schema 单元测试
 *
 * 测试所有 Zod schema 的验证规则、边界条件和错误消息
 */

import { describe, it, expect } from 'vitest';
import {
  cityFormSchema,
  cityUpdateSchema,
  citySearchSchema,
  wishlistFormSchema,
  wishlistUpdateSchema,
} from '../citySchema';
import { TripType, Continent } from '@/types/entities';

describe('cityFormSchema', () => {
  describe('必填字段验证', () => {
    it('应该拒绝空的城市名称', () => {
      const result = cityFormSchema.safeParse({
        cityName: '',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('城市名称不能为空');
      }
    });

    it('应该拒绝超过 100 个字符的城市名称', () => {
      const longName = 'a'.repeat(101);
      const result = cityFormSchema.safeParse({
        cityName: longName,
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('城市名称不能超过 100 个字符');
      }
    });

    it('应该自动去除城市名称的首尾空格', () => {
      const result = cityFormSchema.safeParse({
        cityName: '  北京  ',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cityName).toBe('北京');
      }
    });

    it('应该拒绝空的国家名称', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('国家名称不能为空');
      }
    });
  });

  describe('大洲字段验证', () => {
    it('应该接受有效的大洲值', () => {
      const continents = [
        Continent.Asia,
        Continent.Europe,
        Continent.Africa,
        Continent.NorthAmerica,
        Continent.SouthAmerica,
        Continent.Oceania,
        Continent.Antarctica,
      ];

      continents.forEach((continent) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的大洲值', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: 'InvalidContinent',
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 的错误消息格式
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });
  });

  describe('坐标字段验证', () => {
    it('应该接受有效的纬度范围 (-90 到 90)', () => {
      const validLatitudes = [-90, -45, 0, 45, 90];

      validLatitudes.forEach((latitude) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超出范围的纬度', () => {
      const invalidLatitudes = [-91, 91, -100, 100];

      invalidLatitudes.forEach((latitude) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('纬度必须在 -90 到 90 之间');
        }
      });
    });

    it('应该接受有效的经度范围 (-180 到 180)', () => {
      const validLongitudes = [-180, -90, 0, 90, 180];

      validLongitudes.forEach((longitude) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超出范围的经度', () => {
      const invalidLongitudes = [-181, 181, -200, 200];

      invalidLongitudes.forEach((longitude) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('经度必须在 -180 到 180 之间');
        }
      });
    });

    it('应该拒绝非数字的坐标', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 'invalid',
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 的类型错误消息格式
        expect(result.error.issues[0].message).toContain('Invalid input');
      }
    });
  });

  describe('访问日期验证', () => {
    it('应该接受过去的日期', () => {
      const pastDate = new Date('2020-01-01');
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: pastDate,
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(true);
    });

    it('应该接受今天的日期', () => {
      const today = new Date();
      // 设置时间为当天开始，避免毫秒级差异
      today.setHours(0, 0, 0, 0);

      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: today,
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝未来的日期', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: futureDate,
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('访问日期不能是未来日期');
      }
    });
  });

  describe('旅行类型验证', () => {
    it('应该接受所有有效的旅行类型', () => {
      const tripTypes = [TripType.Leisure, TripType.Business, TripType.Transit];

      tripTypes.forEach((tripType) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的旅行类型', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 的枚举错误消息格式
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });
  });

  describe('可选字段验证', () => {
    it('应该接受有效的评分 (1-5)', () => {
      const validRatings = [1, 2, 3, 4, 5];

      validRatings.forEach((rating) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
          rating,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超出范围的评分', () => {
      const invalidRatings = [0, 6, -1, 10];

      invalidRatings.forEach((rating) => {
        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
          rating,
        });

        expect(result.success).toBe(false);
      });
    });

    it('应该拒绝非整数的评分', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        rating: 3.5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('评分必须是整数');
      }
    });

    it('应该接受有效的备注 (最多 2000 字符)', () => {
      const validNotes = 'a'.repeat(2000);
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        notes: validNotes,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝超过 2000 字符的备注', () => {
      const longNotes = 'a'.repeat(2001);
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        notes: longNotes,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('备注不能超过 2000 个字符');
      }
    });

    it('应该接受有效的标签数组 (最多 10 个)', () => {
      const validTags = Array(10).fill('tag');
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        tags: validTags,
      });

      expect(result.success).toBe(true);
    });

    it('应该拒绝超过 10 个标签', () => {
      const tooManyTags = Array(11).fill('tag');
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        tags: tooManyTags,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('最多只能添加 10 个标签');
      }
    });

    it('应该拒绝空标签', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        tags: [''],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('标签不能为空');
      }
    });

    it('应该拒绝超过 50 字符的标签', () => {
      const longTag = 'a'.repeat(51);
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        tags: [longTag],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('标签不能超过 50 个字符');
      }
    });
  });

  describe('图片上传验证', () => {
    it('应该接受有效的图片文件 (JPG, PNG, WebP, ≤5MB)', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      validTypes.forEach((type) => {
        const file = new File([''], 'test.jpg', { type });
        Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 });

        const result = cityFormSchema.safeParse({
          cityName: '北京',
          countryName: '中国',
          continent: Continent.Asia,
          latitude: 39.9,
          longitude: 116.4,
          visitedAt: new Date('2024-01-01'),
          tripType: TripType.Leisure,
          coverImage: file,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超过 5MB 的图片', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        coverImage: file,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('图片大小不能超过 5MB');
      }
    });

    it('应该拒绝不支持的图片格式', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });

      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        coverImage: file,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('只支持 JPG、PNG、WebP 格式的图片');
      }
    });
  });

  describe('完整表单验证', () => {
    it('应该接受所有必填字段都有效的表单', () => {
      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
      });

      expect(result.success).toBe(true);
    });

    it('应该接受包含所有可选字段的完整表单', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 });

      const result = cityFormSchema.safeParse({
        cityName: '北京',
        countryName: '中国',
        continent: Continent.Asia,
        latitude: 39.9,
        longitude: 116.4,
        visitedAt: new Date('2024-01-01'),
        tripType: TripType.Leisure,
        rating: 5,
        notes: '很棒的旅行体验',
        tags: ['历史', '文化', '美食'],
        coverImage: file,
        isFavorite: true,
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('cityUpdateSchema', () => {
  it('应该允许部分更新（所有字段可选）', () => {
    const result = cityUpdateSchema.safeParse({
      cityName: '上海',
    });

    expect(result.success).toBe(true);
  });

  it('应该验证提供的字段', () => {
    const result = cityUpdateSchema.safeParse({
      rating: 10, // 超出范围
    });

    expect(result.success).toBe(false);
  });
});

describe('wishlistFormSchema', () => {
  describe('必填字段验证', () => {
    it('应该接受所有必填字段都有效的表单', () => {
      const result = wishlistFormSchema.safeParse({
        cityName: '巴黎',
        countryName: '法国',
        continent: Continent.Europe,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(result.success).toBe(true);
    });

    it('应该为优先级设置默认值 3', () => {
      const result = wishlistFormSchema.safeParse({
        cityName: '巴黎',
        countryName: '法国',
        continent: Continent.Europe,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe(3);
      }
    });
  });

  describe('优先级验证', () => {
    it('应该接受有效的优先级 (1-5)', () => {
      const validPriorities = [1, 2, 3, 4, 5];

      validPriorities.forEach((priority) => {
        const result = wishlistFormSchema.safeParse({
          cityName: '巴黎',
          countryName: '法国',
          continent: Continent.Europe,
          latitude: 48.8566,
          longitude: 2.3522,
          priority,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝超出范围的优先级', () => {
      const invalidPriorities = [0, 6, -1, 10];

      invalidPriorities.forEach((priority) => {
        const result = wishlistFormSchema.safeParse({
          cityName: '巴黎',
          countryName: '法国',
          continent: Continent.Europe,
          latitude: 48.8566,
          longitude: 2.3522,
          priority,
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe('期望季节验证', () => {
    it('应该接受有效的季节', () => {
      const validSeasons = ['spring', 'summer', 'autumn', 'winter'];

      validSeasons.forEach((expectedSeason) => {
        const result = wishlistFormSchema.safeParse({
          cityName: '巴黎',
          countryName: '法国',
          continent: Continent.Europe,
          latitude: 48.8566,
          longitude: 2.3522,
          expectedSeason,
        });

        expect(result.success).toBe(true);
      });
    });

    it('应该拒绝无效的季节', () => {
      const result = wishlistFormSchema.safeParse({
        cityName: '巴黎',
        countryName: '法国',
        continent: Continent.Europe,
        latitude: 48.8566,
        longitude: 2.3522,
        expectedSeason: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 的枚举错误消息格式
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });
  });
});
