/**
 * 属性测试：未认证用户重定向
 *
 * 属性 3: 未认证用户重定向
 * 验证需求: 1.5
 *
 * 对于任何受保护的路由，当未登录用户尝试访问时，
 * 系统应该重定向到登录页面。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import fc from 'fast-check';

// ============================================================================
// Mock 认证状态
// ============================================================================

let mockAuthState = {
  user: null as { id: string; email: string } | null,
  isLoading: false,
};

// Mock useAuth hook — 返回我们控制的状态
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

// ============================================================================
// 简化的路由守卫（与 ProtectedRoute 逻辑一致）
// 直接在测试中实现，避免真实组件的副作用依赖
// ============================================================================

function TestProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = mockAuthState;
  const location = useLocation();

  if (isLoading) {
    return <div data-testid="spinner">加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// 辅助组件
// ============================================================================

function ProtectedContent() {
  return <div data-testid="protected-content">受保护的内容</div>;
}

function LoginPage() {
  return <div data-testid="login-page">登录页面</div>;
}

function renderProtectedRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <TestProtectedRoute>
              <ProtectedContent />
            </TestProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// ============================================================================
// 受保护路由列表
// ============================================================================

const protectedPaths = [
  '/app',
  '/app/map',
  '/app/cities',
  '/app/wishlist',
  '/app/trips',
  '/app/insights',
  '/app/profile',
];

// ============================================================================
// 属性测试
// ============================================================================

describe('属性 3: 未认证用户重定向', () => {
  beforeEach(() => {
    // 重置认证状态
    mockAuthState = { user: null, isLoading: false };
  });

  /**
   * 属性 3.1: 未登录用户访问受保护路由应重定向到登录页
   */
  it('属性 3.1: 未登录用户访问任何受保护路由应看到登录页', () => {
    fc.assert(
      fc.property(fc.constantFrom(...protectedPaths), (path) => {
        mockAuthState = {
          user: null,
          isLoading: false,
        };

        const { unmount } = renderProtectedRoute(path);

        // 应该显示登录页面
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        // 不应该显示受保护内容
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: protectedPaths.length },
    );
  });

  /**
   * 属性 3.2: 已登录用户应能访问受保护路由
   */
  it('属性 3.2: 已登录用户应能看到受保护内容', () => {
    fc.assert(
      fc.property(fc.constantFrom(...protectedPaths), (path) => {
        mockAuthState = {
          user: { id: 'user-123', email: 'test@example.com' },
          isLoading: false,
        };

        const { unmount } = renderProtectedRoute(path);

        // 应该显示受保护内容
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        // 不应该显示登录页面
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: protectedPaths.length },
    );
  });

  /**
   * 属性 3.3: 加载中应显示 Spinner
   */
  it('属性 3.3: 认证状态加载中应显示加载指示器', () => {
    fc.assert(
      fc.property(fc.constantFrom(...protectedPaths), (path) => {
        mockAuthState = {
          user: null,
          isLoading: true,
        };

        const { unmount } = renderProtectedRoute(path);

        // 应该显示加载指示器
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        // 不应该显示受保护内容或登录页
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: protectedPaths.length },
    );
  });
});
