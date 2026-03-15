/**
 * 属性测试：城市标记点击显示详情
 *
 * 属性 7: 城市标记点击显示详情
 * 验证需求: 2.4
 *
 * 对于任何地图上的城市标记，当用户点击时，
 * 系统应该显示该城市的详细信息。
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { CityMarker } from '../CityMarker';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  Marker: ({ children, eventHandlers }: any) => (
    <div data-testid="marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn((opts) => ({ ...opts, _type: 'divIcon' })),
  },
  divIcon: vi.fn((opts) => ({ ...opts, _type: 'divIcon' })),
}));

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助生成器
// ============================================================================

const arbCitySnake = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  city_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  country_name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  continent: fc.constantFrom('Asia', 'Europe', 'Africa'),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  visited_at: fc.constant('2024-06-15'),
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

describe('属性 7: 城市标记点击显示详情', () => {
  /**
   * 属性 7.1: 点击标记应调用 onClick 并传递城市 ID
   */
  it('属性 7.1: 点击标记应触发 onClick 回调并传递正确的城市 ID', () => {
    fc.assert(
      fc.property(arbCitySnake, (city) => {
        const onClick = vi.fn();
        const { unmount } = render(<CityMarker city={city as any} onClick={onClick} />);

        const marker = screen.getByTestId('marker');
        marker.click();

        expect(onClick).toHaveBeenCalledWith(city.id);
        expect(onClick).toHaveBeenCalledTimes(1);

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 7.2: 标记弹窗应包含城市详情
   */
  it('属性 7.2: 标记弹窗应显示城市名称和国家', () => {
    fc.assert(
      fc.property(arbCitySnake, (city) => {
        const { unmount } = render(<CityMarker city={city as any} />);

        const popup = screen.getByTestId('popup');
        expect(popup.textContent).toContain(city.city_name);
        expect(popup.textContent).toContain(city.country_name);

        unmount();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 7.3: 不提供 onClick 时点击不应报错
   */
  it('属性 7.3: 不提供 onClick 回调时点击标记不应报错', () => {
    fc.assert(
      fc.property(arbCitySnake, (city) => {
        const { unmount } = render(<CityMarker city={city as any} />);

        const marker = screen.getByTestId('marker');
        expect(() => marker.click()).not.toThrow();

        unmount();
      }),
      { numRuns: 30 }
    );
  });
});
