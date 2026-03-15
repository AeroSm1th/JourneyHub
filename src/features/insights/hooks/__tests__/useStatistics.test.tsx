/**
 * useStatistics Hook 测试
 *
 * 验证需求: 6.1, 6.2, 6.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStatistics } from '../useStatistics';
import { citiesApi } from '@/features/cities/api';
import type { City } from '@/types/database';

vi.mock('@/features/cities/api', () => ({
  citiesApi: {
    getAll: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockCities: City[] = [
  {
    id: '1',
    user_id: 'user1',
    city_name: '东京',
    country_name: '日本',
    continent: 'Asia',
    latitude: 35.6762,
    longitude: 139.6503,
    visited_at: '2024-01-15',
    trip_type: 'leisure',
    rating: 5,
    is_favorite: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    city_name: '巴黎',
    country_name: '法国',
    continent: 'Europe',
    latitude: 48.8566,
    longitude: 2.3522,
    visited_at: '2024-03-20',
    trip_type: 'leisure',
    rating: 4,
    is_favorite: false,
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    city_name: '上海',
    country_name: '中国',
    continent: 'Asia',
    latitude: 31.2304,
    longitude: 121.4737,
    visited_at: '2023-06-10',
    trip_type: 'business',
    rating: 4,
    is_favorite: false,
    created_at: '2023-06-10T00:00:00Z',
    updated_at: '2023-06-10T00:00:00Z',
  },
];

describe('useStatistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在加载时返回 isLoading 为 true', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    vi.mocked(citiesApi.getAll).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.statistics).toBeUndefined();
  });

  it('应该基于城市数据正确计算统计信息', async () => {
    vi.mocked(citiesApi.getAll).mockResolvedValue(mockCities);

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 需求 6.1: 已访问城市总数
    expect(result.current.totalCities).toBe(3);
    expect(result.current.statistics?.totalCities).toBe(3);

    // 需求 6.2: 已访问国家总数
    expect(result.current.totalCountries).toBe(3);
    expect(result.current.statistics?.totalCountries).toBe(3);

    // 需求 6.3: 已访问大洲数量
    expect(result.current.totalContinents).toBe(2); // Asia, Europe
    expect(result.current.statistics?.totalContinents).toBe(2);
  });

  it('应该正确计算大洲覆盖率', async () => {
    vi.mocked(citiesApi.getAll).mockResolvedValue(mockCities);

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 2 大洲 / 7 大洲 ≈ 29%
    expect(result.current.continentCoverage).toBe(29);
  });

  it('应该正确计算平均评分', async () => {
    vi.mocked(citiesApi.getAll).mockResolvedValue(mockCities);

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // (5 + 4 + 4) / 3 ≈ 4.3
    expect(result.current.averageRating).toBe(4.3);
  });

  it('当没有城市数据时应该返回 undefined 统计', async () => {
    vi.mocked(citiesApi.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.statistics).toBeUndefined();
    expect(result.current.totalCities).toBe(0);
    expect(result.current.totalCountries).toBe(0);
    expect(result.current.totalContinents).toBe(0);
    expect(result.current.continentCoverage).toBe(0);
    expect(result.current.averageRating).toBeUndefined();
  });

  it('应该在加载失败时返回错误', async () => {
    const mockError = new Error('获取城市数据失败');
    vi.mocked(citiesApi.getAll).mockRejectedValue(mockError);

    const { result } = renderHook(() => useStatistics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toBe('获取城市数据失败');
    expect(result.current.statistics).toBeUndefined();
  });
});
