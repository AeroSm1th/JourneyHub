/**
 * 城市列表组件
 *
 * 显示所有城市记录，支持点击查看详情
 * 按访问日期降序排序
 *
 * 验证需求: 3.6, 3.7
 */

import { useCities } from '@/features/cities/hooks/useCities';
import { Spinner } from '@/components/common/Spinner';
import { City } from '@/types/database';
import './CityList.css';

interface CityListProps {
  /**
   * 城市点击回调
   */
  onCityClick?: (city: City) => void;

  /**
   * 当前选中的城市 ID
   */
  selectedCityId?: string;
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * 城市列表项组件
 */
function CityListItem({
  city,
  isSelected,
  onClick,
}: {
  city: City;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <li className={`city-list-item ${isSelected ? 'city-list-item-active' : ''}`} onClick={onClick}>
      <div className="city-list-item-content">
        <div className="city-list-item-header">
          <h3 className="city-list-item-name">{city.city_name}</h3>
          {city.is_favorite && (
            <span className="city-list-item-favorite" title="收藏">
              ❤️
            </span>
          )}
        </div>

        <p className="city-list-item-country">{city.country_name}</p>

        <div className="city-list-item-meta">
          <time className="city-list-item-date">{formatDate(city.visited_at)}</time>
          {city.rating && <span className="city-list-item-rating">{'⭐'.repeat(city.rating)}</span>}
        </div>

        {city.tags && city.tags.length > 0 && (
          <div className="city-list-item-tags">
            {city.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="city-list-item-tag">
                {tag}
              </span>
            ))}
            {city.tags.length > 3 && (
              <span className="city-list-item-tag-more">+{city.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {city.cover_image && (
        <div className="city-list-item-image">
          <img src={city.cover_image} alt={city.city_name} />
        </div>
      )}
    </li>
  );
}

/**
 * 城市列表组件
 *
 * @example
 * ```tsx
 * <CityList
 *   onCityClick={(city) => console.log('Clicked:', city)}
 *   selectedCityId={selectedId}
 * />
 * ```
 */
export function CityList({ onCityClick, selectedCityId }: CityListProps) {
  const { data: cities, isLoading, error } = useCities();

  // 加载状态
  if (isLoading) {
    return (
      <div className="city-list-loading">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="city-list-error">
        <p className="city-list-error-message">加载城市列表失败</p>
        <p className="city-list-error-detail">{error.message}</p>
      </div>
    );
  }

  // 空状态
  if (!cities || cities.length === 0) {
    return (
      <div className="city-list-empty">
        <p className="city-list-empty-message">还没有城市记录</p>
        <p className="city-list-empty-hint">在地图上点击添加你的第一个城市</p>
      </div>
    );
  }

  // 按访问日期降序排序（需求 3.6）
  const sortedCities = [...cities].sort((a, b) => {
    return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
  });

  return (
    <div className="city-list-container">
      <div className="city-list-header">
        <h2 className="city-list-title">我的足迹</h2>
        <span className="city-list-count">{cities.length} 个足迹</span>
      </div>

      <ul className="city-list">
        {sortedCities.map((city) => (
          <CityListItem
            key={city.id}
            city={city}
            isSelected={selectedCityId === city.id}
            onClick={() => onCityClick?.(city)}
          />
        ))}
      </ul>
    </div>
  );
}
