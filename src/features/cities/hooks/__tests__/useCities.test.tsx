/**
 * useCities Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCities } from '../useCities';
import { citiesApi } from '../../api';
import type { City } from '@/types/database';

// Mock citiesApi
vi.mock('../../api', () => ({
  citiesApi: {
    getAll: vi.fn(),
  },
}));

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 创建 wrapper
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取城市列表', async () => {
    const mockCities: City[] = [
      {
        id: '1',
        user_id: 'user1',
        city_name: '北京',
        country_name: '中国',
        continent: 'Asia',
        latitude: 39.9042,
        longitude: 116.4074,
        visited_at: '2024-01-01',
        trip_type: 'leisure',
        is_favorite: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(citiesApi.getAll).mockResolvedValue(mockCities);

    const { result } = renderHook(() => useCities(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCities);
    expect(citiesApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('应该处理获取失败的情况', async () => {
    const mockError = new Error('获取失败');
    vi.mocked(citiesApi.getAll).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('应该返回空数组当没有城市时', async () => {
    vi.mocked(citiesApi.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useCities(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
