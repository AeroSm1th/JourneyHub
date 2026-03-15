/**
 * 登录页面组件测试
 *
 * 测试内容：
 * - 表单渲染
 * - 表单验证
 * - 登录提交
 * - 错误显示
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../LoginPage';

// Mock hooks
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    session: null,
    isLoading: false,
  })),
}));

vi.mock('@/features/auth/hooks/useLogin', () => ({
  useLogin: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

// 测试辅助函数
const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染登录表单', () => {
    renderLoginPage();

    expect(screen.getByText('登录到 JourneyHub')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('应该显示邮箱验证错误', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText('密码');
    const submitButton = screen.getByRole('button', { name: /登录/i });

    // 只输入密码，不输入邮箱，直接提交
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // 等待验证错误显示（空邮箱触发 "邮箱不能为空" 错误）
    await waitFor(() => {
      expect(screen.getByText(/邮箱不能为空/i)).toBeInTheDocument();
    });
  });

  it('应该显示密码验证错误', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText('邮箱地址');
    const passwordInput = screen.getByLabelText('密码');
    const submitButton = screen.getByRole('button', { name: /登录/i });

    // 输入有效邮箱但密码太短
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    // 等待验证错误显示
    await waitFor(() => {
      expect(screen.getByText(/密码至少需要 8 个字符/i)).toBeInTheDocument();
    });
  });

  it('应该显示注册链接', () => {
    renderLoginPage();

    const registerLink = screen.getByRole('link', { name: /立即注册/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('表单字段应该有正确的可访问性属性', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText('邮箱地址');
    const passwordInput = screen.getByLabelText('密码');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(emailInput).toHaveAttribute('placeholder');
    expect(passwordInput).toHaveAttribute('placeholder');
  });
});
