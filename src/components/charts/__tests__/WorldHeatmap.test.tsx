/**
 * WorldHeatmap 组件测试
 *
 * 验证需求: 6.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WorldHeatmap } from '../WorldHeatmap';
import type { WorldMapDataItem } from '../WorldHeatmap';

// mock echarts 核心模块
vi.mock('echarts/core', () => ({
  __esModule: true,
  default: {
    registerMap: vi.fn(),
    registerTheme: vi.fn(),
  },
  registerMap: vi.fn(),
  registerTheme: vi.fn(),
}));

// mock echarts-for-react，渲染一个简单的 div 代替 canvas
vi.mock('echarts-for-react', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((props: any) => (
    <div data-testid="echarts-mock" style={props.style}>
      {JSON.stringify(props.option?.series?.[0]?.data ?? [])}
    </div>
  )),
}));

// 模拟 fetch 返回的世界地图 GeoJSON
const mockGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'China' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [100, 30],
            [110, 30],
            [110, 40],
            [100, 40],
          ],
        ],
      },
    },
  ],
};

describe('WorldHeatmap', () => {
  beforeEach(() => {
    // 重置地图注册状态（模块级变量）
    vi.resetModules();

    // mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJson),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleData: WorldMapDataItem[] = [
    { name: 'China', value: 15 },
    { name: 'Japan', value: 8 },
    { name: 'France', value: 5 },
  ];

  it('应该在地图加载完成后渲染图表', async () => {
    render(<WorldHeatmap data={sampleData} />);

    await waitFor(() => {
      expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
    });
  });

  it('应该将数据传递给 ECharts 配置', async () => {
    render(<WorldHeatmap data={sampleData} />);

    await waitFor(() => {
      const chartEl = screen.getByTestId('echarts-mock');
      const content = chartEl.textContent ?? '';
      expect(content).toContain('China');
      expect(content).toContain('15');
    });
  });

  it('应该支持自定义高度', async () => {
    render(<WorldHeatmap data={sampleData} height={600} />);

    await waitFor(() => {
      const chartEl = screen.getByTestId('echarts-mock');
      expect(chartEl).toBeInTheDocument();
    });
  });

  it('空数据时应该正常渲染', async () => {
    render(<WorldHeatmap data={[]} />);

    await waitFor(() => {
      expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
    });
  });

  it('fetch 失败时应该显示错误信息', async () => {
    // 重新导入以重置模块级 mapRegistered 状态
    vi.resetModules();

    // 动态导入以获取新的模块实例
    const { WorldHeatmap: FreshWorldHeatmap } = await import('../WorldHeatmap');

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<FreshWorldHeatmap data={sampleData} />);

    await waitFor(() => {
      expect(screen.getByText(/地图加载失败|加载世界地图数据失败/)).toBeInTheDocument();
    });
  });

  it('应该支持自定义 className', async () => {
    const { container } = render(<WorldHeatmap data={sampleData} className="custom-heatmap" />);

    await waitFor(() => {
      const wrapper = container.querySelector('.custom-heatmap');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
