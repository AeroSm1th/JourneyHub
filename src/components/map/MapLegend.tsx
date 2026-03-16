/**
 * 地图图例组件
 *
 * 在地图右下角显示标记颜色含义说明
 */

import { useState } from 'react';
import './MapLegend.css';

/** 图例项 */
interface LegendEntry {
  color: string;
  label: string;
  icon: 'pin' | 'star';
  dashed?: boolean;
}

/** 已访问城市图例 */
const CITY_LEGENDS: LegendEntry[] = [
  { color: '#3b82f6', label: '休闲旅行', icon: 'pin' },
  { color: '#64748b', label: '商务出行', icon: 'pin' },
  { color: '#9ca3af', label: '中转经停', icon: 'pin' },
];

/** 愿望清单图例 */
const WISHLIST_LEGENDS: LegendEntry[] = [
  { color: '#fde68a', label: '优先级 1', icon: 'star', dashed: true },
  { color: '#fbbf24', label: '优先级 2', icon: 'star', dashed: true },
  { color: '#f59e0b', label: '优先级 3', icon: 'star', dashed: true },
  { color: '#ea580c', label: '优先级 4', icon: 'star', dashed: true },
  { color: '#dc2626', label: '优先级 5', icon: 'star', dashed: true },
];

interface MapLegendProps {
  /** 当前视图模式 */
  mapView: string;
}

export function MapLegend({ mapView }: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(false);

  const entries: LegendEntry[] =
    mapView === 'wishlist'
      ? WISHLIST_LEGENDS
      : mapView === 'trips'
        ? [...CITY_LEGENDS, ...WISHLIST_LEGENDS]
        : CITY_LEGENDS;

  return (
    <div className="map-legend">
      <button
        className="map-legend-toggle"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? '展开图例' : '收起图例'}
      >
        {collapsed ? '图例 ▸' : '图例 ▾'}
      </button>
      {!collapsed && (
        <ul className="map-legend-list">
          {entries.map((e) => (
            <li key={e.label} className="map-legend-item">
              <span
                className={`map-legend-dot${e.dashed ? ' map-legend-dot--dashed' : ''}`}
                style={{ backgroundColor: e.color }}
              />
              <span className="map-legend-label">{e.label}</span>
            </li>
          ))}
          {mapView !== 'wishlist' && (
            <li className="map-legend-item">
              <span className="map-legend-fav-icon">❤</span>
              <span className="map-legend-label">已收藏</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
