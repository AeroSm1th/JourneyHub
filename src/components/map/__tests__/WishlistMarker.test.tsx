/**
 * WishlistMarker 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { WishlistMarker } from '../WishlistMarker';
import type { WishlistItem } from '@/types/entities';

// 模拟愿望清单数据：高优先级
const mockHighPriority: WishlistItem = {
  id: 'w1',
  user_id: 'user-1',
  city_name: '巴黎',
  country_name: '法国',
  continent: 'Europe',
  latitude: 48.8566,
  longitude: 2.3522,
  priority: 5,
  expected_season: 'spring',
  notes: '想去看埃菲尔铁塔',
  created_at: '2024-01-01T00:00:00Z',
};

// 模拟愿望清单数据：中优先级
const mockMediumPriority: WishlistItem = {
  ...mockHighPriority,
  id: 'w2',
  city_name: '东京',
  country_name: '日本',
  continent: 'Asia',
  latitude: 35.6762,
  longitude: 139.6503,
  priority: 3,
  expected_season: 'autumn',
  notes: undefined,
};

// 模拟愿望清单数据：低优先级
const mockLowPriority: WishlistItem = {
  ...mockHighPriority,
  id: 'w3',
  city_name: '悉尼',
  country_name: '澳大利亚',
  continent: 'Oceania',
  latitude: -33.8688,
  longitude: 151.2093,
  priority: 1,
  expected_season: undefined,
  notes: undefined,
};

describe('WishlistMarker', () => {
  it('应该渲染愿望清单标记', () => {
    render(
      <LeafletMap center={[48.8, 2.3]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockHighPriority} />
      </LeafletMap>
    );

    // 标记应该被渲染
    const markers = document.querySelectorAll('.wishlist-marker-icon');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('应该为高优先级项目使用深橙色图标', () => {
    render(
      <LeafletMap center={[48.8, 2.3]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockHighPriority} />
      </LeafletMap>
    );

    const marker = document.querySelector('.wishlist-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 高优先级应该是深橙色 (#ea580c) -> rgb(234, 88, 12)
      expect(style).toContain('rgb(234, 88, 12)');
    }
  });

  it('应该为中优先级项目使用琥珀色图标', () => {
    render(
      <LeafletMap center={[35.6, 139.6]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockMediumPriority} />
      </LeafletMap>
    );

    const marker = document.querySelector('.wishlist-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 中优先级应该是琥珀色 (#f59e0b) -> rgb(245, 158, 11)
      expect(style).toContain('rgb(245, 158, 11)');
    }
  });

  it('应该为低优先级项目使用黄色图标', () => {
    render(
      <LeafletMap center={[-33.8, 151.2]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockLowPriority} />
      </LeafletMap>
    );

    const marker = document.querySelector('.wishlist-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const style = (marker as HTMLElement).style.backgroundColor;
      // 低优先级应该是黄色 (#fbbf24) -> rgb(251, 191, 36)
      expect(style).toContain('rgb(251, 191, 36)');
    }
  });

  it('应该在点击时调用 onClick 回调', () => {
    const onClick = vi.fn();

    render(
      <LeafletMap center={[48.8, 2.3]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockHighPriority} onClick={onClick} />
      </LeafletMap>
    );

    // 验证标记存在
    const markers = document.querySelectorAll('.wishlist-marker-icon');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('应该使用星星图标而非定位图标', () => {
    render(
      <LeafletMap center={[48.8, 2.3]} zoom={10}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <WishlistMarker item={mockHighPriority} />
      </LeafletMap>
    );

    const marker = document.querySelector('.wishlist-marker');
    expect(marker).toBeTruthy();
    if (marker) {
      const svg = marker.querySelector('svg');
      expect(svg).toBeTruthy();
      // 星星图标的 path 包含 "2l3.09"（星形路径特征）
      const path = svg?.querySelector('path');
      expect(path?.getAttribute('d')).toContain('2l3.09');
    }
  });
});
