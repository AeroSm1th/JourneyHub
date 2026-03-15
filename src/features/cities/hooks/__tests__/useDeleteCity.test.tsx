/**
 * useDeleteCity Hook 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteCity } from '../useDeleteCity';
import { citiesApi } from '../../api';

vi.mock('../../api', () => ({
  citiesApi: {
    delete: vi.fn(),
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

describe('useDeleteCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该成功删除城市', async () => {
    vi.mocked(citiesApi.delete).mockResolvedValue();

    const { result } = renderHook(() => useDeleteCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(citiesApi.delete).toHaveBeenCalledWith('1');
  });

  it('应该处理删除失败的情况', async () => {
    const mockError = new Error('删除失败');
    vi.mocked(citiesApi.delete).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDeleteCity(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('999');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('应该支持 mutateAsync', async () => {
    vi.mocked(citiesApi.delete).mockResolvedValue();

    const { result } = renderHook(() => useDeleteCity(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync('2');

    expect(citiesApi.delete).toHaveBeenCalledWith('2');
  });

  it('应该能够连续删除多个城市', async () => {
    vi.mocked(citiesApi.delete).mockResolvedValue();

    const { result } = renderHook(() => useDeleteCity(), {
      wrapper: createWrapper(),
    });

    // 删除第一个城市
    result.current.mutate('1');
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 重置状态
    result.current.reset();

    // 删除第二个城市
    result.current.mutate('2');
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(citiesApi.delete).toHaveBeenCalledTimes(2);
    expect(citiesApi.delete).toHaveBeenNthCalledWith(1, '1');
    expect(citiesApi.delete).toHaveBeenNthCalledWith(2, '2');
  });
});
