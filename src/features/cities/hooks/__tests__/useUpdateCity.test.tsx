/**
 * useUpdateCity Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCity } from '../useUpdateCity';
import { citiesApi } from '../../api';
import type { City, CityInsert } from '@/types/database';

vi.mock('../../api', () => ({
  citiesApi: {
    update: vi.fn(),
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

describe('useUpdateCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功更新城市', async () => {
    const updates: Partial<CityInsert> = {
      rating: 5,
      notes: '非常棒的城市',
      is_favorite: true,
    };

    const updatedCity: City = {
      id: '1',
      user_id: 'user1',
      city_name: '成都',
      country_name: '中国',
      continent: 'Asia',
      latitude: 30.5728,
      longitude: 104.0668,
      visited_at: '2024-06-01',
      trip_type: 'leisure',
      ...updates,
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z',
    };

    vi.mocked(citiesApi.update).mockResolvedValue(updatedCity);

    const { result } = renderHook(() => useUpdateCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: '1', updates });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedCity);
    expect(citiesApi.update).toHaveBeenCalledWith('1', updates);
  });

  it('应该处理更新失败的情况', async () => {
    const updates: Partial<CityInsert> = {
      city_name: '西安',
    };

    const mockError = new Error('更新失败');
    vi.mocked(citiesApi.update).mockRejectedValue(mockError);

    const { result } = renderHook(() => useUpdateCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: '999', updates });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('应该支持 mutateAsync', async () => {
    const updates: Partial<CityInsert> = {
      notes: '更新的备注',
    };

    const updatedCity: City = {
      id: '2',
      user_id: 'user1',
      city_name: '重庆',
      country_name: '中国',
      continent: 'Asia',
      latitude: 29.563,
      longitude: 106.5516,
      visited_at: '2024-07-01',
      trip_type: 'business',
      is_favorite: false,
      notes: '更新的备注',
      created_at: '2024-07-01T00:00:00Z',
      updated_at: '2024-07-15T00:00:00Z',
    };

    vi.mocked(citiesApi.update).mockResolvedValue(updatedCity);

    const { result } = renderHook(() => useUpdateCity(), {
      wrapper: createWrapper(),
    });

    const city = await result.current.mutateAsync({ id: '2', updates });

    expect(city).toEqual(updatedCity);
  });
});
