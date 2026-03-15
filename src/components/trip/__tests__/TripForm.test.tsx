/**
 * 行程表单组件测试
 *
 * 测试表单渲染、验证、提交流程
 * 验证需求: 5.1, 5.2
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TripForm } from '../TripForm';

afterEach(() => {
  cleanup();
});

// ============================================================================
// Mock hooks
// ============================================================================

vi.mock('@/features/cities/hooks/useCities', () => ({
  useCities: () => ({
    data: [
      {
        id: 'city-1',
        user_id: 'u1',
        city_name: '北京',
        country_name: '中国',
        continent: 'Asia',
        latitude: 39.9,
        longitude: 116.4,
        visited_at: '2024-01-01',
        trip_type: 'leisure',
        is_favorite: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/features/wishlist/hooks/useWishlist', () => ({
  useWishlist: () => ({
    data: [
      {
        id: 'wish-1',
        user_id: 'u1',
        city_name: '东京',
        country_name: '日本',
        continent: 'Asia',
        latitude: 35.6,
        longitude: 139.6,
        priority: 3,
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

// ============================================================================
// 辅助函数
// ============================================================================

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

function renderTripForm(props: Record<string, any> = {}) {
  const onSubmit = props.onSubmit || vi.fn();
  const onCancel = props.onCancel || vi.fn();

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TripForm onSubmit={onSubmit} onCancel={onCancel} {...props} />
    </QueryClientProvider>,
  );
}

// ============================================================================
// 测试
// ============================================================================

describe('行程表单组件测试', () => {
  describe('表单渲染', () => {
    it('应渲染所有必填字段（title, startDate, endDate）', () => {
      renderTripForm();

      expect(screen.getByLabelText(/行程名称/)).toBeInTheDocument();
      expect(screen.getByLabelText(/开始日期/)).toBeInTheDocument();
      expect(screen.getByLabelText(/结束日期/)).toBeInTheDocument();
    });

    it('应渲染可选字段（budget, transportation, accommodation, notes）', () => {
      renderTripForm();

      expect(screen.getByLabelText(/预算/)).toBeInTheDocument();
      expect(screen.getByLabelText(/交通方式/)).toBeInTheDocument();
      expect(screen.getByLabelText(/住宿信息/)).toBeInTheDocument();
      expect(screen.getByLabelText(/备注/)).toBeInTheDocument();
    });

    it('应渲染关联城市和愿望清单下拉', () => {
      renderTripForm();

      expect(screen.getByLabelText(/关联城市/)).toBeInTheDocument();
      expect(screen.getByLabelText(/关联愿望清单/)).toBeInTheDocument();

      // 城市选项
      expect(screen.getByText('北京 - 中国')).toBeInTheDocument();
      // 愿望清单选项
      expect(screen.getByText('东京 - 日本')).toBeInTheDocument();
    });

    it('应渲染提交和取消按钮', () => {
      renderTripForm();

      expect(screen.getByRole('button', { name: /创建行程/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('提交空表单应显示验证错误', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderTripForm({ onSubmit });

      await user.click(screen.getByRole('button', { name: /创建行程/ }));

      await waitFor(() => {
        // 行程名称必填错误
        expect(screen.getByText('行程名称不能为空')).toBeInTheDocument();
      });

      // 不应调用 onSubmit
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('表单提交', () => {
    it('填写有效数据后应调用 onSubmit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderTripForm({ onSubmit });

      // 填写必填字段
      await user.type(screen.getByLabelText(/行程名称/), '日本之旅');

      // 填写日期
      const startDateInput = screen.getByLabelText(/开始日期/);
      const endDateInput = screen.getByLabelText(/结束日期/);

      // 使用 fireEvent 设置日期值（date input 需要特殊处理）
      await userEvent.clear(startDateInput);
      await userEvent.type(startDateInput, '2025-06-01');
      await userEvent.clear(endDateInput);
      await userEvent.type(endDateInput, '2025-06-10');

      // 提交
      await user.click(screen.getByRole('button', { name: /创建行程/ }));

      await waitFor(
        () => {
          expect(onSubmit).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 },
      );

      const submittedData = onSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe('日本之旅');
      expect(submittedData.startDate).toBeInstanceOf(Date);
      expect(submittedData.endDate).toBeInstanceOf(Date);
    });
  });

  describe('取消按钮', () => {
    it('点击取消应调用 onCancel', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderTripForm({ onCancel });

      await user.click(screen.getByRole('button', { name: /取消/ }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('加载状态', () => {
    it('isLoading=true 时输入字段应禁用', () => {
      renderTripForm({ isLoading: true });

      expect(screen.getByLabelText(/行程名称/)).toBeDisabled();
      expect(screen.getByLabelText(/开始日期/)).toBeDisabled();
      expect(screen.getByLabelText(/结束日期/)).toBeDisabled();
    });
  });
});
