/**
 * 城市卡片组件
 *
 * 以卡片形式显示城市信息，包括：
 * - 城市名称、国家
 * - 访问日期
 * - 封面图
 * - 评分和标签
 *
 * 验证需求: 3.7
 */

import { City } from '@/types/database';
import './CityCard.css';

interface CityCardProps {
  /**
   * 城市数据
   */
  city: City;

  /**
   * 点击回调
   */
  onClick?: (city: City) => void;

  /**
   * 是否显示为选中状态
   */
  isSelected?: boolean;
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
 * 城市卡片组件
 *
 * @example
 * ```tsx
 * <CityCard
 *   city={cityData}
 *   onClick={(city) => console.log('Clicked:', city)}
 *   isSelected={false}
 * />
 * ```
 */
export function CityCard({ city, onClick, isSelected = false }: CityCardProps) {
  const handleClick = () => {
    onClick?.(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={`city-card ${isSelected ? 'city-card-selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${city.city_name}, ${city.country_name}`}
    >
      {/* 封面图 */}
      <div className="city-card-image-wrapper">
        {city.cover_image ? (
          <img
            src={city.cover_image}
            alt={city.city_name}
            className="city-card-image"
            loading="lazy"
          />
        ) : (
          <div className="city-card-image-placeholder">
            <svg
              className="city-card-image-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}

        {/* 收藏标记 */}
        {city.is_favorite && (
          <div className="city-card-favorite-badge" title="收藏">
            <svg
              className="city-card-favorite-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>

      {/* 卡片内容 */}
      <div className="city-card-content">
        {/* 标题区域 */}
        <div className="city-card-header">
          <h3 className="city-card-title">{city.city_name}</h3>
          <p className="city-card-country">{city.country_name}</p>
        </div>

        {/* 访问日期 */}
        <time className="city-card-date" dateTime={city.visited_at}>
          {formatDate(city.visited_at)}
        </time>

        {/* 评分 */}
        {city.rating !== undefined && city.rating !== null && (
          <div className="city-card-rating" aria-label={`评分 ${city.rating} 星`}>
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`city-card-star ${i < city.rating! ? 'city-card-star-filled' : ''}`}
                fill={i < city.rating! ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
        )}

        {/* 标签 */}
        {city.tags && city.tags.length > 0 && (
          <div className="city-card-tags">
            {city.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="city-card-tag">
                {tag}
              </span>
            ))}
            {city.tags.length > 3 && (
              <span className="city-card-tag-more" title={`还有 ${city.tags.length - 3} 个标签`}>
                +{city.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
