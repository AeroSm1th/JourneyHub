/**
 * ContinentPie 组件测试
 *
 * 验证需求: 6.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContinentPie } from '../ContinentPie';

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

describe('ContinentPie', () => {
  beforeEach(() => {
    capturedOnChartReady = undefined;
  });

  const sampleData = [
    { name: 'Asia', value: 10 },
    { name: 'Europe', value: 8 },
    { name: 'North America', value: 5 },
    { name: 'Africa', value: 2 },
  ];

  it('应该正常渲染饼图', () => {
    render(<ContinentPie data={sampleData} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该将数据传递给饼图 series', () => {
    render(<ContinentPie data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.series[0].data).toEqual(sampleData);
    expect(option.series[0].type).toBe('pie');
  });

  it('空数据时应该正常渲染', () => {
    render(<ContinentPie data={[]} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.series[0].data).toEqual([]);
  });

  it('应该显示百分比标签', () => {
    render(<ContinentPie data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.series[0].label.show).toBe(true);
    expect(option.series[0].label.formatter).toBe('{b}: {d}%');
  });

  it('应该显示图例', () => {
    render(<ContinentPie data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.legend).toBeDefined();
    expect(option.legend.type).toBe('scroll');
  });

  it('应该支持自定义高度', () => {
    render(<ContinentPie data={sampleData} height={600} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('应该支持自定义 className', () => {
    const { container } = render(
      <ContinentPie data={sampleData} className="custom-pie" />,
    );
    const wrapper = container.querySelector('.custom-pie');
    expect(wrapper).toBeInTheDocument();
  });

  it('点击扇区时应该触发 onContinentClick 回调', () => {
    const handleClick = vi.fn();
    render(<ContinentPie data={sampleData} onContinentClick={handleClick} />);

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
    clickHandler({ componentType: 'series', name: 'Asia' });
    expect(handleClick).toHaveBeenCalledWith('Asia');
  });

  it('没有 onContinentClick 时不应绑定点击事件', () => {
    render(<ContinentPie data={sampleData} />);

    const mockInstance = {
      off: vi.fn(),
      on: vi.fn(),
    };

    expect(capturedOnChartReady).toBeDefined();
    capturedOnChartReady!(mockInstance);

    // 没有传 onContinentClick，不应绑定事件
    expect(mockInstance.off).not.toHaveBeenCalled();
    expect(mockInstance.on).not.toHaveBeenCalled();
  });

  it('非 series 类型的点击不应触发回调', () => {
    const handleClick = vi.fn();
    render(<ContinentPie data={sampleData} onContinentClick={handleClick} />);

    const mockInstance = {
      off: vi.fn(),
      on: vi.fn(),
    };

    capturedOnChartReady!(mockInstance);

    const clickHandler = mockInstance.on.mock.calls[0][1];
    // 非 series 类型的点击
    clickHandler({ componentType: 'legend', name: 'Asia' });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('单个大洲数据应该正常渲染', () => {
    const singleData = [{ name: 'Asia', value: 15 }];
    render(<ContinentPie data={singleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.series[0].data).toEqual(singleData);
  });

  it('应该使用环形饼图（有内外半径）', () => {
    render(<ContinentPie data={sampleData} />);
    const chartEl = screen.getByTestId('echarts-mock');
    const content = chartEl.textContent ?? '';
    const option = JSON.parse(content);
    expect(option.series[0].radius).toEqual(['40%', '70%']);
  });
});
