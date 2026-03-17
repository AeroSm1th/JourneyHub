/**
 * 热门城市排行榜组件
 *
 * 使用 ECharts 水平柱状图展示访问次数最多的前 N 个城市，
 * y 轴显示"城市名, 国家名"，x 轴显示访问次数。
 *
 * 验证需求: 6.6
 */

import { useMemo } from 'react';
import { EChartsWrapper } from './EChartsWrapper';

import type { EChartsOption } from 'echarts';

/** 单条城市排行数据 */
export interface TopCityItem {
  cityName: string;
  countryName: string;
  visitCount: number;
}

/** TopCitiesRanking 组件属性 */
export interface TopCitiesRankingProps {
  /** 热门城市数据（按 visitCount 降序） */
  data: TopCityItem[];
  /** 图表高度，默认 400px */
  height?: string | number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

/**
 * 构建 ECharts 水平柱状图配置项
 *
 * 将城市数据按访问次数降序排列后生成水平柱状图，
 * 排名靠前的城市显示在顶部。
 */
function buildOption(data: TopCityItem[]): EChartsOption {
  // 确保按 visitCount 降序排列
  const sorted = [...data].sort((a, b) => b.visitCount - a.visitCount);

  // ECharts 水平柱状图 y 轴从下到上，需要反转使排名第一的在顶部
  const reversed = [...sorted].reverse();

  const labels = reversed.map((item) => `${item.cityName}, ${item.countryName}`);
  const values = reversed.map((item) => item.visitCount);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: any) {
        const item = Array.isArray(params) ? params[0] : params;
        const name: string = item.name ?? '';
        const value: number = item.value ?? 0;
        return `<strong>${name}</strong><br/>访问次数: ${value}`;
      },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      minInterval: 1,
      name: '访问次数',
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        width: 120,
        overflow: 'truncate',
        ellipsis: '...',
      },
    },
    series: [
      {
        name: '访问次数',
        type: 'bar',
        data: values,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  } as EChartsOption;
}

/**
 * 热门城市排行榜组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { cityName: 'Tokyo', countryName: 'Japan', visitCount: 5 },
 *   { cityName: 'Paris', countryName: 'France', visitCount: 3 },
 * ];
 * <TopCitiesRanking data={data} />
 * ```
 */
export function TopCitiesRanking({
  data,
  height = 400,
  loading = false,
  className,
}: TopCitiesRankingProps) {
  const option = useMemo(() => buildOption(data), [data]);

  return <EChartsWrapper option={option} height={height} loading={loading} className={className} />;
}
