/**
 * 行程卡片组件
 *
 * 以卡片形式显示行程信息，包括：
 * - 行程标题
 * - 日期范围（start_date → end_date）
 * - 状态标签（planning/ongoing/completed）
 * - 预算信息
 * - 交通和住宿信息
 * - 备注预览（截断显示）
 *
 * 验证需求: 5.9
 */

import type { Trip } from '@/types/database';
import { TripStatus } from '@/types/entities';
import { computeTripStatus } from './TripList';
import './TripCard.css';

interface TripCardProps {
  /** 行程数据 */
  trip: Trip;
  /** 点击回调 */
  onClick?: (trip: Trip) => void;
  /** 是否显示为选中状态 */
  isSelected?: boolean;
}

/** 状态标签中文映射 */
const STATUS_LABELS: Record<TripStatus, string> = {
  [TripStatus.Planning]: '计划中',
  [TripStatus.Ongoing]: '进行中',
  [TripStatus.Completed]: '已完成',
};

/** 格式化日期 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

/** 截断文本 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};

/**
 * 行程卡片组件
 *
 * @example
 * ```tsx
 * <TripCard
 *   trip={tripData}
 *   onClick={(trip) => console.log('Clicked:', trip)}
 *   isSelected={false}
 * />
 * ```
 */
export function TripCard({ trip, onClick, isSelected = false }: TripCardProps) {
  const status = computeTripStatus(trip);

  const handleClick = () => {
    onClick?.(trip);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={`trip-card ${isSelected ? 'trip-card-selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${trip.title}，${STATUS_LABELS[status]}`}
    >
      {/* 状态标签 */}
      <span className={`trip-card-status trip-card-status-${status}`}>
        {STATUS_LABELS[status]}
      </span>

      {/* 卡片内容 */}
      <div className="trip-card-content">
        {/* 标题 */}
        <h3 className="trip-card-title">{trip.title}</h3>

        {/* 日期范围 */}
        <div className="trip-card-dates">
          <svg className="trip-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <time>{formatDate(trip.start_date)}</time>
          <span className="trip-card-date-separator">→</span>
          <time>{formatDate(trip.end_date)}</time>
        </div>

        {/* 预算 */}
        {trip.budget != null && (
          <div className="trip-card-budget">
            <svg className="trip-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>{trip.budget.toLocaleString('zh-CN')} {trip.currency || 'CNY'}</span>
          </div>
        )}

        {/* 交通和住宿 */}
        {(trip.transportation || trip.accommodation) && (
          <div className="trip-card-details">
            {trip.transportation && (
              <span className="trip-card-detail-tag">🚗 {trip.transportation}</span>
            )}
            {trip.accommodation && (
              <span className="trip-card-detail-tag">🏨 {trip.accommodation}</span>
            )}
          </div>
        )}

        {/* 备注预览 */}
        {trip.notes && (
          <p className="trip-card-notes">{truncateText(trip.notes, 80)}</p>
        )}
      </div>
    </article>
  );
}
