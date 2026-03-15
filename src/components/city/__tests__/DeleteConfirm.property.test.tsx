/**
 * 属性测试：删除确认
 *
 * 属性 15: 删除确认
 * 验证需求: 3.10
 *
 * 对于任何城市记录的删除操作，系统应该在执行删除前要求用户确认。
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

// Mock Modal 组件
vi.mock('@/components/common/Modal', () => ({
  Modal: ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div data-testid="modal" role="dialog">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

afterEach(() => {
  cleanup();
});

// ============================================================================
// 辅助生成器 - 使用纯字母数字避免特殊字符匹配问题
// ============================================================================

/** 生成安全的城市名称（纯字母，足够长度避免子串冲突） */
const arbSafeName = fc
  .stringMatching(/^[A-Z][a-z]{4,15}$/)
  .filter((s) => s.length >= 5);

/** 生成安全的警告文本 */
const arbSafeWarning = fc
  .stringMatching(/^[A-Za-z0-9]{10,40}$/)
  .filter((s) => s.length >= 10);

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 15: 删除确认', () => {
  /**
   * 属性 15.1: 确认对话框打开时应显示确认消息
   */
  it('属性 15.1: 确认对话框应显示确认消息', () => {
    fc.assert(
      fc.property(arbSafeName, (cityName) => {
        cleanup();
        const { unmount } = render(
          <ConfirmDialog
            isOpen={true}
            onClose={vi.fn()}
            onConfirm={vi.fn()}
            title="确认删除"
            message={
              <>
                确定要删除 <strong>{cityName}</strong> 吗？
              </>
            }
            confirmText="确认删除"
            cancelText="取消"
            variant="danger"
          />
        );

        // 对话框应该可见
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // 应该显示城市名称
        expect(screen.getByText(cityName)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 },
    );
  });

  /**
   * 属性 15.2: 确认对话框关闭时不应显示
   */
  it('属性 15.2: isOpen 为 false 时不应渲染对话框', () => {
    fc.assert(
      fc.property(arbSafeName, (cityName) => {
        cleanup();
        const { unmount } = render(
          <ConfirmDialog
            isOpen={false}
            onClose={vi.fn()}
            onConfirm={vi.fn()}
            message={`确定要删除 ${cityName} 吗？`}
          />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: 20 },
    );
  });

  /**
   * 属性 15.3: 确认对话框应包含确认和取消按钮
   */
  it('属性 15.3: 对话框应包含确认和取消按钮', () => {
    const { unmount } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        message="确定要删除吗？"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
      />
    );

    expect(screen.getByText('确认删除')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();

    unmount();
  });

  /**
   * 属性 15.4: 点击取消应调用 onClose
   */
  it('属性 15.4: 点击取消按钮应调用 onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { unmount } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        message="确定要删除吗？"
        cancelText="取消"
      />
    );

    await user.click(screen.getByText('取消'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    unmount();
  });

  /**
   * 属性 15.5: 点击确认应调用 onConfirm
   */
  it('属性 15.5: 点击确认按钮应调用 onConfirm', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    const { unmount } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        message="确定要删除吗？"
        confirmText="确认删除"
        variant="danger"
      />
    );

    await user.click(screen.getByText('确认删除'));

    expect(onConfirm).toHaveBeenCalledTimes(1);

    unmount();
  });

  /**
   * 属性 15.6: 警告信息应显示
   */
  it('属性 15.6: 提供 warning 时应显示警告文本', () => {
    fc.assert(
      fc.property(arbSafeWarning, (warningText) => {
        cleanup();
        const { unmount } = render(
          <ConfirmDialog
            isOpen={true}
            onClose={vi.fn()}
            onConfirm={vi.fn()}
            message="确定要删除吗？"
            warning={warningText}
          />
        );

        expect(screen.getByText(warningText)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 20 },
    );
  });
});
