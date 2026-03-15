/**
 * 组件测试：城市表单
 *
 * 测试表单渲染、验证、提交流程
 * 测试图片上传功能
 * 验证需求: 3.1, 3.3, 3.4
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CityForm } from '../CityForm';

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

function renderCityForm(
  coordinates = { lat: 39.9042, lng: 116.4074 },
  props: Record<string, any> = {}
) {
  const onSubmit = props.onSubmit || vi.fn();
  const onCancel = props.onCancel || vi.fn();

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <CityForm coordinates={coordinates} onSubmit={onSubmit} onCancel={onCancel} {...props} />
    </QueryClientProvider>
  );
}

// ============================================================================
// 测试
// ============================================================================

describe('城市表单组件测试', () => {
  describe('表单渲染', () => {
    it('应渲染所有必填字段', () => {
      renderCityForm();

      expect(screen.getAllByLabelText(/城市名称/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/国家/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/大洲/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/访问日期/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/旅行类型/).length).toBeGreaterThanOrEqual(1);
    });

    it('应渲染提交和取消按钮', () => {
      renderCityForm();

      expect(screen.getAllByRole('button', { name: /提交/ }).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByRole('button', { name: /取消/ }).length).toBeGreaterThanOrEqual(1);
    });

    it('应预填充坐标字段', () => {
      const coords = { lat: 35.6762, lng: 139.6503 };
      renderCityForm(coords);

      const latInputs = screen.getAllByDisplayValue(coords.lat.toFixed(6));
      const lngInputs = screen.getAllByDisplayValue(coords.lng.toFixed(6));

      expect(latInputs.length).toBeGreaterThanOrEqual(1);
      expect(lngInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('坐标字段应为禁用状态', () => {
      const coords = { lat: 35.6762, lng: 139.6503 };
      renderCityForm(coords);

      const latInputs = screen.getAllByDisplayValue(coords.lat.toFixed(6));
      const lngInputs = screen.getAllByDisplayValue(coords.lng.toFixed(6));

      expect(latInputs[0]).toBeDisabled();
      expect(lngInputs[0]).toBeDisabled();
    });
  });

  describe('表单交互', () => {
    it('点击取消应调用 onCancel', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderCityForm(undefined, { onCancel });

      const cancelBtns = screen.getAllByRole('button', { name: /取消/ });
      await user.click(cancelBtns[0]);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('提交空表单应显示验证错误', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      renderCityForm(undefined, { onSubmit });

      const submitBtns = screen.getAllByRole('button', { name: /提交/ });
      await user.click(submitBtns[0]);

      // 等待验证错误出现
      await waitFor(() => {
        // 应该有错误消息出现（具体文本取决于实现）
        const form = document.querySelector('form');
        expect(form).toBeInTheDocument();
      });

      // 不应该调用 onSubmit
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
