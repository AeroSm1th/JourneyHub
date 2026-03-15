/**
 * MapControls 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import { MapControls } from '../MapControls';

// Mock useGeolocation hook
vi.mock('../../../hooks/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    isLoading: false,
    position: null,
    error: null,
    getPosition: vi.fn(),
  })),
}));

describe('MapControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染所有控制按钮', () => {
    render(
      <MapContainer center={[39.9, 116.4]} zoom={6}>
        <MapControls />
      </MapContainer>
    );

    expect(screen.getByLabelText('定位到当前位置')).toBeInTheDocument();
    expect(screen.getByLabelText('放大地图')).toBeInTheDocument();
    expect(screen.getByLabelText('缩小地图')).toBeInTheDocument();
    expect(screen.getByLabelText('重置地图视图')).toBeInTheDocument();
  });

  it('应该有正确的 CSS 类名', () => {
    render(
      <MapContainer center={[39.9, 116.4]} zoom={6}>
        <MapControls />
      </MapContainer>
    );

    const locateBtn = screen.getByLabelText('定位到当前位置');
    expect(locateBtn).toHaveClass('map-control-btn');
  });
});
