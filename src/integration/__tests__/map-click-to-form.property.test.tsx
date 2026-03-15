/**
 * 集成属性测试：地图点击到表单显示的完整流程
 *
 * 属性 9: 地图点击触发表单
 * 验证需求: 3.1
 *
 * 测试从地图点击到表单显示的完整用户流程
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useMapClick } from '@/hooks/useMapClick';
import { CityForm } from '@/components/city/CityForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// 测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

afterEach(() => {
  cleanup();
});

/**
 * 辅助函数：渲染 CityForm 并返回 unmount
 */
function renderCityForm(coordinates: { lat: number; lng: number }) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  return render(
    <TestWrapper>
      <CityForm
        coordinates={coordinates}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </TestWrapper>
  );
}

describe('集成属性测试：地图点击到表单显示', () => {
  /**
   * 属性 9.16: 地图点击后应该能够显示表单
   *
   * 对于任何有效的坐标，当用户点击地图后，
   * 应该能够使用该坐标渲染城市表单
   */
  it('属性 9.16: 地图点击后应该能够使用坐标渲染表单', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          // 1. 模拟地图点击
          const { result } = renderHook(() => useMapClick());

          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          const coordinates = result.current.coordinates;
          expect(coordinates).not.toBeNull();

          // 2. 使用坐标渲染表单
          if (coordinates) {
            const { unmount, container } = renderCityForm(coordinates);

            // 验证：表单应该被渲染
            expect(container.querySelector('form')).toBeInTheDocument();

            // 验证：坐标应该显示在表单中（使用 getAllByDisplayValue 避免多匹配问题）
            const latInputs = screen.getAllByDisplayValue(lat.toFixed(6));
            const lngInputs = screen.getAllByDisplayValue(lng.toFixed(6));

            expect(latInputs.length).toBeGreaterThanOrEqual(1);
            expect(lngInputs.length).toBeGreaterThanOrEqual(1);

            // 验证：坐标输入框应该是禁用的（只读）
            expect(latInputs[0]).toBeDisabled();
            expect(lngInputs[0]).toBeDisabled();

            unmount();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.17: 表单取消应该清除坐标
   *
   * 对于任何坐标，当用户取消表单时，
   * 坐标应该被清除，表单应该关闭
   */
  it('属性 9.17: 表单取消应该清除坐标状态', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { result } = renderHook(() => useMapClick());

          // 点击地图
          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          expect(result.current.coordinates).not.toBeNull();

          // 模拟取消表单（清除坐标）
          act(() => {
            result.current.clearCoordinates();
          });

          // 验证：坐标应该被清除
          expect(result.current.coordinates).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.18: 表单应该预填充坐标字段
   *
   * 对于任何坐标，表单应该在纬度和经度字段中显示这些坐标
   */
  it('属性 9.18: 表单应该预填充坐标字段', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = renderCityForm({ lat, lng });

          // 验证：纬度和经度字段应该显示正确的值
          const latInputs = screen.getAllByDisplayValue(lat.toFixed(6));
          const lngInputs = screen.getAllByDisplayValue(lng.toFixed(6));

          expect(latInputs.length).toBeGreaterThanOrEqual(1);
          expect(lngInputs.length).toBeGreaterThanOrEqual(1);

          // 验证：坐标输入框应该是禁用的
          expect(latInputs[0]).toBeDisabled();
          expect(lngInputs[0]).toBeDisabled();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.19: 坐标字段应该是只读的
   *
   * 对于任何坐标，表单中的坐标字段应该是禁用的，
   * 用户不应该能够修改它们
   */
  it('属性 9.19: 表单中的坐标字段应该是只读的', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = renderCityForm({ lat, lng });

          const latInputs = screen.getAllByDisplayValue(lat.toFixed(6));
          const lngInputs = screen.getAllByDisplayValue(lng.toFixed(6));

          // 验证：所有坐标输入框都应该是禁用的
          latInputs.forEach((input) => expect(input).toBeDisabled());
          lngInputs.forEach((input) => expect(input).toBeDisabled());

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * 属性 9.20: 表单应该包含所有必需字段
   *
   * 对于任何坐标，渲染的表单应该包含所有必需的输入字段
   */
  it('属性 9.20: 表单应该包含所有必需的输入字段', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = renderCityForm({ lat, lng });

          // 验证：必需字段应该存在（使用 getAllByLabelText 处理可能的多匹配）
          expect(screen.getAllByLabelText(/城市名称/).length).toBeGreaterThanOrEqual(1);
          expect(screen.getAllByLabelText(/国家/).length).toBeGreaterThanOrEqual(1);
          expect(screen.getAllByLabelText(/大洲/).length).toBeGreaterThanOrEqual(1);
          expect(screen.getAllByLabelText(/访问日期/).length).toBeGreaterThanOrEqual(1);
          expect(screen.getAllByLabelText(/旅行类型/).length).toBeGreaterThanOrEqual(1);

          // 验证：操作按钮应该存在
          expect(
            screen.getAllByRole('button', { name: /取消/ }).length
          ).toBeGreaterThanOrEqual(1);
          expect(
            screen.getAllByRole('button', { name: /提交/ }).length
          ).toBeGreaterThanOrEqual(1);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * 属性 9.21: 多次点击地图应该更新表单坐标
   *
   * 对于任何两个不同的坐标，第二次点击应该更新表单中显示的坐标
   */
  it('属性 9.21: 多次点击地图应该更新表单中的坐标', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true })
        ),
        fc.tuple(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true })
        ),
        ([lat1, lng1], [lat2, lng2]) => {
          const { result } = renderHook(() => useMapClick());

          // 第一次点击
          act(() => {
            result.current.handleMapClick(lat1, lng1);
          });

          expect(result.current.coordinates?.lat).toBe(lat1);
          expect(result.current.coordinates?.lng).toBe(lng1);

          // 第二次点击
          act(() => {
            result.current.handleMapClick(lat2, lng2);
          });

          // 验证：坐标应该更新
          expect(result.current.coordinates?.lat).toBe(lat2);
          expect(result.current.coordinates?.lng).toBe(lng2);

          // 使用新坐标渲染表单
          if (result.current.coordinates) {
            const { unmount } = renderCityForm(result.current.coordinates);

            // 验证：表单应该显示新坐标
            const latInputs = screen.getAllByDisplayValue(lat2.toFixed(6));
            const lngInputs = screen.getAllByDisplayValue(lng2.toFixed(6));

            expect(latInputs.length).toBeGreaterThanOrEqual(1);
            expect(lngInputs.length).toBeGreaterThanOrEqual(1);

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * 属性 9.22: 坐标格式应该一致
   *
   * 对于任何坐标，表单中显示的坐标应该格式化为 6 位小数
   */
  it('属性 9.22: 表单中的坐标应该格式化为 6 位小数', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const { unmount } = renderCityForm({ lat, lng });

          // 验证：坐标应该格式化为 6 位小数
          const expectedLat = lat.toFixed(6);
          const expectedLng = lng.toFixed(6);

          const latInputs = screen.getAllByDisplayValue(expectedLat);
          const lngInputs = screen.getAllByDisplayValue(expectedLng);

          expect(latInputs.length).toBeGreaterThanOrEqual(1);
          expect(lngInputs.length).toBeGreaterThanOrEqual(1);

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
