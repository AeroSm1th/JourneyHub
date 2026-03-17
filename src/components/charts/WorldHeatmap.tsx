/**
 * 世界地图热力图组件
 *
 * 使用 ECharts 地图类型渲染世界热力图，根据每个国家的访问次数显示热力强度。
 * 地图 GeoJSON 数据通过异步加载并注册到 ECharts。
 *
 * 验证需求: 6.4
 */

import { useEffect, useMemo, useState } from 'react';
import * as echarts from 'echarts/core';
import { EChartsWrapper } from './EChartsWrapper';
import { Spinner } from '@/components/common/Spinner';

import type { EChartsOption } from 'echarts';

/** 世界地图 GeoJSON 数据源地址（本地文件，避免 CORS 问题） */
const WORLD_MAP_JSON_URL = '/world.json';

/** 地图注册名称 */
const MAP_NAME = 'world';

/** 单个国家的访问数据 */
export interface WorldMapDataItem {
  /** 国家名称（英文，需与 GeoJSON 中的 name 匹配） */
  name: string;
  /** 访问次数 */
  value: number;
}

export interface WorldHeatmapProps {
  /** 国家访问数据数组 */
  data: WorldMapDataItem[];
  /** 图表高度，默认 480px */
  height?: string | number;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 额外的 CSS 类名 */
  className?: string;
}

/** 标记世界地图是否已注册 */
let mapRegistered = false;

/**
 * 异步加载并注册世界地图 GeoJSON
 *
 * 仅在首次调用时执行网络请求，后续调用直接返回。
 */
async function ensureWorldMapRegistered(): Promise<void> {
  if (mapRegistered) return;

  const response = await fetch(WORLD_MAP_JSON_URL);
  if (!response.ok) {
    throw new Error(`加载世界地图数据失败: ${response.status}`);
  }

  const geoJson = await response.json();
  echarts.registerMap(MAP_NAME, geoJson as any);
  mapRegistered = true;
}

/**
 * 构建 ECharts 配置项
 */
function buildOption(data: WorldMapDataItem[]): EChartsOption {
  // 计算数据范围，用于 visualMap
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 10;

  return {
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        const name: string = params.name ?? '';
        const value: number = params.value ?? 0;
        return `<strong>${name}</strong><br/>访问次数: ${value}`;
      },
    },
    visualMap: {
      min: 0,
      max: Math.max(maxValue, 1),
      left: 'left',
      bottom: 20,
      text: ['多', '少'],
      calculable: true,
      inRange: {
        color: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0369a1'],
      },
      textStyle: {
        color: '#6b7280',
      },
    },
    series: [
      {
        name: '访问次数',
        type: 'map',
        map: MAP_NAME,
        roam: true,
        emphasis: {
          label: {
            show: true,
            color: '#1f2937',
          },
          itemStyle: {
            areaColor: '#fbbf24',
          },
        },
        itemStyle: {
          areaColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 0.5,
        },
        label: {
          show: false,
        },
        data,
      },
    ],
  } as EChartsOption;
}

/**
 * 世界地图热力图组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { name: 'China', value: 15 },
 *   { name: 'Japan', value: 8 },
 *   { name: 'France', value: 5 },
 * ];
 * <WorldHeatmap data={data} height={500} />
 * ```
 */
export function WorldHeatmap({
  data,
  height = 480,
  loading = false,
  className,
}: WorldHeatmapProps) {
  const [mapReady, setMapReady] = useState(mapRegistered);
  const [error, setError] = useState<string | null>(null);

  // 异步加载世界地图 GeoJSON
  useEffect(() => {
    if (mapReady) return;

    let cancelled = false;

    ensureWorldMapRegistered()
      .then(() => {
        if (!cancelled) setMapReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : '地图加载失败');
      });

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  // 构建图表配置
  const option = useMemo(() => buildOption(data), [data]);

  // 地图加载失败时显示错误提示
  if (error) {
    return (
      <div
        className={`echarts-wrapper ${className ?? ''}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
    );
  }

  // 地图 GeoJSON 未注册前不渲染 ECharts，避免 "Map world not exists" 错误
  if (!mapReady) {
    return (
      <div
        className={`echarts-wrapper ${className ?? ''}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Spinner size="md" centered />
      </div>
    );
  }

  return <EChartsWrapper option={option} height={height} loading={loading} className={className} />;
}
