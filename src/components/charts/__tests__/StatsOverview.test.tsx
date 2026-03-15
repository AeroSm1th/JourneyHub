/**
 * StatsOverview 组件测试
 *
 * 验证需求: 6.1, 6.2, 6.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsOverview } from '../StatsOverview';

// mock useStatistics hook
const mockUseStatistics = vi.fn();
vi.mock('@/features/insights/hooks/useStatistics', () => ({
  useStatistics: () => mockUseStatistics(),
}));

describe('StatsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('加载中时应该显示 Spinner', () => {
    mockUseStatistics.mockReturnValue({
      totalCities: 0,
      totalCountries: 0,
      totalContinents: 0,
      continentCoverage: 0,
      averageRating: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<StatsOverview />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('加载失败时应该显示错误信息', () => {
    mockUseStatistics.mockReturnValue({
      totalCities: 0,
      totalCountries: 0,
      totalContinents: 0,
      continentCoverage: 0,
      averageRating: undefined,
      isLoading: false,
      error: new Error('加载失败'),
    });

    render(<StatsOverview />);
    expect(screen.getByText('加载统计数据失败')).toBeInTheDocument();
  });

  it('应该显示所有四个统计卡片', () => {
    mockUseStatistics.mockReturnValue({
      totalCities: 15,
      totalCountries: 8,
      totalContinents: 3,
      continentCoverage: 42.9,
      averageRating: 4.2,
      isLoading: false,
      error: null,
    });

    render(<StatsOverview />);

    // 城市总数
    expect(screen.getByText('城市总数')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    // 国家总数
    expect(screen.getByText('国家总数')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // 大洲覆盖
    expect(screen.getByText('大洲覆盖')).toBeInTheDocument();
    expect(screen.getByText('3/7')).toBeInTheDocument();
    expect(screen.getByText('42.9%')).toBeInTheDocument();

    // 平均评分
    expect(screen.getByText('平均评分')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('没有评分数据时应该显示 "-"', () => {
    mockUseStatistics.mockReturnValue({
      totalCities: 5,
      totalCountries: 3,
      totalContinents: 1,
      continentCoverage: 14.3,
      averageRating: undefined,
      isLoading: false,
      error: null,
    });

    render(<StatsOverview />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
