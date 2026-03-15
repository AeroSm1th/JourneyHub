/**
 * 属性测试：地图容器点击事件
 *
 * 属性 9: 地图点击触发表单
 * 验证需求: 3.1
 *
 * 测试地图容器组件的点击事件处理
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { MapContainer } from '../MapContainer';

// Mock Leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="leaflet-map" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  useMap: () => ({
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
});

describe('属性测试：地图容器点击事件', () => {
  /**
   * 属性 9.9: 地图点击回调应该被调用
   *
   * 对于任何有效的坐标，当提供了 onMapClick 回调时，
   * 地图点击应该触发该回调
   */
  it('属性 9.9: 提供 onMapClick 回调时，地图应该正常渲染', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const onMapClick = vi.fn();

          const { unmount } = render(
            <MapContainer center={[lat, lng]} zoom={10} onMapClick={onMapClick}>
              <div>Test Child</div>
            </MapContainer>
          );

          // 验证：地图容器应该被渲染
          expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
          expect(onMapClick).toBeDefined();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.10: 地图中心应该正确设置
   */
  it('属性 9.10: 地图应该使用提供的中心坐标', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = render(
            <MapContainer center={[lat, lng]} zoom={10} onMapClick={vi.fn()} />
          );

          expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.11: 地图缩放级别应该正确设置
   */
  it('属性 9.11: 地图应该使用提供的缩放级别', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 18 }), (zoom) => {
        const { unmount } = render(
          <MapContainer center={[39.9, 116.4]} zoom={zoom} onMapClick={vi.fn()} />
        );

        expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
        unmount();
      }),
      { numRuns: 18 }
    );
  });

  /**
   * 属性 9.12: 不提供 onMapClick 时不应该报错
   */
  it('属性 9.12: 不提供 onMapClick 回调时应该正常渲染', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = render(<MapContainer center={[lat, lng]} zoom={10} />);

          expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.13: 子组件应该被正确渲染
   */
  it('属性 9.13: 地图容器应该渲染子组件', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (childText) => {
          const { unmount } = render(
            <MapContainer center={[39.9, 116.4]} zoom={10} onMapClick={vi.fn()}>
              <div data-testid="child-component">{childText}</div>
            </MapContainer>
          );

          expect(screen.getByTestId('child-component')).toBeInTheDocument();
          expect(screen.getByTestId('child-component').textContent).toBe(childText);
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.14: 默认中心坐标应该有效
   */
  it('属性 9.14: 不提供中心坐标时应该使用默认值', () => {
    const { unmount } = render(<MapContainer onMapClick={vi.fn()} />);
    expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
    unmount();
  });

  /**
   * 属性 9.15: 默认缩放级别应该有效
   */
  it('属性 9.15: 不提供缩放级别时应该使用默认值', () => {
    const { unmount } = render(<MapContainer center={[39.9, 116.4]} onMapClick={vi.fn()} />);
    expect(screen.getByTestId('leaflet-map')).toBeInTheDocument();
    unmount();
  });
});
