/**
 * 行程列表组件
 *
 * 显示所有行程记录，支持按状态筛选
 * 根据日期自动判断行程状态（计划中/进行中/已完成）
 *
 * 验证需求: 5.8, 5.9
 */

import { useState, useMemo } from 'react';
import { useTrips } from '@/features/trips/hooks/useTrips';
import { Spinner } from '@/components/common/Spinner';
import { TripStatus } from '@/types/entities';
import type { Trip } from '@/types/database';
import './TripList.css';

/** 筛选选项类型 */
type FilterStatus = 'all' | TripStatus;

interface TripListProps {
  /** 行程点击回调 */
  onTripClick?: (trip: Trip) => void;
  /** 当前选中的行程 ID */
  selectedTripId?: string;
}

/**
 * 根据日期自动判断行程状态
 * - start_date > today → planning
 * - start_date <= today <= end_date → ongoing
 * - end_date < today → completed
 */
export function computeTripStatus(trip: Trip): TripStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(trip.start_date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(trip.end_date);
  end.setHours(0, 0, 0, 0);

  if (today < start) return TripStatus.Planning;
  if (today > end) return TripStatus.Completed;
  return TripStatus.Ongoing;
}

/** 格式化日期 */
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

/** 状态标签映射 */
const STATUS_LABELS: Record<TripStatus, string> = {
  [TripStatus.Planning]: '计划中',
  [TripStatus.Ongoing]: '进行中',
  [TripStatus.Completed]: '已完成',
};

/** 筛选按钮配置 */
const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: TripStatus.Planning, label: '计划中' },
  { value: TripStatus.Ongoing, label: '进行中' },
  { value: TripStatus.Completed, label: '已完成' },
];

/**
 * 行程列表项组件
 */
function TripListItem({
  trip,
  computedStatus,
  isSelected,
  onClick,
}: {
  trip: Trip;
  computedStatus: TripStatus;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <li
      className={`trip-list-item ${isSelected ? 'trip-list-item-active' : ''} ${computedStatus === TripStatus.Completed ? 'trip-list-item-completed' : ''}`}
      onClick={onClick}
    >
      <div className="trip-list-item-content">
        <div className="trip-list-item-header">
          <h3 className="trip-list-item-title">{trip.title}</h3>
          <span className={`trip-list-item-status trip-list-item-status-${computedStatus}`}>
            {STATUS_LABELS[computedStatus]}
          </span>
        </div>

        <div className="trip-list-item-dates">
          <time>{formatDate(trip.start_date)}</time>
          <span className="trip-list-item-date-separator">→</span>
          <time>{formatDate(trip.end_date)}</time>
        </div>

        {trip.budget != null && (
          <div className="trip-list-item-budget">
            💰 {trip.budget.toLocaleString('zh-CN')} {trip.currency || 'CNY'}
          </div>
        )}

        {trip.notes && (
          <p className="trip-list-item-notes">{trip.notes}</p>
        )}
      </div>

      {computedStatus === TripStatus.Completed && (
        <span className="trip-list-item-check" title="已完成">✅</span>
      )}
    </li>
  );
}

/**
 * 行程列表组件
 *
 * @example
 * ```tsx
 * <TripList
 *   onTripClick={(trip) => console.log('Clicked:', trip)}
 *   selectedTripId={selectedId}
 * />
 * ```
 */
export function TripList({ onTripClick, selectedTripId }: TripListProps) {
  const { data, isLoading, error } = useTrips();
  const trips = data as Trip[] | undefined;
  const [filter, setFilter] = useState<FilterStatus>('all');

  // 计算每个行程的状态并筛选
  const filteredTrips = useMemo(() => {
    if (!trips) return [];

    const withStatus = trips.map((trip) => ({
      trip,
      computedStatus: computeTripStatus(trip),
    }));

    if (filter === 'all') return withStatus;
    return withStatus.filter((item) => item.computedStatus === filter);
  }, [trips, filter]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="trip-list-loading">
        <Spinner size="md" centered />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="trip-list-error">
        <p className="trip-list-error-message">加载行程列表失败</p>
        <p className="trip-list-error-detail">{error.message}</p>
      </div>
    );
  }

  // 空状态
  if (!trips || trips.length === 0) {
    return (
      <div className="trip-list-empty">
        <p className="trip-list-empty-message">还没有行程记录</p>
        <p className="trip-list-empty-hint">创建你的第一个旅行行程吧</p>
      </div>
    );
  }

  return (
    <div className="trip-list-container">
      <div className="trip-list-header">
        <h2 className="trip-list-title">我的行程</h2>
        <span className="trip-list-count">{trips.length} 个行程</span>
      </div>

      {/* 状态筛选栏 */}
      <div className="trip-list-filters">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`trip-list-filter-btn ${filter === option.value ? 'trip-list-filter-btn-active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 筛选后无结果 */}
      {filteredTrips.length === 0 ? (
        <div className="trip-list-empty">
          <p className="trip-list-empty-message">没有{FILTER_OPTIONS.find((o) => o.value === filter)?.label}的行程</p>
        </div>
      ) : (
        <ul className="trip-list">
          {filteredTrips.map(({ trip, computedStatus }) => (
            <TripListItem
              key={trip.id}
              trip={trip}
              computedStatus={computedStatus}
              isSelected={selectedTripId === trip.id}
              onClick={() => onTripClick?.(trip)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
