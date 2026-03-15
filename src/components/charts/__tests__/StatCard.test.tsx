/**
 * StatCard 组件测试
 *
 * 验证需求: 6.1, 6.2, 6.7
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('应该渲染图标、标签和数值', () => {
    render(<StatCard icon="🏙️" label="城市总数" value={42} />);

    expect(screen.getByText('🏙️')).toBeInTheDocument();
    expect(screen.getByText('城市总数')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('应该渲染字符串类型的数值', () => {
    render(<StatCard icon="🌍" label="大洲覆盖" value="5/7" />);

    expect(screen.getByText('5/7')).toBeInTheDocument();
  });

  it('应该渲染副标题（如果提供）', () => {
    render(<StatCard icon="🌍" label="大洲覆盖" value="5/7" subtitle="71.4%" />);

    expect(screen.getByText('71.4%')).toBeInTheDocument();
  });

  it('不提供副标题时不应渲染副标题元素', () => {
    const { container } = render(<StatCard icon="🏙️" label="城市总数" value={10} />);

    expect(container.querySelector('.stat-card-subtitle')).toBeNull();
  });

  it('应该将 color 应用到数值文本', () => {
    render(<StatCard icon="🏙️" label="城市总数" value={42} color="#3b82f6" />);

    const valueEl = screen.getByText('42');
    expect(valueEl).toHaveStyle({ color: '#3b82f6' });
  });

  it('应该支持 ReactNode 类型的图标', () => {
    render(<StatCard icon={<span data-testid="custom-icon">★</span>} label="评分" value={4.5} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
