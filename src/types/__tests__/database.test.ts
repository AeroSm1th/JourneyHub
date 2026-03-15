/**
 * 数据库类型定义测试
 *
 * 验证类型定义的正确性和完整性
 */

import { describe, it, expect } from 'vitest';
import type {
  City,
  CityInsert,
  CityUpdate,
  WishlistItem,
  Trip,
  TripDay,
  TripTask,
  Share,
  User,
} from '../database';

describe('数据库类型定义测试', () => {
  describe('City 类型', () => {
    it('应该包含所有必需字段', () => {
      const city: City = {
        id: 'test-id',
        user_id: 'user-id',
        city_name: '北京',
        country_name: '中国',
        continent: 'Asia',
        latitude: 39.9042,
        longitude: 116.4074,
        visited_at: '2024-01-15',
        trip_type: 'leisure',
        is_favorite: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      expect(city.city_name).toBe('北京');
      expect(city.trip_type).toBe('leisure');
    });

    it('应该支持可选字段', () => {
      const city: City = {
        id: 'test-id',
        user_id: 'user-id',
        city_name: '上海',
        country_name: '中国',
        continent: 'Asia',
        latitude: 31.2304,
        longitude: 121.4737,
        visited_at: '2024-01-15',
        trip_type: 'business',
        rating: 5,
        notes: '很棒的城市',
        tags: ['商务', '现代'],
        cover_image: 'https://example.com/image.jpg',
        is_favorite: true,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      expect(city.rating).toBe(5);
      expect(city.tags).toEqual(['商务', '现代']);
    });
  });

  describe('CityInsert 类型', () => {
    it('应该排除自动生成的字段', () => {
      const cityInsert: CityInsert = {
        user_id: 'user-id',
        city_name: '广州',
        country_name: '中国',
        continent: 'Asia',
        latitude: 23.1291,
        longitude: 113.2644,
        visited_at: '2024-01-15',
        trip_type: 'leisure',
        is_favorite: false,
      };

      // 验证不包含 id, created_at, updated_at
      expect(cityInsert).not.toHaveProperty('id');
      expect(cityInsert).not.toHaveProperty('created_at');
      expect(cityInsert).not.toHaveProperty('updated_at');
    });
  });

  describe('CityUpdate 类型', () => {
    it('应该允许部分更新', () => {
      const cityUpdate: CityUpdate = {
        rating: 4,
        notes: '更新的备注',
      };

      expect(cityUpdate.rating).toBe(4);
    });

    it('应该允许更新单个字段', () => {
      const cityUpdate: CityUpdate = {
        is_favorite: true,
      };

      expect(cityUpdate.is_favorite).toBe(true);
    });
  });

  describe('WishlistItem 类型', () => {
    it('应该包含所有必需字段', () => {
      const wishlistItem: WishlistItem = {
        id: 'test-id',
        user_id: 'user-id',
        city_name: '东京',
        country_name: '日本',
        continent: 'Asia',
        latitude: 35.6762,
        longitude: 139.6503,
        priority: 3,
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(wishlistItem.city_name).toBe('东京');
      expect(wishlistItem.priority).toBe(3);
    });
  });

  describe('Trip 类型', () => {
    it('应该包含所有必需字段', () => {
      const trip: Trip = {
        id: 'test-id',
        user_id: 'user-id',
        title: '日本之旅',
        start_date: '2024-03-01',
        end_date: '2024-03-10',
        status: 'planning',
        share_enabled: false,
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      expect(trip.title).toBe('日本之旅');
      expect(trip.status).toBe('planning');
    });

    it('应该支持所有状态值', () => {
      const statuses: Trip['status'][] = ['planning', 'ongoing', 'completed'];

      statuses.forEach((status) => {
        const trip: Trip = {
          id: 'test-id',
          user_id: 'user-id',
          title: '测试行程',
          start_date: '2024-03-01',
          end_date: '2024-03-10',
          status,
          share_enabled: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        };

        expect(trip.status).toBe(status);
      });
    });
  });

  describe('TripDay 类型', () => {
    it('应该包含所有必需字段', () => {
      const tripDay: TripDay = {
        id: 'test-id',
        trip_id: 'trip-id',
        day_index: 1,
        date: '2024-03-01',
      };

      expect(tripDay.day_index).toBe(1);
    });
  });

  describe('TripTask 类型', () => {
    it('应该包含所有必需字段', () => {
      const tripTask: TripTask = {
        id: 'test-id',
        trip_id: 'trip-id',
        content: '预订酒店',
        is_done: false,
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(tripTask.content).toBe('预订酒店');
      expect(tripTask.is_done).toBe(false);
    });
  });

  describe('Share 类型', () => {
    it('应该包含所有必需字段', () => {
      const share: Share = {
        id: 'test-id',
        user_id: 'user-id',
        type: 'all',
        slug: 'unique-slug',
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(share.type).toBe('all');
      expect(share.slug).toBe('unique-slug');
    });

    it('应该支持所有类型值', () => {
      const types: Share['type'][] = ['all', 'trip'];

      types.forEach((type) => {
        const share: Share = {
          id: 'test-id',
          user_id: 'user-id',
          type,
          slug: 'unique-slug',
          created_at: '2024-01-15T00:00:00Z',
        };

        expect(share.type).toBe(type);
      });
    });
  });

  describe('User 类型', () => {
    it('应该包含所有必需字段', () => {
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(user.email).toBe('test@example.com');
    });

    it('应该支持可选字段', () => {
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        nickname: '测试用户',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-15T00:00:00Z',
      };

      expect(user.nickname).toBe('测试用户');
      expect(user.avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('枚举类型', () => {
    it('trip_type 应该只接受有效值', () => {
      const validTypes: City['trip_type'][] = ['leisure', 'business', 'transit'];

      validTypes.forEach((type) => {
        const city: City = {
          id: 'test-id',
          user_id: 'user-id',
          city_name: '测试城市',
          country_name: '测试国家',
          continent: 'Asia',
          latitude: 0,
          longitude: 0,
          visited_at: '2024-01-15',
          trip_type: type,
          is_favorite: false,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        };

        expect(city.trip_type).toBe(type);
      });
    });
  });
});
