/**
 * 城市标记组件
 *
 * 在地图上显示城市标记，支持自定义图标和点击交互
 * 验证需求: 2.2, 2.4, 2.7 - 城市标记显示和交互
 */

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { City } from '@/types/entities';
import './CityMarker.css';

interface CityMarkerProps {
  /**
   * 城市数据
   */
  city: City;

  /**
   * 点击标记时的回调函数
   */
  onClick?: (cityId: string) => void;
}

/**
 * 出行类型颜色映射
 * - leisure（休闲）：蓝色
 * - business（商务）：灰蓝色
 * - transit（中转）：灰色
 */
const tripTypeColors: Record<string, string> = {
  leisure: '#3b82f6',
  business: '#64748b',
  transit: '#9ca3af',
};

/**
 * 根据出行类型创建自定义图标，收藏城市显示心形角标
 */
const createCityIcon = (city: City): L.DivIcon => {
  const iconColor = tripTypeColors[city.trip_type] ?? '#3b82f6';
  const favBadge = city.is_favorite
    ? '<span class="city-marker-fav"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>'
    : '';

  return L.divIcon({
    className: 'city-marker-icon',
    html: `
      <div class="city-marker-wrapper">
        <div class="city-marker" style="background-color: ${iconColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${favBadge}
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

/**
 * 格式化日期显示
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 城市标记组件
 *
 * 功能：
 * - 在地图上显示城市位置标记
 * - 使用自定义图标区分不同类型的城市（收藏、高评分等）
 * - 点击标记显示城市详情弹窗
 * - 支持移动端触摸操作
 *
 * @example
 * ```tsx
 * <CityMarker
 *   city={cityData}
 *   onClick={(id) => console.log('Clicked city:', id)}
 * />
 * ```
 */
export function CityMarker({ city, onClick }: CityMarkerProps) {
  const position: [number, number] = [city.latitude, city.longitude];
  const icon = createCityIcon(city);

  const handleMarkerClick = () => {
    if (onClick) {
      onClick(city.id);
    }
  };

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup className="city-popup">
        <div className="city-popup-content">
          <h3 className="city-popup-title">{city.city_name}</h3>
          <div className="city-popup-info">
            <p className="city-popup-country">
              <span className="city-popup-label">国家：</span>
              {city.country_name}
            </p>
            <p className="city-popup-date">
              <span className="city-popup-label">访问日期：</span>
              {formatDate(city.visited_at)}
            </p>
            {city.rating && (
              <p className="city-popup-rating">
                <span className="city-popup-label">评分：</span>
                {'⭐'.repeat(city.rating)}
              </p>
            )}
            {city.is_favorite && (
              <p className="city-popup-favorite">
                <span className="city-popup-badge">❤️ 收藏</span>
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
