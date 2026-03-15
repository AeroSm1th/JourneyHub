import { describe, it, expect, vi, beforeEach } from 'vitest';
import { citiesApi } from '../api';
import { supabase } from '@/services/supabase/client';
import type { City } from '@/types/database';

// Mock Supabase 客户端
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('citiesApi', () => {
  const mockCity: City = {
    id: '1',
    user_id: 'user-1',
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9042,
    longitude: 116.4074,
    visited_at: '2024-01-01',
    trip_type: 'leisure',
    rating: 5,
    notes: '很棒的城市',
    tags: ['历史', '文化'],
    cover_image: 'https://example.com/image.jpg',
    is_favorite: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('应该获取所有城市记录', async () => {
      const mockData = [mockCity];
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any);

      const result = await citiesApi.getAll();

      expect(result).toEqual(mockData);
    });
  });
});
