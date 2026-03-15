/**
 * 统计概览组件
 *
 * 使用 useStatistics hook 获取数据，以网格布局展示统计卡片
 *
 * 验证需求: 6.1, 6.2, 6.7
 */

import { useStatistics } from '@/features/insights/hooks/useStatistics';
import { Spinner } from '@/components/common/Spinner';
import { StatCard } from './StatCard';
import './StatsOverview.css';

/**
 * 统计概览组件
 *
 * @example
 * ```tsx
 * <StatsOverview />
 * ```
 */
export function StatsOverview() {
  const {
    totalCities,
    totalCountries,
    totalContinents,
    continentCoverage,
    averageRating,
    isLoading,
    error,
  } = useStatistics();

  if (isLoading) {
    return (
      <div className="stats-overview-loading">
        <Spinner size="md" centered />
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-overview-error">
        <p>加载统计数据失败</p>
      </div>
    );
  }

  return (
    <div className="stats-overview">
      <StatCard icon="🏙️" label="城市总数" value={totalCities} color="#3b82f6" />
      <StatCard icon="🌐" label="国家总数" value={totalCountries} color="#8b5cf6" />
      <StatCard
        icon="🌍"
        label="大洲覆盖"
        value={`${totalContinents}/7`}
        subtitle={`${continentCoverage.toFixed(1)}%`}
        color="#10b981"
      />
      <StatCard
        icon="⭐"
        label="平均评分"
        value={averageRating !== undefined ? averageRating.toFixed(1) : '-'}
        color="#f59e0b"
      />
    </div>
  );
}
