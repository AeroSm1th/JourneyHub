/**
 * 集成测试：城市创建流程
 *
 * 测试从地图点击到创建成功的完整流程
 * 验证需求: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useMapClick } from '@/hooks/useMapClick';
import { cityFormSchema } from '@/schemas/citySchema';
import { Continent, TripType } from '@/types/entities';

// Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ============================================================================
// 辅助生成器
// ============================================================================

const arbValidCityForm = fc.record({
  cityName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  countryName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  continent: fc.constantFrom(
    Continent.Asia,
    Continent.Europe,
    Continent.Africa,
    Continent.NorthAmerica,
    Continent.SouthAmerica,
    Continent.Oceania
  ),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  visitedAt: fc
    .date({ min: new Date('2000-01-01'), max: new Date('2025-12-31') })
    .filter((d) => !isNaN(d.getTime()) && d <= new Date()),
  tripType: fc.constantFrom(TripType.Leisure, TripType.Business, TripType.Transit),
});

// ============================================================================
// 集成测试
// ============================================================================

describe('集成测试：城市创建流程', () => {
  /**
   * 步骤 1: 地图点击 → 获取坐标
   * 步骤 2: 坐标 → 表单数据验证
   * 步骤 3: 验证通过 → 可提交
   */
  it('完整流程：地图点击获取坐标 → 填写表单 → 验证通过', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        // 步骤 1: 模拟地图点击获取坐标
        const { result } = renderHook(() => useMapClick());

        act(() => {
          result.current.handleMapClick(formData.latitude, formData.longitude);
        });

        // 验证坐标已保存
        expect(result.current.coordinates).not.toBeNull();
        expect(result.current.coordinates?.lat).toBe(formData.latitude);
        expect(result.current.coordinates?.lng).toBe(formData.longitude);

        // 步骤 2: 使用坐标和表单数据进行验证
        const validationResult = cityFormSchema.safeParse(formData);

        // 步骤 3: 验证应通过
        expect(validationResult.success).toBe(true);

        // 清理
        act(() => {
          result.current.clearCoordinates();
        });
      }),
      { numRuns: 50 }
    );
  });

  it('流程中断：无效表单数据应阻止提交', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
        (lat, lng) => {
          // 步骤 1: 地图点击
          const { result } = renderHook(() => useMapClick());

          act(() => {
            result.current.handleMapClick(lat, lng);
          });

          expect(result.current.coordinates).not.toBeNull();

          // 步骤 2: 提交不完整的表单数据
          const incompleteData = {
            cityName: '', // 空城市名称
            countryName: '',
            latitude: lat,
            longitude: lng,
          };

          const validationResult = cityFormSchema.safeParse(incompleteData);

          // 步骤 3: 验证应失败
          expect(validationResult.success).toBe(false);

          act(() => {
            result.current.clearCoordinates();
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('坐标精度在整个流程中应保持一致', () => {
    fc.assert(
      fc.property(arbValidCityForm, (formData) => {
        const { result } = renderHook(() => useMapClick());

        act(() => {
          result.current.handleMapClick(formData.latitude, formData.longitude);
        });

        const coords = result.current.coordinates;

        // 坐标精度应完全保留
        expect(coords?.lat).toBe(formData.latitude);
        expect(coords?.lng).toBe(formData.longitude);

        // 表单验证中的坐标也应一致
        const validationResult = cityFormSchema.safeParse(formData);
        if (validationResult.success) {
          expect(validationResult.data.latitude).toBe(formData.latitude);
          expect(validationResult.data.longitude).toBe(formData.longitude);
        }

        act(() => {
          result.current.clearCoordinates();
        });
      }),
      { numRuns: 50 }
    );
  });
});
