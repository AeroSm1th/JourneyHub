/**
 * 愿望清单表单组件测试
 *
 * 测试表单渲染、验证、优先级选择、季节选择、提交和取消
 * 验证需求: 4.1, 4.4
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistForm } from '../WishlistForm';

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助函数
// ============================================================================

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

/** 默认坐标 */
const defaultCoords = { lat: 35.6762, lng: 139.6503 };

/** 渲染愿望清单表单 */
function renderWishlistForm(props: Record<string, any> = {}) {
  const onSubmit = props.onSubmit || vi.fn();
  const onCancel = props.onCancel || vi.fn();
  const coordinates = props.coordinates || defaultCoords;

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <WishlistForm
        coordinates={coordinates}
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...props}
      />
    </QueryClientProvider>
  );
}

// ============================================================================
// 测试
// ============================================================================

describe('愿望清单表单组件测试', () => {
  describe('表单渲染', () => {
    it('应渲染所有字段', () => {
      renderWishlistForm();

      // 必填字段
      expect(screen.getByLabelText(/城市名称/)).toBeInTheDocument();
      expect(screen.getByLabelText(/国家/)).toBeInTheDocument();
      expect(screen.getByLabelText(/大洲/)).toBeInTheDocument();

      // 优先级按钮
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('button', { name: `优先级 ${i}` })).toBeInTheDocument();
      }

      // 可选字段
      expect(screen.getByLabelText(/期望季节/)).toBeInTheDocument();
      expect(screen.getByLabelText(/备注/)).toBeInTheDocument();
    });

    it('应渲染提交和取消按钮', () => {
      renderWishlistForm();

      expect(screen.getByRole('button', { name: /添加到愿望清单/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument();
    });

    it('应显示只读坐标', () => {
      renderWishlistForm();

      const latDisplay = screen.getByDisplayValue(defaultCoords.lat.toFixed(6));
      const lngDisplay = screen.getByDisplayValue(defaultCoords.lng.toFixed(6));

      expect(latDisplay).toBeDisabled();
      expect(lngDisplay).toBeDisabled();
    });
  });

  describe('必填字段验证', () => {
    it('空提交应显示验证错误', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderWishlistForm({ onSubmit });

      const submitBtn = screen.getByRole('button', { name: /添加到愿望清单/ });
      await user.click(submitBtn);

      // 等待验证错误出现
      await waitFor(() => {
        expect(screen.getByText('城市名称不能为空')).toBeInTheDocument();
      });

      // 不应调用 onSubmit
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('优先级按钮选择', () => {
    it('默认优先级应为 3', () => {
      renderWishlistForm();

      const btn3 = screen.getByRole('button', { name: '优先级 3' });
      expect(btn3).toHaveAttribute('aria-pressed', 'true');
    });

    it('点击优先级按钮应切换选中状态', async () => {
      const user = userEvent.setup();
      renderWishlistForm();

      const btn5 = screen.getByRole('button', { name: '优先级 5' });
      await user.click(btn5);

      expect(btn5).toHaveAttribute('aria-pressed', 'true');

      // 之前选中的按钮应取消
      const btn3 = screen.getByRole('button', { name: '优先级 3' });
      expect(btn3).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('季节下拉选择', () => {
    it('应包含所有季节选项', () => {
      renderWishlistForm();

      const seasonSelect = screen.getByLabelText(/期望季节/);
      expect(seasonSelect).toBeInTheDocument();

      // 检查选项存在
      expect(screen.getByText('不限季节')).toBeInTheDocument();
      expect(screen.getByText('🌸 春季')).toBeInTheDocument();
      expect(screen.getByText('☀️ 夏季')).toBeInTheDocument();
      expect(screen.getByText('🍂 秋季')).toBeInTheDocument();
      expect(screen.getByText('❄️ 冬季')).toBeInTheDocument();
    });

    it('应能选择季节', async () => {
      const user = userEvent.setup();
      renderWishlistForm();

      const seasonSelect = screen.getByLabelText(/期望季节/);
      await user.selectOptions(seasonSelect, 'summer');

      expect(seasonSelect).toHaveValue('summer');
    });
  });

  describe('表单提交', () => {
    it('填写完整表单后应调用 onSubmit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderWishlistForm({ onSubmit });

      // 填写必填字段
      await user.type(screen.getByLabelText(/城市名称/), '东京');
      await user.type(screen.getByLabelText(/国家/), '日本');
      fireEvent.change(screen.getByLabelText(/大洲/), { target: { value: 'Asia' } });

      // 提交
      const submitBtn = screen.getByRole('button', { name: /添加到愿望清单/ });
      await user.click(submitBtn);

      await waitFor(
        () => {
          expect(onSubmit).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 },
      );

      // 验证提交数据
      const submittedData = onSubmit.mock.calls[0][0];
      expect(submittedData.cityName).toBe('东京');
      expect(submittedData.countryName).toBe('日本');
      expect(submittedData.continent).toBe('Asia');
      expect(submittedData.latitude).toBe(defaultCoords.lat);
      expect(submittedData.longitude).toBe(defaultCoords.lng);
    });
  });

  describe('取消按钮', () => {
    it('点击取消应调用 onCancel', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWishlistForm({ onCancel });

      await user.click(screen.getByRole('button', { name: /取消/ }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
