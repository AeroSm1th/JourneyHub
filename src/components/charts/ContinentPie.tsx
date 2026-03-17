/**
 * 大洲分布饼图组件
 *
 * 使用 ECharts 饼图展示每个大洲的城市数量占比，支持点击扇区查看该大洲城市详情。
 *
 * 验证需求: 6.3
 */

import { useMemo, useCallback } from 'react';
import { EChartsWrapper } from './EChartsWrapper';

import type { EChartsOption } from 'echarts';

/** ContinentPie 组件属性 */
export interface ContinentPieProps {
  /** 大洲数据：大洲名称 -> 城市数量 */
  data: Array<{ name: string; value: number }>;
  /** 图表高度，默认 400px */
  height?: string | number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 点击某个大洲扇区的回调 */
  onContinentClick?: (continent: string) => void;
}

/**
 * 构建 ECharts 饼图配置项
 *
 * 将大洲数据生成饼图配置，显示百分比标签和图例
 */
function buildOption(data: Array<{ name: string; value: number }>): EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        const item = Array.isArray(params) ? params[0] : params;
        const name: string = item.name ?? '';
        const value: number = item.value ?? 0;
        const percent: number = item.percent ?? 0;
        return `<strong>${name}</strong><br/>城市数量: ${value} (${percent}%)`;
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      type: 'scroll',
    },
    series: [
      {
        name: '大洲分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        data,
        label: {
          show: true,
          formatter: '{b}: {d}%',
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
 * 大洲分布饼图组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { name: 'Asia', value: 10 },
 *   { name: 'Europe', value: 8 },
 *   { name: 'North America', value: 5 },
 * ];
 * <ContinentPie data={data} onContinentClick={(c) => console.log(c)} />
 * ```
 */
export function ContinentPie({
  data,
  height = 400,
  loading = false,
  className,
  onContinentClick,
}: ContinentPieProps) {
  const option = useMemo(() => buildOption(data), [data]);

  /** 图表就绪后绑定点击事件 */
  const handleChartReady = useCallback(
    (instance: any) => {
      if (!onContinentClick) return;

      // 移除旧监听，避免重复绑定
      instance.off('click');
      instance.on('click', (params: any) => {
        if (params.componentType === 'series' && params.name) {
          onContinentClick(params.name);
        }
      });
    },
    [onContinentClick]
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
