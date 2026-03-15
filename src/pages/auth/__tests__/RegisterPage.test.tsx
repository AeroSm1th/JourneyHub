/**
 * 注册页面组件测试
 *
 * 测试内容：
 * - 表单渲染
 * - 表单验证
 * - 注册提交流程
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from '../RegisterPage';

// Mock 导航
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as object;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth hook
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock useRegister hook
const mockSignUp = vi.fn();
vi.mock('@/features/auth/hooks/useRegister', () => ({
  useRegister: () => ({
    mutate: mockSignUp,
    isPending: false,
    error: null,
  }),
}));

// 创建测试用的 QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// 测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表单渲染', () => {
    it('应该渲染所有表单字段', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^密码$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument();
    });

    it('应该显示标题', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      expect(screen.getByText(/注册 JourneyHub 账户/i)).toBeInTheDocument();
    });

    it('应该显示登录链接', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const loginLink = screen.getByRole('link', { name: /立即登录/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /注册/i });

      // 不输入任何内容直接提交
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/邮箱不能为空/i)).toBeInTheDocument();
      });
    });

    it('应该验证密码确认匹配', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/邮箱地址/i);
      const passwordInput = screen.getByLabelText(/^密码$/i);
      const confirmPasswordInput = screen.getByLabelText(/确认密码/i);
      const submitButton = screen.getByRole('button', { name: /注册/i });

      // 输入不匹配的密码
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/两次输入的密码不一致/i)).toBeInTheDocument();
      });
    });
  });

  describe('注册提交', () => {
    it('应该在提交有效表单时调用注册函数', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/邮箱地址/i);
      const passwordInput = screen.getByLabelText(/^密码$/i);
      const confirmPasswordInput = screen.getByLabelText(/确认密码/i);
      const submitButton = screen.getByRole('button', { name: /注册/i });

      // 输入有效数据
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });
      });
    });
  });
});
