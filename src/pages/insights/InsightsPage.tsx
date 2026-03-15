/**
 * 统计仪表板页面
 *
 * 集成所有统计卡片和图表组件，展示用户旅行数据的可视化分析。
 * 布局：
 *   - 顶部：StatsOverview 统计概览卡片（全宽）
 *   - 第二行：WorldHeatmap 世界地图热力图（全宽）
 *   - 第三行：YearlyChart（左半）+ ContinentPie（右半），移动端堆叠
 *   - 第四行：TopCitiesRanking 热门城市排行榜（全宽）
 *
 * 验证需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { useMemo } from 'react';
import { useStatistics } from '@/features/insights/hooks/useStatistics';
import { calculateCountryStatistics } from '@/features/insights/utils/calculateStats';
import { useCities } from '@/features/cities/hooks/useCities';
import {
  StatsOverview,
  WorldHeatmap,
  YearlyChart,
  ContinentPie,
  TopCitiesRanking,
} from '@/components/charts';
import { Spinner } from '@/components/common/Spinner';
import type { WorldMapDataItem } from '@/components/charts';
import type { City } from '@/types/database';
import './InsightsPage.css';

/**
 * 将国家统计数据转换为 WorldHeatmap 所需的 WorldMapDataItem[] 格式
 */
function buildWorldMapData(cities: City[]): WorldMapDataItem[] {
  const countryStats = calculateCountryStatistics(cities);
  return countryStats.map((cs) => ({
    name: cs.countryName,
    value: cs.cityCount,
  }));
}

/**
 * 统计仪表板页面组件
 */
export default function InsightsPage() {
  const { data, isLoading: citiesLoading, error: citiesError } = useCities();
  const { statistics, isLoading: statsLoading } = useStatistics();

  /** 城市列表（类型安全） */
  const cities: City[] = (data as City[] | undefined) ?? [];

  /** 是否正在加载 */
  const isLoading = citiesLoading || statsLoading;

  /** 世界地图热力图数据 */
  const worldMapData = useMemo<WorldMapDataItem[]>(() => {
    if (cities.length === 0) return [];
    return buildWorldMapData(cities);
  }, [cities]);

  /** 大洲饼图数据 */
  const continentPieData = useMemo(() => {
    if (!statistics?.citiesByContinent) return [];
    return Object.entries(statistics.citiesByContinent).map(([name, value]) => ({
      name,
      value,
    }));
  }, [statistics]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="insights-page">
        <div className="insights-loading">
          <Spinner size="lg" centered />
        </div>
      </div>
    );
  }

  // 错误状态
  if (citiesError) {
    return (
      <div className="insights-page">
        <div className="insights-error">
          <p className="insights-error-message">加载统计数据失败</p>
          <p className="insights-error-detail">{citiesError.message}</p>
        </div>
      </div>
    );
  }

  // 空状态：没有城市记录
  if (cities.length === 0) {
    return (
      <div className="insights-page">
        <div className="insights-page-header">
          <h1 className="insights-page-title">旅行统计</h1>
        </div>
        <div className="insights-empty">
          <span className="insights-empty-icon">📊</span>
          <h2 className="insights-empty-title">暂无统计数据</h2>
          <p className="insights-empty-text">
            在地图上添加你的第一个城市，开始记录旅行足迹吧
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      {/* 页面头部 */}
      <div className="insights-page-header">
        <h1 className="insights-page-title">旅行统计</h1>
      </div>

      {/* 第一行：统计概览卡片（全宽） */}
      <StatsOverview />

      {/* 第二行：世界地图热力图（全宽） */}
      <div className="insights-section">
        <h2 className="insights-section-title">🌍 世界足迹</h2>
        <WorldHeatmap data={worldMapData} height={480} />
      </div>

      {/* 第三行：年度柱状图 + 大洲饼图（桌面端并排，移动端堆叠） */}
      <div className="insights-charts-row">
        <div className="insights-section">
          <h2 className="insights-section-title">📅 年度统计</h2>
          <YearlyChart data={statistics?.citiesByYear ?? {}} height={360} />
        </div>
        <div className="insights-section">
          <h2 className="insights-section-title">🌏 大洲分布</h2>
          <ContinentPie data={continentPieData} height={360} />
        </div>
      </div>

      {/* 第四行：热门城市排行榜（全宽） */}
      <div className="insights-section">
        <h2 className="insights-section-title">🏆 热门城市 Top 10</h2>
        <TopCitiesRanking data={statistics?.topCities ?? []} height={400} />
      </div>
    </div>
  );
}
