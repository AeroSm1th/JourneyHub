/**
 * ECharts 包装组件
 *
 * 封装 ReactECharts，自动注册 JourneyHub 主题并提供加载状态和响应式尺寸
 *
 * 验证需求: 6.4
 */

import { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { journeyhubTheme, JOURNEYHUB_THEME_NAME } from './echarts-theme';
import { Spinner } from '@/components/common/Spinner';
import './EChartsWrapper.css';

import type { EChartsOption } from 'echarts';

export interface EChartsWrapperProps {
  /** ECharts 配置项 */
  option: EChartsOption;
  /** 图表高度，默认 400px */
  height?: string | number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
  /** 图表就绪回调 */
  onChartReady?: (instance: echarts.ECharts) => void;
}

// 标记主题是否已注册
let themeRegistered = false;

/** 注册 JourneyHub 主题（仅执行一次） */
function ensureThemeRegistered() {
  if (!themeRegistered) {
    echarts.registerTheme(JOURNEYHUB_THEME_NAME, journeyhubTheme);
    themeRegistered = true;
  }
}

/**
 * ECharts 包装组件
 *
 * @example
 * ```tsx
 * <EChartsWrapper
 *   option={{ xAxis: { data: ['A', 'B'] }, yAxis: {}, series: [{ type: 'bar', data: [1, 2] }] }}
 *   height={300}
 * />
 * ```
 */
export function EChartsWrapper({
  option,
  height = 400,
  loading = false,
  className,
  onChartReady,
}: EChartsWrapperProps) {
  const chartRef = useRef<ReactECharts>(null);
  const [ready, setReady] = useState(false);

  // 确保主题在首次渲染前注册
  useEffect(() => {
    ensureThemeRegistered();
    setReady(true);
  }, []);

  // 响应式：监听容器尺寸变化自动 resize
  useEffect(() => {
    if (!chartRef.current) return;

    const instance = chartRef.current.getEchartsInstance();
    const resizeObserver = new ResizeObserver(() => {
      instance?.resize();
    });

    const dom = instance?.getDom();
    if (dom?.parentElement) {
      resizeObserver.observe(dom.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [ready]);

  if (!ready) {
    return (
      <div className={`echarts-wrapper ${className ?? ''}`} style={{ height }}>
        <div className="echarts-wrapper-loading">
          <Spinner size="md" centered />
        </div>
      </div>
    );
  }

  return (
    <div className={`echarts-wrapper ${className ?? ''}`}>
      {loading && (
        <div className="echarts-wrapper-loading" style={{ height }}>
          <Spinner size="md" centered />
        </div>
      )}
      <div style={{ display: loading ? 'none' : 'block' }}>
        <ReactECharts
          ref={chartRef}
          option={option}
          theme={JOURNEYHUB_THEME_NAME}
          style={{ height, width: '100%' }}
          notMerge
          onChartReady={onChartReady}
        />
      </div>
    </div>
  );
}
