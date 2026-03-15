/**
 * 属性测试：城市记录点击显示详情
 *
 * 属性 14: 城市记录点击显示详情
 * 验证需求: 3.7
 *
 * 对于任何列表中的城市记录，当用户点击时，
 * 系统应该显示该记录的详细信息。
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CityDetailPanel } from '../CityDetailPanel';

// Mock useDeleteCity
vi.mock('@/features/cities/hooks/useDeleteCity', () => ({
  useDeleteCity: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助函数
// ============================================================================

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderDetail(city: any, props = {}) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CityDetailPanel city={city} {...props} />
    </QueryClientProvider>,
  );
}

// 使用纯字母生成器避免特殊字符导致 DOM 查询冲突
const arbSafeName = fc
  .stringMatching(/^[A-Z][a-z]{5,15}$/)
  .filter((s) => s.length >= 6);

const arbSafeCountry = fc
  .stringMatching(/^[A-Z][a-z]{5,15}$/)
  .filter((s) => s.length >= 6);

const arbSafeNotes = fc
  .stringMatching(/^[A-Za-z0-9 ]{10,60}$/)
  .filter((s) => s.trim().length >= 10);

/** 生成城市数据 - 使用安全字符串 */
const arbCity = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  city_name: arbSafeName,
  country_name: arbSafeCountry,
  continent: fc.constantFrom('Asia', 'Europe', 'Africa'),
  latitude: fc.double({ min: -89, max: 89, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -179, max: 179, noNaN: true, noDefaultInfinity: true }),
  visited_at: fc.constant('2024-06-15'),
  trip_type: fc.constantFrom('leisure', 'business', 'transit'),
  rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
  notes: fc.option(arbSafeNotes, { nil: undefined }),
  tags: fc.constant(undefined),
  cover_image: fc.constant(undefined),
  is_favorite: fc.boolean(),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
  updated_at: fc.constant('2024-01-01T00:00:00Z'),
});

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 14: 城市记录点击显示详情', () => {
  /**
   * 属性 14.1: 详情面板应显示城市名称
   */
  it('属性 14.1: 详情面板应显示城市名称', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = renderDetail(city);

        expect(screen.getByText(city.city_name)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * 属性 14.2: 详情面板应显示国家名称
   */
  it('属性 14.2: 详情面板应显示国家名称', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = renderDetail(city);

        // 使用 getAllByText 因为国家名可能在多处出现，只要至少有一个即可
        const elements = screen.getAllByText(city.country_name);
        expect(elements.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * 属性 14.3: 详情面板应显示大洲
   */
  it('属性 14.3: 详情面板应显示大洲信息', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = renderDetail(city);

        const elements = screen.getAllByText(city.continent);
        expect(elements.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * 属性 14.4: 详情面板应包含编辑和删除按钮
   */
  it('属性 14.4: 详情面板应包含编辑和删除按钮', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = renderDetail(city, {
          onEdit: vi.fn(),
          onDeleteSuccess: vi.fn(),
        });

        expect(screen.getByText('编辑')).toBeInTheDocument();
        expect(screen.getByText('删除')).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 20 },
    );
  });

  /**
   * 属性 14.5: 有备注时应显示备注内容
   */
  it('属性 14.5: 有备注时应显示备注内容', () => {
    // 使用不含尾部空格的备注生成器
    const arbSafeNotesNoTrail = fc
      .stringMatching(/^[A-Za-z0-9]{10,40}$/)
      .filter((s) => s.trim().length >= 10 && s === s.trim());

    const arbCityWithNotes = fc.record({
      id: fc.uuid(),
      user_id: fc.uuid(),
      city_name: arbSafeName,
      country_name: arbSafeCountry,
      continent: fc.constantFrom('Asia', 'Europe', 'Africa'),
      latitude: fc.double({ min: -89, max: 89, noNaN: true, noDefaultInfinity: true }),
      longitude: fc.double({ min: -179, max: 179, noNaN: true, noDefaultInfinity: true }),
      visited_at: fc.constant('2024-06-15'),
      trip_type: fc.constantFrom('leisure', 'business', 'transit'),
      rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
      notes: arbSafeNotesNoTrail,
      tags: fc.constant(undefined),
      cover_image: fc.constant(undefined),
      is_favorite: fc.boolean(),
      created_at: fc.constant('2024-01-01T00:00:00Z'),
      updated_at: fc.constant('2024-01-01T00:00:00Z'),
    });

    fc.assert(
      fc.property(arbCityWithNotes, (city) => {
        cleanup();
        const { unmount } = renderDetail(city);

        const elements = screen.getAllByText(city.notes);
        expect(elements.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 20 },
    );
  });
});
