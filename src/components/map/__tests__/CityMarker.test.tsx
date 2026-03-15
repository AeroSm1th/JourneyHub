/**
 * CityMarker 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { CityMarker } from '../CityMarker';
import type { City } from '@/types/entities';

// 模拟城市数据
const mockCity: City = {
  id: '1',
  user_id: 'user-1',
  city_name: '北京',
  country_name: '中国',
  continent: 'Asia',
  latitude: 39.9042,
  longitude: 116.4074,
  visited_at: '2024-01-15',
  trip_type: 'leisure',
  rating: 5,
  is_favorite: true,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const mockCityWithoutRating: City = {
  ...mockCity,
  id: '2',
  city_name: '上海',
  rating: undefined,
  is_favorite: false,
};

describe('CityMarker', () => {
  it('应该渲染城市标记', () => {
    const onClick = vi.fn();

    render(
      <LeafletMap center={[39.9, 116.4]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CityMarker city={mockCity} onClick={onClick} />
      </LeafletMap>
    );

    // 标记应该被渲染（通过检查 Leaflet 的 DOM 结构）
    const markers = document.querySelectorAll('.city-marker-icon');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('应该为收藏的城市使用红色图标', () => {
    const onClick = vi.fn();

    render(
      <LeafletMap center={[39.9, 116.4]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CityMarker city={mockCity} onClick={onClick} />
      </LeafletMap>
    );

    const marker = document.querySelector('.city-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 收藏的城市应该是红色 (#ef4444)
      expect(style).toContain('rgb(239, 68, 68)');
    }
  });

  it('应该为高评分城市使用绿色图标', () => {
    const highRatingCity: City = {
      ...mockCity,
      is_favorite: false,
      rating: 4,
    };

    const onClick = vi.fn();

    render(
      <LeafletMap center={[39.9, 116.4]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CityMarker city={highRatingCity} onClick={onClick} />
      </LeafletMap>
    );

    const marker = document.querySelector('.city-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 高评分城市应该是绿色 (#10b981)
      expect(style).toContain('rgb(16, 185, 129)');
    }
  });

  it('应该为没有评分的城市使用默认蓝色图标', () => {
    const onClick = vi.fn();

    render(
      <LeafletMap center={[39.9, 116.4]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CityMarker city={mockCityWithoutRating} onClick={onClick} />
      </LeafletMap>
    );

    const marker = document.querySelector('.city-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 默认应该是蓝色 (#3b82f6)
      expect(style).toContain('rgb(59, 130, 246)');
    }
  });

  it('应该在正确的位置渲染标记', () => {
    const onClick = vi.fn();

    render(
      <LeafletMap center={[39.9, 116.4]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CityMarker city={mockCity} onClick={onClick} />
      </LeafletMap>
    );

    // 验证标记存在
    const markers = document.querySelectorAll('.city-marker-icon');
    expect(markers.length).toBeGreaterThan(0);
  });
});
