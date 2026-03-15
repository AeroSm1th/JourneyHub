/**
 * 愿望清单标记组件
 *
 * 在地图上显示愿望清单城市标记，使用橙色/黄色区分已访问城市
 * 验证需求: 4.3, 2.7 - 愿望清单标记显示和区分
 */

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { WishlistItem } from '@/types/entities';
import './WishlistMarker.css';

interface WishlistMarkerProps {
  /**
   * 愿望清单项目数据
   */
  item: WishlistItem;

  /**
   * 点击标记时的回调函数
   */
  onClick?: (itemId: string) => void;
}

/**
 * 根据优先级创建自定义图标
 * 使用橙色系颜色区分愿望清单和已访问城市
 */
const createWishlistIcon = (item: WishlistItem): L.DivIcon => {
  // 根据优先级确定图标颜色（橙色系）
  let iconColor = '#f59e0b'; // 默认琥珀色

  if (item.priority >= 4) {
    iconColor = '#ea580c'; // 高优先级用深橙色
  } else if (item.priority >= 3) {
    iconColor = '#f59e0b'; // 中优先级用琥珀色
  } else {
    iconColor = '#fbbf24'; // 低优先级用黄色
  }

  // 使用星星图标区分愿望清单（已访问城市使用定位图标）
  return L.divIcon({
    className: 'wishlist-marker-icon',
    html: `
      <div class="wishlist-marker" style="background-color: ${iconColor}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

/**
 * 季节名称映射
 */
const seasonLabels: Record<string, string> = {
  spring: '🌸 春季',
  summer: '☀️ 夏季',
  autumn: '🍂 秋季',
  winter: '❄️ 冬季',
};

/**
 * 优先级标签映射
 */
const priorityLabels: Record<number, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
};

/**
 * 愿望清单标记组件
 *
 * 功能：
 * - 在地图上显示愿望清单城市位置标记
 * - 使用橙色/黄色系图标区分已访问城市（蓝色系）
 * - 使用星星图标区分定位图标
 * - 根据优先级使用不同深浅的橙色
 * - 点击标记显示愿望清单详情弹窗
 * - 支持移动端触摸操作
 *
 * @example
 * ```tsx
 * <WishlistMarker
 *   item={wishlistItem}
 *   onClick={(id) => console.log('Clicked wishlist item:', id)}
 * />
 * ```
 */
export function WishlistMarker({ item, onClick }: WishlistMarkerProps) {
  const position: [number, number] = [item.latitude, item.longitude];
  const icon = createWishlistIcon(item);

  const handleMarkerClick = () => {
    if (onClick) {
      onClick(item.id);
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
      <Popup className="wishlist-popup">
        <div className="wishlist-popup-content">
          <h3 className="wishlist-popup-title">{item.city_name}</h3>
          <div className="wishlist-popup-info">
            <p>
              <span className="wishlist-popup-label">国家：</span>
              {item.country_name}
            </p>
            <p>
              <span className="wishlist-popup-label">大洲：</span>
              {item.continent}
            </p>
            <p>
              <span className="wishlist-popup-label">优先级：</span>
              <span className="wishlist-popup-priority">
                {priorityLabels[item.priority] ?? `${item.priority}`}
              </span>
            </p>
            {item.expected_season && (
              <p>
                <span className="wishlist-popup-label">期望季节：</span>
                <span className="wishlist-popup-season">
                  {seasonLabels[item.expected_season] ?? item.expected_season}
                </span>
              </p>
            )}
            {item.notes && (
              <p>
                <span className="wishlist-popup-label">备注：</span>
                {item.notes}
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
