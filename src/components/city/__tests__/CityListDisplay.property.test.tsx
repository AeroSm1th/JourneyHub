/**
 * 属性测试：城市列表显示
 *
 * 属性 13: 城市列表显示
 * 验证需求: 3.6
 *
 * 对于任何用户的城市记录集合，系统应该在侧边栏列表中显示所有记录。
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CityList } from '../CityList';

// Mock useCities hook
const mockUseCities = vi.fn();
vi.mock('@/features/cities/hooks/useCities', () => ({
  useCities: () => mockUseCities(),
}));

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助函数
// ============================================================================

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

function renderCityList(props = {}) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CityList {...props} />
    </QueryClientProvider>
  );
}

// 使用纯字母生成器避免特殊字符导致 DOM 查询冲突
const arbSafeName = fc
  .stringMatching(/^[A-Z][a-z]{5,15}$/)
  .filter((s) => s.length >= 6);

const arbSafeCountry = fc
  .stringMatching(/^[A-Z][a-z]{5,15}$/)
  .filter((s) => s.length >= 6);

/** 生成城市数据（snake_case） */
const arbCity = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  city_name: arbSafeName,
  country_name: arbSafeCountry,
  continent: fc.constantFrom('Asia', 'Europe', 'Africa'),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  visited_at: fc.constantFrom('2024-01-15', '2024-03-20', '2023-12-01', '2024-06-10'),
  trip_type: fc.constantFrom('leisure', 'business', 'transit'),
  rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  notes: fc.constant(undefined),
  tags: fc.constant(undefined),
  cover_image: fc.constant(undefined),
  is_favorite: fc.boolean(),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  updated_at: fc.constant('2024-01-01T00:00:00Z'),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 13: 城市列表显示', () => {
  /**
   * 属性 13.1: 列表应显示所有城市记录
   */
  it('属性 13.1: 列表应为每个城市渲染一个列表项', () => {
    fc.assert(
      fc.property(fc.array(arbCity, { minLength: 1, maxLength: 10 }), (cities) => {
        cleanup();
        // 确保 ID 和名称唯一
        const uniqueCities = cities.map((c, i) => ({
          ...c,
          id: `city-${i}`,
          city_name: `${c.city_name}${i}`,
        }));

        mockUseCities.mockReturnValue({
          data: uniqueCities,
          isLoading: false,
          error: null,
        });

        const { unmount } = renderCityList();

        // 每个城市名称应出现在列表中
        uniqueCities.forEach((city) => {
          const elements = screen.getAllByText(city.city_name);
          expect(elements.length).toBeGreaterThanOrEqual(1);
        });

        unmount();
      }),
      { numRuns: 20 },
    );
  });

  /**
   * 属性 13.2: 空列表应显示空状态提示
   */
  it('属性 13.2: 没有城市记录时应显示空状态', () => {
    mockUseCities.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { unmount } = renderCityList();

    expect(screen.getByText(/还没有城市记录/)).toBeInTheDocument();

    unmount();
  });

  /**
   * 属性 13.3: 加载中应显示 Spinner
   */
  it('属性 13.3: 数据加载中应显示加载指示器', () => {
    mockUseCities.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { unmount } = renderCityList();

    // 应该有加载状态的容器
    const loadingEl = document.querySelector('.city-list-loading');
    expect(loadingEl).toBeInTheDocument();

    unmount();
  });

  /**
   * 属性 13.4: 错误状态应显示错误信息
   */
  it('属性 13.4: 加载失败应显示错误信息', () => {
    mockUseCities.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('网络错误'),
    });

    const { unmount } = renderCityList();

    expect(screen.getByText(/加载城市列表失败/)).toBeInTheDocument();

    unmount();
  });

  /**
   * 属性 13.5: 列表应显示城市总数
   */
  it('属性 13.5: 列表头部应显示城市总数', () => {
    fc.assert(
      fc.property(fc.array(arbCity, { minLength: 1, maxLength: 5 }), (cities) => {
        cleanup();
        const uniqueCities = cities.map((c, i) => ({ ...c, id: `city-${i}` }));

        mockUseCities.mockReturnValue({
          data: uniqueCities,
          isLoading: false,
          error: null,
        });

        const { unmount } = renderCityList();

        expect(screen.getByText(`${uniqueCities.length} 个城市`)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 10 },
    );
  });
});
