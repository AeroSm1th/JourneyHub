/**
 * 愿望清单卡片组件
 *
 * 以卡片形式显示愿望清单项目信息，包括：
 * - 城市名称、国家
 * - 优先级星标
 * - 期望季节
 *
 * 验证需求: 4.4
 */

import { WishlistItem } from '@/types/database';
import './WishlistCard.css';

interface WishlistCardProps {
  /** 愿望清单项目数据 */
  item: WishlistItem;
  /** 点击回调 */
  onClick?: (item: WishlistItem) => void;
  /** 是否选中 */
  isSelected?: boolean;
  /** 转换为城市记录回调 */
  onConvert?: (item: WishlistItem) => void;
}

/** 季节显示映射 */
const SEASON_LABELS: Record<string, string> = {
  spring: '🌸 春季',
  summer: '☀️ 夏季',
  autumn: '🍂 秋季',
  winter: '❄️ 冬季',
};

/**
 * 渲染优先级星标
 */
function PriorityStars({ priority }: { priority: number }) {
  return (
    <span className="wishlist-card-stars" aria-label={`优先级 ${priority} 星`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`wishlist-card-star ${i < priority ? 'wishlist-card-star--filled' : ''}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * 愿望清单卡片组件
 */
export function WishlistCard({ item, onClick, isSelected = false, onConvert }: WishlistCardProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /** 处理转换按钮点击，阻止事件冒泡 */
  const handleConvertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConvert?.(item);
  };

  return (
    <article
      className={`wishlist-card ${isSelected ? 'wishlist-card--selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${item.city_name}, ${item.country_name}`}
    >
      {/* 头部：城市名和国家 */}
      <div className="wishlist-card-header">
        <h3 className="wishlist-card-title">{item.city_name}</h3>
        <p className="wishlist-card-country">{item.country_name}</p>
      </div>

      {/* 优先级星标 */}
      <div className="wishlist-card-priority">
        <PriorityStars priority={item.priority} />
      </div>

      {/* 元信息：季节、大洲 */}
      <div className="wishlist-card-meta">
        {item.expected_season && (
          <span className="wishlist-card-season">
            {SEASON_LABELS[item.expected_season] ?? item.expected_season}
          </span>
        )}
        <span className="wishlist-card-continent">{item.continent}</span>
      </div>

      {/* 备注（截断显示） */}
      {item.notes && <p className="wishlist-card-notes">{item.notes}</p>}

      {/* 转换为城市记录按钮 */}
      {onConvert && (
        <div className="wishlist-card-actions">
          <button
            className="wishlist-card-convert-btn"
            onClick={handleConvertClick}
            aria-label={`将 ${item.city_name} 转换为城市记录`}
            type="button"
          >
            🔄 转换为城市记录
          </button>
        </div>
      )}
    </article>
  );
}
