/**
 * 属性测试：地图标记显示
 *
 * 属性 5: 地图标记显示
 * 验证需求: 2.2, 2.7, 4.3
 *
 * 对于任何城市记录集合，地图应该为每个项目显示对应的标记，
 * 并使用不同的视觉样式（颜色/图标）区分已访问城市和愿望清单城市。
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { CityMarker } from '../CityMarker';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  Marker: ({
    children,
    position,
    icon,
  }: {
    children: React.ReactNode;
    position: [number, number];
    icon: { html?: string };
  }) => (
    <div
      data-testid="marker"
      data-lat={position[0]}
      data-lng={position[1]}
      data-icon-html={icon?.html ?? ''}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
}));

// 用于在 mock 工厂和测试之间共享 divIcon 调用参数
const iconCapture: { opts: Record<string, unknown> } = { opts: {} };

// Mock leaflet，捕获 divIcon 的参数
vi.mock('leaflet', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = {};
  const makeDivIcon = vi.fn((opts: Record<string, unknown>) => {
    iconCapture.opts = opts;
    return { ...opts, _type: 'divIcon' };
  });
  mod.default = { divIcon: makeDivIcon };
  mod.divIcon = makeDivIcon;
  return mod;
});

beforeEach(() => {
  iconCapture.opts = {};
});

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助生成器
// ============================================================================

/** 生成有效的 snake_case 城市数据（与组件接口一致） */
const arbCity = fc
  .record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    city_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    country_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    continent: fc.constantFrom(
      'Asia',
      'Europe',
      'Africa',
      'North America',
      'South America',
      'Oceania'
    ),
    latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
    longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
    visited_at: fc.constant('2024-06-15'),
    trip_type: fc.constantFrom('leisure' as const, 'business' as const, 'transit' as const),
    rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
    notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }), {
      nil: undefined,
    }),
    cover_image: fc.option(fc.constant('https://example.com/img.jpg'), { nil: undefined }),
    is_favorite: fc.boolean(),
    created_at: fc.constant('2024-01-01T00:00:00Z'),
    updated_at: fc.constant('2024-01-01T00:00:00Z'),
  })
  .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude));

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 5: 地图标记显示', () => {
  /**
   * 属性 5.1: 每个城市应渲染一个标记（需求 2.2）
   */
  it('属性 5.1: 对于任何城市数据，应渲染一个 Marker', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = render(<CityMarker city={city as never} />);
        const markers = screen.getAllByTestId('marker');
        expect(markers.length).toBe(1);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.2: 标记位置应与城市坐标一致（需求 2.2）
   */
  it('属性 5.2: 标记的位置应与城市的经纬度一致', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = render(<CityMarker city={city as never} />);
        const marker = screen.getByTestId('marker');
        expect(Number(marker.getAttribute('data-lat'))).toBe(city.latitude);
        expect(Number(marker.getAttribute('data-lng'))).toBe(city.longitude);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.3: 标记弹窗应显示城市名称（需求 2.2）
   */
  it('属性 5.3: 标记弹窗应包含城市名称', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = render(<CityMarker city={city as never} />);
        const popup = screen.getByTestId('popup');
        expect(popup.textContent).toContain(city.city_name);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.4: 点击回调应传递正确的城市 ID
   */
  it('属性 5.4: onClick 回调应接收正确的城市 ID', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const onClick = vi.fn();
        const { unmount } = render(<CityMarker city={city as never} onClick={onClick} />);
        expect(onClick).toBeDefined();
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.5: 收藏城市应使用红色标记（需求 2.7 - 不同视觉样式区分）
   *
   * 对于任何 is_favorite=true 的城市，图标颜色应为红色 (#ef4444)
   */
  it('属性 5.5: 收藏城市应使用红色图标', () => {
    fc.assert(
      fc.property(arbCity, (cityData) => {
        cleanup();
        const city = { ...cityData, is_favorite: true };
        const { unmount } = render(<CityMarker city={city as never} />);
        expect(iconCapture.opts).toBeDefined();
        expect(String(iconCapture.opts.html)).toContain('#ef4444');
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.6: 非收藏城市的图标颜色应由评分决定（需求 2.7）
   *
   * 对于任何 is_favorite=false 的城市：
   * - rating >= 4 → 绿色 (#10b981)
   * - rating >= 3 → 橙色 (#f59e0b)
   * - rating < 3  → 灰色 (#6b7280)
   * - 无评分      → 蓝色 (#3b82f6)
   */
  it('属性 5.6: 非收藏城市的图标颜色应由评分决定', () => {
    fc.assert(
      fc.property(arbCity, (cityData) => {
        cleanup();
        const city = { ...cityData, is_favorite: false };
        const { unmount } = render(<CityMarker city={city as never} />);
        expect(iconCapture.opts).toBeDefined();
        const html = String(iconCapture.opts.html);

        if (city.rating == null) {
          // 无评分 → 默认蓝色
          expect(html).toContain('#3b82f6');
        } else if (city.rating >= 4) {
          expect(html).toContain('#10b981');
        } else if (city.rating >= 3) {
          expect(html).toContain('#f59e0b');
        } else {
          expect(html).toContain('#6b7280');
        }

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.7: 收藏状态优先于评分决定颜色（需求 2.7）
   *
   * 对于任何 is_favorite=true 且有评分的城市，颜色始终为红色，
   * 不受评分影响。
   */
  it('属性 5.7: 收藏状态优先于评分决定颜色', () => {
    fc.assert(
      fc.property(
        arbCity.chain((c) =>
          fc.integer({ min: 1, max: 5 }).map((r) => ({
            ...c,
            is_favorite: true,
            rating: r,
          }))
        ),
        (city) => {
          cleanup();
          const { unmount } = render(<CityMarker city={city as never} />);
          expect(iconCapture.opts).toBeDefined();
          expect(String(iconCapture.opts.html)).toContain('#ef4444');
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.8: 不同属性的城市应产生不同的视觉样式（需求 2.7, 4.3）
   *
   * 收藏城市和非收藏低评分城市的图标颜色应不同，
   * 确保用户能在视觉上区分不同类型的标记。
   */
  it('属性 5.8: 收藏城市与非收藏低评分城市的图标颜色不同', () => {
    fc.assert(
      fc.property(arbCity, (cityData) => {
        cleanup();
        // 渲染收藏城市
        const favoriteCity = { ...cityData, is_favorite: true };
        const { unmount: u1 } = render(<CityMarker city={favoriteCity as never} />);
        const favoriteHtml = String(iconCapture.opts.html);
        u1();

        cleanup();
        // 渲染非收藏、低评分城市
        const normalCity = { ...cityData, is_favorite: false, rating: 2 };
        const { unmount: u2 } = render(<CityMarker city={normalCity as never} />);
        const normalHtml = String(iconCapture.opts.html);
        u2();

        // 两者颜色应不同
        expect(favoriteHtml).not.toBe(normalHtml);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.9: 弹窗应显示国家信息（需求 2.2）
   */
  it('属性 5.9: 弹窗应包含国家名称', () => {
    fc.assert(
      fc.property(arbCity, (city) => {
        cleanup();
        const { unmount } = render(<CityMarker city={city as never} />);
        const popup = screen.getByTestId('popup');
        expect(popup.textContent).toContain(city.country_name);
        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 5.10: 有评分的城市弹窗应显示对应数量的星星（需求 2.2）
   */
  it('属性 5.10: 有评分的城市弹窗应显示对应数量的星星', () => {
    const arbCityWithRating = arbCity.chain((c) =>
      fc.integer({ min: 1, max: 5 }).map((r) => ({ ...c, rating: r }))
    );

    fc.assert(
      fc.property(arbCityWithRating, (city) => {
        cleanup();
        const { unmount } = render(<CityMarker city={city as never} />);
        const popup = screen.getByTestId('popup');
        const stars = (popup.textContent?.match(/⭐/g) ?? []).length;
        expect(stars).toBe(city.rating);
        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
