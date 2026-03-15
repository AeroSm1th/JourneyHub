/**
 * 年度统计柱状图组件
 *
 * 使用 ECharts 柱状图展示每年的旅行城市数量，支持点击柱子查看该年城市详情。
 *
 * 验证需求: 6.5
 */

import { useMemo, useCallback } from 'react';
import { EChartsWrapper } from './EChartsWrapper';

import type { EChartsOption } from 'echarts';

/** YearlyChart 组件属性 */
export interface YearlyChartProps {
  /** 年度数据：年份 -> 城市数量 */
  data: Record<string, number>;
  /** 图表高度，默认 400px */
  height?: string | number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 点击某年柱子的回调 */
  onYearClick?: (year: string) => void;
}

/**
 * 构建 ECharts 配置项
 *
 * 将年度数据按时间排序后生成柱状图配置
 */
function buildOption(data: Record<string, number>): EChartsOption {
  // 按年份升序排列
  const sortedEntries = Object.entries(data).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const years = sortedEntries.map(([year]) => year);
  const values = sortedEntries.map(([, count]) => count);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params: any) {
        const item = Array.isArray(params) ? params[0] : params;
        const year: string = item.name ?? '';
        const value: number = item.value ?? 0;
        return `<strong>${year}年</strong><br/>城市数量: ${value}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: {
        rotate: years.length > 8 ? 45 : 0,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      name: '城市数量',
    },
    series: [
      {
        name: '城市数量',
        type: 'bar',
        data: values,
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
 * 年度统计柱状图组件
 *
 * @example
 * ```tsx
 * const data = { '2021': 3, '2022': 5, '2023': 8 };
 * <YearlyChart data={data} onYearClick={(year) => console.log(year)} />
 * ```
 */
export function YearlyChart({
  data,
  height = 400,
  loading = false,
  className,
  onYearClick,
}: YearlyChartProps) {
  const option = useMemo(() => buildOption(data), [data]);

  /** 图表就绪后绑定点击事件 */
  const handleChartReady = useCallback(
    (instance: any) => {
      if (!onYearClick) return;

      // 移除旧监听，避免重复绑定
      instance.off('click');
      instance.on('click', (params: any) => {
        if (params.componentType === 'series' && params.name) {
          onYearClick(params.name);
        }
      });
    },
    [onYearClick]
  );

  return (
    <EChartsWrapper
      option={option}
      height={height}
      loading={loading}
      className={className}
      onChartReady={handleChartReady}
    />
  );
}
