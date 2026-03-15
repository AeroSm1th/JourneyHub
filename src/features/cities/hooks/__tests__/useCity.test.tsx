/**
 * useCity Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCity } from '../useCity';
import { citiesApi } from '../../api';
import type { City } from '@/types/database';

vi.mock('../../api', () => ({
  citiesApi: {
    getById: vi.fn(),
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

describe('useCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功获取单个城市', async () => {
    const mockCity: City = {
      id: '1',
      user_id: 'user1',
      city_name: '上海',
      country_name: '中国',
      continent: 'Asia',
      latitude: 31.2304,
      longitude: 121.4737,
      visited_at: '2024-02-01',
      trip_type: 'business',
      rating: 5,
      is_favorite: true,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    };

    vi.mocked(citiesApi.getById).mockResolvedValue(mockCity);

    const { result } = renderHook(() => useCity('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCity);
    expect(citiesApi.getById).toHaveBeenCalledWith('1');
  });

  it('应该处理获取失败的情况', async () => {
    const mockError = new Error('城市不存在');
    vi.mocked(citiesApi.getById).mockRejectedValue(mockError);

    const { result } = renderHook(() => useCity('999'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('当 enabled 为 false 时不应该发起请求', () => {
    const { result } = renderHook(() => useCity('1', { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(citiesApi.getById).not.toHaveBeenCalled();
  });

  it('当 id 为空时不应该发起请求', () => {
    const { result } = renderHook(() => useCity(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(citiesApi.getById).not.toHaveBeenCalled();
  });
});
