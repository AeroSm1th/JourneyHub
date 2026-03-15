/**
 * useMapClick Hook 单元测试
 *
 * 测试地图点击事件处理的核心逻辑
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapClick } from '../useMapClick';

describe('useMapClick', () => {
  it('初始状态下坐标应该为 null', () => {
    const { result } = renderHook(() => useMapClick());

    expect(result.current.coordinates).toBeNull();
  });

  it('调用 handleMapClick 应该保存坐标', () => {
    const { result } = renderHook(() => useMapClick());

    act(() => {
      result.current.handleMapClick(39.9, 116.4);
    });

    expect(result.current.coordinates).toEqual({
      lat: 39.9,
      lng: 116.4,
    });
  });

  it('调用 clearCoordinates 应该清除坐标', () => {
    const { result } = renderHook(() => useMapClick());

    // 先设置坐标
    act(() => {
      result.current.handleMapClick(39.9, 116.4);
    });

    expect(result.current.coordinates).not.toBeNull();

    // 清除坐标
    act(() => {
      result.current.clearCoordinates();
    });

    expect(result.current.coordinates).toBeNull();
  });

  it('多次点击应该更新坐标', () => {
    const { result } = renderHook(() => useMapClick());

    // 第一次点击
    act(() => {
      result.current.handleMapClick(39.9, 116.4);
    });

    expect(result.current.coordinates).toEqual({
      lat: 39.9,
      lng: 116.4,
    });

    // 第二次点击
    act(() => {
      result.current.handleMapClick(31.2, 121.5);
    });

    expect(result.current.coordinates).toEqual({
      lat: 31.2,
      lng: 121.5,
    });
  });

  it('handleMapClick 函数引用应该保持稳定', () => {
    const { result, rerender } = renderHook(() => useMapClick());

    const firstHandleMapClick = result.current.handleMapClick;

    // 触发重新渲染
    rerender();

    const secondHandleMapClick = result.current.handleMapClick;

    expect(firstHandleMapClick).toBe(secondHandleMapClick);
  });

  it('clearCoordinates 函数引用应该保持稳定', () => {
    const { result, rerender } = renderHook(() => useMapClick());

    const firstClearCoordinates = result.current.clearCoordinates;

    // 触发重新渲染
    rerender();

    const secondClearCoordinates = result.current.clearCoordinates;

    expect(firstClearCoordinates).toBe(secondClearCoordinates);
  });

  it('应该正确处理负数坐标', () => {
    const { result } = renderHook(() => useMapClick());

    act(() => {
      result.current.handleMapClick(-33.9, -151.2);
    });

    expect(result.current.coordinates).toEqual({
      lat: -33.9,
      lng: -151.2,
    });
  });

  it('应该正确处理零坐标', () => {
    const { result } = renderHook(() => useMapClick());

    act(() => {
      result.current.handleMapClick(0, 0);
    });

    expect(result.current.coordinates).toEqual({
      lat: 0,
      lng: 0,
    });
  });
});
