/**
 * 组件测试：登录和注册表单
 *
 * 测试表单渲染、验证、提交流程
 * 验证需求: 1.1, 1.2, 1.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../LoginPage';
import RegisterPage from '../RegisterPage';

// Mock hooks
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/auth/hooks/useLogin', () => ({
  useLogin: () => ({
    mutate: mockLogin,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/features/auth/hooks/useRegister', () => ({
  useRegister: () => ({
    mutate: mockRegister,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Button 组件的 type prop 是 CSS 类名（如 "primary"），不是 HTML type
// 需要 mock 为 type="submit" 的 button 才能触发 form submit
vi.mock('@/components/Button', () => ({
  default: ({ children, type: _cssType, ...props }: any) => (
    <button type="submit" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/PageNav', () => ({
  default: () => <nav data-testid="page-nav">Nav</nav>,
}));


// ============================================================================
// 辅助函数
// ============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

// ============================================================================
// 登录表单测试
// ============================================================================

describe('登录表单', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染邮箱和密码输入框', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/邮箱地址/)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
  });

  it('应该渲染登录按钮', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
  });

  it('应该渲染注册链接', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/立即注册/)).toBeInTheDocument();
  });

  it('提交空表单应显示验证错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /登录/ });
    await user.click(submitBtn);

    // 等待验证错误出现
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    // 不应该调用登录函数
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('输入有效数据后应调用登录函数', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/邮箱地址/), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/), 'password123');

    const submitBtn = screen.getByRole('button', { name: /登录/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('输入无效邮箱应显示错误', async () => {
    // 使用 a@b — 通过 HTML5 email 验证但不通过 Zod 的严格 email 验证
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/邮箱地址/), 'a@b');
    await user.type(screen.getByLabelText(/密码/), 'password123');

    const submitBtn = screen.getByRole('button', { name: /登录/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/有效的邮箱/)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('输入短密码应显示错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/邮箱地址/), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/), 'short');

    const submitBtn = screen.getByRole('button', { name: /登录/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/至少.*8/)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 注册表单测试
// ============================================================================

describe('注册表单', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染邮箱、密码和确认密码输入框', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/邮箱地址/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^密码$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/确认密码/)).toBeInTheDocument();
  });

  it('应该渲染注册按钮', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('button', { name: /注册/ })).toBeInTheDocument();
  });

  it('应该渲染登录链接', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByText(/立即登录/)).toBeInTheDocument();
  });

  it('提交空表单应显示验证错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const submitBtn = screen.getByRole('button', { name: /注册/ });
    await user.click(submitBtn);

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('输入有效数据后应调用注册函数', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/邮箱地址/), 'new@example.com');
    await user.type(screen.getByLabelText(/^密码$/), 'password123');
    await user.type(screen.getByLabelText(/确认密码/), 'password123');

    const submitBtn = screen.getByRole('button', { name: /注册/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });

  it('密码不匹配应显示错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText(/邮箱地址/), 'new@example.com');
    await user.type(screen.getByLabelText(/^密码$/), 'password123');
    await user.type(screen.getByLabelText(/确认密码/), 'different456');

    const submitBtn = screen.getByRole('button', { name: /注册/ });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/不一致/)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });
});
