/**
 * JourneyHub ECharts 自定义主题
 *
 * 定义与项目设计风格一致的 ECharts 主题配色和默认样式
 *
 * 验证需求: 6.4
 */

/** 主题名称常量 */
export const JOURNEYHUB_THEME_NAME = 'journeyhub';

/** JourneyHub 调色板 */
const palette = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  green: '#10b981',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  emerald: '#059669',
  violet: '#7c3aed',
};

/** ECharts 主题对象 */
export const journeyhubTheme = {
  color: [
    palette.blue,
    palette.green,
    palette.purple,
    palette.amber,
    palette.teal,
    palette.rose,
    palette.indigo,
    palette.sky,
    palette.emerald,
    palette.violet,
  ],

  backgroundColor: 'transparent',

  textStyle: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#374151',
  },

  title: {
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#1f2937',
    },
    subtextStyle: {
      fontSize: 12,
      color: '#6b7280',
    },
  },

  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    textStyle: {
      color: '#374151',
      fontSize: 13,
    },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
  },

  legend: {
    textStyle: {
      color: '#6b7280',
      fontSize: 12,
    },
  },

  categoryAxis: {
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisTick: { lineStyle: { color: '#e5e7eb' } },
    axisLabel: { color: '#6b7280', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f3f4f6' } },
  },

  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#6b7280', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
  },

  bar: {
    barMaxWidth: 40,
    itemStyle: {
      borderRadius: [4, 4, 0, 0],
    },
  },

  pie: {
    itemStyle: {
      borderColor: '#fff',
      borderWidth: 2,
    },
  },

  line: {
    smooth: true,
    symbolSize: 6,
    lineStyle: { width: 2 },
  },
};
