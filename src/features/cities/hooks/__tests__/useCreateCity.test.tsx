/**
 * useCreateCity Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCity } from '../useCreateCity';
import { citiesApi } from '../../api';
import type { City, CityInsert } from '@/types/database';

vi.mock('../../api', () => ({
  citiesApi: {
    create: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
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

describe('useCreateCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功创建城市', async () => {
    const newCityData: CityInsert = {
      user_id: 'user1',
      city_name: '广州',
      country_name: '中国',
      continent: 'Asia',
      latitude: 23.1291,
      longitude: 113.2644,
      visited_at: '2024-03-01',
      trip_type: 'leisure',
      is_favorite: false,
    };

    const createdCity: City = {
      id: '3',
      ...newCityData,
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
    };

    vi.mocked(citiesApi.create).mockResolvedValue(createdCity);

    const { result } = renderHook(() => useCreateCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newCityData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdCity);
    expect(citiesApi.create).toHaveBeenCalledWith(newCityData);
  });

  it('应该处理创建失败的情况', async () => {
    const newCityData: CityInsert = {
      user_id: 'user1',
      city_name: '深圳',
      country_name: '中国',
      continent: 'Asia',
      latitude: 22.5431,
      longitude: 114.0579,
      visited_at: '2024-04-01',
      trip_type: 'business',
      is_favorite: false,
    };

    const mockError = new Error('创建失败');
    vi.mocked(citiesApi.create).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCreateCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newCityData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('应该支持 mutateAsync', async () => {
    const newCityData: CityInsert = {
      user_id: 'user1',
      city_name: '杭州',
      country_name: '中国',
      continent: 'Asia',
      latitude: 30.2741,
      longitude: 120.1551,
      visited_at: '2024-05-01',
      trip_type: 'leisure',
      is_favorite: true,
    };

    const createdCity: City = {
      id: '4',
      ...newCityData,
      created_at: '2024-05-01T00:00:00Z',
      updated_at: '2024-05-01T00:00:00Z',
    };

    vi.mocked(citiesApi.create).mockResolvedValue(createdCity);

    const { result } = renderHook(() => useCreateCity(), {
      wrapper: createWrapper(),
    });

    const city = await result.current.mutateAsync(newCityData);

    expect(city).toEqual(createdCity);
  });
});
