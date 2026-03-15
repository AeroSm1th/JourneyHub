/**
 * YearlyChart 组件测试
 *
 * 验证需求: 6.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YearlyChart } from '../YearlyChart';

// mock echarts 核心模块
vi.mock('echarts/core', () => ({
  __esModule: true,
  default: {
    registerTheme: vi.fn(),
  },
  registerTheme: vi.fn(),
}));

// mock echarts-for-react，渲染一个简单的 div 代替 canvas
// 同时捕获 onChartReady 回调以便测试点击事件
let capturedOnChartReady: ((instance: any) => void) | undefined;

vi.mock('echarts-for-react', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation((props: any) => {
    capturedOnChartReady = props.onChartReady;
    return (
      <div data-testid="echarts-mock" style={props.style}>
        {JSON.stringify(props.option)}
      </div>
    );
  }),
}));

describe('YearlyChart', () => {
  beforeEach(() => {
    capturedOnChartReady = undefined;
  });

  const sampleData: Record<string, number> = {
    '2021': 3,
    '2023': 8,
    '2022': 5,
  };

  it('应该正常渲染柱状图', () => {
    render(<YearlyChart data={sampleData} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该按年份升序排列数据', () => {
    render(<YearlyChart data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';

    // 验证 xAxis 数据按年份排序
    const option = JSON.parse(content);
    expect(option.xAxis.data).toEqual(['2021', '2022', '2023']);
    expect(option.series[0].data).toEqual([3, 5, 8]);
  });

  it('空数据时应该正常渲染', () => {
    render(<YearlyChart data={{}} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.xAxis.data).toEqual([]);
    expect(option.series[0].data).toEqual([]);
  });

  it('应该支持自定义高度', () => {
    render(<YearlyChart data={sampleData} height={600} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <YearlyChart data={sampleData} className="custom-yearly" />
    );
    const wrapper = container.querySelector('.custom-yearly');
    expect(wrapper).toBeInTheDocument();
  });

  it('点击柱子时应该触发 onYearClick 回调', () => {
    const handleYearClick = vi.fn();
    render(<YearlyChart data={sampleData} onYearClick={handleYearClick} />);

    // 模拟 ECharts 实例
    const mockInstance = {
      off: vi.fn(),
      on: vi.fn(),
    };

    // 触发 onChartReady
    expect(capturedOnChartReady).toBeDefined();
    capturedOnChartReady!(mockInstance);

    // 验证事件绑定
    expect(mockInstance.off).toHaveBeenCalledWith('click');
    expect(mockInstance.on).toHaveBeenCalledWith('click', expect.any(Function));

    // 模拟点击事件
    const clickHandler = mockInstance.on.mock.calls[0][1];
    clickHandler({ componentType: 'series', name: '2022' });
    expect(handleYearClick).toHaveBeenCalledWith('2022');
  });

  it('没有 onYearClick 时不应绑定点击事件', () => {
    render(<YearlyChart data={sampleData} />);

    const mockInstance = {
      off: vi.fn(),
      on: vi.fn(),
    };

    expect(capturedOnChartReady).toBeDefined();
    capturedOnChartReady!(mockInstance);

    // 没有传 onYearClick，不应绑定事件
    expect(mockInstance.off).not.toHaveBeenCalled();
    expect(mockInstance.on).not.toHaveBeenCalled();
  });

  it('非 series 类型的点击不应触发回调', () => {
    const handleYearClick = vi.fn();
    render(<YearlyChart data={sampleData} onYearClick={handleYearClick} />);

    const mockInstance = {
      off: vi.fn(),
      on: vi.fn(),
    };

    capturedOnChartReady!(mockInstance);

    const clickHandler = mockInstance.on.mock.calls[0][1];
    // 非 series 类型的点击
    clickHandler({ componentType: 'xAxis', name: '2022' });
    expect(handleYearClick).not.toHaveBeenCalled();
  });

  it('单个年份数据应该正常渲染', () => {
    render(<YearlyChart data={{ '2023': 10 }} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.xAxis.data).toEqual(['2023']);
    expect(option.series[0].data).toEqual([10]);
  });
});
