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
 * 根据城市属性创建自定义图标
 */
const createCityIcon = (city: City): L.DivIcon => {
  // 根据收藏状态和评分确定图标颜色
  let iconColor = '#3b82f6'; // 默认蓝色

  if (city.is_favorite) {
    iconColor = '#ef4444'; // 收藏的城市用红色
  } else if (city.rating) {
    // 根据评分使用不同颜色
    if (city.rating >= 4) {
      iconColor = '#10b981'; // 高评分用绿色
    } else if (city.rating >= 3) {
      iconColor = '#f59e0b'; // 中等评分用橙色
    } else {
      iconColor = '#6b7280'; // 低评分用灰色
    }
  }

  return L.divIcon({
    className: 'city-marker-icon',
    html: `
      <div class="city-marker" style="background-color: ${iconColor}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
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
