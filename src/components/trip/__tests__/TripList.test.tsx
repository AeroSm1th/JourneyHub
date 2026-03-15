/**
 * 行程列表组件测试
 *
 * 测试列表渲染、筛选、点击、选中状态
 * 验证需求: 5.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TripList } from '../TripList';
import { useTrips } from '@/features/trips/hooks/useTrips';
import type { Trip } from '@/types/database';

// Mock useTrips hook
vi.mock('@/features/trips/hooks/useTrips');

// ============================================================================
// 测试数据
// ============================================================================

/** 生成未来日期字符串 */
const futureDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

/** 生成过去日期字符串 */
const pastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    user_id: 'u1',
    title: '东京之旅',
    start_date: futureDate(10),
    end_date: futureDate(20),
    status: 'planning',
    share_enabled: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'trip-2',
    user_id: 'u1',
    title: '巴黎假期',
    start_date: pastDate(5),
    end_date: futureDate(5),
    status: 'ongoing',
    budget: 15000,
    currency: 'EUR',
    share_enabled: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'trip-3',
    user_id: 'u1',
    title: '北京出差',
    start_date: pastDate(30),
    end_date: pastDate(25),
    status: 'completed',
    share_enabled: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

// ============================================================================
// 辅助函数
// ============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

// ============================================================================
// 测试
// ============================================================================

describe('行程列表组件测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('加载状态', () => {
    it('应显示加载动画', () => {
      vi.mocked(useTrips).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithQueryClient(<TripList />);

      // Spinner 渲染在 trip-list-loading 容器中
      const loadingContainer = document.querySelector('.trip-list-loading');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('错误状态', () => {
    it('应显示错误信息', () => {
      vi.mocked(useTrips).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('网络错误'),
      } as any);

      renderWithQueryClient(<TripList />);

      expect(screen.getByText('加载行程列表失败')).toBeInTheDocument();
      expect(screen.getByText('网络错误')).toBeInTheDocument();
    });
  });

  describe('空状态', () => {
    it('应显示空状态提示', () => {
      vi.mocked(useTrips).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<TripList />);

      expect(screen.getByText('还没有行程记录')).toBeInTheDocument();
      expect(screen.getByText('创建你的第一个旅行行程吧')).toBeInTheDocument();
    });
  });

  describe('列表渲染', () => {
    beforeEach(() => {
      vi.mocked(useTrips).mockReturnValue({
        data: mockTrips,
        isLoading: false,
        error: null,
      } as any);
    });

    it('应显示所有行程', () => {
      renderWithQueryClient(<TripList />);

      expect(screen.getByText('东京之旅')).toBeInTheDocument();
      expect(screen.getByText('巴黎假期')).toBeInTheDocument();
      expect(screen.getByText('北京出差')).toBeInTheDocument();
    });

    it('应显示行程数量', () => {
      renderWithQueryClient(<TripList />);

      expect(screen.getByText('3 个行程')).toBeInTheDocument();
    });

    it('应显示状态标签', () => {
      renderWithQueryClient(<TripList />);

      // 状态标签同时出现在筛选按钮和行程项中，使用 getAllByText
      const planningTexts = screen.getAllByText('计划中');
      const ongoingTexts = screen.getAllByText('进行中');
      const completedTexts = screen.getAllByText('已完成');

      // 每个至少出现 2 次（筛选按钮 + 行程状态标签）
      expect(planningTexts.length).toBeGreaterThanOrEqual(2);
      expect(ongoingTexts.length).toBeGreaterThanOrEqual(2);
      expect(completedTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('应显示预算信息', () => {
      renderWithQueryClient(<TripList />);

      expect(screen.getByText(/15,000/)).toBeInTheDocument();
      expect(screen.getByText(/EUR/)).toBeInTheDocument();
    });
  });

  describe('筛选功能', () => {
    beforeEach(() => {
      vi.mocked(useTrips).mockReturnValue({
        data: mockTrips,
        isLoading: false,
        error: null,
      } as any);
    });

    it('应渲染所有筛选按钮', () => {
      renderWithQueryClient(<TripList />);

      // 筛选按钮：全部、计划中、进行中、已完成
      const filterButtons = screen.getAllByRole('button');
      const filterLabels = filterButtons.map((b) => b.textContent);
      expect(filterLabels).toContain('全部');
      expect(filterLabels).toContain('计划中');
      expect(filterLabels).toContain('进行中');
      expect(filterLabels).toContain('已完成');
    });

    it('点击"计划中"应只显示计划中的行程', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<TripList />);

      // 找到筛选栏中的"计划中"按钮
      const filterBtns = screen
        .getAllByRole('button')
        .filter((b) => b.classList.contains('trip-list-filter-btn'));
      const planningBtn = filterBtns.find((b) => b.textContent === '计划中');
      expect(planningBtn).toBeDefined();

      await user.click(planningBtn!);

      // 应只显示计划中的行程
      expect(screen.getByText('东京之旅')).toBeInTheDocument();
      expect(screen.queryByText('巴黎假期')).not.toBeInTheDocument();
      expect(screen.queryByText('北京出差')).not.toBeInTheDocument();
    });

    it('点击"已完成"应只显示已完成的行程', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<TripList />);

      const filterBtns = screen
        .getAllByRole('button')
        .filter((b) => b.classList.contains('trip-list-filter-btn'));
      const completedBtn = filterBtns.find((b) => b.textContent === '已完成');

      await user.click(completedBtn!);

      expect(screen.getByText('北京出差')).toBeInTheDocument();
      expect(screen.queryByText('东京之旅')).not.toBeInTheDocument();
      expect(screen.queryByText('巴黎假期')).not.toBeInTheDocument();
    });
  });

  describe('点击事件', () => {
    it('点击行程应调用 onTripClick', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      vi.mocked(useTrips).mockReturnValue({
        data: mockTrips,
        isLoading: false,
        error: null,
      } as any);

      renderWithQueryClient(<TripList onTripClick={handleClick} />);

      const tripItem = screen.getByText('东京之旅').closest('li');
      expect(tripItem).toBeInTheDocument();

      await user.click(tripItem!);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'trip-1',
          title: '东京之旅',
        }),
      );
    });
  });

  describe('选中状态', () => {
    beforeEach(() => {
      vi.mocked(useTrips).mockReturnValue({
        data: mockTrips,
        isLoading: false,
        error: null,
      } as any);
    });

    it('选中的行程应有 active 样式', () => {
      renderWithQueryClient(<TripList selectedTripId="trip-1" />);

      const tripItem = screen.getByText('东京之旅').closest('li');
      expect(tripItem).toHaveClass('trip-list-item-active');
    });

    it('未选中的行程不应有 active 样式', () => {
      renderWithQueryClient(<TripList selectedTripId="trip-1" />);

      const tripItem = screen.getByText('巴黎假期').closest('li');
      expect(tripItem).not.toHaveClass('trip-list-item-active');
    });
  });
});
