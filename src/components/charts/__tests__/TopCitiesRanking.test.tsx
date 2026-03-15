/**
 * TopCitiesRanking 组件测试
 *
 * 验证需求: 6.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopCitiesRanking } from '../TopCitiesRanking';

// mock echarts 核心模块
vi.mock('echarts/core', () => ({
  __esModule: true,
  default: {
    registerTheme: vi.fn(),
  },
  registerTheme: vi.fn(),
}));

// mock echarts-for-react，渲染一个简单的 div 代替 canvas
vi.mock('echarts-for-react', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((props: any) => (
    <div data-testid="echarts-mock" style={props.style}>
      {JSON.stringify(props.option)}
    </div>
  )),
}));

const sampleData = [
  { cityName: 'Tokyo', countryName: 'Japan', visitCount: 5 },
  { cityName: 'Paris', countryName: 'France', visitCount: 3 },
  { cityName: 'London', countryName: 'UK', visitCount: 7 },
];

describe('TopCitiesRanking', () => {
  it('应该正常渲染水平柱状图', () => {
    render(<TopCitiesRanking data={sampleData} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该按访问次数降序排列，排名第一的在顶部', () => {
    render(<TopCitiesRanking data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');

    // ECharts y 轴从下到上，所以反转后排名第一的在最后（即顶部）
    // London(7) > Tokyo(5) > Paris(3)
    // 反转后: Paris, Tokyo, London（从下到上显示）
    expect(option.yAxis.data).toEqual([
      'Paris, France',
      'Tokyo, Japan',
      'London, UK',
    ]);
    expect(option.series[0].data).toEqual([3, 5, 7]);
  });

  it('应该在 y 轴标签中显示"城市名, 国家名"格式', () => {
    render(<TopCitiesRanking data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');

    for (const label of option.yAxis.data) {
      expect(label).toMatch(/.+, .+/);
    }
  });

  it('空数据时应该正常渲染', () => {
    render(<TopCitiesRanking data={[]} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');
    expect(option.yAxis.data).toEqual([]);
    expect(option.series[0].data).toEqual([]);
  });

  it('应该使用水平柱状图（xAxis 为 value，yAxis 为 category）', () => {
    render(<TopCitiesRanking data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');
    expect(option.xAxis.type).toBe('value');
    expect(option.yAxis.type).toBe('category');
  });

  it('应该支持自定义高度', () => {
    render(<TopCitiesRanking data={sampleData} height={600} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <TopCitiesRanking data={sampleData} className="custom-ranking" />
    );
    const wrapper = container.querySelector('.custom-ranking');
    expect(wrapper).toBeInTheDocument();
  });

  it('应该支持 loading 状态', () => {
    render(<TopCitiesRanking data={sampleData} loading />);
    // loading 状态下 EChartsWrapper 会显示 Spinner
    // 由于 EChartsWrapper 已有自己的测试，这里只验证不报错
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('单条数据应该正常渲染', () => {
    const single = [{ cityName: 'Berlin', countryName: 'Germany', visitCount: 2 }];
    render(<TopCitiesRanking data={single} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');
    expect(option.yAxis.data).toEqual(['Berlin, Germany']);
    expect(option.series[0].data).toEqual([2]);
  });

  it('已排序数据不应改变顺序', () => {
    const sorted = [
      { cityName: 'A', countryName: 'X', visitCount: 10 },
      { cityName: 'B', countryName: 'Y', visitCount: 5 },
      { cityName: 'C', countryName: 'Z', visitCount: 1 },
    ];
    render(<TopCitiesRanking data={sorted} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chartEl.textContent ?? '');

    // 反转后从下到上: C, B, A（A 在顶部）
    expect(option.yAxis.data).toEqual(['C, Z', 'B, Y', 'A, X']);
    expect(option.series[0].data).toEqual([1, 5, 10]);
  });
});
